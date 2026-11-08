import { calculatorDemo } from './service-quote-demo.mjs';

// Service descriptions are visible content, not claims of measured commercial results.
export const serviceRoutes = {
  calculator: 'services/quote-calculator-development',
  repair: 'services/contact-form-repair',
};
export function servicePages({ lang, page, head, escape: e, base }) {
  const es = lang === 'es';
  const contact = kind => `${base('contact')}?service=${kind}`;
  const calculatorPath = base(serviceRoutes.calculator);
  const repairPath = base(serviceRoutes.repair);
  const link = (url, label, button = false) => `<a class="${button ? 'button' : 'text-link'}" href="${e(url)}">${e(label)} <span aria-hidden="true">↗</span></a>`;
  const section = (title, body) => `<section class="service-next"><h2>${e(title)}</h2>${body}</section>`;
  const paragraphs = lines => lines.map(line => `<p>${e(line)}</p>`).join('');
  const list = lines => `<ul>${lines.map(line => `<li>${e(line)}</li>`).join('')}</ul>`;
  const faq = items => `<section class="faq service-faq"><h2>${es ? 'Preguntas antes de contratar' : 'Before you commission a calculator'}</h2>${items.map(([q,a]) => `<details><summary>${e(q)}</summary><p>${e(a)}</p></details>`).join('')}</section>`;
  const makeService = (route, title, description, html, type) => {
    const result = page(lang, route, title, description, html);
    const url = `${result.structuredData['@graph'][0].url}${result.path}`;
    result.structuredData['@graph'].push({
      '@type': 'Service', '@id': `${url}#service`, name: title, serviceType: type,
      url, description, provider: { '@id': `${result.structuredData['@graph'][0].url}/#person` },
      mainEntityOfPage: { '@id': `${url}#webpage` },
    });
    result.structuredData['@graph'].find(node => node['@type'] === 'WebPage').mainEntity = { '@id': `${url}#service` };
    return result;
  };
  const title = es ? 'Desarrollo de cotizadores web a medida' : 'Custom quote calculator development';
  const description = es
    ? 'Transformá tus reglas de precios en un cotizador para tu web. Paquetes, cantidades, extras y un resumen para la consulta. Desarrollo directo con Lautaro Gärtner.'
    : 'Turn your pricing rules into a custom website quote calculator. Packages, quantities, extras and an enquiry-ready summary, built directly with Lautaro Gärtner.';
  const intro = es
    ? 'Cuando el precio depende de varias decisiones, un cotizador puede reunirlas antes de la primera conversación. Desarrollo calculadoras y formularios de presupuesto para negocios de servicios, a partir de tus reglas y ejemplos aprobados.'
    : 'When price depends on several choices, a quote calculator can bring them together before the first conversation. I build pricing calculators and quote forms for service businesses from your approved rules and examples.';
  const calculator = makeService(serviceRoutes.calculator, title, description,
    head(lang, es ? 'Sitios web y herramientas a medida' : 'Custom websites & business tools', title, intro)
    + `<div class="service-actions actions">${link(contact('quote-calculator'), es ? 'Compartí tus reglas de precios' : 'Send your pricing rules', true)}${link('#calculator-demo', es ? 'Probar la demo' : 'Try the calculator')}</div>`
    + section(es ? 'Un presupuesto que siga tus reglas' : 'A quote that follows your pricing rules', paragraphs(es ? [
      'Definimos los datos necesarios, las fórmulas y el resultado esperado. Pueden ser un paquete base, cantidades, opciones y recargos. La propuesta distingue una estimación orientativa de un precio que puedas confirmar.',
      'El alcance puede incluir un resumen para copiar, un formulario de consulta o una conexión con una herramienta existente. Cada conexión, costo de uso y requisito de acceso se revisa antes de cotizar.',
    ] : [
      'We define the required inputs, formulas and expected result. That may mean a base package, quantities, optional items and surcharges. The scope distinguishes an indicative estimate from a price you can confirm.',
      'The scope can include a copyable summary, an enquiry form or a connection to an existing tool. Each integration, usage cost and access requirement is reviewed before quoting.',
    ]))
    + `<section class="calculator-example" id="calculator-demo"><h2>${es ? 'Probá un ejemplo de cálculo' : 'Try a working pricing example'}</h2><p>${es ? 'Demo con importes ilustrativos en USD. No son los precios de mi servicio ni una oferta de contratación.' : 'A demonstration with illustrative USD amounts. These are not my development prices or an offer to purchase.'}</p>${calculatorDemo(lang)}<p>${link(base('demo/quote-calculator'), es ? 'Abrir la demo en su propia página' : 'Open the standalone calculator demo')}</p></section>`
    + section(es ? 'Qué acordamos y cómo se verifica' : 'What we agree and how it is checked', list(es ? [
      'Una tabla de reglas: datos de entrada, rangos permitidos, redondeo y ejemplos con sus respuestas esperadas.',
      'Un prototipo del recorrido, con campos claros y una separación visible entre estimación y confirmación.',
      'Implementación y pruebas de las combinaciones acordadas, incluidos valores inválidos y uso desde el celular.',
      'Una entrega documentada: código, accesos y cómo actualizar los precios según el alcance contratado.',
    ] : [
      'A rule sheet: inputs, permitted ranges, rounding and examples with their expected answers.',
      'A prototype of the journey, with clear fields and a visible distinction between an estimate and a confirmed quote.',
      'Implementation and checks of the agreed combinations, including invalid inputs and mobile use.',
      'A documented handoff: source code, access and how prices are updated within the agreed scope.',
    ]))
    + section(es ? 'Trabajo que podés explorar' : 'Implementation you can explore', paragraphs(es ? [
      'CarCost es una calculadora publicada que muestra pagos, comparación de plazos y un cronograma de amortización. Es un ejemplo de implementación de cálculos e interfaces, no una prueba de resultados comerciales para otro negocio.',
    ] : [
      'CarCost is a published calculator with payment estimates, term comparisons and an amortization schedule. It demonstrates calculation and interface implementation; it is not evidence of commercial results for another business.',
    ]) + link(base('work/carcost'), es ? 'Ver el proyecto de calculadora' : 'Explore the calculator project'))
    + section(es ? '¿Cuánto cuesta un cotizador a medida?' : 'How much does a custom quote calculator cost?', paragraphs(es ? [
      'El presupuesto depende de la cantidad de reglas y excepciones, el diseño, la plataforma y el destino de los datos. Un cálculo local con un resumen tiene un alcance distinto de un flujo con cuentas, PDF o sincronización con un CRM.',
      'Primero revisamos las reglas y un ejemplo. Después acordamos alcance, precio, esquema de pagos y fecha de entrega por escrito. Hosting, suscripciones y mantenimiento se detallan por separado cuando correspondan.',
    ] : [
      'The quote depends on pricing rules and exceptions, design, the website platform and where the information goes. A browser-based calculation with a summary has a different scope from a flow with accounts, PDF documents or CRM synchronization.',
      'We review the rules and a sample calculation first, then agree the scope, price, payment schedule and delivery date in writing. Hosting, subscriptions and maintenance are itemized separately where needed.',
    ]))
    + faq(es ? [
      ['¿Conviene un desarrollo a medida o un constructor de formularios?', 'Si tus reglas encajan en una herramienta existente y podés mantenerla, esa puede ser la opción más simple. Un desarrollo a medida tiene sentido cuando las reglas, la experiencia o la conexión necesaria no encajan bien. Lo revisamos antes de construir.'],
      ['¿Se puede agregar a mi sitio actual?', 'Primero reviso la plataforma, el modo de publicación y el acceso disponible. La propuesta define si conviene integrarlo en la página o publicarlo como herramienta separada.'],
      ['¿Podés conectar las consultas con mi sistema?', 'Revisamos la API o las opciones disponibles y el dato que tiene que llegar. Una integración, autenticación o sincronización compleja recibe su propio alcance.'],
      ['¿Voy a recibir más consultas?', 'No hay una garantía de cantidad de consultas o ventas. Verificamos el cálculo y el recorrido acordado. Si hay datos suficientes, podemos revisar su uso y la calidad de las consultas recibidas.'],
    ] : [
      ['Should I use a custom calculator or a form builder?', 'If an existing tool fits your rules and you can maintain it, that may be the simpler choice. Custom development makes sense when the pricing logic, user experience or required connection does not fit well. We review that before building.'],
      ['Can you add it to my existing website?', 'I review the platform, publishing setup and available access first. The proposal identifies whether to embed it in your site or deliver a separate tool.'],
      ['Can you connect enquiries to my existing system?', 'We review the available API or connection options and the information that needs to arrive. Complex integrations, authentication or synchronization receive their own scope.'],
      ['Will it generate more leads?', 'There is no guaranteed enquiry or sales increase. We verify the calculation and agreed journey. Where enough data exists, we can review use and the quality of received enquiries.'],
    ])
    + section(es ? 'Empecemos por un ejemplo real' : 'Start with one real example', paragraphs([es ? 'Compartí tu sitio, las opciones que cambian el precio y un presupuesto de ejemplo sin datos de clientes. Con eso podemos definir qué construir y qué verificar.' : 'Share your website, the choices that change the price and one sample quote with customer details removed. That gives us a concrete starting point for the scope and acceptance checks.']) + link(contact('quote-calculator'), es ? 'Pedir presupuesto del cotizador' : 'Discuss your quote calculator', true))
    + `<div class="service-related">${link(repairPath, es ? '¿Tu formulario no envía? Reparación de formularios' : 'Form not sending? Explore contact-form repair')}</div>`,
    'Custom quote calculator development');

  const repairTitle = es ? 'Reparación de formularios de contacto' : 'Contact form repair service';
  const repairDescription = es ? '¿Tu formulario confirma el envío pero no recibís la consulta? Revisamos el fallo, acordamos el arreglo y coordinamos una prueba en el destino esperado.' : 'Contact form says sent but no email arrives? Review the fault, agree a focused repair and coordinate a check at the intended destination with Lautaro Gärtner.';
  const repair = makeService(serviceRoutes.repair, repairTitle, repairDescription,
    head(lang, es ? 'Arreglos en tu web' : 'Website repairs', repairTitle, repairDescription)
    + `<div class="service-actions actions">${link(contact('website-repair'), es ? 'Compartí el formulario y el fallo' : 'Send the form URL and symptom', true)}</div>`
    + section(es ? 'Encontrar en qué paso falla' : 'Find the failing step', paragraphs(es ? [
      'Un formulario puede fallar al validar los campos, procesar el envío o entregar el mensaje. Que aparezca “enviado” no demuestra que la consulta llegó al correo del negocio.',
      'Reviso la página, la plataforma y el acceso necesario antes de cotizar. Acordamos un fallo concreto y cómo comprobar su corrección, sin dar por necesario reconstruir todo el sitio.',
    ] : [
      'A contact form can fail during field validation, submission processing or message delivery. A “sent” confirmation does not prove the enquiry reached the business inbox.',
      'I review the page, platform and required access before quoting. We agree on one specific fault and how to verify the repair, without assuming a whole website rebuild is needed.',
    ]))
    + section(es ? 'Qué puede incluir el arreglo' : 'What a focused repair can include', list(es ? [
      'Diagnóstico del síntoma y corrección del fallo acordado en el formulario existente.',
      'Revisión de campos, validación, mensajes de error y confirmación en computadora y celular.',
      'Una consulta de prueba identificada, coordinada con quien recibe los mensajes.',
      'Una explicación de lo que cambió y del resultado de la prueba en el destino esperado.',
    ] : [
      'Diagnosis of the symptom and correction of the agreed fault in an existing form.',
      'Checks of fields, validation, error messages and confirmation on desktop and mobile.',
      'A clearly identified test enquiry coordinated with the person receiving messages.',
      'A handoff explaining the change and the result of the check at the intended destination.',
    ]))
    + section(es ? 'Alcance y precio antes de empezar' : 'Scope and price before work starts', paragraphs(es ? [
      'Los arreglos pequeños y aislados empiezan en USD 100. El diagnóstico, el precio final, los accesos y la fecha se acuerdan según el fallo. No todos los problemas de envío entran en ese alcance.',
      'Cambios de proveedor de correo, integraciones con CRM, un formulario nuevo o problemas de servidor más amplios pueden requerir un presupuesto aparte. Cualquier suscripción o costo recurrente se acuerda antes de contratar.',
    ] : [
      'Small, isolated fixes start at USD 100. Assessment, final price, required access and delivery date are agreed for the fault; not every delivery problem fits that entry scope.',
      'Changing email providers, CRM integrations, a new form or wider server problems may need a separate quote. Any subscription or recurring cost is agreed before you commit.',
    ]))
    + section(es ? 'Qué enviar para la revisión' : 'What to send for the review', paragraphs([es ? 'Compartí la URL exacta, qué debería pasar, qué ocurre y desde qué dispositivo lo probaste. Una captura y la hora aproximada ayudan. No incluyas contraseñas ni datos personales de clientes.' : 'Send the exact URL, what should happen, what actually happens and the device you tested on. A screenshot and approximate time help. Do not include passwords or customer personal details.']) + link(contact('website-repair'), es ? 'Consultar por el arreglo' : 'Request a repair review', true))
    + section(es ? 'Una guía para empezar' : 'A diagnostic guide to start with', paragraphs([es ? 'Mi artículo distingue intento, aceptación y recepción, y explica el cambio de mailto a envío directo en este sitio. Ese ejemplo no demuestra un aumento de ventas.' : 'My article separates attempt, acceptance and receipt, and explains the change from mailto to direct submission on this site. That example does not demonstrate a sales increase.']) + link(base('formulario-web-no-envia-consultas'), es ? 'El formulario no envía: qué revisar' : 'Contact form not sending: what to check'))
    + `<div class="service-related">${link(calculatorPath, es ? '¿Necesitás un cotizador nuevo?' : 'Need a new quote calculator instead?')}</div>`,
    'Contact form repair');

  const demoTitle = es ? 'Demo de cotizador web a medida' : 'Website quote calculator demo';
  const demo = page(lang, 'demo/quote-calculator', demoTitle,
    es ? 'Ejemplo interactivo de reglas de precios, cantidades y extras. Importes ilustrativos en USD.' : 'Try a custom pricing calculator with packages, quantities and optional extras. Illustrative USD amounts.',
    head(lang, es ? 'Demo interactiva' : 'Interactive demonstration', demoTitle,
      es ? 'Elegí un paquete y una cantidad para ver cómo cambian los cálculos. Los importes son ficticios; no se realizan compras ni reservas.' : 'Choose a package and quantity to see the calculation change. Amounts are fictional; no purchases or bookings take place.')
    + `<section class="calculator-example">${calculatorDemo(lang)}</section>`
    + section(es ? 'Un cotizador con tus propias reglas' : 'A calculator built around your own rules', paragraphs([es ? 'Esta demo muestra una implementación posible. Tu proyecto empieza con tus fórmulas y resultados esperados.' : 'This example demonstrates one possible implementation. Your project starts with your own formulas and expected answers.']) + link(calculatorPath, es ? 'Ver el servicio de cotizadores' : 'Explore quote calculator development', true)));
  return [calculator, repair, demo];
}
