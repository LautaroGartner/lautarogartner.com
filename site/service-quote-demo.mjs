import { calculate, money } from '../public/service-calculator/model.js';
export function calculatorDemo(lang = 'en') {
  const es = lang === 'es', initial = calculate();
  return `<div class="service-calculator" data-service-calculator data-language="${lang}">
    <form class="calculator-controls" aria-label="${es ? 'Opciones del ejemplo' : 'Example pricing options'}">
      <p class="section-label">${es ? 'PRECIOS FICTICIOS · USD' : 'FICTIONAL PRICES · USD'}</p>
      <label for="calculator-package">${es ? 'Paquete de ejemplo' : 'Example package'}</label>
      <select id="calculator-package" name="package"><option value="essential">${es ? 'Esencial' : 'Essential'} — $150.00</option><option value="extended">${es ? 'Ampliado' : 'Extended'} — $250.00</option></select>
      <label for="calculator-quantity">${es ? 'Cantidad (1 a 20)' : 'Quantity (1–20)'}</label><input id="calculator-quantity" name="quantity" type="number" min="1" max="20" step="1" value="1" required inputmode="numeric" aria-describedby="calculator-error">
      <label class="calculator-check"><input name="extra" type="checkbox">${es ? 'Extra opcional: USD 25 por unidad' : 'Optional extra: $25 per unit'}</label>
      <label class="calculator-check"><input name="priority" type="checkbox">${es ? 'Prioridad de ejemplo: +25%' : 'Example priority surcharge: +25%'}</label>
      <p id="calculator-error" class="calculator-error" role="status" aria-live="polite"></p>
      <button type="reset" class="text-link">${es ? 'Restablecer ejemplo' : 'Reset example'}</button>
    </form>
    <div class="calculator-result" aria-label="${es ? 'Desglose del ejemplo' : 'Example price breakdown'}">
      <h3>${es ? 'Tu estimación de ejemplo' : 'Your example estimate'}</h3>
      <dl><div><dt>${es ? 'Paquete × cantidad' : 'Package × quantity'}</dt><dd data-value="base">${money(initial.base)}</dd></div><div><dt>${es ? 'Extras' : 'Extras'}</dt><dd data-value="extras">${money(initial.extras)}</dd></div><div><dt>Subtotal</dt><dd data-value="subtotal">${money(initial.subtotal)}</dd></div><div><dt>${es ? 'Recargo de prioridad' : 'Priority surcharge'}</dt><dd data-value="surcharge">${money(initial.surcharge)}</dd></div></dl>
      <p class="calculator-total"><span>${es ? 'Total ilustrativo' : 'Illustrative total'}</span><output data-value="total" aria-live="polite" aria-atomic="true">${money(initial.total)}</output></p>
      <p>${es ? 'No es una oferta comercial. No se guardan datos ni se envían consultas desde esta demo.' : 'Not a commercial offer. This demo stores no information and sends no enquiries.'}</p>
      <button type="button" class="button" data-copy-quote hidden>${es ? 'Copiar resumen de ejemplo' : 'Copy example summary'}</button><p data-copy-status role="status" aria-live="polite"></p>
      <noscript><p>${es ? 'Este es el ejemplo inicial. Activá JavaScript para actualizar el total con tus elecciones.' : 'This is the initial example. Enable JavaScript to update the total with your choices.'}</p></noscript>
    </div>
  </div><script type="module" src="/service-calculator/app.js"></script>`;
}
