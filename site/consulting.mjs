import fs from 'node:fs';
import { edgeWaves } from './giveaway-elements.mjs';
import { studioButton } from './studio-preview.mjs';

import { revenueBands, ownershipBands } from './application-options.mjs';
const headline = 'What’s holding back growth in your service business?';
const promise =
  'I work with service business owners to figure out what to fix first. We look at the offer, the numbers, and how the work gets done. Then I help your team put the right change into practice.';
const adHeadline = 'You signed a $50,000 project. Why do you need $7,000 to start it?';
const adIntro =
  'A worked example for service business owners. See how the dates of two payments can change the decision you make next.';
const label = 'Illustrative service business · hypothetical figures';
const transcript = [
  'You can sign a fifty-thousand-dollar project on Monday and still need seven thousand dollars to start it. Let’s put two dates on paper and you’ll see how.',
  'Say the customer pays five thousand dollars upfront. Before their next payment comes in, twelve thousand dollars of costs come due. At that point this project has used seven thousand dollars from somewhere else in the business. Now picture starting three projects on those same terms in the same week. Could you comfortably cover twenty-one thousand dollars while you wait?',
  'That’s a question I’d want to answer before spending more to bring new work in. I’d ask when the next payment actually clears, which costs really have to come first, and what the customer would need to see to approve an earlier milestone. A change to the payment schedule might help. Sometimes the simpler move is to stagger start dates. Your numbers tell us which is worth trying.',
  'I’m Lautaro Gärtner, a business consultant. I work with service business owners on decisions like this. For one owner the issue is cash timing. For another it might be the offer itself or a delivery process that still needs them at every step.',
  'You can use this worksheet with your own numbers. If there’s a decision you’d like to work through together, use the short form and tell me about it when we speak.',
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
const discuss = '<a class="studio-action studio-action--line" href="#discuss">Discuss your business</a>';
function worksheet(campaign) {
  const recording =
    campaign &&
    ['cash-flow.mp4', 'cash-flow.vtt'].every((file) =>
      fs.existsSync(new URL('../public/' + file, import.meta.url)),
    );
  return `<section id="example" class="consult-section worksheet"><div class="studio-wrap">
 <p class="studio-label">${label}</p><h2>Where does the first $7,000 come from?</h2>
 <p>The owner signs a $50,000 project. These are the only receipts and expenses for this project before the second customer payment.</p>
 ${recording ? '<video controls playsinline preload="metadata" poster="/cash-flow-social.jpg" aria-label="Lautaro explains the project cash timeline"><source src="/cash-flow.mp4" type="video/mp4"><track default kind="captions" srclang="en" label="English" src="/cash-flow.vtt"></video>' : ''}
 ${campaign ? '<a class="text-link" href="#transcript">Read the transcript</a>' : ''}
 <table><caption>Cash timeline for one project</caption><thead><tr><th scope="col">When</th><th scope="col">Cash movement</th><th scope="col">Balance</th></tr></thead>
 <tbody><tr><th scope="row">Customer confirms</th><td>+$5,000</td><td>$5,000</td></tr>
 <tr><th scope="row">Delivery costs come due</th><td>−$12,000</td><td><strong>−$7,000</strong></td></tr></tbody></table>
 <p>The business needs to cover $7,000 until the next customer payment. To run this check on your own project, write down the next three dates cash comes in or goes out, then calculate the balance after each one. Compare the lowest balance with cash you can actually set aside. Before changing your offer, check whether changing a payment milestone, a delivery date, or the timing of a cost would close the gap.</p>
 <details class="cash-tool"><summary>Try your own numbers</summary><p>Enter up to three cash movements in date order, starting from zero. Use a minus sign for money going out. Your numbers stay on this page.</p>
 ${[1, 2, 3].map((i) => `<div class="cash-entry"><label>Date ${i}<input type="date" data-date></label><label>Cash in or out ($)<input type="number" step="0.01" aria-label="Cash in or out for date ${i}" data-cash></label></div>`).join('')}
 <p aria-live="polite" data-gap></p></details>
 <h3>What I’d check before changing the terms</h3><p>What would the customer need to see to approve a milestone invoice? Which costs could the team move without delaying delivery? If reserves comfortably cover the gap, the current terms may already work.</p>
 <p>Track the largest gap between cash collected and costs due. Estimating final profit requires the full delivery costs.</p>
 ${campaign ? `<details id="transcript"${recording ? '' : ' open'}><summary>Transcript · Lautaro Gärtner</summary>${transcript.map((p) => `<p>${p}</p>`).join('')}</details>` : ''}
 ${discuss}</div></section>`;
}

function form(escape) {
  const options = (name, items) =>
    items
      .map(
        (label, i) =>
          `<label class="choice"><input type="radio" name="${name}" value="${i}" required><span>${escape(label)}</span></label>`,
      )
      .join('');
  return `<section id="discuss" class="consult-section studio-wrap consult-apply">
 <div><h2>Discuss your business.</h2><p>I’ll review your request and get in touch to hear what you’re working through.</p></div>
 <div><form data-application method="post" action="/api/application" class="enquiry-card">
 <p class="studio-label" data-progress>Step 1 of 3</p>
 <fieldset><legend tabindex="-1">How can I reach you?</legend>
 ${[
   ['name', 'Name', 'text'],
   ['email', 'Email', 'email'],
   ['tel', 'Phone', 'tel'],
 ]
   .map(
     ([key, label, type]) =>
       `<div class="contact-field"><label for="app-${key}">${label}</label><input id="app-${key}" name="${key}" type="${type}" autocomplete="${key}" maxlength="${key === 'email' ? 254 : key === 'tel' ? 40 : 120}" required></div>`,
   )
   .join('')}</fieldset>
 <fieldset hidden disabled><legend tabindex="-1">What’s your annual business revenue?</legend>${options('revenue', revenueBands)}</fieldset>
 <fieldset hidden disabled><legend tabindex="-1">What’s your ownership share?</legend>${options('ownership', ownershipBands)}</fieldset>
 <div class="contact-trap" aria-hidden="true"><label>Leave empty<input name="company" tabindex="-1" autocomplete="off"></label></div>
 <div class="app-actions"><button type="button" data-back hidden>Back</button><button type="submit" class="round-submit" data-next disabled>Continue</button></div>
 <p role="status" data-status></p><noscript>Enable JavaScript to apply or email lautaro@lautarogartner.com.</noscript></form>
 <p data-confirm tabindex="-1" hidden>I’ve received your request. I’ll get in touch. It helps to bring one decision you’re weighing and any numbers you already use to make it.</p></div></section>`;
}
export function consultingPage(campaign, escape) {
  const title = campaign ? adHeadline : 'Business Consultant for Service Businesses';
  const description = campaign ? adIntro : promise;
  const html = `<link rel="stylesheet" href="/consulting.css"><div class="studio-page consulting">
 <section class="consult-hero"><div class="hero-edge-motion" aria-hidden="true">${edgeWaves}</div>
 <div class="studio-wrap"><p class="studio-label">Lautaro Gärtner · Business Consultant</p><h1>${campaign ? adHeadline : headline}</h1><p>${description}</p>
 <div class="consult-actions">${studioButton('#example', campaign ? 'See the cash timeline' : 'See a worked example', escape)}${discuss}</div></div></section>
 ${
   campaign
     ? ''
     : `<section class="studio-services"><div class="studio-wrap"><h2>What owners come to me with</h2><div class="studio-offers">${problems.map(([h, p]) => `<article><h3>${h}</h3><p>${p}</p></article>`).join('')}</div></div></section>
 <section class="studio-wrap consult-section with-portrait"><img src="/portrait/lautaro-360.webp" width="180" height="180" loading="lazy" alt="Lautaro Gärtner"><div><h2>How we work together</h2><p>Bring me a decision you’re facing. I’ll ask you to walk me through a recent example and the numbers behind it. Together we decide what is worth changing first. If we work together on implementation, we agree who will do what, what your team needs, and how we’ll tell whether it helped.</p><p>Your team leaves with a change to try, a person responsible for it, and a measure to watch.</p></div></section>`
 }
 ${worksheet(campaign)}${campaign ? '' : `<section class="studio-wrap consult-section"><h2>Questions owners ask</h2>${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`}
 ${form(escape)}</div><script defer src="/application.js"></script>`;
  return { title, description, html };
}
