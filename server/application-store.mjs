import { createClient } from '@libsql/client';
import { createHash, randomUUID } from 'node:crypto';

export function applicationStore(env) {
  const url = env.LEAD_DATABASE_URL;
  if (!url || (env.VERCEL && !/^libsql:\/\//.test(url))) throw Error('Durable lead database required');
  const db = createClient({ url, authToken: env.LEAD_DATABASE_AUTH_TOKEN });
  let ready;
  async function initialize() {
    ready ??= db
      .batch(
        [
          'CREATE TABLE IF NOT EXISTS applications (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, fingerprint TEXT NOT NULL, received INTEGER NOT NULL, record TEXT NOT NULL)',
          'CREATE TABLE IF NOT EXISTS application_jobs (application TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL, due INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, lease TEXT, PRIMARY KEY(application,kind))',
          'CREATE INDEX IF NOT EXISTS application_jobs_due ON application_jobs(due)',
        ],
        'write',
      )
      .catch((error) => {
        ready = undefined;
        throw error;
      });
    await ready;
  }
  async function save(key, record, meta, time) {
    await initialize();
    const id = randomUUID();
    const fingerprint = createHash('sha256')
      .update(JSON.stringify([record.name, record.email, record.phone, record.revenue, record.ownership]))
      .digest('hex');
    const statements = [
      {
        sql: 'INSERT INTO applications(id,request_key,fingerprint,received,record) VALUES (?,?,?,?,?) ON CONFLICT(request_key) DO NOTHING',
        args: [id, key, fingerprint, time, JSON.stringify(record)],
      },
    ];
    function job(kind, payload) {
      statements.push({
        sql: 'INSERT INTO application_jobs(application,kind,payload,due) SELECT id,?,?,? FROM applications WHERE id=?',
        args: [kind, JSON.stringify(payload), time, id],
      });
    }
    job('notify', {});
    if (meta)
      job('meta', { ...meta, event_name: 'Lead', event_time: time, event_id: id, action_source: 'website' });
    statements.push({
      sql: 'SELECT id,fingerprint,received,record FROM applications WHERE request_key=?',
      args: [key],
    });
    const results = await db.batch(statements, 'write');
    const row = results.at(-1).rows[0];
    if (row.fingerprint !== fingerprint) return { conflict: true };
    // A retry uses the original consent decision and conversion ID.
    return {
      id: row.id,
      received: Number(row.received),
      track: Boolean(meta) && JSON.parse(row.record).pixelID === record.pixelID,
    };
  }
  async function runJobs(deliver, now, applicationId) {
    await initialize();
    const time = now();
    const due = await db.execute({
      sql:
        'SELECT application,kind FROM application_jobs WHERE due<=?' +
        (applicationId ? ' AND application=?' : '') +
        ' ORDER BY due LIMIT 24',
      args: applicationId ? [time, applicationId] : [time],
    });
    await Promise.all(
      due.rows.map(async ({ application, kind }) => {
        const lease = randomUUID();
        const claim = await db.execute({
          sql: 'UPDATE application_jobs SET lease=?,due=?,attempts=attempts+1 WHERE application=? AND kind=? AND due<=? RETURNING payload,attempts',
          args: [lease, time + 120, application, kind, time],
        });
        if (!claim.rows.length) return;
        const { payload, attempts } = claim.rows[0];
        try {
          const row = await db.execute({
            sql: 'SELECT record,received FROM applications WHERE id=?',
            args: [application],
          });
          const { record, received } = row.rows[0];
          await deliver(kind, application, JSON.parse(payload), JSON.parse(record), Number(received));
        } catch {
          await db.execute({
            sql: 'UPDATE application_jobs SET due=?,lease=NULL WHERE application=? AND kind=? AND lease=?',
            args: [
              now() + Math.min(86400, 60 * 2 ** Math.min(10, Number(attempts) - 1)),
              application,
              kind,
              lease,
            ],
          });
          return;
        }
        await db.execute({
          sql: 'DELETE FROM application_jobs WHERE application=? AND kind=? AND lease=?',
          args: [application, kind, lease],
        });
      }),
    );
  }
  return { save, runJobs, close: () => db.close() };
}
