import { privacyDialog } from './assessment-privacy.mjs';
import fs from 'node:fs';
import { studioButton } from './studio-preview.mjs';
import { edgeWaves } from './giveaway-elements.mjs';

import { stages, constraints, firstMove, budgets, roles, timelines, callConsent } from './acquisition-assessment.mjs';
import { countryOptions } from './phone-countries.mjs';
import { revenueBands } from './application-options.mjs';
import { adGuide, callPrep } from './growth-guides.mjs';
const adHeadline = 'Build a $5M business that funds its own growth.';
const adIntro = 'Find where sales slow down before you spend more to grow. Get a first step today and a written plan for your business after we talk.';
const transcript = [
  'Before you spend more to bring people in, look at where they stop. If the right people rarely find you, start with the invitation and where you put it. If they ask for a price and go quiet, find out what they still need. Someone asking why the work is worth the price needs a clearer offer. Someone who wants it but needs approval may just need terms they can pass along.',
  'Choose the situation that fits and you’ll see a first step you can try today. When you submit the form, I’ll email you the free guide and an editable deal memo so you can check what a sale leaves you and when the money comes in.',
  'When I call, we’ll follow one sale from first contact to payment and choose one change to test. I’ll send you the plan in writing, including what to measure before you put more money behind it. You can run it yourself.'
];

function followTheMoney() {
  return `<div class="audit-walkthrough" id="example"><h2>Follow the <span class="copy-accent">money.</span></h2>
  <p>Before you pay for more leads or lower your next quote, find out where buyers stop. Choose what sounds familiar. You’ll see one change you can try today.</p>
  ${Object.entries(constraints).map(([key, signal]) => {
    const [title, move] = firstMove({challenge:key});
    return `<details data-constraint="${key}"><summary>${signal}</summary><p><strong>${title}.</strong> ${move}</p></details>`;
  }).join('')}</div>`;
}

function questions() {
  const items = [
    ['How do I tell an offer problem from a sales problem?', 'A quiet buyer could mean either. Ask, “What do you still need to decide?” If they can’t see what the work will do for them, show the result and one reason to believe it. If they want the work but someone else has to approve it, give them the price, scope and start date in a note they can forward.'],
    ['Why would a buyer pay a deposit today?', 'Tell them exactly what the money reserves. If you book dates in the order deposits arrive, put the available date and the deposit amount in the quote. Show how much they’ll still owe. Use that reason only if paying really secures the date.'],
    ['When is a longer form worth it?', 'Think of a call where you both found out too late that the work wasn’t a fit. Put the question that would have settled it on your form. Then check how many worthwhile orders you win and how much time you spend on calls. Fewer inquiries can be a good trade if you win just as much work in fewer hours.'],
    ['How do I know when to spend more?', 'Take the price you collected on a sale. Subtract what it cost to win and deliver the work. Does what’s left cover its share of overhead and the profit you want? Check when the buyer paid, too. If similar orders leave enough money and you can fund and deliver the next batch, try a small increase and check again.'],
    ['What do I get after we talk?', 'I’ll send you a free written audit of the part of your business we reviewed. It spells out the first change, how to test it, what the test should cost and the result that would make it worth repeating. The plan is yours to use. If you’d like help putting it into practice, we can discuss that separately.']
  ];
  return `<section id="questions" class="studio-wrap consult-section"><h2>Questions owners ask</h2>${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`;
}

function campaignHero(escape) {
  const recorded = ['more-clients.mp4', 'more-clients.vtt'].every(file =>
    fs.existsSync(new URL('../public/' + file, import.meta.url)));
  return `<section class="consult-hero audit-hero" data-wave-hero><div class="hero-edge-motion" aria-hidden="true">${edgeWaves}</div>
  <div class="studio-wrap"><h1>${adHeadline.replace('$5M', '<span class="copy-accent">$5M</span>')}</h1>
  ${followTheMoney()}
  ${recorded ? `<div class="audit-walkthrough"><video controls playsinline preload="metadata" aria-label="Your free growth assessment"><source src="/more-clients.mp4" type="video/mp4"><track default kind="captions" srclang="en" label="English" src="/more-clients.vtt"></video><details id="transcript"><summary>Read the video transcript</summary>${transcript.map(p => `<p>${p}</p>`).join('')}</details></div>` : ''}
  <p>Get the free guide and use it on your next sale. After we talk, I’ll send you a written plan with one change to test and the result to look for before you spend more.</p><div class="consult-actions">${studioButton('#discuss', adGuide.cta, escape)}</div></div></section>`;
}

