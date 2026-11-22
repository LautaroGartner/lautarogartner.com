// Only this directory is deployed. The editor and its archive can still render
// historical documents without publishing them or their downloadable files.
import fs from 'node:fs';
import path from 'node:path';
import { createSite } from '../site/presentation.mjs';
import { generateSitemapXml, generateContextJson, generateNotFoundPage } from '../vendor/paideia-framework/build/site-build.js';

const output = 'release';
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const site = createSite(readJson('content/site.json'), [], [readJson('content/pages/about.json')]);
const routes = ['/', '/about', '/privacy', '/thank-you'];
site.pages = routes.map(route => {
  const page = site.pages.find(entry => entry.path === route);
  if (!page) throw new Error('Missing required route ' + route);
  return page;
});
const about = site.pages.find(page => page.path === '/about');
site.headerHtml = about.headerHtml;
site.footerHtml = about.footerHtml;

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
function publish(file) {
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(path.join('dist', file), target, { recursive: true });
}
for (const { path: route } of site.pages) publish(path.join(route.slice(1), 'index.html'));
for (const file of [
  'admin', 'analytics.js', 'application.js', 'phone-number.min.js', 'portfolio.js', 'motion-shell.js',
  'about-portrait.js', 'portrait', 'fonts', 'consulting.css', 'more-clients-social.jpg',
  'favicon.svg', 'favicon.ico', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png',
  'icon-512.png', 'site.webmanifest', 'robots.txt'
]) publish(file);
for (const file of ['more-clients.mp4','more-clients.vtt']) {
  if (fs.existsSync(path.join('dist', file))) publish(file);
}
const visible = site.pages.filter(page => !page.robots?.includes('noindex'));
const files = {
  'sitemap.xml': generateSitemapXml(site),
  'context.json': generateContextJson({...site, pages:visible}),
  'llms.txt': ['# ' + site.title, '', '> ' + site.description, '', ...visible.map(page =>
    `- [${page.title}](${site.url}${page.path}) — ${page.description}`), ''].join('\n'),
  '404.html': generateNotFoundPage(site)
};
for (const [file, body] of Object.entries(files)) fs.writeFileSync(path.join(output, file), body);
