import { createHmac, timingSafeEqual } from 'node:crypto';
const windows = new Map();
const TOKEN_AGE = 30 * 60 * 1000;
export function signature(value, secret) {
  return createHmac('sha256', secret).update(value).digest('hex');
}
export function validToken(token, secret, now, minimumAge = 1000) {
  if (typeof token !== 'string' || token.length > 200) return false;
  const [issued, nonce, mac] = token.split('.');
  if (
    !/^\d{13}$/.test(issued || '') ||
    !/^[a-f0-9-]{36}$/.test(nonce || '') ||
    !/^[a-f0-9]{64}$/.test(mac || '')
  )
    return false;
  const age = now - Number(issued);
  return (
    age >= minimumAge &&
    age <= TOKEN_AGE &&
    timingSafeEqual(Buffer.from(mac), Buffer.from(signature(`${issued}.${nonce}`, secret)))
  );
}
export function allowedOrigin(origin, env) {
  const origins = ['https://www.lautarogartner.com', 'https://lautarogartner.com'];
  if (env.VERCEL_URL) origins.push(`https://${env.VERCEL_URL}`);
  if (env.NODE_ENV !== 'production') origins.push('http://127.0.0.1:8770', 'http://localhost:8770');
  return origins.includes(origin);
}
// Bounded, per-instance protection. A platform rate-limit rule is needed for a global limit.
export function limited(req, secret, now, method) {
  for (const [key, entry] of windows) if (entry.until <= now) windows.delete(key);
  const ip =
    req.headers['x-vercel-forwarded-for'] ||
    req.headers['x-forwarded-for'] ||
    req.socket?.remoteAddress ||
    'unknown';
  const key = `${method}:${signature(String(ip), secret)}`;
  const entry = windows.get(key) || { count: 0, until: now + 60000 };
  if (!windows.has(key) && windows.size >= 5000) return true;
  windows.set(key, entry);
  return ++entry.count > (method.endsWith('GET') ? 20 : 5);
}
