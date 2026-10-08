import {enquiryServices} from '../site/enquiry-options.mjs';
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function enquiryEmail({name, organization='', service, email, project, website='', budget='', language}) {
 const es = language === 'es';
 const title = es ? 'Nueva consulta' : 'New enquiry';
 const labels = es ? ['Email', 'Sitio web', 'Mensaje'] : ['Email', 'Website', 'Message'];
 const fields = [[es ? 'Nombre' : 'Name', name.trim()], [labels[0], email.trim()], ...(organization.trim() ? [[es ? 'Organización' : 'Organization', organization.trim()]] : []), [es ? 'Servicio' : 'Service', enquiryServices.find(option=>option.value===service)?.[es?'es':'en'] || service], ...(website.trim() ? [[labels[1], website.trim()]] : []), [labels[2], project.trim()], ...(budget.trim() ? [[es ? 'Presupuesto' : 'Budget', budget.trim()]] : [])];
 return {
  text: `Lautaro Gärtner\n${title}\n\n${fields.map(([label, value]) => `${label}\n${value}`).join('\n\n')}\n\nlautarogartner.com`,
  html: `<!doctype html><html lang="${es ? 'es' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f0eee8;color:#1c1d20;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px"><tr><td style="padding:28px;background:#1c1d20;color:#f0eee8;border-top:4px solid #2144d5"><p style="margin:0 0 32px;font-size:14px">Lautaro Gärtner</p><h1 style="margin:0;font-size:32px;font-weight:400;letter-spacing:-1px">${title}</h1></td></tr><tr><td style="padding:12px 28px 28px;background:#ffffff">${fields.map(([label, value]) => `<p style="margin:24px 0 8px;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#666666">${label}</p><p style="margin:0;font-size:16px;line-height:1.65;overflow-wrap:anywhere;word-break:break-word">${escape(value).replace(/\r?\n/g, '<br>')}</p>`).join('')}</td></tr><tr><td style="padding:24px 28px;border-top:1px solid #d3d1cb;font-size:12px;color:#666666"><a href="https://www.lautarogartner.com" style="color:#1c1d20;text-decoration:none">lautarogartner.com ↗</a></td></tr></table></td></tr></table></body></html>`
 };
}
