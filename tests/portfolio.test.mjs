import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSite, escape, mailto} from '../site/presentation.mjs';
import {generateSitePage,generatePostPage} from '../vendor/paideia-framework/build/site-build.js';
const settings=JSON.parse(fs.readFileSync('content/site.json'));
const allPosts=fs.readdirSync('content/posts').map(n=>JSON.parse(fs.readFileSync(`content/posts/${n}`)));
const posts=allPosts.filter(p=>p.status==='published').sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
const about=JSON.parse(fs.readFileSync('content/pages/about.json'));
const site=createSite(settings,posts,[about]);
const htmlFor=path=>generateSitePage(site,site.pages.find(p=>p.path===path));
for (const [path,lang,heading,anchor] of [['/','en','Turn more visitors into sales enquiries.','work'],['/es','es','Convertí más visitas en consultas comerciales.','trabajos'],['/web','en','Turn more visitors into sales enquiries.','work'],['/web/es','es','Convertí más visitas en consultas comerciales.','trabajos']]) {
 test(`${path}: bilingual commercial content, narrow pricing and honest evidence`,()=>{
  const html=htmlFor(path); assert.match(html,new RegExp(`<html lang="${lang}">`));assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.ok(html.includes(heading));assert.ok(html.includes(`id="${anchor}"`));
  for(const id of ['tiki','lucia','filsen']) assert.ok(html.includes(`id="${id}"`));
  assert.match(htmlFor(lang==='es'?'/es/services':'/services'),/USD 100/);
  assert.match(html,lang==='en'?/Own product · Beta/:/Producto propio · Beta/);assert.match(html,new RegExp(`mailto:${lang==='es'?'hola':'contact'}@lautarogartner.com\\?subject=`));assert.ok(html.includes('Crespo'));assert.doesNotMatch(html,/Paraná|lautaro@lautarogartner.com/);
  assert.doesNotMatch(html.replace(/<style>[\s\S]*?<\/style>|<script\b[^>]*>[\s\S]*?<\/script>/g,''),/USD 250|155\.000|30%|26%|19\.31%|trusted by|screenshot here|What I can build|Clear websites|checkout|FounderShape/);
  assert.match(html,/hreflang="en"/);assert.match(html,/hreflang="es"/);assert.match(html,/hreflang="x-default"/);
  assert.match(html,/og:image" content="https:\/\/www.lautarogartner.com\/work\/social.jpg/);
  assert.ok(!html.includes('href="#"'));assert.ok(!html.includes('href=""'));
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 });
}
test('all original posts retain source metadata and output URLs; drafts absent',()=>{
 const originalSlugs=['agent-readable-web','building-paideia','framework-becomes-a-tool','generated-systems-should-explain-themselves','why-ai-agents-need-observable-runtime-receipts'];
 const originals=posts.filter(p=>originalSlugs.includes(p.slug));assert.equal(originals.length,5);const index=htmlFor('/writing');
 for(const p of originals){assert.ok(index.includes(`href="/${p.slug}"`));assert.ok(fs.existsSync(`dist/${p.slug}/index.html`));const h=generatePostPage(site,p);assert.ok(h.includes(escape(p.title)));assert.ok(h.includes(p.publishedAt));assert.ok(h.includes(`https://www.lautarogartner.com/${p.slug}`));}
 for(const p of allPosts.filter(p=>p.status==='draft')) assert.ok(!fs.existsSync(`dist/${p.slug}/index.html`));
 const compiled=fs.readFileSync('src/generated/content.ts','utf8');assert.doesNotMatch(compiled,/"status": "draft"/);
});
test('URLs, redirects, admin and public artifacts preserved',()=>{
 const config=JSON.parse(fs.readFileSync('vercel.json'));assert.ok(config.redirects.some(r=>r.source==='/en'&&r.destination==='/'));assert.ok(config.rewrites.some(r=>r.source==='/admin'));
 for(const file of ['index.html','es/index.html','web/index.html','web/es/index.html','about/index.html','writing/index.html','admin/index.html','robots.txt','sitemap.xml','favicon.svg','context.json','runtime.json','system.json','llms.txt','work/social.jpg']) assert.ok(fs.existsSync(`dist/${file}`),file);
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');assert.doesNotMatch(sitemap,/\/admin|\/api/);
});
test('escaping and localized mailto preserve data without injecting markup',()=>{
 assert.equal(escape('<img src="x">&\''),'&lt;img src=&quot;x&quot;&gt;&amp;&#39;');
 const params=new URL(mailto('es')).searchParams;assert.equal(params.get('subject'),'Mejorar el flujo de consultas');assert.ok(params.get('body').includes('\n\nURL de la página:\n'));assert.doesNotMatch(mailto('en'),/\s/);
 const evil=createSite({...settings,title:'<script>alert(1)</script>',author:'"<bad>'},[{...posts[0],language:'en',title:'<img src=x onerror=alert(1)>',slug:'safe-post'}],[about]);
 const html=generateSitePage(evil,evil.pages.find(p=>p.path==='/writing'));assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));assert.ok(!html.includes('<img src=x onerror'));
});
test('admin previews use the shared presentation and preserve editable markdown',()=>{
 const edited={...about,body:'Preview-only body.\n\n## A heading'};const previewSite=createSite(settings,posts,[edited]);const html=generateSitePage(previewSite,edited);assert.ok(html.includes('Preview-only body.'));assert.ok(html.includes('portfolio-header'));assert.ok(html.includes('<h2>A heading</h2>'));
 const h=generateSitePage({title:'Fallback',description:'Fallback',posts:[],pages:[]},{path:'/plain',title:'Plain',body:'<script>bad</script>'});assert.ok(h.includes('&lt;script&gt;bad&lt;/script&gt;'));assert.ok(!h.includes('portfolio-header'));
});
test('duplicate commercial routes share home canonicals and are omitted from sitemap',()=>{
 assert.match(htmlFor('/web'),/<link rel="canonical" href="https:\/\/www.lautarogartner.com\/">/);
 assert.match(htmlFor('/web/es'),/<link rel="canonical" href="https:\/\/www.lautarogartner.com\/es">/);
 const sitemap=fs.readFileSync('dist/sitemap.xml','utf8');assert.ok(!sitemap.includes('<loc>https://www.lautarogartner.com/web'));
});
test('draft exclusion is enforced by the content compiler with an actual draft fixture',async()=>{
 const os=await import('node:os'),path=await import('node:path'),{spawnSync}=await import('node:child_process');
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'portfolio-draft-test-'));
 try{
  fs.mkdirSync(path.join(temp,'content/posts'),{recursive:true});fs.mkdirSync(path.join(temp,'content/pages'),{recursive:true});
  fs.writeFileSync(path.join(temp,'content/site.json'),JSON.stringify(settings));fs.writeFileSync(path.join(temp,'content/pages/about.json'),JSON.stringify(about));
  fs.writeFileSync(path.join(temp,'content/posts/published.json'),JSON.stringify(posts[0]));fs.writeFileSync(path.join(temp,'content/posts/draft.json'),JSON.stringify({...posts[0],slug:'secret-draft-fixture',status:'draft',title:'Private draft fixture'}));
  const result=spawnSync(process.execPath,[path.resolve('scripts/compile-content.mjs')],{cwd:temp,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
  const compiled=fs.readFileSync(path.join(temp,'src/generated/content.ts'),'utf8');assert.ok(compiled.includes(posts[0].slug));assert.doesNotMatch(compiled,/secret-draft-fixture|Private draft fixture/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('every local asset and anchor in generated commercial pages resolves',()=>{
 for(const page of site.pages.filter(p=>['/','/es','/web','/web/es'].includes(p.path))){
  const html=generateSitePage(site,page);
  for(const m of html.matchAll(/(?:src|href)="(\/[^"?#]*)(?:#([^"]+))?"/g)){
   const pathname=m[1],anchor=m[2];const target= /\.[a-z0-9]+$/i.test(pathname)?`dist${pathname}`:pathname==='/'?'dist/index.html':`dist${pathname}/index.html`;
   assert.ok(fs.existsSync(target),`${page.path}: ${pathname}`);if(anchor) assert.ok(fs.readFileSync(target,'utf8').includes(`id="${anchor}"`));
  }
  for(const m of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${m[1]}"`));
 }
});
test('copy interaction has localized success and rejection fallback without sending messages',async()=>{
 const {runInNewContext}=await import('node:vm');const js=fs.readFileSync('public/portfolio.js','utf8');
 for(const fail of [false,true]){
  let click,copied,selected=false;const status={textContent:''};const address={textContent:'hola@lautarogartner.com'};
  const button={dataset:{email:'hola@lautarogartner.com',success:'Email copiado',failure:'Seleccioná y copiá el email que aparece abajo.'},addEventListener:(_,cb)=>{click=cb;}};
  const selectors={'.copy-email':button,'.copy-status':status,'.email-address':address};
  runInNewContext(js,{document:{querySelector:s=>selectors[s]??null,createRange:()=>({selectNodeContents:n=>{selected=n===address;}})},window:{addEventListener:()=>{},getSelection:()=>({removeAllRanges:()=>{},addRange:()=>{}})},navigator:{clipboard:{writeText:async text=>{if(fail) throw new Error('denied');copied=text;}}}});
  await click();assert.equal(status.textContent,fail?button.dataset.failure:button.dataset.success);assert.equal(selected,fail);if(!fail)assert.equal(copied,'hola@lautarogartner.com');
 }
});
test('language interaction maps equivalent section anchors in either direction',async()=>{
 const {runInNewContext}=await import('node:vm');const js=fs.readFileSync('public/portfolio.js','utf8');
 for(const [lang,hash,result] of [['es','#work','/es#trabajos'],['en','#oferta','/#offer'],['es','#lucia','/es#lucia']]){
  const link={dataset:{language:lang},pathname:lang==='es'?'/es':'/',href:''};runInNewContext(js,{document:{querySelector:s=>s==='[data-language]'?link:null},location:{hash},window:{addEventListener:()=>{}}});assert.equal(link.href,result);
 }
});
