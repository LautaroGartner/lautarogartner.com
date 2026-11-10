import {giveawayHero, giveawayPrimaryAction} from './giveaway-elements.mjs';

const arrow = '<svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true"><path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const sparkle = '<svg class="studio-sparkle" viewBox="0 0 27 32" width="27" height="32" fill="none" aria-hidden="true"><path pathLength="1" d="M22 13 16 2"/><path pathLength="1" d="M16 19 4 13"/><path pathLength="1" d="M16 25 2 31"/></svg>';

export function studioButton(href, label, escape, variant = 'primary') {
  if (variant === 'primary') return giveawayPrimaryAction(href, label, escape);
  return `<a class="studio-action studio-action--line" href="${escape(href)}">${escape(label)}</a>`;
}

const offers = {
  es: [
    ['Software a medida.', 'Plataformas, herramientas internas e integraciones para automatizar trabajo y sostener más volumen.'],
    ['Consultoría tecnológica.', 'Evaluamos qué conviene construir, comprar o integrar. Priorizamos la inversión según el problema, el costo y el resultado esperado.'],
    ['Diseño y desarrollo web.', 'Sitios nuevos y rediseños que explican lo que ofrecés y facilitan el próximo paso, desde pedir una cotización hasta comprar.'],
  ],
  en: [
    ['Custom software.', 'Platforms, internal tools and integrations that automate work and help your team handle more volume.'],
    ['Technology consulting.', 'Decide what to build, buy or integrate. Prioritize investment around the problem, the cost and the expected return.'],
    ['Web design and development.', 'New websites and redesigns that explain what you offer and make the next step easy, from requesting a quote to buying.'],
  ],
};

function studioOffers({ lang, base, escape, detailed = false }) {
  const es = lang === 'es';
  return `<section class="studio-services" id="studio-offers" aria-labelledby="studio-services-title">
    <div class="studio-wrap">
      <p class="studio-label">${es ? 'Servicios' : 'Services'}</p>
      <h2 id="studio-services-title">${es ? 'Qué podemos construir.' : 'What we can build.'}</h2>
      <div class="studio-offers">${offers[lang].map(([heading, description], index) => `<article>
        <span class="studio-label" aria-hidden="true">0${index + 1}</span>
        <h3>${escape(heading)}</h3>
        <p>${escape(description)}</p>
      </article>`).join('')}</div>
      ${detailed ? '' : studioButton(base('services'), es ? 'Explorá los servicios' : 'Explore services', escape, 'line')}
    </div>
  </section>`;
}

export function studioHome({ lang, base, escape, copy, legacyLinks }) {
  const es = lang === 'es';
  const title = es ? 'Desarrollador de software y consultor tecnológico' : 'Software Developer and Technology Consultant';
  const description = es
    ? 'Lautaro Gärtner ayuda a negocios a decidir dónde invertir en tecnología y construye software, plataformas y sitios web.'
    : 'Lautaro Gärtner helps businesses decide where to invest in technology and builds software, platforms and websites.';
  const projects = ['lucia', 'filsen'].map(id => ({
    id,
    name: copy.projects.find(project => project.id === id).name,
    href: base('work/' + id),
  }));
  const html = `<div class="studio-page studio-page--home">
    ${giveawayHero({lang, escape, contact:base('contact'), projects})}
    ${studioOffers({ lang, base, escape })}
    <section class="studio-next studio-wrap" aria-labelledby="studio-next-title">
      <h2 id="studio-next-title">${es ? 'Empecemos por tu proyecto.' : 'Let’s start with your project.'}</h2>
      <p>${es ? 'Contame qué querés lograr y qué te está frenando. Con eso podemos decidir dónde conviene empezar.' : 'Tell me what you want to achieve and what’s holding you back. We can decide where to start from there.'}</p>
      ${studioButton(base('contact'), es ? 'Contame tu proyecto' : 'Tell me about your project', escape)}
    </section>
    <nav class="legacy-links" aria-label="${es ? 'Enlaces del sitio' : 'Site links'}">${legacyLinks}</nav>
  </div>`;
  return { title, description, html };
}

