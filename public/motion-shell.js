(() => {
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const ease='cubic-bezier(.76,0,.24,1)';
 const menu=document.querySelector('.site-menu'),open=document.querySelector('[data-menu-open]'),close=document.querySelector('[data-menu-close]');
 let menuClosing=0,previousOverflow='';
 const closeMenu=()=>{
  if(!menu?.open||menuClosing)return;
  root.classList.remove('menu-visible');open?.setAttribute('aria-expanded','false');
  menuClosing=setTimeout(()=>{menu.close();document.body.style.overflow=previousOverflow;menuClosing=0;},reduced.matches?0:850);
 };
 open?.addEventListener('click',()=>{
  if(menu.open){closeMenu();return;}
  previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  menu.showModal();void menu.offsetWidth;open.setAttribute('aria-expanded','true');requestAnimationFrame(()=>root.classList.add('menu-visible'));
 });
 close?.addEventListener('click',closeMenu);
 menu?.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
 menu?.addEventListener('click',event=>{if(event.target===menu)closeMenu();});

 // Preserve native history/new tabs/external URLs; cover only ordinary internal navigation.
 const curtain=document.querySelector('.route-curtain');let navigating=false;
 try{
  const stored=sessionStorage.getItem('portfolio-route-transition');const arriving=stored?JSON.parse(stored):null;
  sessionStorage.removeItem('portfolio-route-transition');
  const navigationType=performance.getEntriesByType('navigation')[0]?.type;
  const fresh=arriving&&Date.now()-arriving.createdAt<60000;
  if(fresh&&navigationType!=='reload'&&navigationType!=='back_forward'&&arriving.path.replace(/\/+$/,'')===location.pathname.replace(/\/+$/,'')){
   curtain.querySelector('span').textContent='';
   sessionStorage.removeItem('portfolio-route-transition');
   if(!reduced.matches){window.__portfolioRouteEnterStarted??=performance.now();root.classList.add('route-enter');setTimeout(()=>{root.classList.remove('route-enter','home-route-enter');document.querySelector('#content')?.focus({preventScroll:true});},Math.max(0,1050-(performance.now()-window.__portfolioRouteEnterStarted)));}
  }
 }catch{}
 document.addEventListener('click',event=>{
  const anchor=event.target.closest?.('a[href]');
  if(!anchor||reduced.matches||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.target||anchor.hasAttribute('download'))return;
  const url=new URL(anchor.href,location.href);
  if(url.origin!==location.origin||url.protocol!=='http:'&&url.protocol!=='https:'||url.pathname.startsWith('/admin')||url.pathname.startsWith('/api'))return;
  if(navigating){event.preventDefault();return;}
  const normalize=path=>path.replace(/\/+$/,'')||'/';
  if(normalize(url.pathname)===normalize(location.pathname)&&url.search===location.search){
   if(!url.hash){event.preventDefault();document.querySelector('[data-scene-reset]')?.click();scrollTo({top:0,behavior:'smooth'});}
   return;
  }
  event.preventDefault();navigating=true;
  const beginExit=()=>{
   const opening=root.classList.contains('motion-enter')?document.querySelector('.opening-curtain'):null;
   const cover=opening?getComputedStyle(opening):null;
   const from=cover?{transform:cover.transform,borderRadius:cover.borderRadius}:null;
   curtain.getAnimations().forEach(animation=>animation.cancel());curtain.style.removeProperty('animation');
   root.classList.remove('motion-enter','route-enter');root.classList.add('route-exit');
   curtain.querySelector('span').textContent='';
   if(from){curtain.style.animation='none';curtain.animate([from,{transform:'none',borderRadius:'0px'}],{duration:650,easing:ease,fill:'forwards'});}
   try{sessionStorage.setItem('portfolio-route-transition',JSON.stringify({path:url.pathname,title:'',createdAt:Date.now()}));}catch{}
   setTimeout(()=>{if(menu?.open){menu.close();open?.setAttribute('aria-expanded','false');document.body.style.overflow=previousOverflow;root.classList.remove('menu-visible');}location.assign(url.href);},720);
  };
  // Finish an incoming reveal before starting a new cover; never reset a moving curtain offscreen.
  const remaining=root.classList.contains('route-enter')?Math.max(0,1050-(performance.now()-(window.__portfolioRouteEnterStarted||0))):0;
  if(remaining)setTimeout(beginExit,remaining);else beginExit();
 });
 window.addEventListener('pageshow',event=>{
  if(event.persisted){navigating=false;clearTimeout(menuClosing);menuClosing=0;open?.setAttribute('aria-expanded','false');root.classList.remove('route-exit','route-enter','home-route-enter','menu-visible','work-cursor-visible');if(menu?.open)menu.close();document.body.style.overflow=previousOverflow;}
 });

 // Magnetic motion stays attached to the actual accessible link/button.
 document.querySelectorAll('.portfolio-header nav a,.header-contact,.writing-utility,.languages a,.brand-roll,.round-link,.round-submit,.floating-menu-button,.menu-close,.site-menu nav a').forEach(element=>{
  if(element.matches('.portfolio-header nav a,.header-contact,.writing-utility,.languages a,.site-menu nav a,.round-link,.round-submit')){const label=document.createElement('span');label.className='magnetic-label';while(element.firstChild)label.append(element.firstChild);element.append(label);}
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
  scrollFrame=0;if(Math.abs(scrollY-directionOrigin)>=12){root.dataset.scrollDirection=scrollY>directionOrigin?'down':'up';directionOrigin=scrollY;}root.classList.toggle('is-scrolled',scrollY>Math.min(260,innerHeight*.45));
  if(footer){const box=footer.getBoundingClientRect();const progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight-box.top)/box.height));footer.style.setProperty('--footer-progress',progress.toFixed(4));footer.style.setProperty('--footer-bend',`${Math.round(110*(1-progress))}px`);footer.style.setProperty('--footer-shift',`${Math.round(45*(1-progress))}px`);}
 };
 window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paintScroll);},{passive:true});window.addEventListener('resize',paintScroll);paintScroll();
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(!reduced.matches&&!root.classList.contains('route-enter')&&!root.classList.contains('motion-enter'))entry.target.animate([{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:750,easing:ease});}),{threshold:.12});
  document.querySelectorAll('.route-head,.case-intro,.case-cover,.case-gallery figure,.work-card,.about-identity,.post-body h2').forEach(element=>observer.observe(element));
 }
 reduced.addEventListener('change',()=>{if(reduced.matches){root.classList.remove('work-cursor-visible','work-preview-visible','route-exit','route-enter');document.getAnimations().forEach(animation=>animation.cancel());paintScroll();}});
})();
