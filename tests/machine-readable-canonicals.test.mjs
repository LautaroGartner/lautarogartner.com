import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSite} from '../site/presentation.mjs';
import {generateContextJson, generateSiteManifestWithCapabilities, generateSitePage, generatePostPage} from '../vendor/paideia-framework/build/site-build.js';

const settings = JSON.parse(fs.readFileSync('content/site.json', 'utf8'));
const posts = fs.readdirSync('content/posts').map(name => JSON.parse(fs.readFileSync(`content/posts/${name}`, 'utf8'))).filter(post => post.status === 'published');
const about = JSON.parse(fs.readFileSync('content/pages/about.json', 'utf8'));
const site = createSite(settings, posts, [about]);
const manifest = JSON.parse(generateSiteManifestWithCapabilities(site, ['static-site']));
const context = JSON.parse(generateContextJson(site));
const htmlCanonical = html => html.match(/<link rel="canonical" href="([^"]+)"/)[1];

for (const [alias, canonicalPath, output] of [['/web', '/', 'web/index.html'], ['/cash-flow', '/', 'cash-flow/index.html'], ['/more-clients', '/', 'more-clients/index.html']]) {
  test(`${alias} alias metadata agrees with the HTML canonical and preserves its route`, () => {
    const page = site.pages.find(page => page.path === alias);
    const expected = `${settings.url}${canonicalPath}`;
    assert.equal(htmlCanonical(generateSitePage(site, page)), expected);
    for (const pages of [manifest.site.pages, context.pages]) {
      const entry = pages.find(entry => entry.path === alias);
      assert.equal(entry.canonical, expected);
      assert.equal(entry.path, alias);
    }
    assert.equal(manifest.site.pages.find(entry => entry.path === alias).output, output);
  });
}

test('ordinary pages retain their own canonical URLs in both metadata documents', () => {
  for (const path of ['/', '/about', '/writing']) {
    const expected = `${settings.url}${path}`;
    assert.equal(manifest.site.pages.find(page => page.path === path).canonical, expected);
    assert.equal(context.pages.find(page => page.path === path).canonical, expected);
  }
});

test('published article canonicals and output routes remain unchanged', () => {
  assert.ok(site.posts.length > 0);
  for (const entries of [manifest.site.posts, context.posts]) assert.ok(entries.every(entry => !entry.slug.startsWith('es/')));
  for (const post of site.posts) {
    const path = `/${post.slug}`;
    const expected = `${settings.url}${path}`;
    assert.equal(htmlCanonical(generatePostPage(site, post)), expected);
    for (const entries of [manifest.site.posts, context.posts]) {
      const entry = entries.find(entry => entry.slug === post.slug);
      assert.equal(entry.path, path);
      assert.equal(entry.canonical, expected);
    }
    assert.equal(manifest.site.posts.find(entry => entry.slug === post.slug).output, `${post.slug}/index.html`);
  }
});

test('built context.json and system.json agree with each generated HTML canonical', () => {
  const builtContext = JSON.parse(fs.readFileSync('dist/context.json', 'utf8'));
  const builtManifest = JSON.parse(fs.readFileSync('dist/system.json', 'utf8'));
  for (const entry of builtManifest.site.pages) {
    const canonical = htmlCanonical(fs.readFileSync(`dist/${entry.output}`, 'utf8'));
    assert.equal(entry.canonical, canonical, `system.json: ${entry.path}`);
    assert.equal(builtContext.pages.find(page => page.path === entry.path).canonical, canonical, `context.json: ${entry.path}`);
  }
  for (const entry of builtManifest.site.posts) {
    const canonical = htmlCanonical(fs.readFileSync(`dist/${entry.output}`, 'utf8'));
    assert.equal(entry.canonical, canonical, `system.json article: ${entry.slug}`);
    assert.equal(builtContext.posts.find(post => post.slug === entry.slug).canonical, canonical, `context.json article: ${entry.slug}`);
  }
});

test('public discovery lists indexable canonical pages only', () => {
  const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
  const guide = fs.readFileSync('dist/llms.txt', 'utf8');
  for (const page of site.pages) {
    const visible = (!page.canonicalPath || page.canonicalPath === page.path)
      && !/\b(noindex|none)\b/i.test(page.robots ?? '');
    const url = settings.url + page.path;
    assert.equal(sitemap.includes(`<loc>${url}</loc>`), visible, page.path);
    assert.equal(guide.includes(`](${url})`), visible, page.path);
  }
});

test('the landing page identifies the assessment and its provider across campaign URLs', () => {
  for (const route of ['/more-clients', '/web', '/cash-flow']) {
    const entities = site.pages.find(page => page.path === route).structuredData['@graph'];
    const service = entities.find(node => node['@type'] === 'Service');
    const provider = entities.find(node => node['@id'] === service.provider['@id']);
    assert.equal(service.url, settings.url + '/');
    assert.equal(service.name, 'Free Business Growth Assessment');
    assert.equal(entities.find(node => node['@type'] === 'WebPage').mainEntity['@id'], service['@id']);
    assert.equal(provider.url, settings.url + '/about');
  }
});
