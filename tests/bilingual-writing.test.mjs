import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const root='dist';
const sources=fs.readdirSync('content/posts').map(n=>JSON.parse(fs.readFileSync(`content/posts/${n}`))).filter(p=>p.status==='published');
const read=p=>fs.readFileSync(`${root}/${p.slug}/index.html`,'utf8');
const originals=['agent-readable-web','building-paideia','framework-becomes-a-tool','generated-systems-should-explain-themselves','why-ai-agents-need-observable-runtime-receipts'];
test('existing English text, metadata, dates and URLs are preserved',()=>{
 for(const slug of originals){
  const before=JSON.parse(execFileSync('git',['show',`389456a:content/posts/${slug}.json`],{encoding:'utf8'}));
  const after=sources.find(p=>p.slug===slug);
  assert.deepEqual(after,before,slug);
 }
});
test('public articles have English canonicals and the writing index lists each once',()=>{
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
 const index=fs.readFileSync('dist/writing/index.html','utf8');
 const english=sources.filter(post=>(post.language??'en')==='en');
 assert.equal((index.match(/<article\b/g)||[]).length,english.length);
 assert.doesNotMatch(sitemap,/www\.lautarogartner\.com\/es(?:[</])/);
 for(const post of sources){
  if(!english.includes(post)){
   assert.ok(!fs.existsSync(`dist/${post.slug}/index.html`));
   assert.ok(!index.includes(`href="/${post.slug}"`));
   continue;
  }
  const html=read(post),url='https://www.lautarogartner.com/'+post.slug;
  assert.ok(html.includes('<html lang="en">'));
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`));
  assert.doesNotMatch(html,/hreflang="es"|data-language=/);
  assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  assert.ok(index.includes(`href="/${post.slug}"`));
  assert.ok(fs.existsSync(`dist/social/${post.slug}.png`));
 }
});
