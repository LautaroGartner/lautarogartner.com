import { calculateQuote, money, whatsappUrl } from './model.js';
const form = document.querySelector('#quote-form');
const summary = document.querySelector('.quote-summary');
const breakdown = document.querySelector('#quote-breakdown');
function row(label, value, className = '') {
  const line = document.createElement('div');
  line.className = `summary-row ${className}`;
  const name = document.createElement('span');
  name.textContent = label;
  const price = document.createElement('span');
  price.textContent = money(value);
  line.append(name, price);
  return line;
}
function update() {
  const data = new FormData(form);
  const quote = calculateQuote(data.get('package'), data.getAll('extra'), data.get('delivery') === 'rush');
  const rows = [row(quote.selectedPackage.name, quote.selectedPackage.price)];
  for (const extra of quote.selectedExtras) rows.push(row(extra.name, extra.price));
  if (!quote.selectedExtras.length) {
    const note = document.createElement('p');
    note.className = 'summary-empty';
    note.textContent = 'Sin extras por ahora.';
    rows.push(note);
  }
  rows.push(row('Subtotal', quote.subtotal, 'summary-subtotal'));
  rows.push(row(quote.rushFee ? 'Entrega exprés · 25%' : 'Entrega estándar', quote.rushFee));
  breakdown.replaceChildren(...rows);
  document.querySelector('#quote-total').textContent = money(quote.total);
  document.querySelector('#quote-mobile-total').textContent = money(quote.total);
  document.querySelector('#quote-whatsapp').href = whatsappUrl(quote);
  document.querySelector('[data-standard-days]').textContent = quote.selectedPackage.days;
  document.querySelector('[data-rush-days]').textContent = Math.ceil(quote.selectedPackage.days / 2);
}
form.addEventListener('change', update);
document.querySelector('#quote-reset').addEventListener('click', () => {
  form.reset();
  update();
  form.querySelector('input:checked').focus();
});
update();
form.hidden = false;
summary.hidden = false;
document.querySelector('.quote-mobile-bar').hidden = false;
