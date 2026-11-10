import {servicePages} from './service-pages.mjs';
import {studioHome, studioServices, studioWriting} from './studio-preview.mjs';
import {giveawayNavigation} from './giveaway-elements.mjs';
import {countryOptions} from './phone-countries.mjs';
import {enquiryBudgets, enquiryServices} from './enquiry-options.mjs';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {projectMedia} from './project-media.mjs';
// Route composition reuses the owner's copy and Paideia's server-rendered pages.
import {generateSitePage} from '../vendor/paideia-framework/build/site-build.js';
export function composeRoutes(site,copy,{escape:e,mailto,picture}){
 const giveawayStyles = fs.readFileSync(new URL('./giveaway-elements.css', import.meta.url), 'utf8');
 const studioStyles = fs.readFileSync(new URL('./studio-preview.css', import.meta.url), 'utf8');
 const scriptVersion=createHash('sha256').update(fs.readFileSync(new URL('../public/portfolio.js',import.meta.url),'utf8')+fs.readFileSync(new URL('../public/motion-shell.js',import.meta.url),'utf8')).digest('hex').slice(0,12);
 const arrow='<span aria-hidden="true">↗</span>';
 const path=(lang,route='')=>`${lang==='es'?'/es':''}${route?'/'+route:lang==='es'?'':'/'}`;
 const globe=`<span class="wire-globe motion-graphic" data-motion-graphic aria-hidden="true"><span class="globe-equator"></span><span class="globe-latitude globe-latitude--north"></span><span class="globe-latitude globe-latitude--south"></span>${[0,1,2].map(i=>`<span class="globe-meridian" style="--ring:${i}"></span>`).join('')}</span>`;
 const nav = (lang, route='') => giveawayNavigation({lang, route, path, escape:e, labels:copy[lang].nav});
 const foot=(lang,{sales=true,writing=false}={})=>`<footer id="site-footer" class="studio-footer ${sales?'':'studio-footer--quiet'}" data-footer-kind="${sales?'commercial':writing?'writing':'simple'}">${sales?`<div class="footer-invitation"><h2>${lang==='es'?'¿Trabajamos juntos?':'Let’s work together.'}</h2><a class="round-link" href="${path(lang,'contact')}" aria-label="${e(copy[lang].nav.contact)}">${arrow}</a></div>`:''}<div class="footer-meta"><div class="footer-identity"><span>Lautaro Gärtner</span><p>Crespo, Argentina ${globe}</p></div><div class="footer-local"><span>${lang==='es'?'Hora local':'Local time'}</span><time data-local-time data-timezone="America/Argentina/Buenos_Aires">${new Intl.DateTimeFormat('en-GB',{timeZone:'America/Argentina/Buenos_Aires',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())}</time></div><a href="${e(mailto(lang))}">${e(copy[lang].contact.email)}</a><nav aria-label="${lang==='es'?'Enlaces del pie':'Footer links'}">${writing?'':`<a href="${path(lang,'writing')}">${lang==='es'?'Artículos':'Writing'}</a>`}<a href="https://www.linkedin.com/in/lautarogartner">LinkedIn</a><a href="https://x.com/lautarogartner_">X</a><a class="footer-instagram" href="https://www.instagram.com/lautarogartner_/" aria-label="Instagram @lautarogartner_"><svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a><a href="https://github.com/LautaroGartner/lautarogartner.com">GitHub</a></nav></div><script async src="/portfolio.js?v=${scriptVersion}"></script><script defer src="/motion-shell.js?v=${scriptVersion}"></script></footer>`;
 const head=(lang,kicker,title,body='')=>`<section class="route-head"><p class="section-label">${e(kicker)}</p><h1>${e(title)}</h1>${body?`<p class="route-lede">${e(body)}</p>`:''}</section>`;
 const script='';
 const graph=(lang,route,title)=>{const base=site.url.replace(/\/$/,'');return {'@context':'https://schema.org','@graph':[{'@type':'Person','@id':base+'/#person',name:site.author,url:base,jobTitle:lang==='es'?'Desarrollador de software y consultor tecnológico':'Software developer and technology consultant',sameAs:['https://www.linkedin.com/in/lautarogartner','https://x.com/lautarogartner_']},{'@type':'WebSite','@id':base+'/#website',url:base,name:site.title,inLanguage:['en','es'],publisher:{'@id':base+'/#person'}},{'@type':'WebPage','@id':base+path(lang,route)+'#webpage',url:base+path(lang,route),name:title,inLanguage:lang,isPartOf:{'@id':base+'/#website'},about:{'@id':base+'/#person'}}]};};
 const page=(lang,route,title,description,html)=>({path:path(lang,route),title,seoTitle:`${title} | Lautaro Gärtner`,description,body:description,html,shell:'wide',nav:false,language:lang,headerHtml:nav(lang,route),footerHtml:foot(lang,{sales:route!=='contact'}),canonicalPath:path(lang,route),imagePath:'/work/social.jpg',alternates:[{language:'en',path:path('en',route)},{language:'es',path:path('es',route)},{language:'x-default',path:path('en',route)}],structuredData:graph(lang,route,title),tokenSummary:description});
 const pages=[];
 for(const lang of ['en','es']){
  const c=copy[lang];
  const legacyLinks=Object.entries(c.anchors).map(([key,id])=>{const target={offer:'services',work:'work',about:'about',contact:'contact'}[key];return target?`<a id="${e(id)}" href="${path(lang,target)}">${e({offer:c.nav.offer,work:c.nav.work,about:lang==='es'?'Sobre mí':'About',contact:c.nav.contact}[key])}</a>`:'';}).join('')+c.projects.map(p=>`<a id="${p.id}" href="${path(lang,'work/'+p.id)}">${e(p.name)}</a>`).join('');
  const home = studioHome({
    lang, base: route => path(lang, route), escape: e, copy: c,
    legacyLinks,
  });
  pages.push(page(lang, '', home.title, home.description, home.html));
  const workTitle=lang==='es'?'Trabajos':'Work';
  const work=`<div class="work-toolbar"><div role="group" aria-label="${lang==='es'?'Filtrar trabajos':'Filter work'}"><button data-work-filter="all" aria-pressed="true">${lang==='es'?'Todos':'All'}</button><button data-work-filter="published" aria-pressed="false">${lang==='es'?'Publicados':'Published'}</button><button data-work-filter="beta" aria-pressed="false">${lang==='es'?'Producto propio':'Own product'}</button></div><div role="group" aria-label="${lang==='es'?'Vista de trabajos':'Work view'}"><button data-work-view="grid" aria-pressed="true">${lang==='es'?'Grilla':'Grid'}</button><button data-work-view="list" aria-pressed="false">${lang==='es'?'Lista':'List'}</button></div></div><section class="work-index" data-work-index data-view="grid">${c.projects.map(p=>`<article class="work-card" data-category="${p.id==='filsen'?'beta':'published'}"><a href="${path(lang,'work/'+p.id)}"><figure>${picture(p,false,'(max-width: 740px) calc(100vw - 40px), 48vw')}</figure><div class="work-card-caption"><h2>${e(p.name)}</h2>${arrow}<p>${e(p.label)}</p></div></a></article>`).join('')}</section>`;
  pages.push(page(lang,'work',workTitle,c.work.intro,head(lang,'',workTitle)+work+script));
  const services = studioServices({lang, base: route => path(lang, route), escape: e});
  pages.push(page(lang, 'services', services.title, services.description, services.html));
  pages.push(...servicePages({lang,page,head,escape:e,base:route=>path(lang,route)}));
  const form=`<section class="contact-layout enquiry-layout"><form class="contact-draft enquiry-card" data-contact-form data-contact-language="${lang}" action="/api/enquiry" method="post">
<div class="contact-field"><label for="contact-service">${lang==='es'?'¿Qué necesitás?':'What do you need?'}</label><select id="contact-service" name="service" required><option value="" disabled selected>${lang==='es'?'Seleccioná un servicio':'Select a service'}</option>${enquiryServices.map(service=>`<option value="${service.value}"${service.value==='quote-calculator'?' hidden':''}>${e(service.value==='new-website'?(lang==='es'?'Web nueva o rediseño':'New website or redesign'):service[lang])}</option>`).join('')}</select></div>
<div class="contact-field"><label for="contact-need">${lang==='es'?'Sobre tu proyecto':'About your project'}</label><textarea id="contact-need" name="project" aria-describedby="contact-project-hint" required minlength="10" maxlength="4000" rows="4"></textarea><p id="contact-project-hint" class="enquiry-hint">${lang==='es'?'Por ejemplo, qué hace tu negocio, qué querés lograr y qué te está frenando.':'For example, what your business does, what you want to achieve and what’s holding you back.'}</p></div>
<div class="enquiry-identity">
<div class="contact-field"><label for="contact-name">${lang==='es'?'Nombre':'Name'}</label><input id="contact-name" name="name" type="text" autocomplete="name" required maxlength="120"></div>
<div class="contact-field"><label for="contact-email">${lang==='es'?'Email':'Email'}</label><input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="254"></div>
</div>
<div class="enquiry-identity">
<div class="contact-field"><label for="contact-organization">${lang==='es'?'Organización (opcional)':'Organization (optional)'}</label><input id="contact-organization" name="organization" type="text" autocomplete="organization" maxlength="160"></div>
<div class="contact-field"><label for="contact-site">${lang==='es'?'Enlace a tu web (opcional)':'Website link (optional)'}</label><input id="contact-site" name="website" type="text" inputmode="url" autocomplete="url" maxlength="2048"></div>
</div>
<div class="contact-field"><label for="contact-phone">${lang==='es'?'Teléfono':'Phone number'}</label><div class="phone-controls"><select id="contact-phone-country" name="phoneCountry" autocomplete="country" aria-label="${lang==='es'?'País o región del teléfono':'Phone country or region'}"><option value="">${lang==='es'?'País / región':'Country / region'}</option>${countryOptions(lang).map(country=>`<option value="${country.value}" data-calling-code="+${country.code}">${e(country.name)} (+${country.code})</option>`).join('')}</select><input id="contact-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="40" required></div></div>
<div class="contact-field"><label for="contact-budget">${lang==='es'?'Presupuesto':'Budget'}</label><select id="contact-budget" name="budget" required><option value="" disabled selected>${lang==='es'?'Seleccioná una opción':'Select an option'}</option>${enquiryBudgets.map(({value, [lang]: label})=>`<option value="${value}">${e(label)}</option>`).join('')}</select></div>
<div class="contact-trap" aria-hidden="true"><label for="contact-company">Company</label><input id="contact-company" name="company" tabindex="-1" autocomplete="off"></div><button class="round-submit enquiry-submit" type="submit" disabled>${lang==='es'?'Enviar consulta':'Send enquiry'} ${arrow}</button><p class="contact-status" role="status" aria-live="polite" tabindex="-1"></p><noscript><p>${lang==='es'?'Activá JavaScript o escribime por email.':'Enable JavaScript or email me directly.'}</p></noscript></form><aside class="enquiry-direct"><p>${lang==='es'?'¿Preferís escribir por email?':'Prefer to email me?'}</p><a href="${e(mailto(lang))}">${e(c.contact.email)}</a></aside></section><script defer src="/contact.js?v=11"></script>`;
  pages.push(page(lang,'contact',lang==='es'?'Contacto':'Contact',c.contact.body,'<div class="route-contact" data-route="contact">'+head(lang,'',lang==='es'?'Contame tu proyecto.':'Tell me about your project.',lang==='es'?'Unas líneas sobre tu negocio y lo que necesitás para empezar.':'A few lines about your business and what you need are enough to get started.')+form+'</div>'+script));

  for(const p of c.projects){
   const shots=projectMedia[p.id].map(shot=>[shot.id,shot[lang]]);
   const extra=shots.length?`<div class="case-gallery">${shots.map(([id,label])=>`<figure>${picture({id,alt:label},false,'(max-width: 740px) calc(100vw - 40px), 48vw')}<figcaption>${e(label)}</figcaption></figure>`).join('')}</div>`:'';
   pages.push(page(lang,'work/'+p.id,p.name,p.description,head(lang,p.label,p.name,p.title)+`<section class="case-intro"><p>${e(p.description)}</p><div><ul class="deliverables">${p.deliverables.map(x=>`<li>${e(x)}</li>`).join('')}</ul><div class="actions"><a class="text-link" href="${e(p.url)}">${e(p.cta)}</a>${p.tutorial?`<a class="text-link" href="${e(p.tutorial)}">${e(p.tutorialLabel)}</a>`:''}</div></div></section><figure class="case-cover">${picture(p,true,'calc(100vw - 64px)')}</figure>`+extra+(p.id==='carcost'?`<section class="service-next"><h2>${lang==='es'?'Una calculadora para tu propio negocio':'A calculator for your own business'}</h2><p>${lang==='es'?'Este proyecto muestra implementación de cálculos e interfaces. Para tu herramienta, acordamos las reglas, los ejemplos esperados y el recorrido.':'This project demonstrates calculation and interface implementation. For your own tool, we agree on the rules, expected answers and user journey.'}</p><a class="button" href="${path(lang,'services')}">${lang==='es'?'Ver servicios de desarrollo web':'Explore web development services'} ${arrow}</a></section>`:'')+(p.case?`<section class="service-next"><h2>${e(p.case.heading)}</h2><p>${e(p.case.body)}</p><a class="button" href="${path(lang,'contact')}">${e(p.case.cta)} ${arrow}</a></section>`:'')+`<a class="case-back text-link" href="${path(lang,'work')}">${e(c.nav.work)} ${arrow}</a>`+script));
  }
 }
 const about=site.pages.find(p=>p.path==='/about');
 if(about){
  const publicBody=about.body.split('\n\n').filter(block=>!block.startsWith('The machine-readable files below')).join('\n\n');
  const spanishBody=`Soy desarrollador de software y consultor tecnológico. Ayudo a negocios a decidir dónde invertir en tecnología y construyo plataformas, herramientas y sitios web para llevar esas decisiones a la práctica. Soy fundador de FounderShape y cofundador de Filsen, donde lidero producto e ingeniería junto a Rafa. Mi experiencia trabajando en gastronomía también influye en cómo diseño software: tiene que servir durante una jornada real de trabajo.

## Trabajo

Podés ver mis [servicios de software y consultoría](/es/services) y los [proyectos que construí](/es/work).

Trabajo directamente con personas que necesitan software para resolver un problema concreto: un sitio claro para su negocio, un catálogo, una página para un evento, un sistema de presupuestos o una aplicación a medida. Me importa que el resultado sea comprensible y útil, incluidas las partes menos vistosas, como los dominios, el despliegue, la analítica y la entrega de la propiedad real del proyecto.

## Software y escritura

Trabajo principalmente con TypeScript, React, Node.js, Ruby on Rails y SQL. Los artículos de este sitio tratan sobre ingeniería de software, decisiones de producto, sistemas que los agentes pueden interpretar y aprendizajes al crear y operar productos pequeños.

Paideia Framework es uno de esos proyectos: un experimento de software generado que puede describir su propia estructura y ejecución. Influye en algunos de los ensayos de este sitio, pero es un proyecto entre los distintos trabajos reunidos aquí.

## Contacto

Para un proyecto, una colaboración o una conversación, escribime a [contact@lautarogartner.com](mailto:contact@lautarogartner.com) o encontrame en [LinkedIn](https://www.linkedin.com/in/lautarogartner).`;
  for(const lang of ['en','es']){
   const translated={...about,path:path(lang,'about'),title:lang==='es'?'Sobre mí':about.title,body:lang==='es'?spanishBody:publicBody,description:lang==='es'?'Desarrollador de software y consultor tecnológico en Crespo, Argentina. Plataformas, herramientas a medida y sitios web para negocios.':about.description,tokenSummary:lang==='es'?'Sobre Lautaro Gärtner, desarrollador de software y consultor tecnológico de Argentina.':about.tokenSummary,language:lang};
   const rendered=generateSitePage(site,translated);
   const portrait=`<figure class="about-portrait" data-about-portrait><div class="portrait-window"><picture><source type="image/webp" srcset="${[360,640,960,1122].map(w=>`/portrait/lautaro-${w}.webp ${w}w`).join(', ')}" sizes="(max-width: 740px) calc(100vw - 40px), (max-width: 1100px) 36vw, 440px"><img src="/portrait/lautaro-640.jpg" alt="${lang==='es'?'Retrato de Lautaro Gärtner':'Portrait of Lautaro Gärtner'}" width="1122" height="1402" loading="eager" fetchpriority="high" decoding="async"></picture></div><figcaption><span>Lautaro Gärtner</span><span>Crespo, Argentina</span></figcaption></figure>`;
   const html=rendered.match(/<main id="content" tabindex="-1">([\s\S]*?)<\/main>/)[1].replace(/<p class="agent-files">[\s\S]*?<\/p>/,'').replace('<div class="page-body">',`<div class="about-layout">${portrait}<div class="page-body">`)+`</div><script defer src="/about-portrait.js?v=1"></script>`;
   pages.push({...translated,html,shell:'wide',nav:false,headerHtml:nav(lang,'about'),footerHtml:foot(lang),alternates:[{language:'en',path:'/about'},{language:'es',path:'/es/about'},{language:'x-default',path:'/about'}],structuredData:graph(lang,'about',translated.title)});
  }
 }
 for(const lang of ['en','es']){
  const title=lang==='es'?'Artículos':'Writing';
  const description=lang==='es'?'Notas sobre sitios web, software y productos de Lautaro Gärtner.':'Notes on websites, software and products by Lautaro Gärtner.';
  const localPosts=site.posts.filter(p=>(p.language??'en')===lang);
  const html=studioWriting({lang,title,description,posts:localPosts,escape:e});
  pages.push({...page(lang,'writing',title,description,html),footerHtml:foot(lang,{sales:false})});
 }
 const posts=site.posts.map(post=>{
  const lang=post.language??'en',route=post.slug.replace(/^es\//,'');
  const pair=site.posts.find(p=>p.slug=== (lang==='es'?route:'es/'+route));
  const alternates=pair?[{language:'en',path:'/'+route},{language:'es',path:'/es/'+route},{language:'x-default',path:'/'+route}]:undefined;
  return {...post,language:lang,alternates,headerHtml:nav(lang,route),footerHtml:foot(lang,{sales:false,writing:true})};
 });
 for(const [alias,canonical]of [['/web','/'],['/web/es','/es']])pages.push({...pages.find(p=>p.path===canonical),path:alias,canonicalPath:canonical});
 return {...site,styles:site.styles+'\n'+studioStyles+'\n'+giveawayStyles,headerHtml:nav('en','writing'),footerHtml:foot('en',{sales:false,writing:true}),pages,posts};
}
