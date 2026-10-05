async page => {
 const context=await page.context().browser().newContext({viewport:{width:1000,height:700},reducedMotion:'no-preference'});
 try{
 const p=await context.newPage(),session=await context.newCDPSession(p),frames=[];
 session.on('Page.screencastFrame',event=>{frames.push({phase:phase,data:event.data,metadata:event.metadata});session.send('Page.screencastFrameAck',{sessionId:event.sessionId});});
 let phase='opening';await session.send('Page.startScreencast',{format:'jpeg',quality:55,maxWidth:600,maxHeight:420,everyNthFrame:3});
 await p.goto('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});
 const opening=await p.evaluate(()=>({epoch:performance.timeOrigin+window.__portfolioOpeningStarted,box:document.querySelector('.opening-greeting').getBoundingClientRect().toJSON(),viewport:{width:innerWidth,height:innerHeight}}));
 await p.waitForTimeout(4100);
 phase='normal-route';await p.locator('.portfolio-header nav a[href="/work"]').click({noWaitAfter:true});await p.waitForURL(/work/,{waitUntil:'domcontentloaded'});
 phase='rapid-route';await p.locator('.portfolio-header nav a[href="/about"]').click({noWaitAfter:true});await p.waitForURL(/about/,{waitUntil:'domcontentloaded'});await p.waitForTimeout(1300);
 phase='internal-home';await p.locator('.brand-roll').click({noWaitAfter:true});await p.waitForURL('http://127.0.0.1:8766/',{waitUntil:'domcontentloaded'});const internal=await p.evaluate(()=>({opening:document.documentElement.classList.contains('motion-enter'),internal:window.__portfolioInternalNavigation}));if(internal.opening||!internal.internal)throw Error('Internal Home restarted greeting');
 await p.waitForTimeout(1200);phase='welcome-interruption';await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(800);await p.locator('.portfolio-header nav a[href="/work"]').click({noWaitAfter:true});await p.waitForURL(/work/,{waitUntil:'domcontentloaded'});await p.waitForTimeout(1300);
 await session.send('Page.stopScreencast');return {opening,internal,frames,url:p.url()};
 }finally{await context.close();}
}