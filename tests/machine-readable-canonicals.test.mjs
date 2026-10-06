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

for (const [alias, canonicalPath, output] of [['/web', '/', 'web/index.html'], ['/web/es', '/es', 'web/es/index.html']]) {
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
  for (const path of ['/', '/es', '/about', '/es/about', '/writing']) {
    const expected = `${settings.url}${path}`;
    assert.equal(manifest.site.pages.find(page => page.path === path).canonical, expected);
    assert.equal(context.pages.find(page => page.path === path).canonical, expected);
  }
});

test('published article canonicals and output routes remain unchanged', () => {
  assert.ok(posts.length > 0);
  for (const post of posts) {
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
