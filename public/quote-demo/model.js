// Illustrative ARS amounts. Edit this catalog to adapt the workshop template.
export const packages = [
  { id: 'logo', name: 'Logo esencial', price: 120000, description: 'El primer paso para darle identidad a tu proyecto.', deliverables: ['Diseño de logo y sus variantes', 'Paleta de colores', 'Archivos listos para uso digital'], days: 10 },
  { id: 'identidad', name: 'Identidad de marca', price: 240000, description: 'Un sistema visual para que todo hable el mismo idioma.', deliverables: ['Todo lo de Logo esencial', 'Selección tipográfica', 'Guía de marca y aplicaciones'], days: 15 },
  { id: 'lanzamiento', name: 'Marca + lanzamiento', price: 360000, description: 'Tu identidad, preparada para salir al mundo.', deliverables: ['Todo lo de Identidad de marca', '6 piezas de lanzamiento para redes', 'Presentación de marca de 8 páginas'], days: 20 },
];
export const extras = [
  { id: 'redes', name: 'Plantillas para redes', description: '6 plantillas editables para futuras publicaciones.', price: 45000 },
  { id: 'tarjetas', name: 'Tarjeta personal', description: 'Diseño de frente y dorso, listo para imprenta. No incluye impresión.', price: 25000 },
  { id: 'revision', name: 'Una ronda de revisión adicional', description: 'Una instancia extra de ajustes sobre la propuesta elegida.', price: 20000 },
];
export const rushRate = 0.25;
export const money = value => `ARS ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(value)}`;
export function calculateQuote(packageId, extraIds = [], rush = false) {
  const selectedPackage = packages.find(item => item.id === packageId);
  if (!selectedPackage) throw new Error('Paquete desconocido');
  const selectedExtras = extras.filter(item => extraIds.includes(item.id));
  const subtotal = selectedPackage.price + selectedExtras.reduce((sum, item) => sum + item.price, 0);
  const rushFee = rush ? Math.round(subtotal * rushRate) : 0;
  return { selectedPackage, selectedExtras, subtotal, rushFee, total: subtotal + rushFee, days: rush ? Math.ceil(selectedPackage.days / 2) : selectedPackage.days };
}
export function inquiryMessage(quote) {
  return [
    '¡Hola! Te comparto una consulta de prueba del cotizador de diseño.',
    'DEMO: precios ilustrativos. No es una contratación ni una oferta comercial.',
    '',
    `Paquete: ${quote.selectedPackage.name} — ${money(quote.selectedPackage.price)}`,
    ...quote.selectedExtras.map(item => `Extra: ${item.name} — ${money(item.price)}`),
    ...(quote.selectedExtras.length ? [] : ['Extras: sin adicionales']),
    `Subtotal: ${money(quote.subtotal)}`,
    `Entrega: ${quote.rushFee ? 'exprés (+25%)' : 'estándar'} — ${quote.days} días hábiles estimados`,
    `Recargo exprés: ${money(quote.rushFee)}`,
    `Total estimado: ${money(quote.total)}`,
    '',
    'Alcance, plazos, impuestos aplicables y precio final a confirmar antes de contratar.',
  ].join('\n');
}
export const whatsappUrl = quote => `https://wa.me/?text=${encodeURIComponent(inquiryMessage(quote))}`;
