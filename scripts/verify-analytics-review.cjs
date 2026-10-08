async page=>{
 const browser=page.context().browser(),result=[];
 for(const [width,lang] of [[1440,'en'],[390,'es'],[320,'en']]){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});let googleLoads=0,submits=0;
  try{
   await ctx.route('https://www.googletagmanager.com/**',route=>{googleLoads++;return route.fulfill({contentType:'application/javascript',body:'/* synthetic tag fixture; no Google requests */'});});
   await ctx.route(/https:\/\/[^/]*google-analytics\.com\//,route=>route.abort());
   await ctx.route('https://www.lautarogartner.com/**',async route=>{
    const url=new URL(route.request().url());if(url.pathname==='/api/enquiry')return route.fulfill(route.request().method()==='GET'?{json:{token:'synthetic-ga-token'}}:(submits++,{json:{accepted:true,reference:'synthetic-ga-accepted'}}));
    const response=await ctx.request.get('http://127.0.0.1:8770'+url.pathname+url.search);const contentType=response.headers()['content-type']||'application/octet-stream';let body=await response.body();if(contentType.includes('text/html'))body=Buffer.from(body.toString().replace('data-measurement-id=""','data-measurement-id="G-TEST123456"'));
    return route.fulfill({status:response.status(),contentType,body});
   });
   const p=await ctx.newPage();const prefix=lang==='es'?'/es':'';
   await p.goto('https://www.lautarogartner.com'+prefix+'/contact?email=DO_NOT_TRACK',{waitUntil:'networkidle'});
   if(googleLoads||await p.evaluate(()=>window.dataLayer?.length||0))throw Error('Tracked before opt-in');
   if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Consent layout overflow');
   await p.screenshot({path:'output/playwright/analytics-choice-'+lang+'-'+width+'.png',fullPage:true});
   await p.getByRole('button',{name:lang==='es'?'Rechazar':'Decline',exact:true}).click();await p.reload({waitUntil:'networkidle'});if(googleLoads)throw Error('Tracked declined consent');
   await p.getByRole('button',{name:lang==='es'?'Analítica':'Analytics',exact:true}).click();await p.getByRole('button',{name:lang==='es'?'Permitir':'Allow',exact:true}).click();
   await p.waitForFunction(()=>window.dataLayer?.some(x=>x[0]==='event'&&x[1]==='page_view'));
   if(googleLoads!==1)throw Error('Repeated Google loader');
   const email=lang==='es'?'Email':'Mail',need=lang==='es'?'Tu mensaje':'Your message';
   await p.locator('#contact-name').fill('Synthetic Owner');await p.locator('#contact-service').selectOption('forms');await p.getByLabel(email,{exact:true}).fill('synthetic@example.invalid');await p.getByLabel(need).fill('[TEST ONLY] No form data goes to analytics.');await p.getByRole('button',{name:lang==='es'?'Enviar consulta':'Send enquiry'}).click();await p.waitForFunction(()=>document.querySelector('.contact-status').dataset.state==='success');
   const events=await p.evaluate(()=>window.dataLayer.filter(x=>x[0]==='event').map(x=>[x[1],x[2]]));
   if(events.filter(x=>x[0]==='enquiry_accepted').length!==1)throw Error('Wrong enquiry count');if(JSON.stringify(events).includes('synthetic@example')||JSON.stringify(events).includes('TEST ONLY')||JSON.stringify(events).includes('DO_NOT_TRACK'))throw Error('PII in analytics');
   await p.evaluate(()=>document.querySelector('form').requestSubmit());if(submits!==1)throw Error('Repeated submission');
   await p.getByRole('button',{name:lang==='es'?'Analítica':'Analytics',exact:true}).click();await p.getByRole('button',{name:lang==='es'?'Rechazar':'Decline',exact:true}).click();
   await p.evaluate(()=>dispatchEvent(new CustomEvent('enquiry:accepted',{detail:{language:'en'}})));const after=await p.evaluate(()=>window.dataLayer.filter(x=>x[0]==='event').length);if(after!==events.length)throw Error('Tracked after withdrawal');
   await p.reload({waitUntil:'networkidle'});if(googleLoads!==1)throw Error('Reloaded Google after withdrawal');
   result.push({width,lang,default:'no Google network',decline:'persisted',allow:'one pageview, one provider-accepted enquiry',payload:'language and sanitized path only; no form data or query',withdraw:'stops events and future Google loads',liveIngestion:'not tested; synthetic ID and blocked Google routes'});
  }finally{await ctx.close();}
 }
 return result;
}
