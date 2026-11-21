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
test('the ad revenue target flags the private notification at the $3M boundary', async (t) => {
  const f = await fixture(t);
  for (const [source, revenue, matches] of [['/more-clients',4,false],['/more-clients',5,true],['/cash-flow',6,true],['/',5,false]]) {
    const result = await f.call('POST', { ...f.body, key: randomUUID(), source, revenue, advertising: false });
    assert.equal(result.status, 200);
    await Promise.all(f.work);
    const subject = f.requests.filter(request => request.kind === 'notify').at(-1).body.subject;
    assert.equal(subject.includes('$3M+'), matches);
  }
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

test('kit downloads and owner-only follow-ups survive retries and follow the gift delivery date', async (t) => {
  const f = await fixture(t);
  const body = { ...f.body, kit: true, source: '/', tel: '+12025550134', planCall: false, advertising: false };
  const invalid = await f.call('POST', { ...body, logo: 'wrong type' });
  assert.equal(invalid.status, 400);
  for (const fields of [{planCall: false, tel: '+12025550134'}, {planCall: true, tel: ''}]) {
    const invalidCall = await f.call('POST', {...body, ...fields, source:'/more-clients'});
    assert.equal(invalidCall.status,400);
  }
  f.fail.add('notify'); // Mock every outbound email failing on the first attempt.
  const { data } = await f.call('POST', body);
  await Promise.all(f.work);
  assert.deepEqual((await f.db.execute('SELECT kind FROM application_jobs ORDER BY kind')).rows.map(r => r.kind), ['gift','notify']);
  f.fail.clear();
  f.advance(61);
  const drain = () => f.call('GET', undefined, { authorization: 'Bearer ' + f.env.CRON_SECRET });
  await drain();
  const gift = f.requests.at(-1).body.to[0] === body.email ? f.requests.at(-1) : f.requests.at(-2);
  assert.deepEqual(gift.body.to, [body.email]);
  assert.equal(data.kitPath, undefined);
  const links = gift.body.text.split(/\s+/).filter(word => word.startsWith('https://'));
  const memoLink = links.find(link => !link.includes('&format=pdf'));
  const pdfLink = links.find(link => link.includes('&format=pdf'));
  assert.ok(memoLink && pdfLink);
  assert.equal(data.guideTitle,'Grow Your Sales, Keep More of What You Make');
  assert.ok(gift.body.subject.includes(data.guideTitle));
  assert.doesNotMatch(gift.body.text,/\$5M/);
  const {createKitHandler} = await import('../api/growth-kit.mjs');
  const getKit = createKitHandler(f.env, f.store);
  async function download(href) {
    let status, bytes;
    await getKit({method:'GET',query:Object.fromEntries(new URL(href,'https://localhost').searchParams)},{
      setHeader(){}, status(n){status=n;return this;}, end(b){bytes=b;}
    });
    return {status,bytes};
  }
  assert.equal((await download(memoLink + 'x')).status,404);
  assert.equal((await download(memoLink)).bytes.subarray(0,2).toString(),'PK');
  const fieldbook = await download(pdfLink);
  assert.equal(fieldbook.status, 200);
  assert.equal(fieldbook.bytes.subarray(0,5).toString(), '%PDF-');
  assert.equal((await download(memoLink + 'x&format=pdf')).status,404);
  assert.deepEqual((await f.call('POST', body)).data,data);
  await Promise.all(f.work);
  const count = f.requests.length;
  f.advance(2*86400-1);
  await drain();
  assert.equal(f.requests.length, count);
  f.advance(1);
  await drain();
  assert.match(f.requests.at(-1).body.subject,/Day 2/);
  f.advance(5*86400);
  await drain();
  assert.match(f.requests.at(-1).body.subject,/Day 7/);
  for (const reminder of f.requests.slice(count)) {
    assert.deepEqual(reminder.body.to, ['lautaro@lautarogartner.com']);
    assert.match(reminder.body.text,/Suggested personal note/);
  }
  assert.equal(f.requests.length, count+2);
  assert.equal((await f.db.execute('SELECT count(*) AS n FROM application_jobs')).rows[0].n,0);
});

test('assessment saves answers, routes only consented callbacks and returns an immediate action', async t => {
  const f = await fixture(t);
  const base = {...f.body, kit:true, source:'/more-clients', business:'Example Co', role:'owner',
    challenge:'closing', stage:'established', budget:'from5', timing:'month', callback:true, planCall:true};
  for (const [extra, priority] of [[{},'High'],[{revenue:4},'Medium'],[{role:'other'},'Medium'],
    [{stage:'prelaunch'},'Low'],[{budget:'none'},'Low'], [{role:'coowner',source:'/',assessment:true},'High'],
    [{budget:'under5'},'Medium'], [{timing:'quarter'},'Medium'], [{timing:'exploring'},'Low'],
    [{role:'executive', timing:'now', budget:'from50'},'High']]) {
    f.advance(1);
    const token = (await f.call('GET')).data.token;
    const body = {...base,...extra,key:randomUUID(),token};
    const response = await f.call('POST',body);
    assert.equal(response.status,200);
    assert.equal(response.data.firstMove.length,2);
    assert.doesNotMatch(JSON.stringify(response.data), /kitPath|growth-kit\?|&key=/);
    assert.doesNotMatch(JSON.stringify(response.data), /priority/i);
    const record = await f.store.kitRecipient(response.data.eventID);
    assert.equal(record.qualification.priority,priority);
    assert.equal(Boolean(record.qualification.consent),body.callback);
    await Promise.all(f.work);
    const messages = f.requests.filter(r => r.headers['Idempotency-Key']?.includes(response.data.eventID));
    const alert = messages.find(r => r.body.subject?.startsWith(priority + ' priority'));
    assert.ok(alert);
    assert.equal(alert.body.text.includes('Call now at'), priority === 'High');
    assert.match(alert.body.text, /Role — /);
    assert.doesNotMatch(alert.body.text, /undefined/);
    const gift = messages.find(r => r.body.to?.includes(body.email)).body;
    for (const version of [gift.text, gift.html]) {
      assert.ok(version.includes(response.data.firstMove[1]));
      assert.ok(version.includes(response.data.guidance.thanks));
      assert.ok(version.includes(response.data.guidance.reading));
      assert.ok(version.includes(response.data.guidance.next));
      assert.equal(version.includes('within one business day to arrange our conversation'), priority === 'High');
      assert.equal(version.includes('I’ll follow up by email first'), priority !== 'High');
      assert.ok(version.includes('format=pdf'));
      assert.doesNotMatch(version, /lang=es|Descargar/);
    }
    assert.doesNotMatch(JSON.stringify(f.requests.find(r => r.kind === 'meta' && r.body.data[0].event_id === response.data.eventID).body), /profitable orders|priority|budget/i);
    f.advance(61);
  }
  f.advance(61);
  base.token = (await f.call('GET')).data.token;
  assert.equal((await f.call('POST',{...base,key:randomUUID(),callback:false,planCall:false})).status,400);
  for (const overrides of [{challenge:'invalid'}, {revenue:8}, {tel:''}, {planCall:false,callback:false,tel:''},
    {role:''}, {role:'missing'}, {budget:''}, {timing:''}]) {
    f.advance(61);
    base.token = (await f.call('GET')).data.token;
    assert.equal((await f.call('POST',{...base,...overrides,key:randomUUID()})).status,400);
  }
});

test('CRM tags apply to earlier submissions, survive form retries, and reject stale edits', async t => {
  const f = await fixture(t);
  const { data } = await f.call('POST', f.body);
  const id = data.eventID;
  const rows = await f.store.listLeads('Unreviewed');
  assert.deepEqual(rows.map(row => row.id), [id]);
  assert.deepEqual(await f.store.listLeads(undefined, rows[0].cursor), []);
  assert.equal(await f.store.setLeadTag(id, 'Qualified', 'Unreviewed'), true);
  assert.equal(await f.store.setLeadTag(id, 'Not a fit', 'Unreviewed'), false);
  assert.equal((await f.call('POST', f.body)).data.eventID, id);
  assert.deepEqual(await f.store.listLeads('Unreviewed'), []);
  assert.equal((await f.store.listLeads('Qualified'))[0].id, id);
});
