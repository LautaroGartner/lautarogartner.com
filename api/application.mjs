import { randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { waitUntil } from '@vercel/functions';
import { signature, validToken, allowedOrigin, limited } from '../server/form-security.mjs';
import { revenueBands, ownershipBands } from '../site/application-options.mjs';
import { applicationStore } from '../server/application-store.mjs';
import { deliverApplication } from '../server/application-delivery.mjs';

const epoch = () => Math.floor(Date.now() / 1000);
const campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validText(value, max) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= max &&
    !/[\x00-\x1f\x7f]/.test(value)
  );
}
function parseApplication(body, ads) {
  if (
    !body ||
    typeof body.key !== 'string' ||
    !uuid.test(body.key) ||
    body.company !== '' ||
    !['/', '/cash-flow', '/more-clients'].includes(body.source)
  )
    return;
  if (
    !validText(body.name, 120) ||
    !validText(body.email, 254) ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)
  )
    return;
  if (!validText(body.tel, 40) || !/^\+?[\d ().-]+$/.test(body.tel) || body.tel.replace(/\D/g, '').length < 6)
    return;
  if (
    !Number.isInteger(body.revenue) ||
    !revenueBands[body.revenue] ||
    !Number.isInteger(body.ownership) ||
    !ownershipBands[body.ownership]
  )
    return;
  const campaign = {};
  if (ads)
    for (const key of campaignKeys) {
      const value = body.campaign?.[key];
      if (typeof value === 'string' && /^[\w.-]{1,100}$/.test(value)) campaign[key] = value;
    }
  return {
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.tel.trim(),
    revenue: body.revenue,
    ownership: body.ownership,
    source: body.source,
    campaign,
  };
}
export function createApplicationHandler({
  env = process.env,
  now = epoch,
  store,
  deliver,
  background = waitUntil,
} = {}) {
  const database = () => (store ??= applicationStore(env));
  const send = deliver ?? deliverApplication(env);
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const out = (status, data) => res.status(status).json(data);
    try {
      if (req.method === 'GET' && (req.query?.drain === '1' || req.headers.authorization)) {
        if (!env.CRON_SECRET || req.headers.authorization !== 'Bearer ' + env.CRON_SECRET)
          return out(403, { error: 'forbidden' });
        await database().runJobs(send, now);
        return out(200, { ok: true });
      }
      if (!['GET', 'POST'].includes(req.method)) return out(405, { error: 'method' });
      if (
        !allowedOrigin(req.headers.origin, env) &&
        !(req.method === 'GET' && req.headers['sec-fetch-site'] === 'same-origin')
      )
        return out(403, { error: 'origin' });
      const secret = env.ENQUIRY_SECRET || env.SESSION_SECRET;
      if (!secret) return out(503, { error: 'unavailable' });
      const time = now();
      if (limited(req, secret, time * 1000, 'application-' + req.method))
        return out(429, { error: 'rate_limited' });
      if (req.method === 'GET') {
        const nonce = time * 1000 + '.' + randomUUID();
        return out(200, { token: nonce + '.' + signature(nonce, secret) });
      }
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))
        return out(415, { error: 'content_type' });
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw) > 6000) return out(413, { error: 'size' });
      let body;
      try {
        body = JSON.parse(raw);
      } catch {
        return out(400, { error: 'validation' });
      }
      if (!validToken(body?.token, secret, time * 1000, 0)) return out(400, { error: 'token' });
      const ads =
        body.advertising === true &&
        /(?:^|;\s*)lg_ad_consent=1(?:;|$)/.test(req.headers.cookie || '') &&
        req.headers['sec-gpc'] !== '1' &&
        req.headers.dnt !== '1';
      const record = parseApplication(body, ads);
      if (!record) return out(400, { error: 'validation' });
      const ua = req.headers['user-agent'];
      const metaEnabled = /^\d{5,25}$/.test(env.META_PIXEL_ID || '') && Boolean(env.META_CAPI_ACCESS_TOKEN);
      const userData = { client_user_agent: typeof ua === 'string' ? ua.slice(0, 1024) : '' };
      const ip = String(req.headers['x-vercel-forwarded-for'] || req.socket?.remoteAddress || '')
        .split(',')[0]
        .trim();
      if (isIP(ip)) userData.client_ip_address = ip;
      if (ads)
        for (const [name, pattern] of Object.entries({
          fbp: /^fb\.\d\.\d{13}\.\d{1,24}$/,
          fbc: /^fb\.\d\.\d{13}\.[\w-]{1,400}$/,
        })) {
          if (typeof body[name] === 'string' && pattern.test(body[name])) userData[name] = body[name];
        }
      const meta =
        ads && metaEnabled && userData.client_user_agent
          ? { event_source_url: req.headers.origin + record.source, user_data: userData }
          : null;
      const saved = await database().save(
        body.key,
        { ...record, pixelID: meta ? env.META_PIXEL_ID : null },
        meta,
        time,
      );
      if (saved.conflict) return out(409, { error: 'key_reused' });
      background(
        database()
          .runJobs(send, now, saved.id)
          .catch(() => console.error('Application delivery pending')),
      );
      return out(200, { accepted: true, eventID: saved.id, pixelID: saved.track ? env.META_PIXEL_ID : null });
    } catch {
      return out(503, { error: 'save_unavailable' });
    }
  };
}
export default createApplicationHandler();
