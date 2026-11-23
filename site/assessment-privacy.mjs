const policy = `<p>I’m Lautaro Gärtner. When you request a guide or an assessment, I store your name, email, phone number and form answers. I use your email to deliver your guide and editable deal memo.</p>
<h3>When I’ll call</h3><p>A phone number is required to submit the form. Submitting the growth assessment requests a call at that number. I keep the call request with your submission. You can decline further contact at any time.</p>
<h3>How I use your answers</h3><p>For the assessment, your business stage, revenue, growth challenge, potential budget, role and timing help me prioritize call requests and choose a useful first step. I use your answers to prepare personal follow-ups about the assessment. My hosting, database and email providers help store the request, deliver your files and notify me. If you submit a form on Facebook or Instagram, Meta also processes it under its own privacy policy.</p>
<h3>Website measurement</h3><p>You can change analytics and advertising preferences in this site’s data settings. When advertising measurement is enabled, Meta receives a page view when you open the assessment landing page and a lead event after you submit. These events can include the page address, browser and network information, and ad identifiers. The lead event also includes a conversion ID. The event excludes your contact fields, qualification answers and private call priority.</p>
<h3>Contact me about your data</h3><p>To withdraw a call request or ask about access, correction or deletion, email <a href="mailto:lautaro@lautarogartner.com">lautaro@lautarogartner.com</a>.</p>`;

export function privacyDialog() {
  return `<dialog class="assessment-policy" aria-labelledby="policy-heading"><div class="policy-head"><h2 id="policy-heading">Assessment privacy policy</h2><button type="button" data-close-policy autofocus>Close</button></div><div class="policy-copy">${policy}</div></dialog>`;
}
export function privacyPage() {
  return `<article class="standalone-policy"><h1>Assessment privacy policy</h1>${policy.replaceAll('<h3>', '<h2>').replaceAll('</h3>', '</h2>')}</article>`;
}
