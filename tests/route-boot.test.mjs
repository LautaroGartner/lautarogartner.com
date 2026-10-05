import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync('public/route-boot.js','utf8');
function boot({path='/',type='navigate',reduced=false,pending=null}={}){
 const classes=new Set();const window={};const timers=[];
 vm.runInNewContext(source,{window,document:{documentElement:{classList:{add(...names){names.forEach(n=>classes.add(n));},remove(...names){names.forEach(n=>classes.delete(n));}}}},location:{pathname:path},performance:{now:()=>100,getEntriesByType:()=>[{type}]},matchMedia:()=>({matches:reduced}),sessionStorage:{getItem:()=>typeof pending==='string'?pending:JSON.stringify(pending)},Date,setTimeout:fn=>timers.push(fn)});
 return {classes,window,timers};
}
test('direct home and explicit home reload show greeting despite a stale/pending record',()=>{
 for(const type of ['navigate','reload']){const h=boot({type,pending:type==='reload'?{path:'/',createdAt:Date.now()}:null});assert(h.classes.has('motion-enter'));}
});
test('internal brand navigation to home uses the shared curtain without a greeting',()=>{const h=boot({pending:{path:'/',createdAt:Date.now()}});assert(h.classes.has('route-enter'));assert(!h.classes.has('motion-enter'));assert.equal(h.window.__portfolioInternalNavigation,true);});
test('history restores and reduced motion never start a curtain',()=>{for(const options of [{type:'back_forward'},{reduced:true}])assert.equal(boot({...options,pending:{path:'/',createdAt:Date.now()}}).classes.size,0);});
test('expired or malformed route storage cannot hide the direct-home greeting',()=>{for(const pending of ['{bad',{path:'/',createdAt:Date.now()-61000}])assert(boot({pending}).classes.has('motion-enter'));});
test('direct non-home arrival never runs the home greeting',()=>assert.equal(boot({path:'/about'}).classes.size,0));
