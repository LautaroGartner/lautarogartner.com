async page=>{
 const browser=page.context().browser(),results=[];
 const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
 for(const mode of [{name:'desktop-motion',width:1440,height:900},{name:'mobile-motion',width:390,height:844,touch:true},{name:'mobile-reduced',width:390,height:844,touch:true,reduced:true}]){
  const ctx=await browser.newContext({viewport:{width:mode.width,height:mode.height},isMobile:!!mode.touch,hasTouch:!!mode.touch,reducedMotion:mode.reduced?'reduce':'no-preference'});
  try{
   const p=await ctx.newPage();p.setDefaultTimeout(10000);p.setDefaultNavigationTimeout(10000);await p.goto('http://127.0.0.1:8769/es/about',{waitUntil:'domcontentloaded'});
   const opener=p.locator('[data-menu-open]'),menu=p.locator('.site-menu');
   const prepare=async()=>{if(!mode.touch){await p.evaluate(()=>scrollTo({top:400,behavior:'instant'}));await p.waitForTimeout(100);}};
   const state=()=>p.evaluate(()=>{const d=document.querySelector('.site-menu');return {open:d.open,visible:document.documentElement.classList.contains('menu-visible'),x:d.getBoundingClientRect().x,overflow:document.body.style.overflow,focus:document.activeElement===document.querySelector('[data-menu-open]'),scrollY};});
   await p.screenshot({path:'/tmp/menu-after-'+mode.name+'-about.png'});await prepare();await opener.click();
   const frames=[];for(const delay of [0,100,160,240]){if(delay)await p.waitForTimeout(delay);frames.push(await state());await p.screenshot({path:'/tmp/menu-after-'+mode.name+'-open-'+frames.length+'.png'});}
   if(!mode.reduced)assert(frames[0].x>frames[2].x&&frames[3].x===mode.width-Math.min(520,mode.width),'Panel did not animate coherently '+mode.name);
   assert((await state()).open&&(await state()).overflow==='hidden','Menu not locked/open');
   for(let n=0;n<12;n++){await p.keyboard.press(n%3?'Tab':'Shift+Tab');assert(await p.evaluate(()=>document.querySelector('.site-menu').contains(document.activeElement)),'Focus escaped dialog');}
   const lockedY=(await state()).scrollY;await p.mouse.wheel(0,300);await p.waitForTimeout(100);assert((await state()).scrollY===lockedY,'Background scroll was not locked');
   await p.keyboard.press('Escape');await p.waitForTimeout(400);let closed=await state();assert(!closed.open&&!closed.visible&&closed.overflow===''&&closed.focus,'Escape/focus restore failed');
   for(let n=0;n<5;n++){await opener.click();await p.waitForTimeout(25);await p.keyboard.press('Escape');await p.waitForTimeout(380);closed=await state();assert(!closed.open&&!closed.visible&&closed.overflow==='','Interrupted open stuck '+n);}
   await opener.click();await p.waitForTimeout(450);await menu.locator('a[href="/es/about"]').click();await p.waitForTimeout(400);assert(!(await state()).open&&(await state()).overflow==='','Current page selection did not close');
   await opener.click();await p.waitForTimeout(450);await p.locator('[data-menu-close]').click();await p.waitForTimeout(400);assert(!(await state()).open&&(await state()).focus,'Close button focus failed');
   await opener.click();await p.waitForTimeout(450);await menu.locator('a[href="/es/work"]').click();
   if(!mode.reduced){await p.waitForTimeout(150);const handoff=await state();assert(!handoff.visible,'Menu did not start closing during route handoff');await p.screenshot({path:'/tmp/menu-after-'+mode.name+'-handoff.png'});}
   await p.waitForURL(/\/es\/work\/?$/);await p.waitForTimeout(1200);assert(!(await state()).open&&(await state()).overflow==='','Route retained modal lock');
   await p.goBack({waitUntil:'domcontentloaded'});await p.waitForTimeout(200);assert(!(await state()).open&&(await state()).overflow==='','History restored locked menu');
   results.push({mode:mode.name,frames,interactionChecks:'Escape, focus trap/return, body lock, 5 interrupted opens, current route, close button, route handoff and history passed'});
  }finally{await ctx.close();}
 }
 for(const width of [320,390,740,741,1024,1440]){
  const ctx=await browser.newContext({viewport:{width,height:844},reducedMotion:'no-preference'});
  try{const p=await ctx.newPage();p.setDefaultTimeout(10000);p.setDefaultNavigationTimeout(10000);for(const route of ['/es','/es/about','/es/work','/es/contact','/writing']){
   await p.goto('http://127.0.0.1:8769'+route,{waitUntil:'domcontentloaded'});await p.waitForTimeout(route==='/es'?4400:100);
   const layout=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,headerHeight:document.querySelector('.portfolio-header').getBoundingClientRect().height,portrait:document.querySelector('.about-portrait img')?.complete}));
   assert(!layout.overflow,'Overflow '+width+' '+route);if(width<=740)assert(layout.headerHeight===76,'Mobile header is not compact');
   if([320,390,741,1440].includes(width)&&['/es','/es/about'].includes(route))await p.screenshot({path:'/tmp/menu-layout-'+width+'-'+(route==='/es'?'home':'about')+'.png'});
   results.push({width,route,...layout});
  }}finally{await ctx.close();}
 }
 return results;
}