export function studioServices({ lang, base, escape }) {
  const es = lang === 'es';
  const title = es ? 'Desarrollo de software y consultoría tecnológica' : 'Software Development & Technology Consulting';
  const description = es
    ? 'Trabajo con equipos que necesitan tomar una decisión tecnológica o construir software, plataformas y sitios web.'
    : 'I work with teams making a technology decision or building software, platforms and websites.';
  const contact = base('contact');
  const steps = es
    ? [
      ['Entendemos el negocio', 'Identificamos el problema, el resultado que buscás y cómo sabríamos si la inversión rindió.'],
      ['Definimos qué hacer primero', 'Evaluamos las opciones y acordamos un alcance. Si hay que construir, trabajamos en entregas que se puedan probar.'],
      ['Probamos y entregamos', 'Validamos el sistema con casos reales y preparo la documentación y los accesos para tu equipo.'],
    ]
    : [
      ['Understand the business', 'We identify the problem, the outcome you need and how we’ll tell if the investment paid off.'],
      ['Decide what comes first', 'We compare options and agree on scope. When building makes sense, we work in increments you can test.'],
      ['Validate and hand over', 'We check the system against real cases, then I prepare the documentation and access your team needs.'],
    ];
  const html = `<div class="studio-page studio-page--services">
    <section class="studio-hero studio-hero--services" aria-labelledby="studio-services-hero">
      <div class="studio-hero-copy">
        <h1 id="studio-services-hero"><span class="studio-pin">Software${sparkle}</span> ${es ? 'y consultoría tecnológica.' : 'and technology consulting.'}</h1>
        <p>${escape(description)}</p>
        <div class="studio-actions">
          ${studioButton(contact, es ? 'Hablemos de tu proyecto' : 'Let’s talk about your project', escape)}
          ${studioButton('#studio-offers', es ? 'Ver opciones' : 'Explore your options', escape, 'line')}
        </div>
      </div>
    </section>
    ${studioOffers({ lang, base, escape, detailed: true })}
    <section class="studio-process studio-wrap" aria-labelledby="studio-process-title">
      <p class="studio-label">${es ? 'El proceso' : 'The process'}</p>
      <h2 id="studio-process-title">${es ? 'De la decisión a la entrega.' : 'From decision to delivery.'}</h2>
      <ol>${steps.map(([heading, body], index) => `<li>
        <span class="studio-label" aria-hidden="true">0${index + 1}</span><div><h3>${escape(heading)}</h3><p>${escape(body)}</p></div>
      </li>`).join('')}</ol>
      ${studioButton(contact, es ? 'Contame qué necesitás' : 'Tell me what you need', escape)}
    </section>
  </div>`;
  return { title, description, html };
}

export function studioWriting({lang, title, description, posts, escape}) {
  const es = lang === 'es';
  const dates = new Intl.DateTimeFormat(es ? 'es-AR' : 'en', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const covers = {
    'car-loan-calculator-guide': {src:'/articles/car-loan/calculator-tax-fees.webp', width:1280, height:1089},
    'formulario-web-no-envia-consultas': {src:`/articles/contact-form/checks-${lang}.svg`, width:1600, height:660},
  };
  const cards = posts.map((post, index) => {
    const cover = covers[post.slug.replace(/^es\//,'')];
    const image = cover && index < 2
      ? `<div class="writing-cover"><img src="${cover.src}" alt="" width="${cover.width}" height="${cover.height}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async"></div>`
      : '';
    return `<article class="writing-entry">
      <a href="/${escape(post.slug)}">
        ${image}
        <div class="writing-entry-copy">
          <div class="writing-meta">${post.topics?.[0] ? `<span>${escape(post.topics[0])}</span>` : ''}<time datetime="${escape(post.publishedAt)}">${escape(dates.format(new Date(post.publishedAt)))}</time></div>
          <h2>${escape(post.title)}</h2>
          <p>${escape(post.description)}</p>
        </div>
        <span class="writing-arrow" aria-hidden="true">${arrow}</span>
      </a>
    </article>`;
  });
  return `<div class="studio-page studio-writing"><div class="studio-wrap">
    <header class="writing-heading">
      <h1>${escape(title)}</h1>
      <p>${escape(description)}</p>
    </header>
    <div class="writing-featured">${cards.slice(0,2).join('')}</div>
    ${cards.length > 2 ? `<section class="writing-archive" aria-labelledby="writing-archive-title">
      <h2 id="writing-archive-title">${es ? 'Más artículos' : 'More articles'}</h2>
      ${cards.slice(2).join('')}
    </section>` : ''}
  </div></div>`;
}
