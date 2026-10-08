(() => {
 document.documentElement?.classList?.remove('opening-pending');
 const equivalents = {offer:'oferta',work:'trabajos','about-me':'sobre-mi',contact:'contacto',tiki:'tiki',lucia:'lucia',filsen:'filsen'};
 const updateLanguage = () => {
  const link=document.querySelector('[data-language]'); if(!link) return;
  const hash=decodeURIComponent(location.hash.slice(1));
  const map=link.dataset.language==='es'?equivalents:Object.fromEntries(Object.entries(equivalents).map(([a,b])=>[b,a]));
  link.href=link.pathname+(map[hash]?'#'+map[hash]:'');
 };
 updateLanguage(); window.addEventListener('hashchange',updateLanguage);
 const clocks=[...(document.querySelectorAll?.('[data-local-time]')||[])];
 if(clocks.length){
  let clockTimer;
  const updateClock=()=>{
   window.clearTimeout(clockTimer);if(document.visibilityState==='hidden')return;
   const now=new Date();clocks.forEach(clock=>{clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:clock.dataset.timezone,hour:'2-digit',minute:'2-digit',hour12:false}).format(now);clock.dateTime=now.toISOString();});
   clockTimer=window.setTimeout(updateClock,60000-(Date.now()%60000));
  };
  updateClock();document.addEventListener('visibilitychange',updateClock);
 }
 if('IntersectionObserver' in window){
  const graphics=document.querySelectorAll('[data-motion-graphic]');
  const graphicObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-motion-visible',entry.isIntersecting)),{rootMargin:'40px'});
  graphics.forEach(graphic=>graphicObserver.observe(graphic));
 }
 const button=document.querySelector('.copy-email'),status=document.querySelector('.copy-status');
 if(button) button.addEventListener('click',async()=>{
  try { if(!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(button.dataset.email); status.textContent=button.dataset.success; }
  catch { status.textContent=button.dataset.failure; const range=document.createRange(); range.selectNodeContents(document.querySelector('.email-address')); const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }
 });
 // The scene has one interruptible state shared by title, tiles and collage.
 // Server-rendered content stays readable when scripts or motion are disabled.
 const scene=document.querySelector('[data-scene]');
 if(scene&&location.hash){
  const lang=(location.pathname||'/').startsWith('/es')||(location.pathname||'').endsWith('/es')?'es':'en';
  const legacy={offer:'services',oferta:'services',work:'work',trabajos:'work','about-me':'about','sobre-mi':'about',contact:'contact',contacto:'contact',tiki:'work/tiki',lucia:'work/lucia',filsen:'work/filsen'};
  const route=legacy[location.hash.slice(1)];
  if(route&&location.replace){location.replace((lang==='es'?'/es':'')+'/'+route);return;}
 }
 const workIndex=document.querySelector('[data-work-index]');
 if(workIndex){
  document.querySelectorAll('[data-work-filter]').forEach(button=>button.addEventListener('click',()=>{
   const category=button.dataset.workFilter;
   document.querySelectorAll('[data-work-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
   workIndex.querySelectorAll('[data-category]').forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;});
  }));
  document.querySelectorAll('[data-work-view]').forEach(button=>button.addEventListener('click',()=>{
   workIndex.dataset.view=button.dataset.workView;
   document.querySelectorAll('[data-work-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
  }));
 }
 if(scene){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobileLayout=window.matchMedia('(max-width: 740px)');
  const tiles=[...scene.querySelectorAll('[data-project]')];
  const contexts=[...scene.querySelectorAll('[data-context]')];
  const reset=scene.querySelector('[data-scene-reset]');
  let pinned=null,leaveTimer=0,frame=0,opening=false;
  const cancelLeave=()=>window.clearTimeout(leaveTimer);
  const select=(project)=>{
   cancelLeave();
   if(project){opening=false;document.documentElement.classList.remove('motion-enter');}
   scene.dataset.focus=project||'overview';
   tiles.forEach(tile=>tile.setAttribute('aria-pressed',String(tile.dataset.project===project)));
   contexts.forEach(context=>{
    const active=context.dataset.context===project;
    context.setAttribute('aria-hidden',String(!active));
    context.querySelector('a').tabIndex=active?0:-1;
   });
   scene.querySelector('.scene-overview a').tabIndex=project&&!mobileLayout.matches?-1:0;
   reset.tabIndex=project?0:-1;
  };
  const restore=()=>{pinned=null;select(null);tiles.forEach(tile=>{tile.style.removeProperty('--float-x');tile.style.removeProperty('--float-y');});};
  tiles.forEach(tile=>{
   tile.addEventListener('pointerenter',()=>{if(finePointer.matches&&!pinned&&!opening)select(tile.dataset.project);});
   tile.addEventListener('pointerleave',()=>{if(!pinned)leaveTimer=window.setTimeout(()=>{if(!scene.contains(document.activeElement))select(null);},110);});
   tile.addEventListener('focus',()=>{pinned=null;select(tile.dataset.project);});
   tile.addEventListener('click',()=>{const id=tile.dataset.project;const link=contexts.find(context=>context.dataset.context===id)?.querySelector('a');if(finePointer.matches&&!mobileLayout.matches&&link?.click){link.click();return;}pinned=pinned===id?null:id;select(pinned);});
   tile.addEventListener('pointermove',event=>{
    if(reduced.matches||!finePointer.matches||frame)return;
    frame=window.requestAnimationFrame(()=>{
     frame=0;const box=tile.getBoundingClientRect();
     tile.style.setProperty('--float-x',`${((event.clientX-box.left)/box.width-.5)*10}px`);
     tile.style.setProperty('--float-y',`${((event.clientY-box.top)/box.height-.5)*10}px`);
    });
   });
  });
  contexts.forEach(context=>context.addEventListener('pointerenter',cancelLeave));
  scene.addEventListener('pointerleave',()=>{if(!pinned&&!scene.contains(document.activeElement))select(null);});
  scene.addEventListener('focusout',()=>{window.setTimeout(()=>{if(!scene.contains(document.activeElement)&&!pinned)select(null);},0);});
  scene.addEventListener('keydown',event=>{if(event.key==='Escape'){restore();document.activeElement?.blur?.();}});
  reset.addEventListener('click',restore);
  select(null);
  const backForward=typeof performance!=='undefined'&&performance.getEntriesByType?.('navigation')?.[0]?.type==='back_forward';
  if(!reduced.matches&&!backForward&&!window.__portfolioInternalNavigation){
   const elapsed=window.__portfolioOpeningStarted&&typeof performance!=='undefined'?performance.now()-window.__portfolioOpeningStarted:0;
   const remaining=Math.max(0,3800-elapsed);
   opening=remaining>0;
   if(opening)document.documentElement.classList.add('motion-enter');
   window.setTimeout(()=>{
    opening=false;document.documentElement.classList.remove('motion-enter');
    try{sessionStorage.setItem('portfolio-opening-v3','seen');}catch{}
   },remaining);
  }
  window.addEventListener('pageshow',event=>{if(event.persisted)document.documentElement.classList.remove('motion-enter');});
  // Native scrolling keeps browser history, anchors and keyboard behavior.
  // Reveal animation never hides content while waiting for an observer.
  if('IntersectionObserver' in window){
   const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
     if(!entry.isIntersecting)return;
     observer.unobserve(entry.target);
     if(!reduced.matches)entry.target.animate([
      {opacity:.35,transform:'translateY(28px)'},
      {opacity:1,transform:'translateY(0)'}
     ],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});
    });
   },{threshold:.12});
   document.querySelectorAll('.project,.section-grid,.steps article,.contact,.recent-writing').forEach(element=>observer.observe(element));
  }
  reduced.addEventListener('change',()=>{
   if(reduced.matches){document.documentElement.classList.remove('motion-enter');document.getAnimations().forEach(animation=>animation.cancel());tiles.forEach(tile=>{tile.style.removeProperty('--float-x');tile.style.removeProperty('--float-y');});}
  });
 }
})();
