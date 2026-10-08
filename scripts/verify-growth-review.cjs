async page => {
 const browser=page.context().browser(),results=[];
 const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
 const base='http://127.0.0.1:8770';
 for(const width of [1440,390,320]){
  const ctx=await browser.newContext({viewport:{width,height:900},hasTouch:width<740,reducedMotion:'reduce'});
  try{
   const p=await ctx.newPage();
   for(const route of ['/services','/es/services','/contact','/es/contact','/work/tiki','/es/work/tiki']){
    await p.goto(base+route,{waitUntil:'domcontentloaded'});
    assert(await p.locator('h1').count()===1,route+' heading');
    assert(await p.locator('script[src*="datafa.st"]').count()===0,'DataFast still installed');
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),route+' overflow '+width);
    const lang=route.startsWith('/es')?'es':'en',pair=lang==='es'?route.slice(3):'/es'+route;
    assert(await p.locator('[data-language]').getAttribute('href')===pair,'Language pair '+route);
    const direct=p.locator('.contact-direct');if(await direct.count()){const href=await direct.getAttribute('href');assert(href.startsWith('mailto:'+(lang==='es'?'hola':'contact')+'@lautarogartner.com'),'Localized direct email');assert((await p.locator('.contact-details').textContent()).includes(lang==='es'?'borrador':'draft'),'Mailto expectation');}
    if(route.includes('contact'))assert(await p.locator('.contact-trap').evaluate(el=>el.getBoundingClientRect().right<0),'Honeypot visible');
    if(width!==320)await p.screenshot({path:'output/playwright/'+route.slice(1).replaceAll('/','-')+'-'+width+'.png',fullPage:true});
    results.push({route,width,heading:true,reflow:true,languagePair:pair});
   }
   await p.goto(base+'/services');if(width<740){await p.locator('[data-menu-open]').click();await p.locator('.site-menu a[href="/es/services"]').click();}else{await p.locator('[data-language]').click();}await p.waitForURL(/\/es\/services$/);assert((await p.locator('h1').textContent()).includes('Arreglos'),'Actual language switch');
   await p.locator('.service-next .button').click();await p.waitForURL(/\/es\/contact$/);
   // Real local endpoint is intentionally unconfigured. It must not claim sending.
   await p.getByLabel('Tu email',{exact:true}).fill('synthetic@example.invalid');await p.getByLabel('¿Qué necesitás resolver?').fill('[TEST ONLY] Synthetic form verification.');await p.getByRole('button',{name:'Enviar consulta'}).click();
   await p.waitForFunction(()=>document.querySelector('.contact-status').dataset.state==='error');assert(await p.locator('.contact-status').textContent(), 'Visible unavailable status');
   assert(await p.getByLabel('¿Qué necesitás resolver?').inputValue()==='[TEST ONLY] Synthetic form verification.','Values retained');
   // Synthetic provider/UI fixtures; these never contact a real delivery service.
   let posts=0,mode='reject',payloads=[];
   await p.route('**/api/enquiry',async route=>{if(route.request().method()==='GET')return route.fulfill({json:{token:'synthetic-browser-token'}});posts++;payloads.push(route.request().postDataJSON());await new Promise(resolve=>setTimeout(resolve,250));return route.fulfill(mode==='reject'?{status:502,json:{error:'delivery'}}:mode==='rate'?{status:429,json:{error:'rate_limited'}}:{json:{accepted:true,reference:'synthetic-browser-accepted'}});});
   await p.goto(base+'/es/contact');await p.evaluate(()=>{window.__goals=[];window.addEventListener('enquiry:accepted',event=>window.__goals.push(['enquiry_accepted',event.detail]));});
   await p.getByRole('button',{name:'Enviar consulta'}).click();assert(posts===0,'Invalid empty form sent');
   await p.getByLabel('Tu email',{exact:true}).fill('synthetic@example.invalid');await p.getByLabel('¿Qué necesitás resolver?').fill('[TEST ONLY] Synthetic browser enquiry.');
   await p.getByRole('button',{name:'Enviar consulta'}).click();await p.evaluate(()=>document.querySelector('form').requestSubmit());await p.waitForFunction(()=>document.querySelector('.contact-status').dataset.state==='error');
   assert(posts===1,'Duplicate pending send');assert((await p.evaluate(()=>window.__goals)).length===0,'Error counted as conversion');
   mode='rate';await p.getByRole('button',{name:'Enviar consulta'}).click();await p.waitForFunction(()=>document.querySelector('.contact-status').textContent.includes('minuto'));assert((await p.evaluate(()=>window.__goals)).length===0,'Rate error counted');
   mode='accept';await p.getByRole('button',{name:'Enviar consulta'}).click();await p.waitForFunction(()=>document.querySelector('.contact-status').dataset.state==='success');
   assert(await p.locator('.round-submit .magnetic-label').textContent()==='Consulta aceptada','Submit label stacking');
   assert(payloads.every(payload=>JSON.stringify(payload)===JSON.stringify(payloads[0])),'Retry payload changed');
   await p.evaluate(()=>document.querySelector('form').requestSubmit());assert(posts===3,'Repeated accepted send');
   const goals=await p.evaluate(()=>window.__goals);assert(JSON.stringify(goals)==='[["enquiry_accepted",{"language":"es"}]]','PII or duplicate conversion');
   await p.screenshot({path:'output/playwright/contact-accepted-fixture-'+width+'.png',fullPage:true});results.push({width,form:'validation, unavailable, 502, 429, acceptance, stable retry, repeated submit and PII-free single goal passed (fixtures)'});
   await p.goto(base+'/about');const portrait=p.locator('.about-portrait img');assert(await portrait.evaluate(img=>img.complete&&img.naturalWidth>0),'Original About portrait');
   for(const asset of ['favicon.ico','favicon.svg','favicon-32.png','apple-touch-icon.png','icon-192.png','icon-512.png','site.webmanifest'])assert((await p.request.get(base+'/'+asset+'?v=portrait-20261008')).status()===200,'Icon '+asset);
   assert(await p.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute('href')==='/favicon.svg?v=portrait-20261008','Favicon reference');
   await p.screenshot({path:'output/playwright/about-'+width+'.png',fullPage:true});
   results.push({width,portrait:'decoded unchanged original',favicon:'all current references and assets HTTP 200'});
  }finally{await ctx.close();}
 }
 const ctx=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});try{const p=await ctx.newPage();await p.goto(base+'/es/contact');assert((await p.locator('noscript').textContent()).includes('borrador'),'No-JS fallback');assert(await p.locator('button[type=submit]').isDisabled(),'No-JS submit enabled');results.push({noJavaScript:'disabled submit, visible direct email instructions'});}finally{await ctx.close();}
 return results;
}