function form(escape) {
  const countries = countryOptions('en').map(({value, name, code}) => {
    const flag = String.fromCodePoint(...Array.from(value, letter => 127397 + letter.charCodeAt(0)));
    return `<li id="region-${value}" role="option" aria-selected="false" data-value="${value}" data-code="${code}" data-name="${escape(name)}"><span aria-hidden="true">${flag}</span> ${escape(name)} +${code}</li>`;
  }).join('');
  const select = (name, label, options) => `<div class="contact-field"><label for="app-${name}">${label}</label><select id="app-${name}" name="${name}" required><option value="">Choose an option</option>${Object.entries(options).map(([value, text]) => `<option value="${value}">${escape(text)}</option>`).join('')}</select></div>`;
  const contacts = ` <div class="contact-field"><label for="app-name">Full name</label><input id="app-name" name="name" autocomplete="name" maxlength="120" required></div>
 <div class="contact-field"><label for="app-email">Business email</label><input id="app-email" name="email" type="email" autocomplete="email" maxlength="254" required></div>
 <div class="contact-field"><label for="app-tel">Phone number</label><div class="consult-phone">
 <div class="app-picker phone-region" data-picker>
 <button type="button" data-country-toggle aria-label="Choose phone country or region" aria-haspopup="dialog" aria-expanded="false" aria-controls="phone-regions"><span data-flag aria-hidden="true">🌐</span><span aria-hidden="true">▾</span></button>
 <input type="hidden" name="phoneCountry">
 <div id="phone-regions" class="picker-menu" data-menu role="dialog" aria-label="Phone country or region" hidden>
 <input type="text" role="combobox" aria-label="Search countries or calling codes" autocomplete="off" aria-autocomplete="list" aria-expanded="false" aria-controls="region-options" placeholder="Search country or calling code">
 <ul id="region-options" role="listbox" aria-label="Countries">${countries}</ul>
 <span data-no-match hidden>No matching countries.</span></div></div>
 <span id="phone-prefix" data-dial-code></span><input id="app-tel" name="tel" type="tel" required autocomplete="tel" aria-describedby="phone-prefix" maxlength="40"></div></div>
 <p class="call-disclosure">${escape(callConsent)}</p>`;
  return `<section class="consult-section studio-wrap consult-apply">
 <div class="plan-intro"><h2>Get your free <span class="copy-accent">growth assessment.</span></h2>
 <p><strong>As soon as you submit,</strong> you’ll see one action you can take today based on the problem you picked.</p>
 <p>Check your inbox for <em>${adGuide.title}</em> and an editable deal memo. Before you send your next quote, use the memo to see how much you’ll keep and which bills come due before you get paid.</p></div>
 <div><form id="discuss" tabindex="-1" data-application data-submit-label="${escape(adGuide.cta)}" method="post" action="/api/application" class="enquiry-card">
 <p class="form-intro">By filling this out, you’re asking me to call. I’ll review your answers first. On the call, we’ll walk through one sale you’d like to win, from first contact to payment. We’ll pinpoint where it could stall and agree on what to try next. I’ll send you the steps in writing.</p>
 <p class="studio-label" data-progress>Step 1 of 3</p>
 <fieldset><legend tabindex="-1">What do you want to solve?</legend>
 ${select('challenge','Where does a sale slow down for you?',constraints)}
 ${select('budget','If the plan makes sense, how much could you invest in testing or implementing it over the next 90 days (USD)?',budgets)}</fieldset>
 <fieldset hidden disabled><legend tabindex="-1">Tell me about your business.</legend>
 ${select('role','What’s your role in the business?',roles)}
 ${select('timing','When would you want to put a plan into action?',timelines)}
 ${select('stage','Which best describes your business?',stages)}
 ${select('revenue','Annual business revenue',revenueBands)}</fieldset>
 <fieldset hidden disabled><legend tabindex="-1">Where should I send your assessment?</legend>
 <div class="contact-field"><label for="app-business">Business website or name</label><input id="app-business" name="business" autocomplete="organization" maxlength="160" required></div>
 ${contacts}</fieldset>
 <div class="contact-trap" aria-hidden="true"><label>Leave empty<input name="company" tabindex="-1" autocomplete="off"></label></div>
 <p class="policy-link"><a href="/privacy" data-show-policy>Privacy policy</a></p>
 <div class="app-actions"><button type="button" data-back hidden>Back</button><button type="submit" class="consult-submit" data-next disabled><span>Continue</span><span aria-hidden="true">→</span></button></div>
 <p role="status" data-status></p><noscript>Enable JavaScript to apply or email lautaro@lautarogartner.com.</noscript></form>${privacyDialog()}
 </div></section>`;
}
export function thankYouPage() {
  const moveTemplates = Object.keys(constraints).map(challenge => {
    const [title, move] = firstMove({ challenge });
    return `<template data-current-move="${challenge}"><h2>${title}</h2><p>${move}</p></template>`;
  }).join('');
  return `<link rel="stylesheet" href="/consulting.css?v=27"><div class="studio-page consulting">
  <section class="thank-you studio-wrap" data-thank-you>
    <p class="studio-label" data-receipt-label hidden>Assessment request received</p>
    <h1 data-receipt-heading>Your growth assessment</h1>
    <section data-first-move hidden><p class="studio-label">Your first move</p><h2></h2><p data-action-copy></p></section>
    ${moveTemplates}
    <div class="receipt-details">
      <section data-email-delivery hidden><h2>Check your inbox for the book</h2><p>Look for an email from Lautaro Gärtner with <em data-guide-title></em> in the subject. Inside you’ll find the book and your editable deal memo.</p><p data-book-start hidden></p></section>
      <section data-call-confirm hidden><h2>What to have ready when I call</h2><p>${callPrep}</p></section>
    </div>
    <p data-recovery>If you’ve already filled out the form, look for the book in your inbox. To get your own first step, <a href="/#discuss">start your free assessment</a>.</p>
  </section></div><script defer src="/application.js?v=24"></script>`;
}

export function consultingPage(escape) {
  const html = `<link rel="stylesheet" href="/consulting.css?v=26"><div class="studio-page consulting">
 ${campaignHero(escape)}
 ${questions()}
 ${form(escape)}</div><script defer src="/phone-number.min.js"></script><script defer src="/application.js?v=24"></script>`;
  return {title: adHeadline, description: adIntro, html};
}
