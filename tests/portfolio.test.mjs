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
test('former Spanish pages have permanent English destinations and no public output',()=>{
 const redirects=JSON.parse(fs.readFileSync('vercel.json')).redirects;
 for(const [source,destination] of [['/es','/'],['/web/es','/'],['/es/:path*','/:path*'],['/demo/cotizador','/demo/quote-calculator'],['/es/building-a-car-loan-calculator','/car-loan-calculator-guide']]){
  assert.ok(redirects.some(rule=>rule.source===source && rule.destination===destination && rule.permanent));
 }
 for(const page of [...site.pages,...site.posts]){
  assert.equal(page.language,'en');
  assert.doesNotMatch(page.headerHtml,/data-language=|hreflang="es"/);
 }
 for(const path of ['es','web/es','demo/cotizador']) assert.ok(!fs.existsSync(`dist/${path}/index.html`),path);
 assert.match(htmlFor('/services/contact-form-repair'),/USD 100/);
 assert.match(htmlFor('/work'),/Own product · Beta/);
});
for(const route of ['/','/web','/cash-flow','/more-clients']){
 test(route+' shows the consulting offer, worked example and application',()=>{
  const page=site.pages.find(p=>p.path===route);
  const html=htmlFor(route);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
  assert.doesNotMatch(page.html, /Hormozi|\$100M (?:Leads|Offers|Money Models)/i);
  assert.doesNotMatch(page.headerHtml, /href="\/writing"/);
  assert.doesNotMatch(page.html, /href="#example"/);
  assert.equal((page.html.match(/href="#discuss"/g)||[]).length,1);
  assert.match(page.html,/free (?:written )?audit/i);
  assert.doesNotMatch(page.html,/cash-tool|need \$7,000 to start|worksheet/i);
  assert.doesNotMatch(page.footerHtml,/Crespo|Local time|LinkedIn|GitHub|>Writing</);
  assert.equal((page.html.match(/<fieldset/g)||[]).length,3);
  assert.ok(html.includes('href="#discuss"'));
  assert.doesNotMatch(page.headerHtml, /growth-banner/);
  assert.ok(page.html.includes('href="#discuss" aria-label="Get my free growth assessment"'));
  assert.match(page.html, /<form id="discuss" tabindex="-1" data-application/);
  assert.match(page.html, /data-submit-label="Get my free growth assessment"/);
  assert.equal(page.html.includes('name="planCall"'),false);
  assert.doesNotMatch(page.html,/name="kitLogo"|name="businessName"/);
  {
    const steps = [...page.html.matchAll(/<fieldset[^>]*>([\s\S]*?)<\/fieldset>/g)];
    assert.doesNotMatch(steps[0][1]+steps[1][1], /<input|<textarea/);
    assert.match(steps[1][1], /Co-owner \/ partner/);
    assert.equal(steps[1][1].match(/<select id="app-revenue"[^>]*>(.*?)<\/select>/)[1].match(/<option/g).length,9);
  }
  assert.equal((html.match(/id="ownership-\d+" role="option"/g)||[]).length,0);
  assert.equal(page.structuredData['@graph'][0].jobTitle,'Business Consultant');
  assert.ok(fs.existsSync('dist'+page.imagePath));
  assert.ok(html.indexOf('id="example"')<html.indexOf('id="discuss"'));
  assert.doesNotMatch(page.html,/commission|outsourced closer|giveaway.lautarogartner.com/i);
  if(route === '/') {
    assert.match(page.headerHtml, /data-menu-open/);
    assert.match(page.headerHtml, /id="site-menu"/);
    assert.doesNotMatch(page.headerHtml, /href="\/(work|services|about|contact|writing)"/);
    for (const id of ['example', 'questions', 'discuss']) assert.ok(page.headerHtml.includes('href="#' + id + '"'));
    for (const link of ['mailto:contact@lautarogartner.com','instagram.com/lautarogartner_', 'x.com/lautarogartner_']) assert.ok(page.footerHtml.includes(link));
  } else {
    assert.doesNotMatch(page.headerHtml + page.footerHtml, /<nav\b|data-menu-open|instagram/i);
  }
  if(page.canonicalPath==='/'){
    assert.match(page.html.replace(/<\/?span\b[^>]*>/g, ''), /<h1>Build a \$5M business that funds its own growth\.<\/h1>/);
    assert.match(page.html, /<\/h1>\s*<div class="audit-walkthrough" id="example">/);
    assert.match(page.html, /id="example"><h2>Follow the <span class="copy-accent">money/);
    for (const key of ['offer', 'funnel', 'sales']) {
      assert.ok(page.html.includes(`<details data-constraint="${key}">`));
      assert.ok(page.html.includes(`<option value="${key}">`));
    }
    assert.match(page.html, /<summary>What do I get after we talk\?<\/summary>/);
  }
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
 for(const file of ['index.html','web/index.html','about/index.html','writing/index.html','admin/index.html','robots.txt','sitemap.xml','favicon.svg','context.json','runtime.json','system.json','llms.txt','work/social.jpg']) assert.ok(fs.existsSync(`dist/${file}`),file);
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
 assert.equal(htmlFor('/cash-flow').match(/<link rel="canonical"[^>]+>/)[0], htmlFor('/').match(/<link rel="canonical"[^>]+>/)[0]);
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
 for(const page of site.pages.filter(p=>['/','/more-clients','/web','/cash-flow'].includes(p.path))){
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
