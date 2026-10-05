async page => {
 const browser=page.context().browser(),evidence={frames:[],scenes:[]};
 const assert=(value,message)=>{if(!value)throw Error(message);};
 let stage='desktop opening';
 const desktop=await browser.newContext({viewport:{width:1301,height:657},reducedMotion:'no-preference'});
 try{
  const p=await desktop.newPage();await p.goto('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>document.documentElement.classList.contains('motion-enter'));
  const start=Date.now();
  for(const delay of [100,500,1000,1800,2400,3100,4000,4500]){
   await p.waitForTimeout(Math.max(0,delay-(Date.now()-start)));
   await p.screenshot({path:`output/playwright/ready-r4-opening-desktop-${delay}.png`});
   evidence.frames.push({frame:delay,elapsed:Date.now()-start,...await p.evaluate(()=>({opening:document.documentElement.classList.contains('motion-enter'),curtain:getComputedStyle(document.querySelector('.opening-curtain')).transform,animations:document.getAnimations().map(a=>a.animationName).filter(Boolean)}))});
  }
  assert(!await p.evaluate(()=>document.documentElement.classList.contains('motion-enter')),'Opening did not settle');
  stage='desktop scenes';
  for(const id of ['tiki','lucia','filsen']){
   await p.mouse.move(650,30);await p.waitForTimeout(160);await p.evaluate(()=>scrollTo(0,0));
   await p.locator(`[data-project="${id}"]`).hover();await p.waitForTimeout(850);await p.waitForFunction(id=>[document.querySelector(`[data-project="${id}"] img`),...document.querySelector(`[data-collage="${id}"]`).querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0),id,{timeout:15000});
   const state=await p.evaluate(id=>{
    const collage=document.querySelector(`[data-collage="${id}"]`),tile=document.querySelector(`[data-project="${id}"]`),title=document.querySelector(`[data-context="${id}"] h2`).getBoundingClientRect();
    const imgs=[tile.querySelector('img'),...collage.querySelectorAll('img')];
    return {scrollY,focus:document.querySelector('[data-scene]').dataset.focus,visible:getComputedStyle(collage).visibility,images:imgs.map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),collision:imgs.some(i=>{const r=i.getBoundingClientRect();return r.left<title.right&&r.right>title.left&&r.top<title.bottom&&r.bottom>title.top;}),overflow:document.documentElement.scrollWidth>innerWidth};
   },id);
   assert(state.focus===id&&state.visible==='visible'&&state.images.length===3&&state.images.every(i=>i.loaded)&&!state.collision&&!state.overflow,'Invalid desktop scene '+JSON.stringify(state));evidence.scenes.push({viewport:'desktop',id,...state});
   await p.screenshot({path:`output/playwright/ready-r4-scene-${id}-desktop.png`});
  }
  stage='route transition';
  await p.locator('[data-project="filsen"]').click({noWaitAfter:true});await p.waitForTimeout(200);
  evidence.exit=await p.evaluate(()=>({active:document.documentElement.classList.contains('route-exit'),label:document.querySelector('.route-curtain span').textContent}));
  await p.waitForURL(/\/work\/filsen\/?$/,{waitUntil:'domcontentloaded'});await p.waitForSelector('body');await p.waitForTimeout(100);evidence.enter=await p.evaluate(()=>({active:document.documentElement.classList.contains('route-enter'),internal:window.__portfolioInternalNavigation,elapsed:performance.now()-(window.__portfolioRouteEnterStarted||0),label:document.querySelector('.route-curtain span').textContent}));await p.screenshot({path:'output/playwright/ready-r4-route-reveal.png'});
  assert(evidence.exit.active&&evidence.enter.internal&&(evidence.enter.active||evidence.enter.elapsed>=1000)&&evidence.enter.label==='','Missing click-to-case transition '+JSON.stringify({exit:evidence.exit,enter:evidence.enter}));
  stage='back history';
  await p.waitForTimeout(1100);await p.goBack({waitUntil:'domcontentloaded'});await p.waitForSelector('body');await p.waitForTimeout(500);evidence.back=await p.evaluate(()=>({opening:document.documentElement.classList.contains('motion-enter'),exit:document.documentElement.classList.contains('route-exit')}));assert(!evidence.back.opening&&!evidence.back.exit,'Back retained an overlay');
  await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(300);evidence.repeat=await p.evaluate(()=>document.documentElement.classList.contains('motion-enter'));assert(evidence.repeat,'Intentional homepage reload did not show opening');await p.waitForTimeout(4100);
  stage='footer';
  const footer=p.locator('.studio-footer');await footer.scrollIntoViewIfNeeded();await p.evaluate(()=>{const f=document.querySelector('footer');scrollTo(0,f.getBoundingClientRect().top+scrollY-innerHeight+100);});await p.waitForTimeout(100);
  evidence.footerEntry=await footer.evaluate(e=>({progress:e.style.getPropertyValue('--footer-progress'),bend:getComputedStyle(e,'::after').height,content:getComputedStyle(e.querySelector('.footer-meta')).translate,button:getComputedStyle(e.querySelector('.round-link')).translate}));await p.screenshot({path:'output/playwright/ready-r4-footer-entry.png'});
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(100);evidence.footerEnd=await footer.evaluate(e=>({progress:e.style.getPropertyValue('--footer-progress'),bend:getComputedStyle(e,'::after').height,content:getComputedStyle(e.querySelector('.footer-meta')).translate,button:getComputedStyle(e.querySelector('.round-link')).translate}));await p.screenshot({path:'output/playwright/ready-r4-footer-end.png'});assert(parseFloat(evidence.footerEntry.bend)>parseFloat(evidence.footerEnd.bend),'Footer curve did not flatten');
  stage='menu';
  await p.locator('[data-menu-open]').click();await p.waitForTimeout(230);evidence.menuMid=await p.locator('dialog').evaluate(e=>({open:e.open,curve:getComputedStyle(e).borderTopLeftRadius,transform:getComputedStyle(e).transform}));await p.screenshot({path:'output/playwright/ready-r4-menu-curved-entry.png'});
  await p.waitForTimeout(650);evidence.menuOpen=await p.evaluate(()=>({open:document.querySelector('dialog').open,focusInside:document.querySelector('dialog').contains(document.activeElement),lock:document.body.style.overflow}));await p.screenshot({path:'output/playwright/ready-r4-menu-open.png'});await p.keyboard.press('Escape');await p.waitForTimeout(900);evidence.menuClosed=await p.evaluate(()=>({open:document.querySelector('dialog').open,focusReturned:document.activeElement===document.querySelector('[data-menu-open]'),lock:document.body.style.overflow}));assert(evidence.menuOpen.open&&evidence.menuOpen.focusInside&&evidence.menuOpen.lock==='hidden'&&!evidence.menuClosed.open&&evidence.menuClosed.focusReturned,'Menu focus/scroll lifecycle failed');
  stage='magnets and work';
  await p.evaluate(()=>scrollTo(0,0));const work=p.locator('.portfolio-header nav a[href="/work"]');await work.hover();const box=await work.boundingBox();await p.mouse.move(box.x+box.width*.85,box.y+box.height*.75);await p.waitForTimeout(300);evidence.magnet=await work.evaluate(e=>({outer:getComputedStyle(e).transform,inner:getComputedStyle(e.querySelector('.magnetic-label')).transform,x:e.style.getPropertyValue('--magnet-x')}));assert(parseFloat(evidence.magnet.x)!==0,'Navigation not magnetic');
  await p.locator('.brand-roll').hover();await p.waitForTimeout(550);evidence.brand=await p.locator('.brand-roll-main').evaluate(e=>getComputedStyle(e).transform);await p.screenshot({path:'output/playwright/ready-r4-brand-reveal.png'});
  await work.click();await p.waitForURL(/\/work\/?$/);await p.waitForTimeout(1200);await p.locator('[data-work-view="list"]').click();
  await p.locator('.work-card').nth(1).hover();await p.waitForTimeout(550);evidence.work=await p.evaluate(()=>({cursor:document.documentElement.classList.contains('work-cursor-visible'),preview:document.documentElement.classList.contains('work-preview-visible'),images:document.querySelectorAll('.work-hover-preview img').length,index:document.querySelector('.work-hover-preview').style.getPropertyValue('--preview-index'),stack:getComputedStyle(document.querySelector('.work-preview-stack')).transform}));assert(evidence.work.cursor&&evidence.work.preview&&evidence.work.images===3&&evidence.work.index==='1','Work follower absent');await p.screenshot({path:'output/playwright/ready-r4-work-hover.png'});
 }catch(error){throw Error(stage+': '+error.message);}finally{await desktop.close();}
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
 try{
  const p=await mobile.newPage();await p.goto('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});await p.waitForTimeout(400);evidence.mobileOpening=await p.evaluate(()=>({active:document.documentElement.classList.contains('motion-enter'),curtain:getComputedStyle(document.querySelector('.opening-curtain')).display,contact:document.querySelector('.header-contact').getBoundingClientRect().width}));await p.screenshot({path:'output/playwright/ready-r4-opening-mobile.png'});assert(evidence.mobileOpening.active&&evidence.mobileOpening.curtain==='flex'&&evidence.mobileOpening.contact>0,'Mobile opening absent');await p.waitForTimeout(3700);
  for(const id of ['tiki','lucia','filsen']){await p.locator(`[data-project="${id}"]`).tap();await p.locator(`[data-context="${id}"]`).scrollIntoViewIfNeeded();await p.waitForTimeout(600);await p.waitForFunction(id=>[...document.querySelector(`[data-context="${id}"]`).querySelectorAll('.mobile-project-media img')].every(i=>i.complete&&i.naturalWidth>0),id,{timeout:15000});const state=await p.locator(`[data-context="${id}"]`).evaluate(e=>({visible:e.getAttribute('aria-hidden')==='false',images:[...e.querySelectorAll('.mobile-project-media img')].map(i=>({src:i.currentSrc,loaded:i.complete&&i.naturalWidth>0})),overflow:document.documentElement.scrollWidth>innerWidth}));assert(state.visible&&state.images.length===2&&state.images.every(i=>i.loaded)&&!state.overflow,'Invalid touch scene '+id);evidence.scenes.push({viewport:'mobile',id,...state});await p.screenshot({path:`output/playwright/ready-r4-scene-${id}-mobile.png`});}
  await p.locator('[data-context="filsen"] a').click();await p.waitForURL(/\/work\/filsen\/?$/);await p.waitForTimeout(1200);evidence.mobileCase=p.url();
 }finally{await mobile.close();}
 return evidence;
}
