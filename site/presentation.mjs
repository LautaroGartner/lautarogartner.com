import fs from 'node:fs';
import {composeRoutes} from './routes.mjs';

// site/presentation.mjs
const copy=JSON.parse(fs.readFileSync(new URL('../content/portfolio/copy.json',import.meta.url),'utf8'));
const styles=fs.readFileSync(new URL('./motion.css',import.meta.url),'utf8');
var escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function mailto(lang) {
  const c = copy[lang].contact;
  return `mailto:${c.email}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(c.mailBody)}`;
}
function picture(project, eager = false, sizes = "(max-width: 740px) calc(100vw - 40px), 26vw") {
  const widths = [720, 1440, 2160, 3840];
  return `<picture><source type="image/webp" srcset="${widths.map((w) => `/work/${project.id}-${w}.webp ${w}w`).join(", ")}" sizes="${sizes}"><img src="/work/${project.id}-1440.jpg" alt="${escape(project.alt)}" width="1440" height="900" loading="${eager ? "eager" : "lazy"}" ${eager ? 'fetchpriority="high"' : ""} decoding="async"></picture>`;
}
function createSite(settings, posts, pages) {
  const englishPosts = posts.filter(post => (post.language ?? 'en') === 'en' && !post.slug.startsWith('es/'));
  return composeRoutes({ ...settings, language: 'en', styles, posts: englishPosts, pages }, copy, { escape, mailto, picture });
}

export {createSite,escape,mailto};
