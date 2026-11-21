async page=>{
 const browser=page.context().browser(),result=[];
 for(const [width,lang] of [[1440,'en'],[390,'en'],[320,'en']]){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});let googleLoads=0,submits=0;
  try{
   await ctx.route('https://www.googletagmanager.com/**',route=>{googleLoads++;return route.fulfill({contentType:'application/javascript',body:'/* synthetic tag fixture; no Google requests */'});});
   await ctx.route(/https:\/\/[^/]*google-analytics\.com\//,route=>route.abort());
   await ctx.route('https://www.lautarogartner.com/**',async route=>{
    const url=new URL(route.request().url());if(url.pathname==='/api/enquiry')return route.fulfill(route.request().method()==='GET'?{json:{token:'synthetic-ga-token'}}:(submits++,{json:{accepted:true,reference:'synthetic-ga-accepted'}}));
    const response=await ctx.request.get('http://127.0.0.1:8770'+url.pathname+url.search);const contentType=response.headers()['content-type']||'application/octet-stream';let body=await response.body();if(contentType.includes('text/html'))body=Buffer.from(body.toString().replace('data-measurement-id=""','data-measurement-id="G-TEST123456"'));
    return route.fulfill({status:response.status(),contentType,body});
   });
   const p=await ctx.newPage();
   await p.goto('https://www.lautarogartner.com/contact?email=DO_NOT_TRACK',{waitUntil:'networkidle'});
   if(googleLoads!==1 || !await p.evaluate(()=>window.lgAdvertisingAllowed()))throw Error('Missing default measurement');
   const toggle=p.locator('.data-settings-toggle');
   const deny=p.locator('[data-necessary-only]');
   const analytics=p.locator('[name="analytics"]');
   if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Consent layout overflow');
   await p.screenshot({path:'output/playwright/analytics-choice-'+lang+'-'+width+'.png',fullPage:true});
   await deny.click();await p.reload({waitUntil:'networkidle'});if(googleLoads!==1)throw Error('Tracked declined consent');
   await toggle.click();await analytics.check();await p.locator('[data-save-preferences]').click();
   await p.waitForFunction(()=>window.dataLayer?.some(x=>x[0]==='event'&&x[1]==='page_view'));
   if(googleLoads!==2)throw Error('Repeated Google loader');
   await p.locator('#contact-name').fill('Synthetic Owner');
   await p.locator('#contact-service').selectOption({index:1});
   await p.locator('#contact-email').fill('synthetic@example.invalid');
   await p.locator('#contact-need').fill('[TEST ONLY] No form data goes to analytics.');
   await p.locator('#contact-phone-country').selectOption('US');
   await p.locator('#contact-phone').fill('2025550123');
   await p.locator('#contact-budget').selectOption({index:1});
   await p.locator('.enquiry-submit').click();
   await p.waitForFunction(()=>document.querySelector('.contact-status').dataset.state==='success');
   const events=await p.evaluate(()=>window.dataLayer.filter(x=>x[0]==='event').map(x=>[x[1],x[2]]));
   if(events.filter(x=>x[0]==='enquiry_accepted').length!==1)throw Error('Wrong enquiry count');if(JSON.stringify(events).includes('synthetic@example')||JSON.stringify(events).includes('TEST ONLY')||JSON.stringify(events).includes('DO_NOT_TRACK'))throw Error('PII in analytics');
   await p.evaluate(()=>document.querySelector('form').requestSubmit());if(submits!==1)throw Error('Repeated submission');
   await toggle.click();await deny.click();
   await p.evaluate(()=>dispatchEvent(new CustomEvent('enquiry:accepted',{detail:{language:'en'}})));const after=await p.evaluate(()=>window.dataLayer.filter(x=>x[0]==='event').length);if(after!==events.length)throw Error('Tracked after withdrawal');
   await p.reload({waitUntil:'networkidle'});if(googleLoads!==2)throw Error('Reloaded Google after withdrawal');
   result.push({width,lang,default:'both categories enabled',decline:'persisted',allow:'one pageview, one provider-accepted enquiry',payload:'language and sanitized path only; no form data or query',withdraw:'stops events and future Google loads',liveIngestion:'not tested; synthetic ID and blocked Google routes'});
  }finally{await ctx.close();}
 }
 return result;
}
