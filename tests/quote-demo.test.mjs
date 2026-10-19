import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateQuote, inquiryMessage, whatsappUrl } from '../public/quote-demo/model.js';

test('quote totals cover all packages, every extra combination, and both delivery modes', () => {
  const basePrices = { logo: 120000, identidad: 240000, lanzamiento: 360000 };
  const extraPrices = { redes: 45000, tarjetas: 25000, revision: 20000 };
  const ids = Object.keys(extraPrices);
  for (const [packageId, price] of Object.entries(basePrices)) {
    for (let mask = 0; mask < 8; mask++) {
      const selected = ids.filter((_, index) => mask & (1 << index));
      const subtotal = price + selected.reduce((sum, id) => sum + extraPrices[id], 0);
      for (const rush of [false, true]) {
        const quote = calculateQuote(packageId, selected, rush);
        assert.equal(quote.subtotal, subtotal);
        assert.equal(quote.total, rush ? subtotal * 1.25 : subtotal);
        assert.equal(quote.selectedExtras.length, selected.length);
      }
    }
  }
});

test('known demo scenario and delivery estimates match the displayed offer', () => {
  const quote = calculateQuote('identidad', ['redes'], true);
  assert.equal(quote.total, 356250);
  assert.equal(quote.rushFee, 71250);
  assert.equal(quote.days, 8);
  assert.equal(calculateQuote('logo').days, 10);
  assert.equal(calculateQuote('lanzamiento', [], true).days, 10);
  assert.equal(calculateQuote('logo', ['redes', 'redes', 'unknown']).total, 165000);
  assert.throws(() => calculateQuote('unknown'));
});

test('WhatsApp shares the current quote without a fixed recipient and identifies it as a demo', () => {
  const quote = calculateQuote('identidad', ['redes'], true);
  const url = new URL(whatsappUrl(quote));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/');
  assert.equal(url.searchParams.get('text'), inquiryMessage(quote));
  const message = url.searchParams.get('text');
  for (const text of ['DEMO', 'Identidad de marca', 'Plantillas para redes', 'ARS 356.250', 'ARS 71.250', '8 días hábiles', 'impuestos aplicables']) assert.ok(message.includes(text), text);
  assert.ok(!message.includes('Tarjeta personal'));
});

test('standalone page renders in Spanish and includes the demo assets and disclosure', async () => {
  const { quoteDemoPage } = await import('../site/quote-demo.mjs');
  const { generateSitePage } = await import('../vendor/paideia-framework/build/site-build.js');
  const page = quoteDemoPage();
  const html = generateSitePage({ title: 'Lautaro Gärtner', url: 'https://www.lautarogartner.com', posts: [], pages: [page] }, page);
  assert.match(html, /<html lang="es">/);
  assert.match(html, /https:\/\/www.lautarogartner.com\/demo\/cotizador/);
  assert.match(html, /Esto es una demo/);
  assert.match(html, /Elegís el contacto en WhatsApp/);
  assert.match(html, /type="module" src="\/quote-demo\/app.js"/);
  assert.equal((html.match(/name="package"/g) || []).length, 3);
  assert.equal((html.match(/name="extra"/g) || []).length, 3);
});
