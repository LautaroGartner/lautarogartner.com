import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

test('production publishes the construction sign, supporting pages and the admin shell', () => {
  const {outputDirectory} = JSON.parse(fs.readFileSync('vercel.json'));
  const files = fs.readdirSync(outputDirectory, {recursive:true});
  const pages = files.filter(file => file.endsWith('.html')).sort();
  assert.deepEqual(pages, ['404.html','admin/index.html','index.html','privacy/index.html','thank-you/index.html']);
  for (const file of files) assert.doesNotMatch(file, /^(work|services|articles|social|downloads|writing|demo)(\/|$)/);
  const read = file => fs.readFileSync(path.join(outputDirectory,file), 'utf8');
  for (const page of pages.filter(page => !page.startsWith('admin/'))) {
    assert.doesNotMatch(read(page), /(?:href|src)="\/(?:work|writing|services|demo|contact|es)(?:\/|")/);
  }
  assert.deepEqual([...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname), ['/']);
  assert.deepEqual(JSON.parse(read('context.json')).pages.map(page=>page.path), ['/']);
  assert.doesNotMatch(read('llms.txt'), /\/work\/|\/writing|\/services|\/thank-you/);
  assert.match(read('index.html'), /Under construction/);
  assert.match(read('index.html'), /We’re building<br>something great/);
  assert.doesNotMatch(read('index.html'), /data-application|Free Business Growth Assessment/);
  assert.ok(files.includes('construction.css'));
  for (const route of ['privacy','thank-you']) assert.match(read(route+'/index.html'), /name="robots" content="noindex,follow"/);
});
