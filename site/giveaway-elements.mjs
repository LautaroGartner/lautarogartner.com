/* Reusable markup for the giveaway's actual header, controls, menu and hero. */
const curve = 'M50 3C77 0 98 9 97 24C97 40 75 47 49 45C22 48 2 39 3 24C2 10 25 2 50 3Z';
const rays = [
  'M0.2,37L0,36.2c6.7-1.4,13.9-2.1,21.3-2.3l0,0.8C13.9,34.9,6.8,35.7,0.2,37z',
  'M22.2,23.2c-3.9-3.7-7.9-7.5-11.7-11.1l0.5-0.6l-0.3,0.3l0.3-0.3c3.9,3.6,7.9,7.4,11.7,11.1L22.2,23.2z',
  'M35,20.1l-0.8,0c0.2-6.6-0.7-13.3-2.4-19.8L32.5,0C34.3,6.7,35.1,13.4,35,20.1z',
];
const sparkle = `<span class="c-heading__sparkle o-deco -sparkle is-visible" data-sequence-bound="true" data-sparkle-playing="true"><span class="o-deco__inner"><svg viewBox="0 0 35 37" aria-hidden="true">${rays.map(d => `<path d="${d}"></path>`).join('')}</svg></span></span>`;
const waveStrands = Array.from({length:9},(_,i)=>`<path d="M -110 -20 C 242 25, -65 175, 147 273 C 359 371, 294 514, -285 720" transform="translate(${i*13} ${i*3})" opacity="${(.32+i*.05).toFixed(2)}"/>`).join('');
const waveBand = [[.10,0],[.13,.12],[.19,.84],[.22,1],[.51,1],[.54,.84],[.59,.12],[.62,0]];
const edgeWaves = ['left', 'right'].map(side => `<div class="hero-edge hero-edge--${side}">${['sharp','soft'].map((layer,index)=>`
  <svg class="hero-edge-${layer}" viewBox="0 0 420 740" preserveAspectRatio="none">
    <defs>
      <linearGradient class="hero-wave-color" id="hero-wave-${layer}-${side}" x1="0%" y1="0%" x2="100%" y2="90%">
        <stop stop-color="#acabff"/><stop offset=".54" stop-color="#92d9f0"/><stop offset="1" stop-color="#b8e5a2"/>
      </linearGradient>
      ${index ? `<filter class="hero-wave-filter" id="hero-strands-blur-${side}" filterUnits="userSpaceOnUse" x="-40" y="95" width="500" height="365">
        <feGaussianBlur stdDeviation="9 5"/>
      </filter>` : ''}
      <linearGradient class="hero-wave-band" id="hero-band-${layer}-${side}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="740">
        ${waveBand.map(([offset,blur])=>`<stop offset="${offset}" stop-color="#fff" stop-opacity="${index?blur:1-blur}"/>`).join('')}
      </linearGradient>
      <mask id="hero-mask-${layer}-${side}" maskUnits="userSpaceOnUse" x="-360" y="-60" width="840" height="860">
        <rect x="-360" y="-60" width="840" height="860" fill="url(#hero-band-${layer}-${side})"/>
      </mask>
    </defs>
    <g class="hero-wave-${layer}" fill="none" stroke="url(#hero-wave-${layer}-${side})" mask="url(#hero-mask-${layer}-${side})"${index ? ` filter="url(#hero-strands-blur-${side})"` : ''}>${waveStrands}</g>
  </svg>`).join('')}
</div>`).join('');

function animatedLine(text, escape) {
  return `<span class="o-at__l" style="display:block;text-align:center;position:relative">${text.split(' ').map(word => `<span class="o-at__w" style="position:relative;display:inline-block">${escape(word)}</span>`).join(' ')}</span>`;
}

function menuLetters(label, escape) {
  let index = 0;
  return label.split(' ').map(word => {
    const letters = [...word].map(letter =>
      `<span class="nav-label-letter" style="--nav-letter:${index++}">${escape(letter)}</span>`
    ).join('');
    return `<span class="nav-label-word">${letters}</span>`;
  }).join(' ');
}

function navLanguage(lang, href, active, escape) {
  const label = lang === 'es' ? 'Español' : 'English';
  const letters = [...label].map((letter, index) => `<span class="language-letter" style="--letter-index:${index}" aria-hidden="true">${letter}</span>`).join('');
  return `<a${active ? '' : ` data-language="${lang}"`} href="${escape(href)}" lang="${lang}" hreflang="${lang}" aria-label="${label}"${active ? ' aria-current="page"' : ''}>${letters}<svg class="language-ring" viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true"><path pathLength="100" d="${curve}"></path></svg></a>`;
}

export function giveawayPrimaryAction(href, label, escape) {
  const letters = [...label].map(letter => `<span class="name-letter">${escape(letter)}</span>`).join('');
  return `<span class="giveaway-elements"><a class="c-btn giveaway-primary" href="${escape(href)}" aria-label="${escape(label)}"><span class="c-btn__inner" aria-hidden="true"><strong class="c-btn__label">${letters}</strong></span></a></span>`;
}

