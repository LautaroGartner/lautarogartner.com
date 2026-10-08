(() => {
 const id=document.currentScript?.dataset.measurementId;
 // A public measurement ID is supplied at build time. Local previews never collect live data.
 if(!/^G-[A-Z0-9]{6,20}$/.test(id||'') || !['www.lautarogartner.com','lautarogartner.com'].includes(location.hostname))return;
 const key='lg-analytics-choice-v1',es=document.documentElement.lang==='es';
 const labels=es?{title:'¿Permitís analítica opcional?',body:'Google Analytics usa cookies para medir visitas y consultas aceptadas. No enviamos el contenido del formulario. Podés cambiar tu decisión cuando quieras.',allow:'Permitir',deny:'Rechazar',settings:'Preferencias de analítica'}:{title:'Allow optional analytics?',body:'Google Analytics uses cookies to measure page visits and accepted enquiries. We don’t send form contents. You can change your choice at any time.',allow:'Allow',deny:'Decline',settings:'Analytics preferences'};
 let enabled=false,loaded=false,pageTracked=false;
 let choice=null;try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&saved.expires>Date.now())choice=saved.choice;}catch{}
 const panel=document.createElement('section');panel.className='analytics-choice';panel.hidden=true;panel.setAttribute('aria-label',labels.title);
 const title=document.createElement('strong');title.textContent=labels.title;
 const text=document.createElement('p');text.textContent=labels.body;
 const actions=document.createElement('div');const allow=document.createElement('button'),deny=document.createElement('button');allow.type=deny.type='button';allow.textContent=labels.allow;deny.textContent=labels.deny;actions.append(allow,deny);panel.append(title,text,actions);
 const settings=document.createElement('button');settings.type='button';settings.className='analytics-settings';settings.textContent=labels.settings;
 document.body.append(panel);(document.querySelector('.footer-meta')||document.body).append(settings);
 const track=(name,params={})=>{if(enabled&&loaded)window.gtag('event',name,{send_to:id,page_location:location.origin+location.pathname,page_referrer:document.referrer?new URL(document.referrer).origin:'',...params});};
 const enable=()=>{
  enabled=true;window['ga-disable-'+id]=false;
  if(!loaded){
   loaded=true;window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};
   window.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   window.gtag('js',new Date());
   window.gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,cookie_expires:7776000,page_location:location.origin+location.pathname,page_referrer:document.referrer?new URL(document.referrer).origin:''});
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.append(script);
  }
  window.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(!pageTracked){pageTracked=true;track('page_view',{page_title:document.title});}
 };
 const choose=value=>{
  choice=value;panel.hidden=true;try{localStorage.setItem(key,JSON.stringify({choice:value,expires:Date.now()+90*86400000}));}catch{}
  if(value==='allow')enable();else{
   enabled=false;window['ga-disable-'+id]=true;
   // Do not send a denial ping. Subsequent loads never request Google's script.
   for(const cookie of document.cookie.split(';')){const name=cookie.trim().split('=')[0];if(name==='_ga'||name.startsWith('_ga_'))for(const domain of ['',location.hostname,'.lautarogartner.com'])document.cookie=name+'=; Max-Age=0; Path=/'+(domain?'; Domain='+domain:'')+'; SameSite=Lax';}
  }
  settings.focus();
 };
 allow.addEventListener('click',()=>choose('allow'));deny.addEventListener('click',()=>choose('deny'));settings.addEventListener('click',()=>{panel.hidden=false;allow.focus();});
 window.addEventListener('enquiry:accepted',event=>{if(!enabled)return;const language=event.detail?.language;if(['en','es'].includes(language))track('enquiry_accepted',{language});});
 if(choice==='allow')enable();else if(choice!=='deny')panel.hidden=false;
})();
