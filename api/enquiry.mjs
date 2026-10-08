import {enquiryEmail} from './enquiry-email.mjs';
import {createHmac, randomUUID, timingSafeEqual} from 'node:crypto';

const windows = new Map();
const TOKEN_AGE = 30 * 60 * 1000;
const RECIPIENT = 'lautaro@lautarogartner.com';
function signature(value, secret) { return createHmac('sha256', secret).update(value).digest('hex'); }
function validToken(token, secret, now) {
 if (typeof token !== 'string' || token.length > 200) return false;
 const [issued, nonce, mac] = token.split('.');
 if (!/^\d{13}$/.test(issued || '') || !/^[a-f0-9-]{36}$/.test(nonce || '') || !/^[a-f0-9]{64}$/.test(mac || '')) return false;
 const age = now - Number(issued);
 return age >= 1000 && age <= TOKEN_AGE && timingSafeEqual(Buffer.from(mac), Buffer.from(signature(`${issued}.${nonce}`, secret)));
}
function allowedOrigin(origin, env) {
 const origins = ['https://www.lautarogartner.com', 'https://lautarogartner.com'];
 if (env.VERCEL_URL) origins.push(`https://${env.VERCEL_URL}`);
 if (env.NODE_ENV !== 'production') origins.push('http://127.0.0.1:8770', 'http://localhost:8770');
 return origins.includes(origin);
}
// Bounded, per-instance protection. A platform rate-limit rule is needed for a global limit.
function limited(req, secret, now, method) {
 for (const [key, entry] of windows) if (entry.until <= now) windows.delete(key);
 const ip = req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
 const key = `${method}:${signature(String(ip), secret)}`;
 const entry = windows.get(key) || {count:0, until:now + 60000};
 if (!windows.has(key) && windows.size >= 5000) return true;
 windows.set(key, entry); return ++entry.count > (method === 'GET' ? 20 : 5);
}
export function createEnquiryHandler({env=process.env, request=fetch, now=Date.now}={}) {
 return async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET','POST'].includes(req.method)) {res.setHeader('Allow','GET, POST');return res.status(405).json({error:'method'});}
  const secret=env.ENQUIRY_SECRET || env.SESSION_SECRET;
  if (!secret || !env.RESEND_API_KEY || !env.ENQUIRY_FROM) return res.status(503).json({error:'unavailable'});
  const origin=req.headers.origin;
  // GET fetches do not always carry Origin; require a same-origin browser fetch instead.
  if (!allowedOrigin(origin,env) && !(req.method==='GET' && req.headers['sec-fetch-site']==='same-origin')) return res.status(403).json({error:'origin'});
  const time=now();
  if (limited(req,secret,time,req.method)) {res.setHeader('Retry-After','60');return res.status(429).json({error:'rate_limited'});}
  if(req.method==='GET') {
   const value=`${time}.${randomUUID()}`;
   return res.status(200).json({token:`${value}.${signature(value,secret)}`});
  }
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).json({error:'content_type'});
  let body;
  try {
   const raw=typeof req.body==='string'?req.body:Buffer.isBuffer(req.body)?req.body.toString('utf8'):JSON.stringify(req.body);
   if (!raw || Buffer.byteLength(raw)>12000) return res.status(413).json({error:'size'});
   body=JSON.parse(raw);
  } catch {return res.status(400).json({error:'validation'});}
  if (!body || typeof body!=='object' || Array.isArray(body) || !validToken(body.token,secret,time)) return res.status(400).json({error:'token'});
  const {email,project,website='',budget='',company='',language}=body;
  if (typeof email!=='string' || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email) || typeof project!=='string' || project.trim().length<10 || project.length>4000 || typeof website!=='string' || website.length>2048 || typeof budget!=='string' || budget.length>100 || company!=='' || !['en','es'].includes(language)) return res.status(400).json({error:'validation'});
  const nonce=body.token.split('.')[1];
  try {
   const response=await request('https://api.resend.com/emails', {
    method:'POST', signal:AbortSignal.timeout(10000),
    headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`, 'Content-Type':'application/json', 'Idempotency-Key':`enquiry/${nonce}`},
    body:JSON.stringify({from:env.ENQUIRY_FROM,to:[RECIPIENT],reply_to:email.trim(),subject:language==='es'?'Consulta web — lautarogartner.com':'Website enquiry — lautarogartner.com',...enquiryEmail({email, project, website, budget, language})})
   });
   const receipt=await response.json();
   if (!response.ok || typeof receipt.id!=='string' || !receipt.id) return res.status(502).json({error:'delivery'});
   return res.status(200).json({accepted:true,reference:nonce});
  } catch {return res.status(502).json({error:'delivery'});}
 };
}
export default createEnquiryHandler();
