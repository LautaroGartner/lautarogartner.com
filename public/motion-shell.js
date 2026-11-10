(() => {
 const root=document.documentElement;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const fine = matchMedia('(hover: hover) and (pointer: fine)');
 const ease = 'cubic-bezier(.76,0,.24,1)';
 const menu = document.querySelector('.l-nav');
 const toggle = document.querySelector('[data-menu-open]');
 const header = menu?.closest('.l-header');
 const viewport = window.visualViewport;
 const menuList = menu?.querySelector('.l-nav__list');
 const mobile = matchMedia('(max-width: 767px)');
 let inertNodes = [];

 function placeMenu() {
  if (!header?.classList.contains('nav-is-open') || !mobile.matches) return;
  const top = menu.offsetParent?.getBoundingClientRect().top ?? -scrollY;
  menu.style.setProperty('--mobile-menu-top', `${(viewport?.offsetTop || 0) - top}px`);
  menu.style.setProperty('--mobile-menu-height', `${viewport?.height || innerHeight}px`);
 }
 function setMenu(open, restoreFocus = true) {
  if (!header || !toggle) return;
  header.classList.toggle('nav-is-open', open);
  root.classList.toggle('mobile-menu-open', open && mobile.matches);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? toggle.dataset.closeLabel : toggle.dataset.openLabel);
  menu.inert = !open;
  header.querySelector('.c-btn__open').classList.toggle('is-visible', !open);
  header.querySelector('.c-btn__close').classList.toggle('is-visible', open);
  if (open) {
   placeMenu();
   inertNodes = [...document.querySelectorAll('#content,.studio-footer')].map(node => [node,node.inert]);
   for (const [node] of inertNodes) node.inert = true;
  } else {
   for (const [node,wasInert] of inertNodes) node.inert = wasInert;
   inertNodes = [];
   if (restoreFocus) toggle.focus({preventScroll:true});
  }
 }
 if (header && toggle) {
  toggle.addEventListener('click', () => setMenu(menu.inert));
  document.addEventListener('keydown', event => {
   if (menu.inert) return;
   if (event.key === 'Escape') { event.preventDefault(); setMenu(false); return; }
   if (event.key !== 'Tab') return;
   const controls = [...header.querySelectorAll('a[href],button')];
   const first = controls[0], last = controls.at(-1);
   if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
   else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  menu.addEventListener('click', event => {
   const link = event.target.closest('a[href]');
   if (!link) return;
   const url = new URL(link.href,location.href);
   const normalize = path => path.replace(/\/+$/, '') || '/';
   if (url.origin === location.origin && normalize(url.pathname) === normalize(location.pathname) && !url.hash && url.search === location.search) {
    event.preventDefault();
    setMenu(false);
   }
  });
  const stopBackgroundScroll = event => {
   if (menu.inert || event.touches?.length > 1 || event.ctrlKey) return;
   const canScrollMenu = menuList.contains(event.target) && menuList.scrollHeight > menuList.clientHeight;
   if (!canScrollMenu) event.preventDefault();
  };
  window.addEventListener('touchmove', stopBackgroundScroll, {passive:false});
  window.addEventListener('wheel', stopBackgroundScroll, {passive:false});
  window.addEventListener('scroll', placeMenu, {passive:true});
  window.addEventListener('resize', placeMenu, {passive:true});
  viewport?.addEventListener('resize', placeMenu, {passive:true});
  viewport?.addEventListener('scroll', placeMenu, {passive:true});
  mobile.addEventListener('change', () => { if (!menu.inert) setMenu(false); });
  window.addEventListener('pageshow', event => { if (event.persisted && !menu.inert) setMenu(false,false); });
 }
 root.classList.add('navigation-ready');

 for (const control of document.querySelectorAll('.giveaway-elements .c-btn')) {
  const animateRing = enter => {
   if (reduced.matches) return;
   const wasIn = control.classList.contains('motion-in');
   control.classList.toggle('motion-in', enter);
   control.classList.toggle('motion-out', !enter && wasIn);
  };
  control.addEventListener('pointerenter', event => {
   if (fine.matches && event.pointerType !== 'touch') animateRing(true);
  });
  control.addEventListener('pointerleave', event => {
   if (fine.matches && event.pointerType !== 'touch' && !control.matches(':focus-visible')) animateRing(false);
  });
  control.addEventListener('focus', () => { if (control.matches(':focus-visible')) animateRing(true); });
  control.addEventListener('blur', () => { if (!fine.matches || !control.matches(':hover')) animateRing(false); });
 }

 const timers = new WeakMap();
 function touchControl(event) { return event.target.closest('.giveaway-elements .c-btn,.menu-language a'); }
 document.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch' || reduced.matches) return;
  const control = touchControl(event);
  if (!control) return;
  clearTimeout(timers.get(control));
  control.dataset.touchMotion = 'in';
 }, {capture:true,passive:true});
 document.addEventListener('pointerup', event => {
  const control = touchControl(event);
  if (event.pointerType !== 'touch' || !control?.dataset.touchMotion) return;
  timers.set(control,setTimeout(() => {
   control.dataset.touchMotion = 'out';
   timers.set(control,setTimeout(() => delete control.dataset.touchMotion,280));
  },450));
 }, {capture:true,passive:true});
 document.addEventListener('pointercancel', event => {
  const control = touchControl(event);
  if (!control) return;
  clearTimeout(timers.get(control));
  delete control.dataset.touchMotion;
 }, {capture:true,passive:true});

 function mountHeroMotion(hero) {
  const windows = hero.querySelector('.hero-project-windows');
  const desktop = matchMedia('(min-width: 1050px)');
  const tau = 2 * Math.PI;
  const edges = [...hero.querySelectorAll('.hero-edge-sharp')].map((svg, side) => {
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
   if (!ctx) return null;
   canvas.className = 'hero-edge-canvas';
   svg.after(canvas);
   const view = svg.viewBox.baseVal;
   const width = view.width, height = view.height;
   const band = [...svg.querySelector('.hero-wave-band').children];
   const colors = [...svg.querySelector('.hero-wave-color').children];
   const paths = [...svg.querySelectorAll('.hero-wave-sharp path')];
   const strands = paths.map((path, index) => {
    const translate = path.transform.baseVal.getItem(0).matrix;
    const bounds = path.getBBox();
    const points = Array.from(path.getAttribute('d').matchAll(/(-?\d+) (-?\d+)/g), ([,x,y]) => {
     const along = Math.max(0, Math.min(1, Number(y) / height));
     const angle = index * tau / paths.length + side * .5 + along * 5.2;
     const radius = 14 + 54 * Math.sin(along * Math.PI);
     return {x:Number(x)+translate.e, y:Number(y)+translate.f, along, a:radius*Math.cos(angle), b:-radius*Math.sin(angle)};
    });
    return {path, points, bounds, translate, x: new Float32Array(points.length)};
   });
   return {canvas, ctx, svg, side, width, height, band, colors, strands};
  }).filter(Boolean);
  let inView = false, windowsInView = false, playing = false, dirty = true;
  let frame = 0, lastFrame = 0, nextFrame = 0, lastY = 0, lastScroll = 0;
  let impulse = 0, extraSpeed = 0, turn = 0;
  const frameInterval = 1000 / 30;

  function prepare(edge) {
   const {canvas, ctx, width, height, band, colors, strands} = edge;
   const cssWidth = canvas.clientWidth, cssHeight = canvas.clientHeight;
   if (!cssWidth || !cssHeight) return;
   if (canvas.width !== cssWidth) canvas.width = cssWidth;
   if (canvas.height !== cssHeight) canvas.height = cssHeight;
   ctx.setTransform(cssWidth/width,0,0,cssHeight/height,0,0);
   const offsets = band.map(stop => Number(stop.getAttribute('offset')));
   edge.mask = null;
   if (mobile.matches) {
    edge.mask = ctx.createLinearGradient(0,0,0,height);
    band.forEach((stop, i) => edge.mask.addColorStop(offsets[i], `rgba(0,0,0,${stop.getAttribute('stop-opacity')})`));
   }
   const stops = colors.map(stop => [stop.offset.baseVal, getComputedStyle(stop).stopColor]);
   ctx.lineWidth = mobile.matches ? 2.25 : 1;
   for (const strand of strands) {
    const {path, points, bounds, translate} = strand;
    const gx = 1 / bounds.width, gy = .9 / bounds.height;
    const scale = 1.81 / (gx*gx + gy*gy);
    const x = bounds.x + translate.e, y = bounds.y + translate.f;
    strand.color = ctx.createLinearGradient(x,y,x+gx*scale,y+gy*scale);
    stops.forEach(([offset,color]) => strand.color.addColorStop(offset,color));
    strand.opacity = Number(getComputedStyle(path).opacity);
    for (const point of points) {
     const gap = Math.max(offsets[0] - point.along, point.along - offsets.at(-1), 0);
     point.movement = mobile.matches ? .20 + .80 * Math.min(1, gap / .10) : 1;
    }
   }
   edge.ready = true;
  }

  function paint(edge) {
   const {ctx, canvas, svg, side, width, height, strands, mask} = edge;
   if (!edge.ready) return;
   const cos = Math.cos(turn) - 1, sin = Math.sin(turn) * (side ? -1 : 1);
   ctx.clearRect(0,0,width,height);
   for (const strand of strands) {
    const {points, x} = strand;
    points.forEach((point, i) => { x[i] = point.x + point.movement * (point.a * cos + point.b * sin); });
    ctx.beginPath();
    ctx.moveTo(x[0],points[0].y);
    for (let i = 1; i < points.length; i += 3) {
     ctx.bezierCurveTo(x[i],points[i].y,x[i+1],points[i+1].y,x[i+2],points[i+2].y);
    }
    ctx.globalAlpha = strand.opacity;
    ctx.strokeStyle = strand.color;
    ctx.stroke();
   }
   if (mask) {
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = mask;
    ctx.fillRect(0,0,width,height);
    ctx.globalCompositeOperation = 'source-over';
   }
   if (!canvas.classList.contains('is-painted')) {
    canvas.classList.add('is-painted');
    svg.classList.add('is-replaced');
   }
  }

  // Drive both ribbons from one clock. Keep the blurred SVG stationary, and
  // paint the sharp curves at CSS-pixel resolution instead of morphing SVG paths at device resolution.
  const advance = now => {
   if (now >= nextFrame - 2) {
    const dt = Math.min(.08, Math.max(0,(now-lastFrame)/1000));
    lastFrame = now;
    nextFrame = Math.max(now-2,nextFrame) + frameInterval;
    extraSpeed += (impulse - extraSpeed) * (1 - Math.exp(-23 * dt));
    impulse *= Math.exp(-6 * dt);
    turn = (turn + dt * (1 + extraSpeed) * tau / (desktop.matches ? 8.5 : 11)) % tau;
    if (dirty) {
     for (const edge of edges) prepare(edge);
     dirty = false;
    }
    for (const edge of edges) paint(edge);
   }
   frame = requestAnimationFrame(advance);
  };
  const onScroll = () => {
   const now = performance.now(), y = scrollY;
   const velocity = Math.abs(y - lastY) / Math.max(16, Math.min(100, now - lastScroll));
   lastY = y;
   lastScroll = now;
   const boost = desktop.matches ? Math.min(6.5, velocity * 3.2) : Math.min(5.8, velocity * 3.8);
   impulse = Math.max(impulse, boost);
  };
  const sync = () => {
   const canAnimate = !reduced.matches && !document.hidden;
   windows.classList.toggle('is-floating', canAnimate && windowsInView);
   const play = edges.length > 0 && inView && canAnimate;
   if (play === playing) return;
   playing = play;
   if (play) {
    lastY = scrollY;
    lastFrame = nextFrame = lastScroll = performance.now();
    window.addEventListener('scroll', onScroll, {passive:true});
    frame = requestAnimationFrame(advance);
   } else {
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(frame);
    impulse = extraSpeed = 0;
   }
  };
  const observer = new IntersectionObserver(entries => {
   for (const entry of entries) {
    if (entry.target === hero) inView = entry.isIntersecting;
    else windowsInView = entry.isIntersecting;
   }
   sync();
  });
  observer.observe(hero);
  observer.observe(windows);
  const resize = new ResizeObserver(() => { dirty = true; });
  resize.observe(hero.querySelector('.c-heading__inner'));
  for (const {canvas} of edges) resize.observe(canvas);
  mobile.addEventListener('change', () => { dirty = true; });
  reduced.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);
 }

 const hero = document.querySelector('.giveaway-hero');
 if (hero) {
  const heading = hero.querySelector('.c-heading__inner');
  const titleElement = heading.querySelector('.c-heading__title');
  const description = heading.querySelector('.c-heading__desc p');
  const edgeLayer = hero.querySelector('.hero-edge-motion');
  const bands = edgeLayer.querySelectorAll('.hero-wave-band');
  const filters = edgeLayer.querySelectorAll('.hero-wave-filter');
  const waveViewHeight = edgeLayer.querySelector('svg').viewBox.baseVal.height;
  const word = titleElement.querySelector('.o-at__w');
  const line = word.closest('.o-at__l');
  const redraw = () => {
   const box = heading.getBoundingClientRect(), row = line.getBoundingClientRect();
   const anchor = row.left + word.offsetLeft - 36;
   const left = Math.max(22, anchor);
   heading.style.setProperty('--sparkle-left', `${left-box.left}px`);
   heading.style.setProperty('--sparkle-top', `${row.top-box.top-(left>anchor?34:26)}px`);
   if (mobile.matches) {
    const {top, height} = edgeLayer.getBoundingClientRect();
    const titleTop = titleElement.getBoundingClientRect().top - top;
    const copyBottom = description.getBoundingClientRect().bottom - top;
    const offsets = [titleTop - 82, titleTop - 65, titleTop - 31, titleTop - 12,
     copyBottom + 8, copyBottom + 27, copyBottom + 61, copyBottom + 78]
     .map(value => Math.max(0, Math.min(1, value / (height * 1.12))));
    for (const band of bands) [...band.children].forEach((stop, i) => stop.setAttribute('offset', offsets[i]));
    const filterTop = offsets[0] * waveViewHeight - 20;
    const filterHeight = (offsets.at(-1) - offsets[0]) * waveViewHeight + 40;
    for (const filter of filters) {
     filter.setAttribute('y', filterTop);
     filter.setAttribute('height', filterHeight);
    }
   }
  };
  redraw();
  new ResizeObserver(redraw).observe(heading);
  window.addEventListener('resize',redraw,{passive:true});
  document.fonts.ready.then(redraw);
  const curtain = hero.querySelector('.studio-curtain');
  const layers = [...curtain.querySelectorAll('.studio-curtain-layer')];
  const curtainAnimations = !reduced.matches && scrollY < 50
   ? layers.flatMap(layer => layer.getAnimations()).filter(animation => animation.playState==='running')
   : [];
  if (curtainAnimations.length) {
   const entranceEase = getComputedStyle(hero).getPropertyValue('--hero-enter-ease').trim();
   const stage = (element, keyframes, duration, delay = 0) => element.animate(keyframes, {
    duration, delay, easing: 'linear', fill: 'both'
   });
   const rise = (element,offset,duration,delay) => stage(element,[
    {opacity:0,transform:`translateY(${offset}px)`,easing:entranceEase},
    {opacity:1,transform:'translateY(0)'}
   ],duration,delay);
   const words = [...titleElement.querySelectorAll('.o-at__w')];
   const title = [
    rise(heading.querySelector('.hero-role'),10,410),
    ...words.map((word, index) => stage(word,[
     {opacity:0,transform:'translateY(72%) rotate3d(1,.3,0,88deg)',easing:entranceEase},
     {offset:.33,opacity:.87,transform:'translateY(32%) rotate3d(1,.3,0,47deg)',easing:entranceEase},
     {opacity:1,transform:'translateY(0) rotate3d(1,.3,0,0deg)'}
    ],570,index*38)),
    rise(heading.querySelector('.c-heading__desc'),18,490,225)
   ];
   // The curtain reveals the background that is already painted behind it.
   const artwork = [...hero.querySelectorAll('.hero-project-window,.c-heading__sparkle path')].flatMap(element => element.getAnimations());
   const entrance = [...title, ...artwork];
   for (const animation of entrance) {
    animation.pause();
    animation.currentTime = 0;
   }
   let handoffFrame;
   let entranceStarted = false;
   const startEntrance = () => {
    if (entranceStarted) return;
    entranceStarted = true;
    for (const animation of entrance) animation.play();
    Promise.allSettled(title.map(animation => animation.finished)).then(() => {
     for (const animation of title) animation.cancel();
    });
   };
   const finishOpening = (focused = false) => {
    if (curtain.hidden) return;
    cancelAnimationFrame(handoffFrame);
    curtain.hidden = true;
    hero.removeEventListener('focusin',showFocusedContent);
    startEntrance();
    if (focused) {
     for (const animation of title) if (animation.playState === 'running') animation.finish();
    }
    mountHeroMotion(hero);
   };
   const showFocusedContent = () => finishOpening(true);
   hero.addEventListener('focusin',showFocusedContent);
   const checkHandoff = () => {
    const {bottom,height} = curtain.getBoundingClientRect();
    const curtainEdge = Math.min(...layers.map(layer => layer.getBoundingClientRect().top));
    if (curtainEdge >= bottom) {
     finishOpening();
     return;
    }
    // Start the shared timeline as the curtain clears the title.
    if (!entranceStarted && curtainEdge >= Math.max(bottom - height * .32, titleElement.getBoundingClientRect().bottom + 16)) {
     startEntrance();
    }
    handoffFrame = requestAnimationFrame(checkHandoff);
   };
   handoffFrame = requestAnimationFrame(checkHandoff);
   Promise.allSettled(curtainAnimations.map(animation => animation.finished)).then(() => finishOpening());
  } else {
   curtain.hidden = true;
   mountHeroMotion(hero);
  }
 }

 const wordmark = document.querySelector('.lautaro-wordmark');
 wordmark?.addEventListener('pointermove', event => {
  if (!fine.matches || reduced.matches || event.pointerType === 'touch') return;
  const letter = event.target.closest('.name-letter');
  if (!letter) return;
  const {left, top} = letter.getBoundingClientRect();
  letter.style.setProperty('--wordmark-x', `${event.clientX - left}px`);
  letter.style.setProperty('--wordmark-y', `${event.clientY - top}px`);
 });

 for (const label of document.querySelectorAll('.giveaway-primary .c-btn__label')) {
  label.addEventListener('pointermove', event => {
   if (!fine.matches || reduced.matches) return;
   for (const letter of label.children) {
    const rect = letter.getBoundingClientRect();
    letter.style.setProperty('--gleam', String(.24*Math.max(0, 1-Math.abs(event.clientX-rect.left-rect.width/2)/19)));
   }
  });
  label.addEventListener('pointerleave', () => [...label.children].forEach(letter => letter.style.removeProperty('--gleam')));
 }

 // Magnetic motion stays attached to the actual accessible link/button.
 document.querySelectorAll('.portfolio-header nav a,.header-contact,.writing-utility,.languages a,.brand-roll,.round-link,.round-submit').forEach(element=>{
  if(element.matches('.portfolio-header nav a,.header-contact,.writing-utility,.languages a,.round-link,.round-submit')){const label=document.createElement('span');label.className='magnetic-label';while(element.firstChild)label.append(element.firstChild);element.append(label);}
  let box;
  const reset=()=>{element.style.removeProperty('--magnet-x');element.style.removeProperty('--magnet-y');box=null;};
  element.addEventListener('pointerenter',()=>{if(fine.matches&&!reduced.matches)box=element.getBoundingClientRect();});
  element.addEventListener('pointermove',event=>{
   if(!box||reduced.matches||!fine.matches)return;
   const round=element.matches('.round-link,.round-submit,.floating-menu-button,.menu-close');
   const limit=round?18:9;
   element.style.setProperty('--magnet-x',`${Math.max(-limit,Math.min(limit,(event.clientX-box.left-box.width/2)*.22))}px`);
   element.style.setProperty('--magnet-y',`${Math.max(-limit,Math.min(limit,(event.clientY-box.top-box.height/2)*.22))}px`);
  });
  element.addEventListener('pointerleave',reset);element.addEventListener('blur',reset);element.addEventListener('pointerdown',reset);
 });

 const work=document.querySelector('[data-work-index]'),scene=document.querySelector('[data-scene]');
 if((work||scene)&&fine.matches&&!reduced.matches){
  const cursor=document.createElement('span');cursor.className='work-view-cursor';const cursorLabel=document.createElement('span');cursorLabel.textContent=document.documentElement.lang==='es'?'Ver':'View';cursor.append(cursorLabel);cursor.setAttribute('aria-hidden','true');document.body.append(cursor);
  const preview=document.createElement('div');preview.className='work-hover-preview';preview.setAttribute('aria-hidden','true');const stack=document.createElement('div');stack.className='work-preview-stack';const cards=[...(work||scene).querySelectorAll(work?'.work-card':'[data-project]')];if(work)cards.forEach(card=>{const img=document.createElement('img'),main=card.querySelector('img'),source=card.querySelector('source');img.alt='';img.src=main.currentSrc||main.src;if(source){img.srcset=source.srcset;img.sizes='310px';}stack.append(img);});preview.append(stack);document.body.append(preview);
  let frame=0,last;
  cards.forEach((card,index)=>{
   card.addEventListener('pointerenter',event=>{if(!fine.matches||reduced.matches)return;cursor.style.transition='none';cursor.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;void cursor.offsetWidth;cursor.style.removeProperty('transition');preview.style.transform=`translate3d(${Math.min(innerWidth-350,Math.max(16,event.clientX-155))}px,${Math.max(20,event.clientY-240)}px,0)`;preview.style.setProperty('--preview-index',index);root.classList.add('work-cursor-visible');root.classList.toggle('work-preview-visible',work?.dataset.view==='list');});
   card.addEventListener('pointermove',event=>{if(!fine.matches||reduced.matches)return;last=event;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;cursor.style.transform=`translate3d(${last.clientX}px,${last.clientY}px,0)`;preview.style.transform=`translate3d(${Math.min(innerWidth-350,Math.max(16,last.clientX-155))}px,${Math.max(20,last.clientY-240)}px,0)`;});});
   card.addEventListener('pointerleave',()=>root.classList.remove('work-cursor-visible','work-preview-visible'));
  });
 }

 // Direction indicator is decorative; native links and viewport scrolling retain their meaning.
 document.querySelectorAll('.route-head,.scene-topline,.about-orbit').forEach(host=>{const arrow=document.createElement('span');arrow.className='scroll-direction';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v27m-7-7 7 7 7-7" stroke="currentColor" stroke-width="1.5"/></svg>';host.append(arrow);});
 root.dataset.scrollDirection='down';let directionOrigin=scrollY;
 const footer=document.querySelector('.studio-footer');let scrollFrame=0;
 const paintScroll=()=>{
  scrollFrame=0;if(Math.abs(scrollY-directionOrigin)>=12){root.dataset.scrollDirection=scrollY>directionOrigin?'down':'up';directionOrigin=scrollY;}root.classList.toggle('is-scrolled',scrollY>Math.min(260,innerHeight*.45));root.classList.toggle('menu-scrolled',scrollY>76);
  if(footer){const box=footer.getBoundingClientRect();const progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight-box.top)/box.height));footer.style.setProperty('--footer-progress',progress.toFixed(4));footer.style.setProperty('--footer-bend',`${Math.round(110*(1-progress))}px`);footer.style.setProperty('--footer-shift',`${Math.round(45*(1-progress))}px`);}
 };
 window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paintScroll);},{passive:true});window.addEventListener('resize',paintScroll);paintScroll();
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(!reduced.matches&&!root.classList.contains('route-enter')&&!root.classList.contains('motion-enter'))entry.target.animate([{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:750,easing:ease});}),{threshold:.12});
  document.querySelectorAll('.case-intro,.case-cover,.case-gallery figure,.work-card,.about-identity,.post-body h2').forEach(element=>observer.observe(element));

 }
 reduced.addEventListener('change', () => {
  if (!reduced.matches) return;
  root.classList.remove('work-cursor-visible','work-preview-visible');
  paintScroll();
 });
})();
