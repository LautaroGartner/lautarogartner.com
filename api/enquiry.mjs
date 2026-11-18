import {isPhoneCountry} from '../site/phone-countries.mjs';
import {enquiryBudgets, enquiryServices} from '../site/enquiry-options.mjs';
import {enquiryEmail} from './enquiry-email.mjs';
import {randomUUID} from 'node:crypto';
import {signature, validToken, allowedOrigin, limited} from '../server/form-security.mjs';

const RECIPIENT = 'lautaro@lautarogartner.com';
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
   const country=req.headers['x-vercel-ip-country'];
   return res.status(200).json({token:`${value}.${signature(value,secret)}`,country:isPhoneCountry(country)?country:null});
  }
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).json({error:'content_type'});
  let body;
  try {
   const raw=typeof req.body==='string'?req.body:Buffer.isBuffer(req.body)?req.body.toString('utf8'):JSON.stringify(req.body);
   if (!raw || Buffer.byteLength(raw)>12000) return res.status(413).json({error:'size'});
   body=JSON.parse(raw);
  } catch {return res.status(400).json({error:'validation'});}
  if (!body || typeof body!=='object' || Array.isArray(body) || !validToken(body.token,secret,time)) return res.status(400).json({error:'token'});
  const {name,organization='',service,email,phone,phoneCountry='',project,website='',budget,company='',language}=body;
  if (typeof phone!=='string' || !phone.trim() || phone.length>40 || !enquiryBudgets.some(option=>option.value===budget)) return res.status(400).json({error:'validation'});
  if (typeof name!=='string' || !name.trim() || name.length>120 || (phoneCountry!=='' && !isPhoneCountry(phoneCountry)) || typeof organization!=='string' || organization.length>160 || !enquiryServices.some(option=>option.value===service) || typeof email!=='string' || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /[\r\n]/.test(email) || typeof project!=='string' || project.trim().length<10 || project.length>4000 || typeof website!=='string' || website.length>2048 || company!=='' || !['en','es'].includes(language)) return res.status(400).json({error:'validation'});
  const nonce=body.token.split('.')[1];
  try {
   const response=await request('https://api.resend.com/emails', {
    method:'POST', signal:AbortSignal.timeout(10000),
    headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`, 'Content-Type':'application/json', 'Idempotency-Key':`enquiry/${nonce}`},
    body:JSON.stringify({from:env.ENQUIRY_FROM,to:[RECIPIENT],reply_to:email.trim(),subject:language==='es'?'Consulta web — lautarogartner.com':'Website enquiry — lautarogartner.com',...enquiryEmail({name, organization, service, email, phone, phoneCountry, project, website, budget, language})})
   });
   const receipt=await response.json();
   if (!response.ok || typeof receipt.id!=='string' || !receipt.id) return res.status(502).json({error:'delivery'});
   return res.status(200).json({accepted:true,reference:nonce});
  } catch {return res.status(502).json({error:'delivery'});}
 };
}
export default createEnquiryHandler();
