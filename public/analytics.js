(() => {
 const id=document.currentScript?.dataset.measurementId;
 // Preferences are reviewable in preview, while measurement requires the public hostname and ID.
 const canMeasure=/^G-[A-Z0-9]{6,20}$/.test(id||'')&&['www.lautarogartner.com','lautarogartner.com'].includes(location.hostname);
 const key=canMeasure?'lg-analytics-choice-v1':'lg-analytics-preview-choice-v1',es=document.documentElement.lang==='es';
 const labels=es?{
  settings:'Privacidad y preferencias', intro:'Vos decidís qué permisos dar. Guardamos tus preferencias únicamente en este navegador.',
  necessary:'Necesarias', analytics:'Analítica', advertising:'Publicidad',
  note:'La analítica se activa solo si guardás esa opción. No cargamos herramientas de publicidad. Las necesarias recuerdan tus ajustes.',
  preview:'La medición está desactivada en esta vista.', details:'Datos del formulario',
  form:'Uso los datos del formulario para evaluar tu consulta y contactarte por tu proyecto. Las preferencias de cookies son independientes del envío de la consulta.',
  deny:'Solo necesarias', save:'Guardar',
 }:{
  settings:'Privacy and preferences', intro:'You choose which permissions to give. Your preferences are saved only in this browser.',
  necessary:'Necessary', analytics:'Analytics', advertising:'Advertising',
  note:'Analytics starts only when you save that choice. No advertising tools are loaded. Necessary storage remembers your settings.',
  preview:'Measurement is off in this view.', details:'Form data',
  form:'I use the information you submit to review your enquiry and get in touch about your project. Cookie preferences are separate from submitting the form.',
  deny:'Necessary only', save:'Save',
 };
 let enabled=false,loaded=false,pageTracked=false;
 let choice=null, advertisingChoice=true;
 try {
  const saved=JSON.parse(localStorage.getItem(key));
  if(saved&&saved.expires>Date.now()){
   choice=saved.choice;
   advertisingChoice=saved.advertising??(choice!=='deny');
  }
 }catch{}
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
 document.body.append(preferences);
 const panel=preferences.querySelector('.data-settings-panel');
 const settings=preferences.querySelector('.data-settings-toggle');
 const analytics=preferences.querySelector('[name="analytics"]');
 const advertising=preferences.querySelector('[name="advertising"]');
 const updateStatus=input=>{input.nextElementSibling.textContent=input.checked?'On':'Off';};
 const setPanel=open=>{
  if(open){
   analytics.checked=choice!=='deny';
   advertising.checked=advertisingChoice;
   updateStatus(analytics);
   updateStatus(advertising);
  }
  panel.hidden=!open;
  settings.setAttribute('aria-expanded',String(open));
 };
 const track=(name,params={})=>{if(enabled&&loaded)window.gtag('event',name,{send_to:id,page_location:location.origin+location.pathname,page_referrer:document.referrer?new URL(document.referrer).origin:'',...params});};
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
 const choose=(value,ads)=>{
  choice=value;advertisingChoice=ads;setPanel(false);try{localStorage.setItem(key,JSON.stringify({choice:value,advertising:ads,expires:Date.now()+90*86400000}));}catch{}
  if(value==='allow')enable();else if(canMeasure){
   enabled=false;window['ga-disable-'+id]=true;
   // Do not send a denial ping. Subsequent loads never request Google's script.
   for(const cookie of document.cookie.split(';')){const name=cookie.trim().split('=')[0];if(name==='_ga'||name.startsWith('_ga_'))for(const domain of ['',location.hostname,'.lautarogartner.com'])document.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'')+'; SameSite=Lax';}
  }
  settings.focus();
 };
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
 const form=document.querySelector('[data-contact-form]');
 form?.addEventListener('focusin',event=>{if(event.target.matches('input:not([name="company"]), select, textarea'))trackStep('enquiry_start');});
 form?.addEventListener('invalid',()=>trackStep('enquiry_error'),true);
 window.addEventListener('enquiry:error',()=>trackStep('enquiry_error'));
 window.addEventListener('enquiry:accepted',event=>{if(!enabled)return;const language=event.detail?.language;if(['en','es'].includes(language))track('enquiry_accepted',{language,...(['custom-software','technology-consulting','quote-calculator','website-repair','forms','new-website','other'].includes(event.detail?.service)?{service:event.detail.service}:{})});});
 setPanel(canMeasure&&choice!=='allow'&&choice!=='deny');
 if(choice==='allow')enable();
})();
