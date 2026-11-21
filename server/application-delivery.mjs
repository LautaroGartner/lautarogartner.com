import { adGuide, guideForSource } from '../site/growth-guides.mjs';
import { ownershipBands, revenueBands } from '../site/application-options.mjs';
import { stages, challenges, budgets, decisions, timelines, investments, roles, firstMove, assessmentResponse } from '../site/acquisition-assessment.mjs';
import { kitPath } from './growth-kit-link.mjs';


const owner = 'lautaro@lautarogartner.com';
function assessmentNextAction(record) {
  if (!record.planCall) return 'Send resources only.';
  if (record.qualification.priority === 'High') return 'Call now at ' + record.phone + ' about their stated goal.';
  return 'Send the guide and first step now. Use the day 2 and day 7 reminders for personal follow-up.';
}

function assessmentFollowUp(answers, day) {
  if (day === 2) {
    const [action] = firstMove(answers);
    return 'I sent you a first step for your business: “' + action + '.” Does that address the part you want to fix first? If something else is getting in the way, reply with it and I’ll point you to a better place to start.';
  }
  if (answers.role === 'coowner' || answers.decision === 'joint' || answers.decision === 'group')
    return 'What would the people deciding with you need to see before backing a first test? Send me the question you’re working through and I’ll help you put numbers to it.';
  return 'Did you get a chance to work through the first step? Send me what you drafted or the decision that’s still open, and I’ll help you choose what to test next.';
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
  return { to: [owner], subject: (record.qualification ? record.qualification.priority + ' priority · ' : '') + 'Day ' + day + ' reminder · ' + guide.title,
    text: [record.name + ' · ' + record.email, record.business, record.qualification?.goal, record.planCall ? 'They requested a planning call.' : 'They requested the kit only.',
      'Check your conversation before following up. Skip this note if they declined, opted out, or you are already working together. If they ask about implementation, discuss the scope and terms with them directly.',
      'Suggested personal note', note].filter(Boolean).join('\n\n') };
}

export function deliverApplication(env, request = fetch) {
  return async (kind, id, event, record) => {
    let response;
    if (kind !== 'meta') {
      let message;
      if (kind === 'notify') {
        // Revenue bands are stored as stable zero-based option IDs. Band 5 starts at $3M.
        const inAdRevenueTarget = ['/more-clients', '/cash-flow'].includes(record.source) && record.revenue >= 5;
        const lines = [
          ['Name', record.name],
          ['Email', record.email],
          ['Phone', record.phone],
          ['Annual revenue', revenueBands[record.revenue] || 'Prefer not to say'],
          ...(record.qualification ? [
            ['Business',record.business], ['Business stage',stages[record.qualification.stage]],
            ['Growth challenge',challenges[record.qualification.challenge]],
            ...(record.qualification.budget ? [
              ...(record.qualification.goal ? [['Desired result',record.qualification.goal]] : []), ['90-day budget (USD)',budgets[record.qualification.budget]],
              record.qualification.decision ? ['Who approves',decisions[record.qualification.decision]] : ['Role',roles[record.qualification.role]], ['Desired start',timelines[record.qualification.timing]]
            ] : [['Investment',investments[record.qualification.investment]], ['Role',roles[record.qualification.role]]]),
            ['Call priority',record.qualification.priority], ['Next action',assessmentNextAction(record)],
            ['Callback permission', record.qualification.consent || 'None']
          ] : [['Ownership', ownershipBands[record.ownership]]]),
          ['Page', record.source],
          ...(record.kit ? [['Planning call requested', record.planCall ? 'Yes' : 'No']] : []),
          ...Object.entries(record.campaign),
        ];
        message = { to: [owner], reply_to: record.email,
          subject: (record.qualification ? record.qualification.priority + (record.qualification.priority === 'High' && record.planCall ? ' priority · Call now · ' : ' priority · Acquisition assessment · ') + record.business : inAdRevenueTarget ? 'Consulting application · $3M+ annual revenue' : 'Consulting application · Lautaro Gärtner') + (record.planCall ? ' · Planning call requested' : ''),
          text: lines.map(([k, v]) => k + ' — ' + v).join('\n') };
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
      if (!response.ok || (await response.json()).events_received !== 1)
        throw Error('Conversion not accepted');
    }
  };
}
