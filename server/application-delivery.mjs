import { adGuide, guideForSource } from '../site/growth-guides.mjs';
import { newLeadEmail, reminderEmail } from './lead-notification.mjs';
import { firstMove, assessmentResponse } from '../site/acquisition-assessment.mjs';
import { kitPath } from './growth-kit-link.mjs';


const owner = 'lautaro@lautarogartner.com';
function assessmentFollowUp(answers, day) {
  if (day === 2) {
    const questions = {
      offer: 'When you read your offer out loud, which part would you want proof of before buying? If you send me that line, I’ll suggest a way to make it clearer.',
      funnel: 'Did one place come to mind where people already look for help with this problem? Send me the one you’re considering and we can work out what to offer them there.',
      sales: 'What’s the question you hear just before a sale stalls? Even a few words are enough for us to work with.'
    };
    return questions[answers.challenge] || 'Did the first step address the problem you had in mind? If it missed something, tell me what you’d change.';
  }
  return 'Is this still the part of the business you want to work on? If it is, send me a time that suits you and your time zone. I’ll reply to confirm.';
}

function assessmentEmail(record, guide, url) {
  const [move, instruction] = firstMove(record.qualification);
  const book = url + '&format=pdf';
  const subject = 'Your book · ' + guide.title;
  const guidance = assessmentResponse(record);
  const signedLink = link => link.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  const memo = 'Use the editable deal memo to put your price, delivery costs and first payment on one page.';
  return {
    to: [record.email], reply_to: owner, subject,
    text: [
      guidance.thanks, 'Here’s your copy of ' + guide.title + '.', 'Read the book (PDF)\n' + book, guidance.reading,
      'Your first move · ' + move, instruction,
      ...(guidance.next ? [guidance.heading, guidance.next] : []),
      memo + '\n' + url, 'Lautaro Gärtner'
    ].join('\n\n'),
    html: `<div style="max-width:560px;margin:auto;padding:24px 16px;font:16px/1.55 Arial,sans-serif;color:#241e31">
      <p style="margin:0;color:#51438c;font-weight:bold">Lautaro Gärtner</p>
      <p>${guidance.thanks}</p>
      <h1 style="font-size:28px;line-height:1.15">${guide.title}</h1>
      <p><a href="${signedLink(book)}" style="display:inline-block;padding:11px 18px;border-radius:8px;background:#51438c;color:#fff;text-decoration:none;font-weight:bold">Read the book (PDF)</a></p><p>${guidance.reading}</p>
      <p style="margin:26px 0 3px;color:#51438c">Your first move</p>
      <h2 style="margin:0;font-size:21px">${move}</h2><p>${instruction}</p>
      ${guidance.next ? `<h2 style="font-size:19px">${guidance.heading}</h2><p>${guidance.next}</p>` : ''}
      <p>${memo} <a href="${signedLink(url)}">Open the memo (Word)</a></p>
      <p>Lautaro Gärtner</p></div>`
  };
}

function kitEmail(kind, record, id, env) {
  const guide = guideForSource(record.source, record.qualification);
  if (kind === 'gift') {
    const host = env.VERCEL_ENV === 'preview' && env.VERCEL_URL ? 'https://' + env.VERCEL_URL : 'https://www.lautarogartner.com';
    const url = host + kitPath(id, env.ENQUIRY_SECRET || env.SESSION_SECRET);
    if (record.qualification) return assessmentEmail(record, guide, url);
    return { to: [record.email], reply_to: owner, subject: 'Your guide · ' + guide.title,
      text: [
        'Thank you for taking the time to tell me about your business. Here’s the guide I put together for you.',
        'Download ' + guide.title + ' (PDF)', url + '&format=pdf',
        'Editable copy of the deal memo (Word):', url,
        guide === adGuide ? 'Start with the chapter that addresses your growth challenge, then draft your own offer on the fillable final page.' : 'Start on page 2 with one live quote. Offer your usual scope and a lower-priced option that saves you real work. On day seven, record the buyer’s choice and cash received.',
        record.planCall ? 'I’ve received your call request. I’ll email you personally to arrange a time. If you already have a quote in mind, you can reply with it.' : 'Want help applying one of the pages? Reply with the one you picked. If you’d like, we can build a free 90-day plan together.',
        'For the planning call, bring your paid wins, one quote and available delivery slots. We’ll compare two paths and I’ll send the 90-day plan in writing.',
        record.planCall ? 'If you have preferred times, reply with two options and your time zone.' : 'If you want a call, reply with two times that work and your time zone.',
        'Lautaro'
      ].join('\n\n') };
  }
  const day = kind === 'remind-2' ? 2 : 7;
  const note = record.qualification ? assessmentFollowUp(record.qualification, day) : day === 2
    ? 'Which number changed how you looked at the quote? If you’re unsure about a cost or payment term, send it over and I’ll help you check it.'
    : 'What happened with the buyer this week? Did they accept the terms, pay, or tell you what still needs to change? If you want help deciding what to repeat or change, we can put together a free 90-day plan.';
  return reminderEmail(record, day, note);
}

export function deliverApplication(env, request = fetch) {
  return async (kind, id, event, record) => {
    let response;
    if (kind !== 'meta') {
      let message;
      if (kind === 'notify') {
        message = newLeadEmail(record);
      } else {
        if (!['gift', 'remind-2', 'remind-7'].includes(kind)) throw Error('Unknown delivery');
        message = kitEmail(kind, record, id, env);
      }
      response = await request('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(10000),
        headers: { Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json',
          'Idempotency-Key': kind === 'notify' ? 'consulting/' + id : 'consulting/' + id + '/' + kind },
        body: JSON.stringify({ from: env.ENQUIRY_FROM, ...message })
      });
      if (!response.ok || !(await response.json()).id) throw Error('Notification not accepted');
    } else {
      if (!record.pixelID || record.pixelID !== env.META_PIXEL_ID)
        throw Error('Dataset configuration changed');
      const data = { data: [event] };
      if (env.META_TEST_EVENT_CODE && env.VERCEL_ENV !== 'production')
        data.test_event_code = env.META_TEST_EVENT_CODE;
      response = await request('https://graph.facebook.com/v25.0/' + env.META_PIXEL_ID + '/events', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: 'Bearer ' + env.META_CAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const receipt = await response.json();
      if (!response.ok || receipt.events_received !== 1) {
        if (env.VERCEL_ENV === 'production') console.warn('Meta Lead rejected', id, response.status, receipt.error?.code);
        throw Error('Conversion not accepted');
      }
      if (env.VERCEL_ENV === 'production') console.info('Meta Lead accepted', id);
    }
  };
}
