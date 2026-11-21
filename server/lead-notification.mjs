import { budgets, challenges, decisions, investments, roles, stages, timelines } from '../site/acquisition-assessment.mjs';
import { ownershipBands, revenueBands } from '../site/application-options.mjs';

const owner = 'lautaro@lautarogartner.com';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const subjectName = record => (record.business || record.name).replace(/\s+/g, ' ').trim().slice(0, 65);

function mailto(address) {
  return 'mailto:' + encodeURIComponent(address).replace('%40', '@');
}

function card(label, heading, content) {
  return `<div style="max-width:540px;margin:0 auto;padding:24px 18px;font:16px/1.55 Arial,sans-serif;color:#272330">
    <p style="margin:0;color:#55458e;font-size:13px;font-weight:bold">${escape(label)}</p>
    <h1 style="margin:8px 0 14px;font-size:25px;line-height:1.2">${escape(heading)}</h1>${content}</div>`;
}

function button(href, label) {
  return `<a href="${escape(href)}" style="display:inline-block;background:#493879;color:white;text-decoration:none;border-radius:8px;padding:10px 16px;font-weight:bold">${escape(label)}</a>`;
}

export function newLeadEmail(record) {
  const q = record.qualification;
  const callFirst = record.planCall && q?.priority === 'High' && Boolean(record.phone);
  const who = subjectName(record);
  const contact = record.business ? record.name + ' · ' + record.business : record.name;
  const action = callFirst ? 'Contact them within one business day to arrange the assessment.' : record.planCall
    ? 'Email to arrange a time. The applicant requested a call.' : record.kit ? 'Guide requested. Follow up by email.' : 'Review this consulting inquiry.';
  const adTarget = !q && ['/more-clients', '/cash-flow'].includes(record.source) && record.revenue >= 5;
  const subject = callFirst ? 'Call first · ' + who : record.planCall ? 'Email first · ' + who
    : (adTarget ? '$3M+ inquiry · ' : 'New inquiry · ') + who;
  const challenge = challenges[q?.challenge];
  const rows = [
    ['90-day budget (USD)', budgets[q?.budget] || investments[q?.investment]],
    ['When to start', timelines[q?.timing]], ['Role', roles[q?.role] || decisions[q?.decision]],
    ['Annual revenue', revenueBands[record.revenue]], ['Business stage', stages[q?.stage]],
    ['Desired result', q?.goal], ['Ownership', q ? undefined : ownershipBands[record.ownership]],
    ['Source', [record.source, record.campaign?.utm_source, record.campaign?.utm_medium, record.campaign?.utm_campaign, record.campaign?.utm_content].filter(Boolean).join(' · ')]
  ].filter(([, value]) => value);
  const label = q ? q.priority + ' priority · Growth assessment' : 'Consulting inquiry';
  const emailLink = mailto(record.email);
  const phoneLink = 'tel:' + String(record.phone || '').replace(/[^+\d]/g,'');
  const data = rows.map(([k,v]) => `<tr><th scope="row" style="text-align:left;vertical-align:top;padding:6px 14px 6px 0;color:#585462;font-size:13px">${escape(k)}</th><td style="padding:6px 0">${escape(v)}</td></tr>`).join('');
  return { to:[owner], reply_to:owner, subject,
    text:[label, contact, action, [record.phone, record.email].filter(Boolean).join(' · '), challenge, rows.map(([k,v]) => k + ' — ' + v).join('\n')].filter(Boolean).join('\n\n'),
    html:card(label, contact, `<p>${escape(action)}</p>${button(callFirst ? phoneLink : emailLink, callFirst ? 'Call ' + record.phone : 'Email applicant')}
      <p>${callFirst ? '<a href="' + escape(emailLink) + '">' + escape(record.email) + '</a>' : escape(record.email) + (record.phone ? ' · ' + escape(record.phone) : '')}</p>
      ${challenge ? '<h2 style="font-size:16px;margin:24px 0 4px">What they want to solve</h2><p style="margin-top:0">' + escape(challenge) + '</p>' : ''}
      <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #ddd6eb;font:15px/1.45 Arial,sans-serif">${data}</table>`) };
}

export function reminderEmail(record, day, note) {
  const subject = 'Day ' + day + ' follow-up · ' + subjectName(record);
  const draft = 'Hi ' + record.name.trim().split(/\s+/)[0] + ',\n\n' + note + '\n\nLautaro';
  const context = 'Check your last conversation first. Skip this if they declined or you’ve already agreed on a next step.';
  const compose = mailto(record.email) + '?subject=' + encodeURIComponent('Your growth assessment') + '&body=' + encodeURIComponent(draft);
  return {to:[owner],reply_to:owner,subject,
    text:[subject,record.email,context,'Suggested personal note',draft].join('\n\n'),
    html:card('Day ' + day + ' · Personal follow-up', subjectName(record), `<p>${escape(record.email)}</p><p>${escape(context)}</p>
      <div style="border-left:3px solid #afa0d5;padding:2px 14px;margin:20px 0">${draft.split('\n\n').map(line=>'<p>' + escape(line) + '</p>').join('')}</div>
      ${button(compose,'Edit email draft')}`)};
}
