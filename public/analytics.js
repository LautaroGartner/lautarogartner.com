(() => {
 const id=document.currentScript?.dataset.measurementId;
 const pixelId=document.currentScript?.dataset.metaPixelId;
 let landingViewSent=false;
 // Preferences are reviewable in preview, while measurement requires the public hostname and ID.
 const canMeasure=/^G-[A-Z0-9]{6,20}$/.test(id||'')&&['www.lautarogartner.com','lautarogartner.com'].includes(location.hostname);
 const publicHost=['www.lautarogartner.com','lautarogartner.com'].includes(location.hostname);
 const key=publicHost?'lg-analytics-choice-v1':'lg-analytics-preview-choice-v1',es=document.documentElement.lang==='es';
 const labels=es?{
  settings:'Privacidad y preferencias', intro:'Vos decidís qué permisos dar. Guardamos tus preferencias únicamente en este navegador.',
  necessary:'Necesarias', analytics:'Analítica', advertising:'Publicidad',
  note:'La analítica mide las visitas. La publicidad permite informar a Meta las visitas a la página de inicio y las consultas enviadas. Ambas están activadas de forma predeterminada, salvo que vos o tu navegador indiquen lo contrario.',
  preview:'Google Analytics está desactivado en esta vista.', details:'Datos del formulario',
  form:'Uso los datos del formulario para evaluar tu consulta y contactarte por tu proyecto. Las preferencias de cookies son independientes del envío de la consulta.',
  deny:'Solo necesarias', save:'Guardar',
 }:{
  settings:'Privacy and preferences', intro:'You choose which permissions to give. Your preferences are saved only in this browser.',
  necessary:'Necessary', analytics:'Analytics', advertising:'Advertising',
  note:'Analytics measures visits. Advertising lets me report landing page visits and completed enquiries to Meta. Both are on by default unless you or your browser opt out.',
  preview:'Google Analytics is off in this view.', details:'Form data',
  form:'I use the information you submit to review your enquiry and get in touch about your project. Cookie preferences are separate from submitting the form.',
  deny:'Necessary only', save:'Save',
 };
 let enabled=false,loaded=false,pageTracked=false;
 const preferenceLifetime=90*86400000;
 const optedOut=()=>navigator.globalPrivacyControl===true || navigator.doNotTrack==='1';
 let saved;
 function readPreferences(){
  try { saved=JSON.parse(localStorage.getItem(key)); } catch { saved=null; }
 }
 const analyticsAllowed=()=>!optedOut() && saved?.choice!=='deny';
 window.lgAdvertisingAllowed=()=>{
  if(optedOut())return false;
  if(saved?.adPolicy===2)return saved.advertising===true;
  // Older preferences only covered analytics. Preserve the previous advertising opt-out.
  return !saved;
 };
 function sendLandingView(){
  if(landingViewSent || !publicHost || location.pathname!=='/' || !/^\d{5,25}$/.test(pixelId||'') || !document.querySelector('[data-application]'))return;
  const endpoint=new URL('https://www.facebook.com/tr/');
  endpoint.searchParams.set('id',pixelId);
  endpoint.searchParams.set('ev','PageView');
  endpoint.searchParams.set('dl',location.origin+'/');
  endpoint.searchParams.set('noscript','1');
  const clickId=new URLSearchParams(location.search).get('fbclid');
  if(clickId && /^[\w-]{1,400}$/.test(clickId))endpoint.searchParams.set('fbc','fb.1.'+Date.now()+'.'+clickId);
  const image=document.createElement('img');
  image.alt='';
  image.hidden=true;
  image.referrerPolicy='no-referrer';
  landingViewSent=true;
  image.src=endpoint.href;
  document.body.append(image);
 }
 function syncAdvertising(){
  const allowed=window.lgAdvertisingAllowed();
  document.cookie='lg_ad_consent='+(allowed?'1':'0')+'; Path=/; SameSite=Lax; Max-Age='+(allowed?preferenceLifetime/1000:0)+(location.protocol==='https:'?'; Secure':'');
  if(allowed)sendLandingView();
  if(!allowed)for(const name of ['_fbp','_fbc'])for(const domain of ['',location.hostname,'.lautarogartner.com'])document.cookie=name+'=; Path=/; Max-Age=0; SameSite=Lax'+(domain?'; Domain='+domain:'');
  window.dispatchEvent(new Event('lg:advertising-change'));
 }
 const preferences=document.createElement('aside');
 preferences.className='data-settings';
 preferences.setAttribute('aria-label',labels.settings);
 preferences.innerHTML=`
  <section id="analytics-preferences" class="data-settings-panel" aria-label="${labels.settings}" hidden>
   <p>${labels.intro}</p>
   <div class="data-settings-options privacy-options">
    <label><span>${labels.necessary}</span><input type="checkbox" role="switch" checked disabled><span aria-hidden="true">On</span></label>
    <label><span>${labels.analytics}</span><input type="checkbox" role="switch" name="analytics"><span aria-hidden="true"></span></label>
    <label><span>${labels.advertising}</span><input type="checkbox" role="switch" name="advertising"><span aria-hidden="true"></span></label>
   </div>
   <p class="privacy-note">${labels.note}${canMeasure?'':' '+labels.preview}</p>
   <details class="form-data-details"><summary>${labels.details}</summary><p>${labels.form}</p></details>
   <div class="privacy-actions"><button type="button" data-necessary-only>${labels.deny}</button><button type="button" data-save-preferences>${labels.save}</button></div>
  </section>
  <button type="button" class="data-settings-toggle" aria-label="${labels.settings}" aria-controls="analytics-preferences" aria-expanded="false">
   <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14M7 3v4m6 1v4m-5 1v4"/></svg>
  </button>`;
 const settingsHost=document.querySelector('main + .consult-footer')?.previousElementSibling || document.body;
 settingsHost.append(preferences);
 const panel=preferences.querySelector('.data-settings-panel');
 const settings=preferences.querySelector('.data-settings-toggle');
 const analytics=preferences.querySelector('[name="analytics"]');
 const advertising=preferences.querySelector('[name="advertising"]');
 const updateStatus=input=>{input.nextElementSibling.textContent=input.checked?'On':'Off';};
 const setPanel=open=>{
  if(open){
   analytics.checked=analyticsAllowed();analytics.disabled=optedOut();
   advertising.checked=window.lgAdvertisingAllowed();advertising.disabled=optedOut();
   updateStatus(analytics);
   updateStatus(advertising);
  }
  panel.hidden=!open;
  settings.setAttribute('aria-expanded',String(open));
 };
 const track=(name,params={})=>{if(enabled&&loaded&&analyticsAllowed())window.gtag('event',name,{send_to:id,page_location:location.origin+location.pathname,page_referrer:document.referrer?new URL(document.referrer).origin:'',...params});};
 const funnelSteps=new Set();
 const trackStep=name=>{
  if(!enabled||funnelSteps.has(name))return;
  funnelSteps.add(name);
  track(name,{language:es?'es':'en'});
 };
 const campaignFields=()=>{
  const params=new URLSearchParams(location.search);
  const fields={};
  for(const [utm,field] of [['source','source'],['medium','medium'],['campaign','name'],['content','content']]){
   const value=params.get('utm_'+utm);
   if(value&&/^[\w.-]{1,100}$/.test(value))fields['campaign_'+field]=value;
  }
  return fields;
 };
 const enable=()=>{
  if(!canMeasure)return;
  enabled=true;window['ga-disable-'+id]=false;
  if(!loaded){
   loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
   window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   window.gtag('js',new Date());
   window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:7776000,page_location:location.origin+location.pathname,page_referrer:document.referrer?new URL(document.referrer).origin:'',...campaignFields()});
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.append(script);
  }
  window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(!pageTracked){pageTracked=true;track('page_view',{page_title:document.title});}
 };
 function applyPreferences(){
  syncAdvertising();
  if(analyticsAllowed())enable();else if(canMeasure){
   enabled=false;window['ga-disable-'+id]=true;
   for(const cookie of document.cookie.split(';')){const name=cookie.trim().split('=')[0];if(name==='_ga'||name.startsWith('_ga_'))for(const domain of ['',location.hostname,'.lautarogartner.com'])document.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'')+'; SameSite=Lax';}
  }
  if(!panel.hidden)setPanel(true);
 }
 function choose(value,ads){
  saved={choice:value,advertising:ads,adPolicy:2,expires:Date.now()+preferenceLifetime};
  try{localStorage.setItem(key,JSON.stringify(saved));}catch{}
  applyPreferences();setPanel(false);settings.focus();
 }
 window.addEventListener('storage',event=>{
  if(event.key===key || event.key===null){readPreferences();applyPreferences();}
 });
 analytics.addEventListener('change',()=>updateStatus(analytics));
 advertising.addEventListener('change',()=>updateStatus(advertising));
 preferences.querySelector('[data-save-preferences]').addEventListener('click',()=>choose(analytics.checked?'allow':'deny',advertising.checked));
 preferences.querySelector('[data-necessary-only]').addEventListener('click',()=>choose('deny',false));
 settings.addEventListener('click',()=>{
  setPanel(panel.hidden);
  if(!panel.hidden)analytics.focus();
 });
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'){setPanel(false);settings.focus();}});
 document.addEventListener('pointerdown',event=>{if(!panel.hidden&&!preferences.contains(event.target))setPanel(false);});
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(link?.origin===location.origin&&/^(\/es)?\/contact\/?$/.test(link.pathname))trackStep('enquiry_click');
 },true);
 const application=document.querySelector('[data-application]');
 if(application){
  document.querySelector('#example')?.addEventListener('click',event=>{
   const summary=event.target.closest('details[data-constraint] > summary');
   if(summary&&!summary.parentElement.open)trackStep('growth_advice_open');
  },true);
  const transcript=document.querySelector('#transcript');
  transcript?.addEventListener('toggle',()=>{
   if(transcript.open)trackStep('growth_example_open');
  });
  document.querySelector('#example video')?.addEventListener('playing',()=>trackStep('growth_video_play'));
  application.addEventListener('growth:business-step',()=>trackStep('growth_business_step'));
  application.addEventListener('growth:contact-step',()=>trackStep('growth_contact_step'));
  application.addEventListener('input',()=>trackStep('growth_form_start'));
 }
 const form=document.querySelector('[data-contact-form]');
 form?.addEventListener('focusin',event=>{if(event.target.matches('input:not([name="company"]), select, textarea'))trackStep('enquiry_start');});
 form?.addEventListener('invalid',()=>trackStep('enquiry_error'),true);
 window.addEventListener('enquiry:error',()=>trackStep('enquiry_error'));
 window.addEventListener('enquiry:accepted',event=>{if(!enabled)return;const language=event.detail?.language;if(['en','es'].includes(language))track('enquiry_accepted',{language,...(['custom-software','technology-consulting','quote-calculator','website-repair','forms','new-website','other'].includes(event.detail?.service)?{service:event.detail.service}:{})});});
 readPreferences();
 setPanel((canMeasure||Boolean(document.querySelector('[data-application]'))&&publicHost)&&!saved&&!optedOut());
 applyPreferences();
})();
