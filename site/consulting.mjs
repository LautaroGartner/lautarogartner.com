import fs from 'node:fs';
import { edgeWaves } from './giveaway-elements.mjs';
import { studioButton } from './studio-preview.mjs';

import { countryOptions } from './phone-countries.mjs';
import { revenueBands, ownershipBands } from './application-options.mjs';
const headline = 'Want more paying clients for your service business?';
const promise = 'Tell me about work you expected to win and didn’t. After we speak, I’ll send you a free audit with what I’d change first, why, and how to try it. Take it to your team or ask me to help put it into practice.';
const adHeadline = 'You sent the quote. You followed up. Then silence.';
const adIntro = 'Before you spend more to find the next client, let’s look at the one you almost won. We’ll talk through what happened. I’ll send you a free audit you can put to work yourself.';
const transcript = [
  'Think about the last job you were sure you’d win. The customer needed the work, you had a good conversation, and you sent the quote. Then nothing. Which part would you change before sending the next one?',
  'Here’s a hypothetical example. A buyer asks whether the work can be finished before they open a new location. Your proposal lists the work and the price. It leaves out the date. Another follow-up asking if they’ve decided still leaves their question unanswered.',
  'I’d look at the original conversation beside the proposal. Did the buyer actually say the date would decide it? Could your team commit to it? If both are true, put the date, what it depends on, and who needs to approve it in the next proposal. If the buyer already had those answers, I’d ask what happened after they received it before changing the offer.',
  'I’m Lautaro Gärtner. Bring me one opportunity like that. After we speak, I’ll send you a free audit with my recommendation and a way to check whether it helps. You can run with it yourself or have me help your team implement it.',
];
const problems = [
  [
    '“We’re busy, but cash is tight.”',
    'Compare customer payment dates with the expenses that come due to deliver the work.',
  ],
  [
    '“People ask for proposals, then go quiet.”',
    'Look at recent inquiries. What did people expect, what did you propose, and what happened next?',
  ],
  [
    '“Every new client puts more work on me.”',
    'Follow one engagement from agreement to delivery. Which decision, approval, or handoff still depends on you?',
  ],
];
const faq = [
  [
    'Which businesses do you work with?',
    'Service businesses across industries. The work is a good fit when you have customers who value your service and a team or operation that can put a change into practice.',
  ],
  [
    'What should I bring to the first conversation?',
    'A recent example and whatever numbers you already have.',
  ],
  [
    'Can you help my team implement the change?',
    'Yes. Once we agree on the change, we can define my role, who will do the work, and how we’ll check whether it helped.',
  ],
];
const discuss = '<a class="studio-action studio-action--line" href="#discuss">Request my free audit</a>';
function workedExample(campaign) {
  const recorded = campaign && ['more-clients.mp4', 'more-clients.vtt'].every(file =>
    fs.existsSync(new URL('../public/' + file, import.meta.url)));
  return `<section id="example" class="consult-section decision-example"><div class="studio-wrap">
  <p class="studio-label">Inside an audit · hypothetical example</p><h2>The buyer asked about Friday. The quote answered with a price.</h2>
  <p>A buyer is opening a new location. On the call they ask, “Can you finish before we open?” The proposal lists the scope and price. It never says when the work will be ready. Two follow-ups later, the job is still open.</p>
  ${recorded ? '<video controls playsinline preload="metadata" aria-label="Lautaro walks through the lost proposal"><source src="/more-clients.mp4" type="video/mp4"><track default kind="captions" srclang="en" label="English" src="/more-clients.vtt"></video>' : ''}
  <h3>What I’d check</h3><p>Put the buyer’s last question beside the proposal. Was the opening date essential? Could the team reliably meet it? Silence alone doesn’t tell us why the buyer walked away.</p>
  <h3>What I’d try first</h3><p>On the next time-sensitive quote, spell out the delivery date, what the buyer must approve, and by when. If the team can’t meet the date, say so before preparing the quote.</p>
  <h3>How the owner can judge it</h3><p>For the next comparable proposals, record which buyers make a decision, which become paying clients, and which questions come back. If dates were already clear, ask a buyer what held up the decision before rewriting anything.</p>
  ${campaign ? `<details id="transcript"${recorded ? '' : ' open'}><summary>Read the walkthrough · Lautaro Gärtner</summary>${transcript.map(p=>`<p>${p}</p>`).join('')}</details>` : ''}
  ${discuss}</div></section>`;
}

