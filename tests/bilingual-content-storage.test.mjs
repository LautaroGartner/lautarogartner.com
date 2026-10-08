import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {contentPath} from '../server/content.mjs';
test('localized articles use distinct flat storage paths and reject path traversal',()=>{
 assert.equal(contentPath({kind:'post',slug:'es/example'}),'content/posts/example.es.json');
 assert.equal(contentPath({kind:'post',slug:'example-es'}),'content/posts/example-es.json');
 for(const slug of ['../example','es/../example','es/es/example','/example','example.json','es/']) assert.throws(()=>contentPath({kind:'post',slug}));
 assert.throws(()=>contentPath({kind:'page',slug:'es/example'}));
});
test('saving a Spanish article updates its compiler-readable file without overwriting English',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'bilingual-storage-'));
 const modulePath=path.resolve('server/content.mjs');
 try{
  fs.mkdirSync(path.join(temp,'content/posts'),{recursive:true});
  fs.writeFileSync(path.join(temp,'content/posts/example.json'),'English original');
  const env={...process.env};delete env.GITHUB_TOKEN;
  execFileSync(process.execPath,['--input-type=module','-e',`import {writeContent} from ${JSON.stringify(modulePath)}; await writeContent({kind:'post',slug:'es/example',language:'es',title:'Actualizado',body:'Texto completo',sha:'old'});`],{cwd:temp,env});
  assert.equal(fs.readFileSync(path.join(temp,'content/posts/example.json'),'utf8'),'English original');
  const saved=JSON.parse(fs.readFileSync(path.join(temp,'content/posts/example.es.json'),'utf8'));
  assert.equal(saved.slug,'es/example');assert.equal(saved.language,'es');assert.equal(saved.title,'Actualizado');assert.equal(saved.sha,undefined);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
