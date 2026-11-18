import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@libsql/client';
import { applicationStore } from '../server/application-store.mjs';
import { createApplicationHandler } from '../api/application.mjs';
import { deliverApplication } from '../server/application-delivery.mjs';

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'consulting-test-'));
  const env = {
    LEAD_DATABASE_URL: 'file:' + join(dir, 'leads.db'),
    ENQUIRY_SECRET: randomUUID(),
    META_PIXEL_ID: '123456789',
    META_CAPI_ACCESS_TOKEN: 'local-test',
    META_TEST_EVENT_CODE: 'TEST-fixture',
    CRON_SECRET: randomUUID(),
  };
  const db = createClient({ url: env.LEAD_DATABASE_URL });
  const store = applicationStore(env);
  let time = 1800000000;
  const work = [],
    requests = [],
    fail = new Set();
  const deliver = deliverApplication(env, async (url, init) => {
    const kind = url.includes('graph.facebook') ? 'meta' : 'notify';
    requests.push({ kind, body: JSON.parse(init.body), headers: init.headers });
    if (fail.has(kind)) return Response.json({ error: 'fixture' }, { status: 503 });
    return Response.json(kind === 'meta' ? { events_received: 1 } : { id: randomUUID() });
  });
  const handler = createApplicationHandler({
    env,
    store,
    deliver,
    now: () => time,
    background: (promise) => work.push(promise),
  });
  async function call(method, body, extra = {}) {
    let status, data;
    const headers = {
      origin: 'http://localhost:8770',
      'user-agent': 'Test agent',
      'content-type': 'application/json',
      cookie: 'lg_ad_consent=1',
      ...extra,
    };
    await handler(
      { method, headers, body, socket: { remoteAddress: '127.0.0.1' } },
      {
        setHeader() {},
        status(code) {
          status = code;
          return this;
        },
        json(value) {
          data = value;
        },
      },
    );
    return { status, data };
  }
  const {
    data: { token },
  } = await call('GET');
  const body = {
    key: randomUUID(),
    token,
    name: 'Local Fixture',
    email: 'test@example.invalid',
    tel: '+1 202 555 0134',
    company: '',
    source: '/cash-flow',
    revenue: 7,
    ownership: 4,
    advertising: true,
    campaign: {
      utm_campaign: 'cash-test',
      utm_medium: 'paid',
      email: 'private',
      utm_content: 'pii@example.invalid',
    },
  };
  t.after(async () => {
    await Promise.all(work);
    store.close();
    db.close();
    await rm(dir, { recursive: true, force: true });
  });
  return {
    env,
    db,
    store,
    call,
    body,
    work,
    requests,
    fail,
    advance: (seconds) => {
      time += seconds;
    },
  };
}
test('simultaneous retries commit one application, one notification and one consented conversion', async (t) => {
  const f = await fixture(t);
  const [a, b] = await Promise.all([f.call('POST', f.body), f.call('POST', f.body)]);
  assert.equal(a.status, 200);
  assert.deepEqual(a, b);
  assert.equal(a.data.pixelID, f.env.META_PIXEL_ID);
  await Promise.all(f.work);
  const records = (await f.db.execute('SELECT record FROM applications')).rows;
  assert.equal(records.length, 1);
  assert.deepEqual(JSON.parse(records[0].record).campaign, { utm_campaign: 'cash-test', utm_medium: 'paid' });
  assert.equal(f.requests.length, 2);
  const event = f.requests.find((r) => r.kind === 'meta').body.data[0];
  assert.deepEqual(event, {
    event_name: 'Lead',
    event_time: 1800000000,
    event_id: a.data.eventID,
    action_source: 'website',
    event_source_url: 'http://localhost:8770/cash-flow',
    user_data: { client_user_agent: 'Test agent', client_ip_address: '127.0.0.1' },
  });
  assert.doesNotMatch(JSON.stringify(event), /example.invalid|Local Fixture|ownership|revenue|cash-test/);
  assert.equal((await f.call('POST', { ...f.body, name: 'Changed payload' })).status, 409);
});
test('saved requests survive independent provider failures and worker restarts', async (t) => {
  const f = await fixture(t);
  f.fail.add('meta');
  f.fail.add('notify');
  const result = await f.call('POST', f.body);
  assert.equal(result.status, 200);
  await Promise.all(f.work);
  assert.equal((await f.db.execute('SELECT kind FROM application_jobs')).rows.length, 2);
  f.fail.delete('notify');
  f.advance(61);
  const reopened = applicationStore(f.env);
  t.after(() => reopened.close());
  const drain = () => f.call('GET', undefined, { authorization: 'Bearer ' + f.env.CRON_SECRET });
  assert.equal((await drain()).status, 200);
  assert.deepEqual(
    (await f.db.execute('SELECT kind FROM application_jobs')).rows.map((r) => r.kind),
    ['meta'],
  );
  f.fail.clear();
  f.advance(121);
  let retried;
  await reopened.runJobs(
    async (kind, id, event) => {
      retried = { kind, id, event };
    },
    () => 1800000182,
  );
  const first = f.requests.find((r) => r.kind === 'meta').body.data[0];
  assert.deepEqual(retried, { kind: 'meta', id: result.data.eventID, event: first });
  assert.equal((await f.db.execute('SELECT kind FROM application_jobs')).rows.length, 0);
});
test('denial, opt-out signals and missing consent cookie suppress attribution and Meta', async (t) => {
  const f = await fixture(t);
  for (const [advertising, headers] of [
    [false, {}],
    [true, { cookie: '' }],
    [true, { 'sec-gpc': '1' }],
    [true, { dnt: '1' }],
  ]) {
    const response = await f.call(
      'POST',
      { ...f.body, key: randomUUID(), source: '/', advertising },
      headers,
    );
    assert.equal(response.status, 200);
    assert.equal(response.data.pixelID, null);
    await Promise.all(f.work);
  }
  assert.equal(f.requests.filter((r) => r.kind === 'meta').length, 0);
  for (const { record } of (await f.db.execute('SELECT record FROM applications')).rows)
    assert.deepEqual(JSON.parse(record).campaign, {});
});
test('failed saves never confirm or schedule delivery and invalid values never reach storage', async (t) => {
  const f = await fixture(t);
  const invalid = await f.call('POST', { ...f.body, ownership: 5 });
  assert.equal(invalid.status, 400);
  // Make the real SQL transaction fail after the application INSERT.
  await f.store.runJobs(async () => {}, () => 1800000000);
  await f.db.execute("CREATE TRIGGER fail_job BEFORE INSERT ON application_jobs BEGIN SELECT RAISE(ABORT,'test save failure'); END");
  const result = await f.call('POST', f.body);
  assert.equal(result.status, 503);
  assert.equal(result.data.accepted, undefined);
  assert.equal(f.work.length, 0);
  assert.equal((await f.db.execute('SELECT COUNT(*) AS n FROM applications')).rows[0].n, 0);
  await f.db.execute('DROP TRIGGER fail_job');
  assert.equal((await f.call('POST', f.body)).status, 200);
  await Promise.all(f.work);
  assert.equal((await f.db.execute('SELECT COUNT(*) AS n FROM applications')).rows[0].n, 1);
});