function form(escape) {
  const picker = (name, label, items) => `<div class="app-picker" data-picker>
    <input id="app-${name}" role="combobox" aria-label="${label}" aria-autocomplete="list" aria-expanded="false" aria-controls="${name}-options" autocomplete="off" placeholder="Type or choose an option" required>
    <button type="button" tabindex="-1" data-toggle aria-label="Show ${label.toLowerCase()} options">⌄</button>
    <input type="hidden" name="${name}">
    <ul id="${name}-options" role="listbox" aria-label="${label}" hidden>
    ${items.map((item,i)=>`<li id="${name}-${i}" role="option" aria-selected="false" data-value="${i}">${escape(item)}</li>`).join('')}
    </ul><span data-no-match hidden>No matching options.</span></div>`;
  const countries = countryOptions('en').map(({value, name, code}) =>
    `<option value="${value}">${escape(name)} (+${code})</option>`).join('');
  return `<section id="discuss" class="consult-section studio-wrap consult-apply">
 <div><h2>Request your free audit.</h2><p>I’ll get in touch to hear where you’re losing business. After we speak, I’ll send you the audit. You decide who puts it into practice.</p></div>
 <div><form data-application method="post" action="/api/application" class="enquiry-card">
 <p class="studio-label" data-progress>Step 1 of 3</p>
 <fieldset><legend tabindex="-1">Tell me about yourself.</legend>
 <div class="contact-field"><label for="app-name">Name</label><input id="app-name" name="name" autocomplete="name" maxlength="120" required></div>
 <div class="contact-field"><label for="app-email">Email</label><input id="app-email" name="email" type="email" autocomplete="email" maxlength="254" required></div>
 <div class="contact-field"><label for="app-tel">Phone</label><div class="consult-phone">
 <select name="phoneCountry" aria-label="Phone country or region" autocomplete="section-phone country"><option value="">Country code</option>${countries}</select>
 <input id="app-tel" name="tel" type="tel" autocomplete="tel" maxlength="40" required></div></div></fieldset>
 <fieldset hidden disabled><legend tabindex="-1">What’s your annual business revenue?</legend>${picker('revenue','Annual business revenue', revenueBands)}</fieldset>
 <fieldset hidden disabled><legend tabindex="-1">What’s your ownership share?</legend>${picker('ownership','Ownership share', ownershipBands)}</fieldset>
 <div class="contact-trap" aria-hidden="true"><label>Leave empty<input name="company" tabindex="-1" autocomplete="off"></label></div>
 <div class="app-actions"><button type="button" data-back hidden>Back</button><button type="submit" class="consult-submit" data-next disabled><span>Continue</span><span aria-hidden="true">→</span></button></div>
 <p role="status" data-status></p><noscript>Enable JavaScript to apply or email lautaro@lautarogartner.com.</noscript></form>
 <p data-confirm tabindex="-1" hidden>I’ve received your audit request. I’ll get in touch to arrange our conversation. Bring one recent opportunity and whatever you already have from it.</p></div></section>`;
}
export function consultingPage(campaign, escape) {
  const title = campaign ? adHeadline : 'Business Consultant for Service Businesses';
  const description = campaign ? adIntro : promise;
  const html = `<link rel="stylesheet" href="/consulting.css?v=2"><div class="studio-page consulting">
 <section class="consult-hero" data-wave-hero><div class="hero-edge-motion" aria-hidden="true">${edgeWaves}</div>
 <div class="studio-wrap"><p class="studio-label">Lautaro Gärtner · Business Consultant</p><h1>${campaign ? adHeadline : headline}</h1><p>${description}</p>
 <div class="consult-actions">${studioButton('#discuss', 'Request my free audit', escape)}<a class="studio-action studio-action--line" href="#example">See a sample audit</a></div></div></section>
 ${
   campaign
     ? ''
     : `<section class="studio-services"><div class="studio-wrap"><h2>What owners come to me with</h2><div class="studio-offers">${problems.map(([h, p]) => `<article><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></div></section>
 <section class="studio-wrap consult-section with-portrait"><img src="/portrait/lautaro-360.webp" width="180" height="180" loading="lazy" alt="Lautaro Gärtner"><div><h2>What you get after we talk</h2><p>Bring a recent inquiry, quote, or job that earned less than you expected. We’ll go through what the customer wanted, what you offered, and what happened next.</p><p>I’ll write up what the evidence points to, the first change I’d test, and what to watch. The free audit is yours to use. If you want implementation help, we can agree on the work together.</p></div></section>`
 }
 ${workedExample(campaign)}${campaign ? '' : `<section class="studio-wrap consult-section"><h2>Questions owners ask</h2>${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`}
 ${form(escape)}</div><script defer src="/phone-number.min.js"></script><script defer src="/application.js?v=2"></script>`;
  return { title, description, html };
}
