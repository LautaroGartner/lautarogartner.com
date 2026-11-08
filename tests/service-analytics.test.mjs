import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function fixture(choice) {
  const listeners={}, scripts=[];
  const element=()=>({append(){},addEventListener(){},setAttribute(){},focus(){},dataset:{}});
  const document={currentScript:{dataset:{measurementId:'G-ABC1234567'}},documentElement:{lang:'en'},createElement:element,body:element(),head:{append:node=>scripts.push(node)},querySelector:()=>null,referrer:'https://chatgpt.com/',title:'Contact',cookie:''};
  const window={addEventListener:(name,handler)=>listeners[name]=handler};
  vm.runInNewContext(fs.readFileSync('public/analytics.js','utf8'),{window,document,location:{hostname:'www.lautarogartner.com',origin:'https://www.lautarogartner.com',pathname:'/contact'},URL,localStorage:{getItem:()=>JSON.stringify({choice,expires:Date.now()+60000})}});
  return {window,listeners,scripts};
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
