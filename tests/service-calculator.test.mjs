import test from 'node:test';
import assert from 'node:assert/strict';
import {calculate} from '../public/service-calculator/model.js';
import fs from 'node:fs';

test('sample quote rules handle all quantities, packages and optional charges in cents', () => {
  for (const [packageId, unit] of [['essential', 15000], ['extended', 25000]]) {
    for (let quantity = 1; quantity <= 20; quantity++) {
      for (const extra of [false, true]) for (const priority of [false, true]) {
        const expected = (unit + (extra ? 2500 : 0)) * quantity;
        const result = calculate({packageId, quantity, extra, priority});
        assert.equal(result.subtotal, expected);
        assert.equal(result.total, expected + (priority ? Math.round(expected / 4) : 0));
      }
    }
  }
  assert.equal(calculate({packageId:'extended',quantity:3,extra:true,priority:true}).total,103125);
});
test('invalid quantities and package ids never produce a quote', () => {
  for (const quantity of [0, -1, 21, 1.5, NaN, Infinity, '2', null]) assert.throws(() => calculate({quantity}), RangeError);
  for (const packageId of ['toString','__proto__','unknown','']) assert.throws(() => calculate({packageId}), RangeError);
});
test('service and demo routes are discoverable with consistent canonicals, language pairs and service identity', () => {
  const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
  const context=JSON.parse(fs.readFileSync('dist/context.json','utf8'));
  for (const route of ['services/quote-calculator-development','services/contact-form-repair','demo/quote-calculator']) {
    for (const prefix of ['', 'es/']) {
      const path=`/${prefix}${route}`, url=`https://www.lautarogartner.com${path}`;
      const html=fs.readFileSync(`dist${path}/index.html`,'utf8');
      assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
      assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
      assert.ok(sitemap.includes(`<loc>${url}</loc>`));
      assert.equal(context.pages.find(page=>page.path===path).canonical,url);
      assert.ok(html.includes(`hreflang="en" href="https://www.lautarogartner.com/${route}"`));
      assert.ok(html.includes(`hreflang="es" href="https://www.lautarogartner.com/es/${route}"`));
      if (route.startsWith('services/')) {
        const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
        const service=graph.find(node=>node['@type']==='Service');
        assert.equal(service.url,url);assert.equal(service.provider['@id'],'https://www.lautarogartner.com/#person');
        assert.equal(graph.find(node=>node['@type']==='WebPage').mainEntity['@id'],service['@id']);
      }
    }
  }
});
test('calculator enquiry service is accepted by the shared form and API catalogue', async () => {
  const {enquiryServices}=await import('../site/enquiry-options.mjs');
  assert.ok(enquiryServices.some(option=>option.value==='quote-calculator'));
  const html=fs.readFileSync('dist/contact/index.html','utf8');
  assert.ok(html.includes('<option value="quote-calculator">Custom quote calculator</option>'));
});
