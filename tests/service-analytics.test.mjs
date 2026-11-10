import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function fixture(choice, search='') {
  const listeners={}, documentListeners={}, formListeners={}, scripts=[];
  const element=()=>({append(){},addEventListener(){},setAttribute(){},focus(){},querySelector:element,nextElementSibling:{},dataset:{}});
  const form={addEventListener:(name,handler)=>formListeners[name]=handler};
  const document={currentScript:{dataset:{measurementId:'G-ABC1234567'}},documentElement:{lang:'en'},createElement:element,body:element(),head:{append:node=>scripts.push(node)},querySelector:selector=>selector==='[data-contact-form]'?form:null,addEventListener:(name,handler)=>documentListeners[name]=handler,referrer:'https://chatgpt.com/',title:'Contact',cookie:''};
  const window={addEventListener:(name,handler)=>listeners[name]=handler};
  vm.runInNewContext(fs.readFileSync('public/analytics.js','utf8'),{window,document,location:{hostname:'www.lautarogartner.com',origin:'https://www.lautarogartner.com',pathname:'/contact',search},URL,URLSearchParams,localStorage:{getItem:()=>JSON.stringify({choice,expires:Date.now()+60000})}});
  return {window,listeners,documentListeners,formListeners,scripts};
}
test('accepted enquiry analytics respects consent and sends only language and an allowlisted service',()=>{
  const allowed=fixture('allow');
  allowed.listeners['enquiry:accepted']({detail:{language:'en',service:'quote-calculator',email:'private@example.invalid',project:'Private message'}});
  const events=allowed.window.dataLayer.filter(args=>args[0]==='event'&&args[1]==='enquiry_accepted');
  assert.equal(events.length,1);
  assert.deepEqual(JSON.parse(JSON.stringify(events[0][2])),{send_to:'G-ABC1234567',page_location:'https://www.lautarogartner.com/contact',page_referrer:'https://chatgpt.com',language:'en',service:'quote-calculator'});
  allowed.listeners['enquiry:accepted']({detail:{language:'en',service:'private@example.invalid'}});
  const last=allowed.window.dataLayer.at(-1);
  assert.equal(last[2].service,undefined);
  const denied=fixture('deny');denied.listeners['enquiry:accepted']({detail:{language:'en',service:'quote-calculator'}});
  assert.equal(denied.scripts.length,0);assert.equal(denied.window.dataLayer,undefined);
});

test('enquiry funnel records only consented steps and approved campaign fields',()=>{
  const allowed=fixture('allow','?utm_source=newsletter&utm_campaign=portfolio-launch&utm_content=private%40example.invalid&email=private%40example.invalid');
  const denied=fixture('deny');
  for(const fixture of [allowed,denied]){
    const target={closest:()=>({origin:'https://www.lautarogartner.com',pathname:'/es/contact/'}),matches:()=>true,value:'Private message'};
    fixture.documentListeners.click({target});
    fixture.documentListeners.click({target});
    fixture.formListeners.focusin({target});
    fixture.formListeners.invalid();
    fixture.listeners['enquiry:error']();
  }
  const config=allowed.window.dataLayer.find(args=>args[0]==='config')[2];
  assert.equal(config.campaign_source,'newsletter');
  assert.equal(config.campaign_name,'portfolio-launch');
  assert.equal(config.campaign_content,undefined);
  const steps=Array.from(allowed.window.dataLayer).filter(args=>args[0]==='event').map(args=>args[1]);
  assert.deepEqual(steps,['page_view','enquiry_click','enquiry_start','enquiry_error']);
  assert.doesNotMatch(JSON.stringify(allowed.window.dataLayer),/private|example\.invalid/i);
  assert.equal(denied.window.dataLayer,undefined);
});
