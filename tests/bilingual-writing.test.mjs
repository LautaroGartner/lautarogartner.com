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
test('six article pairs have reciprocal alternatives, own canonicals and matching language navigation',()=>{
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');
 assert.equal(sources.length,12);
 for(const post of sources){
  const language=post.language??'en',slug=post.slug.replace(/^es\//,''),html=read(post);
  assert.ok(html.includes(`<html lang="${language}">`));
  assert.ok(html.includes(`<link rel="canonical" href="https://www.lautarogartner.com/${post.slug}">`));
  for(const [lang,path] of [['en','/'+slug],['es','/es/'+slug],['x-default','/'+slug]]){
   assert.ok(html.includes(`hreflang="${lang}" href="https://www.lautarogartner.com${path}"`),`${post.slug}: ${lang}`);
  }
  assert.ok(html.includes(`data-language="${language==='es'?'en':'es'}" href="${language==='es'?'/':'/es/'}${slug}"`));
  assert.ok(html.includes(`href="${language==='es'?'/es':''}/writing"`));
  assert.ok(sitemap.includes(`<loc>https://www.lautarogartner.com/${post.slug}</loc>`));
  assert.ok(fs.existsSync(`dist/social/${post.slug}.png`));
 }
});
test('each writing index lists six matching-language articles and no untranslated duplicates',()=>{
 for(const lang of ['en','es']){
  const html=fs.readFileSync(`dist/${lang==='es'?'es/':''}writing/index.html`,'utf8');
  assert.equal((html.match(/<article>/g)||[]).length,6);
  for(const p of sources){const same=(p.language??'en')===lang;assert.equal(html.includes(`href="/${p.slug}"`),same,p.slug);}
 }
});
