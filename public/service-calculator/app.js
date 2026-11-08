import { calculate, money } from './model.js';
for (const root of document.querySelectorAll('[data-service-calculator]')) {
  const form = root.querySelector('form'), copy = root.querySelector('[data-copy-quote]');
  const status = root.querySelector('[data-copy-status]'), error = root.querySelector('#calculator-error');
  const es = root.dataset.language === 'es';
  let quote;
  function update() {
    status.textContent = '';
    try {
      quote = calculate({ packageId: form.elements.package.value, quantity: Number(form.elements.quantity.value), extra: form.elements.extra.checked, priority: form.elements.priority.checked });
      for (const [key, value] of Object.entries(quote)) root.querySelector(`[data-value="${key}"]`).textContent = money(value);
      copy.disabled = false;
      error.textContent = '';
      form.elements.quantity.removeAttribute('aria-invalid');
    } catch {
      quote = null;
      copy.disabled = true;
      error.textContent = es ? 'Ingresá una cantidad entera entre 1 y 20. El total anterior ya no corresponde a estos datos.' : 'Enter a whole quantity from 1 to 20. The previous total no longer applies to these inputs.';
      form.elements.quantity.setAttribute('aria-invalid', 'true');
      for (const node of root.querySelectorAll('[data-value]')) node.textContent = '—';
    }
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('reset', event => {
    event.preventDefault();
    form.elements.package.selectedIndex = 0;
    form.elements.quantity.value = form.elements.quantity.defaultValue;
    for (const name of ['extra', 'priority']) form.elements[name].checked = form.elements[name].defaultChecked;
    update();
  });
  copy.addEventListener('click', async () => {
    if (!quote) return;
    const label = form.elements.package.selectedOptions[0].textContent;
    const text = [es ? 'DEMO — importes ficticios en USD; no es una oferta comercial.' : 'DEMO — fictional USD amounts; not a commercial offer.', label, `${es ? 'Cantidad' : 'Quantity'}: ${form.elements.quantity.value}`, `${es ? 'Extras' : 'Extras'}: ${money(quote.extras)}`, `${es ? 'Recargo' : 'Surcharge'}: ${money(quote.surcharge)}`, `Total: ${money(quote.total)}`].join('\n');
    try { await navigator.clipboard.writeText(text); status.textContent = es ? 'Resumen de ejemplo copiado.' : 'Example summary copied.'; }
    catch { status.textContent = text; }
  });
  update();
  copy.hidden = false;
}