export function giveawayNavigation({lang, route, path, escape, labels}) {
  const es = lang === 'es';
  const open = es ? 'Menú' : 'Menu', close = es ? 'Cerrar' : 'Close';
  const contactHref = path(lang, 'contact');
  const links = [
    ['', es ? 'Inicio' : 'Home'], ['work', labels.work], ['services', es ? 'Servicios' : 'Services'],
    ['about', es ? 'Sobre mí' : 'About'], ['writing', es ? 'Artículos' : 'Writing'], ['contact', labels.contact],
  ];
  const current = destination => route === destination || route.startsWith(destination + '/');
  const menu = links.map(([destination, label], index) => `<li class="l-nav__item t-t2-serif" style="--nav-row:${index}">
    <a href="${escape(path(lang,destination))}" class="l-nav__link t-link-gradient${current(destination) ? ' is-current' : ''}" aria-label="${escape(label)}"${current(destination) ? ' aria-current="page"' : ''}><span class="l-nav__label" aria-hidden="true">${menuLetters(label, escape)}</span></a>
  </li>`).join('');
  const fallback = links.map(([destination,label])=>`<a href="${escape(path(lang,destination))}">${escape(label)}</a>`).join('');
  const name = [...'Lautaro Gärtner'].map(letter => `<span class="name-letter" aria-hidden="true">${letter === ' ' ? '&nbsp;' : letter}</span>`).join('');
  return `<a class="skip-link" href="#content">${es ? 'Saltar al contenido' : 'Skip to content'}</a>
    <div class="giveaway-elements giveaway-navigation">
      <header class="l-header" data-studio-header>
        <a href="${path(lang)}" class="l-header__logo" aria-label="Lautaro Gärtner"><span class="lautaro-wordmark">${name}</span></a>
        <div class="l-header__trigger"><div class="headroom--top headroom--not-bottom headroom">
          <button class="c-btn" type="button" data-menu-open aria-label="${es ? 'Abrir menú' : 'Open menu'}" data-open-label="${es ? 'Abrir menú' : 'Open menu'}" data-close-label="${es ? 'Cerrar menú' : 'Close menu'}" aria-expanded="false" aria-controls="site-menu">
            <span class="c-btn__inner"><span class="c-btn__line-top"></span><span class="c-btn__label t-small" aria-hidden="true"><span class="c-btn__open o-at is-visible">${animatedLine(open,escape)}</span><span class="c-btn__close o-at">${animatedLine(close,escape)}</span></span><span class="c-btn__line-bottom"></span></span>
          </button>
        </div></div>
        <div class="l-header__cta"><div class="headroom--top headroom--not-bottom headroom">
          <a class="c-btn" href="${escape(contactHref)}"><span class="c-btn__inner"><span class="c-btn__label t-small">${escape(labels.contact)}</span><span class="c-btn__line-bottom"></span></span></a>
        </div></div>
        <nav class="l-nav" id="site-menu" aria-label="${es ? 'Navegación' : 'Navigation'}" inert>
          <ul class="l-nav__list">${menu}</ul>
          <div class="menu-language">${navLanguage('en', path('en',route), !es, escape)}<span aria-hidden="true">/</span>${navLanguage('es', path('es',route), es, escape)}</div>
        </nav>
      </header>
      <noscript><nav class="giveaway-fallback-links" aria-label="${es ? 'Navegación' : 'Navigation'}">${fallback}</nav></noscript>
    </div>`;
}

export function giveawayHero({lang, escape, contact, projects}) {
  const es = lang === 'es';
  const lines = es ? ['Software para', 'escalar tu negocio.'] : ['Software that', 'scales with you.'];
  return `<div class="giveaway-elements giveaway-hero">
    <div class="studio-curtain" aria-hidden="true">
      <div class="studio-curtain-layer"></div>
      <div class="studio-curtain-layer studio-curtain-layer--front"><span>LG</span></div>
    </div>
    <section class="p-home__header l-section" aria-labelledby="hero-title">
      <div class="hero-edge-motion" aria-hidden="true">${edgeWaves}</div>
      <div class="c-heading c-heading--center is-visible">
        <div class="c-heading__inner t-content">
          <p class="hero-role">${es ? 'Desarrollador de software · Consultor tecnológico' : 'Software developer · Technology consultant'}</p>
          ${sparkle}
          <h1 id="hero-title" class="c-heading__title o-at is-visible t-t1-serif">${lines.map(line=>animatedLine(line,escape)).join(' ')}</h1>
          <div class="c-heading__desc o-at is-visible t-cms">
            <p>${es ? 'Te ayudo a decidir dónde invertir en tecnología y construyo lo que sigue. Plataformas para vender, software para operar a escala y webs para captar clientes.' : 'I help founders decide where to invest in technology, then build the platforms, software and websites to grow sales and scale operations.'}</p>
            <div class="giveaway-hero-actions">
              ${giveawayPrimaryAction(contact, es ? 'Contame tu proyecto' : 'Tell me about your project', escape)}
            </div>
          </div>
        </div>
      </div>
      <div class="hero-project-windows">
        ${projects.map(({id, name, href}) => `<a class="hero-project-window hero-project-window--${escape(id)}" href="${escape(href)}">
          <div class="hero-window-float">
            <div class="hero-window-surface">
              <div class="hero-window-bar"><span aria-hidden="true"></span><span>${escape(name)}</span></div>
              <img src="/work/${id === 'filsen' ? 'filsen-current-home.webp' : escape(id) + '-720.webp'}" alt="" width="720" height="450" decoding="async">
            </div>
          </div>
        </a>`).join('')}
      </div>
    </section>
  </div>`;
}
