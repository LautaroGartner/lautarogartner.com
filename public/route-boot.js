// Critical first-paint state. CSS completes the reveal even if the later controller fails.
(() => {
 try{
  const navigationType=performance.getEntriesByType('navigation')[0]?.type;
  const restored=navigationType==='back_forward';
  if(restored||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const normalize=path=>path.replace(/\/+$/,'')||'/';
  const path=normalize(location.pathname),home=['/','/es','/web','/web/es'].includes(path);
  let route;try{route=JSON.parse(sessionStorage.getItem('portfolio-route-transition')||'null');}catch{}
  const fresh=route&&Date.now()-route.createdAt<60000;
  const internal=navigationType!=='reload'&&fresh&&normalize(route.path)===path;window.__portfolioInternalNavigation=Boolean(internal);
  if(internal){window.__portfolioRouteEnterStarted=performance.now();document.documentElement.classList.add('route-enter');}
  if(home&&!internal){window.__portfolioOpeningStarted=performance.now();document.documentElement.classList.add('motion-enter','opening-pending');setTimeout(()=>document.documentElement.classList.remove('motion-enter','opening-pending','home-route-enter'),4500);}
 }catch{}
})();
