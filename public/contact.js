(() => {
 const form=document.querySelector('[data-contact-form]');if(!form)return;
 const es=form.dataset.contactLanguage==='es',button=form.querySelector('button[type=submit]'),status=form.querySelector('.contact-status');
 const labels=es?{send:'Enviar consulta ↗',busy:'Enviando…',ready:'',success:'',error:'No se pudo enviar. Reintentá o escribime por email.',rate:'Esperá un minuto antes de volver a intentar, o escribime por email.',token:'El formulario no está disponible ahora. Podés escribirme directamente por email.'}:{send:'Send enquiry ↗',busy:'Sending…',ready:'',success:'',error:'Couldn’t send. Try again or email me directly.',rate:'Please wait a minute before retrying, or email me directly.',token:'The form is unavailable right now. You can email me directly.'};
 let tokenPromise,token='',pending=false,accepted=false,submittedBody,preparedAt=0;
 const message=(text,state)=>{status.textContent=text;status.dataset.state=state;};
 const setLabel=text=>{(button.querySelector('.magnetic-label')||button).textContent=text;};
 const prepare=()=>tokenPromise ||= fetch('/api/enquiry',{headers:{Accept:'application/json'},credentials:'same-origin',signal:AbortSignal.timeout(10000)}).then(async response=>{const data=await response.json();if(!response.ok||!data.token)throw Error('unavailable');token=data.token;preparedAt=Date.now();return token;}).catch(()=>{tokenPromise=null;throw Error('unavailable');});
 // Prepare when the visitor engages, keeping a signed token out of public static HTML.
 form.addEventListener('focusin',()=>{if(!token&&!tokenPromise)prepare().catch(()=>{});});
 button.disabled=false;
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(pending||accepted||!form.reportValidity())return;
  pending=true;button.disabled=true;setLabel(labels.busy);form.setAttribute('aria-busy','true');message('', 'pending');
  let response;
  try{
   if(!token)await prepare();
   if(Date.now()-preparedAt<1100)await new Promise(resolve=>setTimeout(resolve,1100-(Date.now()-preparedAt)));
   // Keep the first request intact on retries: the provider uses its token as an idempotency key.
   if(!submittedBody){const values=new FormData(form);submittedBody={token,email:values.get('email'),project:values.get('project'),website:values.get('website'),company:values.get('company'),language:es?'es':'en'};}
   form.querySelectorAll('input,textarea').forEach(field=>{field.readOnly=true;});
   response=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},credentials:'same-origin',body:JSON.stringify(submittedBody),signal:AbortSignal.timeout(15000)});
   const data=await response.json();
   if(!response.ok||data.accepted!==true||typeof data.reference!=='string')throw Error('rejected');
   accepted=true;message(labels.success,'success');
   form.querySelectorAll('input,textarea').forEach(field=>{field.disabled=true;});
   // Only acceptance counts. No form values or recipient are sent to analytics.
   const key=`enquiry-accepted:${data.reference}`;
   let tracked=false;try{tracked=sessionStorage.getItem(key)==='1';if(!tracked)sessionStorage.setItem(key,'1');}catch{}
   if(!tracked){try{window.dispatchEvent(new CustomEvent('enquiry:accepted',{detail:{language:es?'es':'en'}}));}catch{}}
  }catch{
   message(response?.status===429?labels.rate:response?.status===503?labels.token:labels.error,'error');
   // Token/validation rejection has not sent email; allow corrected details and a fresh token.
   if(response?.status===400){submittedBody=null;token='';tokenPromise=null;form.querySelectorAll('input,textarea').forEach(field=>{field.readOnly=false;});}
  }finally{
   pending=false;form.removeAttribute('aria-busy');button.disabled=accepted;setLabel(accepted?(es?'¡Gracias!':'Thank you!'):labels.send);status.focus();
  }
 });
})();
