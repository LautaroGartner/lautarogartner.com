import { packages, extras, money, calculateQuote, whatsappUrl } from '../public/quote-demo/model.js';
const initial = calculateQuote('identidad');
const icon = (paths, className = '') => `<svg class="${className}" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
const mark = icon('<path d="m12 3 9 9-9 9-9-9 9-9Z"/><path d="M12 3v18M3 12h18"/>');
const packageIcons = {
  logo: icon('<path d="m15 5 4 4M5 19l4-1 11-11a2.8 2.8 0 0 0-4-4L5 14l-1 6 1-1Z"/><path d="m5 14 4 4"/>'),
  identidad: icon('<rect x="4" y="4" width="7" height="7" rx="1.5"/><circle cx="17" cy="7.5" r="3.5"/><path d="m4 20 3.5-7L11 20H4Z"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  lanzamiento: icon('<path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>'),
};
const arrow = icon('<path d="M5 12h14m-6-6 6 6-6 6"/>', 'action-icon');
export function quoteDemoPage() {
  return {
    path: '/demo/cotizador', language: 'es', nav: false, shell: 'wide',
    title: 'Cotizador de diseño · Demo | Lautaro Gärtner',
    seoTitle: 'Cotizador de diseño · Demo | Lautaro Gärtner',
    description: 'Probá un cotizador interactivo de diseño: elegí un paquete, sumá extras y compartí el presupuesto estimado por WhatsApp. Precios ilustrativos en ARS.',
    body: 'Demo interactiva de un cotizador para diseñadores freelance. Todos los precios son ilustrativos.',
    headerHtml: `<a class="skip-link" href="#content">Saltar al contenido</a><header class="portfolio-header quote-header"><a class="identity" href="/es"><span class="quote-brand-mark">${mark}</span><span>Lautaro Gärtner<span class="quote-brand-caption">Ideas que toman forma.</span></span></a><a href="/es">Volver al sitio ${arrow}</a></header>`,
    footerHtml: '<footer class="portfolio-footer"><span>Una demo de Lautaro Gärtner</span><a href="/es">Explorá mi trabajo</a></footer>',
    html: `<link rel="stylesheet" href="/quote-demo/base.css"><link rel="stylesheet" href="/quote-demo/style.css">
      <div class="quote-demo">
        <section class="quote-intro"><h1>Tu próxima <em>marca,</em><br>con las cuentas claras.</h1><p>Elegí un paquete de diseño, sumá lo que necesitás y armá un presupuesto a tu medida.</p><p class="demo-note"><strong>Esto es una demo.</strong> Los precios en pesos argentinos son ilustrativos. No se realizan compras ni reservas.</p></section>
        <noscript><p class="demo-note">Activá JavaScript para calcular tu presupuesto y preparar la consulta de WhatsApp.</p></noscript>
        <div class="quote-layout">
          <form id="quote-form" aria-label="Configurá tu presupuesto" hidden>
            <fieldset><legend><span>01</span> Elegí tu punto de partida</legend><div class="quote-packages">
              ${packages.map(item => `<label class="package-option"><input type="radio" name="package" value="${item.id}" ${item.id === 'identidad' ? 'checked' : ''}><span class="package-content"><span class="package-icon">${packageIcons[item.id]}</span><span class="package-heading">${item.name}</span><span class="package-description">${item.description}</span><strong class="package-price">${money(item.price)}</strong><span class="package-deliverables">${item.deliverables.map(text => `<span>${text}</span>`).join('')}<span>2 rondas de revisión incluidas</span></span></span></label>`).join('')}
            </div></fieldset>
            <fieldset><legend><span>02</span> Dale tu toque</legend><div class="quote-extras">
              ${extras.map(item => `<label class="extra-option"><input type="checkbox" name="extra" value="${item.id}"><span><strong>${item.name}</strong><small>${item.description}</small></span><b>+ ${money(item.price)}</b></label>`).join('')}
            </div></fieldset>
            <fieldset><legend><span>03</span> ¿Para cuándo lo necesitás?</legend><div class="delivery-options">
              <label><input type="radio" name="delivery" value="standard" checked><span><strong>Sin apuro</strong><small>Entrega estándar · <span data-standard-days>15</span> días hábiles</small></span><b>Incluida</b></label>
              <label><input type="radio" name="delivery" value="rush"><span><strong>Lo necesito antes</strong><small>Entrega exprés · <span data-rush-days>8</span> días hábiles</small></span><b>+25%</b></label>
            </div><p class="quote-help">El recargo exprés se calcula sobre el paquete y los extras. Plazos sujetos a disponibilidad, desde la recepción del material.</p></fieldset>
          </form>
          <aside id="presupuesto" class="quote-summary" tabindex="-1" aria-labelledby="summary-heading" hidden>
            <div class="summary-heading-line"><h2 id="summary-heading">Tu presupuesto</h2><span class="summary-mark">${mark}</span></div><p class="summary-subtitle">Una primera idea para tu proyecto.</p>
            <div id="quote-breakdown"></div>
            <div class="quote-total"><span>Total estimado</span><output id="quote-total" for="quote-form" aria-live="polite" aria-atomic="true">${money(initial.total)}</output><small>Pesos argentinos · precios de ejemplo</small></div>
            <p class="quote-help">El alcance, los plazos, los impuestos aplicables y el precio final se confirman antes de contratar.</p>
            <a id="quote-whatsapp" class="button" href="${whatsappUrl(initial).replaceAll('&', '&amp;')}" target="_blank" rel="noopener noreferrer">Compartir por WhatsApp ${arrow}</a>
            <p class="quote-help whatsapp-note">Elegís el contacto en WhatsApp y revisás el mensaje antes de enviarlo. La consulta se identifica como demo.</p>
            <button id="quote-reset" type="button">Empezar de nuevo</button>
          </aside>
        </div>
      <div class="quote-mobile-bar" hidden><span>Estimado · <strong id="quote-mobile-total">ARS 240.000</strong></span><a href="#presupuesto">Ver presupuesto ↓</a></div></div><script type="module" src="/quote-demo/app.js"></script>`,
  };
}
