// scripts/refresh-preview.mjs
import fs3 from "node:fs";

// site/project-media.mjs
var projectMedia = {
  tiki: [{ id: "tiki-services", en: "Service selection", es: "Servicios" }, { id: "tiki-quote", en: "Quote flow", es: "Presupuesto" }],
  lucia: [{ id: "lucia-services", en: "Services", es: "Servicios" }, { id: "lucia-work", en: "Visual concepts", es: "Conceptos visuales" }, { id: "lucia-about", en: "About Luc\xEDa", es: "Sobre Luc\xEDa" }],
  filsen: [{ id: "filsen-browse", en: "Product discovery", es: "Descubrimiento de productos" }, { id: "filsen-catalog", en: "Product catalogue", es: "Cat\xE1logo de productos" }, { id: "filsen-store", en: "Merchant storefront", es: "Vidriera de un comercio" }, { id: "filsen-product", en: "Product details", es: "Detalle de producto" }]
};

// site/presentation.mjs
import fs2 from "node:fs";

// site/routes.mjs
import fs from "node:fs";
import { createHash } from "node:crypto";

// vendor/paideia-framework/build/config.js
var mode = process.env.NODE_ENV === "production" ? "production" : "development";

// vendor/paideia-framework/build/utils.js
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

// vendor/paideia-framework/build/version.js
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
var PACKAGE_ROOT = process.env.PAIDEIA_PACKAGE_ROOT ?? path.dirname(path.dirname(fileURLToPath(import.meta.url)));
function readPackageVersion() {
  try {
    const packageJson = JSON.parse("{\n  \"name\": \"paideia-framework\",\n  \"version\": \"1.8.1\",\n  \"type\": \"module\",\n  \"bin\": {\n    \"paideia\": \"./cli.mjs\",\n    \"agentify\": \"./scripts/agentify.mjs\"\n  },\n  \"files\": [\n    \"assets/\",\n    \"build/\",\n    \"cli.mjs\",\n    \"examples/\",\n    \"packages/\",\n    \"runtime/\",\n    \"scripts/\",\n    \"src/\",\n    \"tests/\",\n    \"tsconfig.json\"\n  ],\n  \"scripts\": {\n    \"prepack\": \"npm run build\",\n    \"dev\": \"node cli.mjs dev\",\n    \"build\": \"node cli.mjs build\",\n    \"social:screenshots\": \"node scripts/social-screenshots.mjs\",\n    \"start\": \"node cli.mjs start\",\n    \"doctor\": \"node cli.mjs doctor\",\n    \"paideia\": \"node cli.mjs\",\n    \"test:runtime\": \"node tests/runtime-identity.test.mjs\",\n    \"test:version\": \"node tests/version-consistency.test.mjs\",\n    \"test:manifest-diagnostics\": \"node tests/manifest-diagnostics.test.mjs\",\n    \"test:manifest\": \"node tests/manifest-contract.test.mjs\",\n    \"test:docs-example\": \"node tests/docs-example.test.mjs\",\n    \"test:agentify\": \"node tests/agentify.test.mjs\",\n    \"test:agentify-fixtures\": \"node tests/agentify-fixtures.test.mjs\",\n    \"test:agentify-corpus\": \"node tests/agentify-corpus.test.mjs\",\n    \"test:agentify-package\": \"node tests/agentify-package.test.mjs\",\n    \"test:agentify-install\": \"node tests/agentify-install.test.mjs\",\n    \"test:init\": \"node tests/init-project.test.mjs\",\n    \"test:new-post\": \"node tests/new-post-cli.test.mjs\",\n    \"test:site\": \"node tests/site-runtime.test.mjs\",\n    \"test:writing\": \"node tests/writing-validation.test.mjs\",\n    \"test:install-smoke\": \"node tests/install-smoke.mjs\"\n  },\n  \"devDependencies\": {\n    \"@types/node\": \"^25.7.0\",\n    \"typescript\": \"^5.9.3\"\n  },\n  \"dependencies\": {\n    \"@vercel/analytics\": \"^2.0.1\",\n    \"@vercel/speed-insights\": \"^2.0.0\"\n  }\n}\n");
    return typeof packageJson.version === "string" ? packageJson.version : null;
  } catch {
    return null;
  }
}
var FRAMEWORK_VERSION = readPackageVersion() ?? "1.8.1";

// vendor/paideia-framework/build/site-build.js
var AUTHOR_NAME = "Lautaro G\xE4rtner";
var AUTHOR_USERNAME = "@lautyxgr";
var X_PROFILE_URL = "https://x.com/lautyxgr";
var SOURCE_URL = "https://github.com/LautaroGartner/paideia-framework";
var SOCIAL_IMAGE_WIDTH = 1200;
var SOCIAL_IMAGE_HEIGHT = 630;
function normalizePath(pagePath) {
  if (pagePath === "/") {
    return "/";
  }
  return `/${pagePath.replace(/^\/+|\/+$/g, "")}`;
}
function sortPosts(posts) {
  return [...posts].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}
function siteLanguage(site2) {
  return site2.language ?? "en";
}
function canonicalUrl(site2, pagePath) {
  if (!site2.url) {
    return null;
  }
  const base = site2.url.replace(/\/+$/g, "");
  const normalized = normalizePath(pagePath);
  if (normalized === "/") {
    return `${base}/`;
  }
  return `${base}${normalized}`;
}
function siteAssetUrl(site2, assetPath) {
  if (!site2.url) {
    return null;
  }
  const base = site2.url.replace(/\/+$/g, "");
  const normalized = `/${assetPath.replace(/^\/+/g, "")}`;
  return `${base}${normalized}`;
}
function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
function renderHead(options) {
  const canonical = options.canonical === false ? null : canonicalUrl(options.site, options.canonicalPath ?? options.path);
  const author = options.site.author ? `
    <meta name="author" content="${escapeHtml(options.site.author)}">` : "";
  const canonicalLink = canonical ? `
    <link rel="canonical" href="${escapeHtml(canonical)}">` : "";
  const socialUrl = canonical ? `
    <meta property="og:url" content="${escapeHtml(canonical)}">` : "";
  const imageUrl = options.imagePath ? siteAssetUrl(options.site, options.imagePath) : null;
  const socialImage = imageUrl ? `
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:width" content="${SOCIAL_IMAGE_WIDTH}">
    <meta property="og:image:height" content="${SOCIAL_IMAGE_HEIGHT}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">` : "";
  const articleMeta = options.type === "article" ? `${options.publishedAt ? `
    <meta property="article:published_time" content="${escapeHtml(options.publishedAt)}">` : ""}${(options.topics ?? []).map((topic) => `
    <meta property="article:tag" content="${escapeHtml(topic)}">`).join("")}` : "";
  const structuredData = options.structuredData ? `
    <script type="application/ld+json">${jsonLd(options.structuredData)}</script>` : "";
  return `<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(options.title)}</title>
    <meta name="description" content="${escapeHtml(options.description)}">
    <meta name="robots" content="${escapeHtml(options.robots ?? "index,follow")}">
    <meta property="og:site_name" content="${escapeHtml(options.site.title)}">
    <meta property="og:type" content="${options.type === "article" ? "article" : "website"}">
    <meta property="og:title" content="${escapeHtml(options.title)}">
    <meta property="og:description" content="${escapeHtml(options.description)}">${socialUrl}${socialImage}${articleMeta}
    <meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}">
    <meta name="twitter:title" content="${escapeHtml(options.title)}">
    <meta name="twitter:description" content="${escapeHtml(options.description)}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">${author}${canonicalLink}${(options.alternates ?? []).map((a) => `
    <link rel="alternate" hreflang="${escapeHtml(a.language)}" href="${escapeHtml(canonicalUrl(options.site, a.path) ?? a.path)}">`).join("")}${structuredData}
    <script defer data-website-id="dfid_TicEthGphV3CzxqMiE8Oq" data-domain="www.lautarogartner.com" src="https://datafa.st/js/script.js"></script>
    <script>
      (() => {
        function formatRelativeDate(publishedAt, now = new Date()) {
          const published = new Date(publishedAt + "T00:00:00Z");

          if (Number.isNaN(published.getTime())) {
            return "";
          }

          const today = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate()
          ));
          const diffDays = Math.floor(
            (today.getTime() - published.getTime()) / 86400000
          );

          if (diffDays <= 0) return "today";
          if (diffDays === 1) return "1d ago";
          if (diffDays < 30) return diffDays + "d ago";

          const diffMonths = Math.floor(diffDays / 30);

          if (diffMonths === 1) return "1 month ago";
          if (diffMonths < 12) return diffMonths + " months ago";

          const diffYears = Math.floor(diffMonths / 12);

          if (diffYears === 1) return "1 year ago";
          return diffYears + " years ago";
        }

        function updateRelativeDates() {
          for (const label of document.querySelectorAll("[data-relative-date-label]")) {
            const relativeDate = label.querySelector("[data-relative-date]");
            const value = formatRelativeDate(label.dataset.publishedAt);

            if (!relativeDate || !value) {
              continue;
            }

            relativeDate.textContent = value;
            label.hidden = false;
          }
        }

        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", updateRelativeDates, { once: true });
        } else {
          updateRelativeDates();
        }

        const localHosts = new Set(["", "localhost", "127.0.0.1", "::1"]);

        if (localHosts.has(window.location.hostname)) {
          return;
        }

        for (const src of [
          "/_vercel/insights/script.js",
          "/_vercel/speed-insights/script.js",
        ]) {
          const script = document.createElement("script");
          script.defer = true;
          script.src = src;
          document.head.append(script);
        }
      })();
    </script>`;
}
function pageOutputPath(page) {
  const normalized = normalizePath(page.path);
  if (normalized === "/") {
    return "index.html";
  }
  return `${normalized.slice(1)}/index.html`;
}
function postPath(post) {
  return `/${post.slug}`;
}
function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(/* @__PURE__ */ new Date(`${value}T00:00:00Z`));
}
function renderPostTopics(post) {
  if (!post.topics || post.topics.length === 0) {
    return "";
  }
  return `<p class="post-topics">${post.topics.map((topic) => escapeHtml(topic)).join(" / ")}</p>`;
}
function authorSocialLabel(site2) {
  if (!site2.authorUrl) {
    return site2.author ?? AUTHOR_USERNAME;
  }
  try {
    const url = new URL(site2.authorUrl);
    const handle = url.pathname.split("/").filter(Boolean).at(-1);
    if (handle && ["x.com", "twitter.com", "www.x.com", "www.twitter.com"].includes(url.hostname)) {
      return `@${handle}`;
    }
  } catch {
  }
  return site2.author ?? AUTHOR_USERNAME;
}
function renderHeader(site2, currentPath) {
  const label = site2.author ?? AUTHOR_NAME;
  const normalizedPath = normalizePath(currentPath);
  const brand = normalizedPath === "/" ? `<span class="brand">${escapeHtml(label)}</span>` : `<a class="brand" href="/">${escapeHtml(label)}</a>`;
  const pageLinks = site2.pages.filter((page) => page.nav !== false).map((page) => {
    const pagePath = normalizePath(page.path);
    if (pagePath === normalizedPath || normalizedPath === "/web/es" && pagePath === "/web") {
      return "";
    }
    return `
          <a href="${escapeHtml(pagePath)}">${escapeHtml(page.navLabel ?? page.title)}</a>`;
  }).join("");
  const authorLink = site2.authorUrl ? `
          <a href="${escapeHtml(site2.authorUrl)}" rel="me">${escapeHtml(site2.followLabel ?? "Follow")}</a>` : "";
  const languageLink = normalizedPath === "/web" ? `
          <a href="/web/es" lang="es">Ver en espa\xF1ol</a>` : normalizedPath === "/web/es" ? `
          <a href="/web" lang="en">Read in English</a>` : "";
  return `<header>
        ${brand}
        <nav aria-label="Site">
          ${pageLinks}${languageLink}${authorLink}
        </nav>
      </header>`;
}
function renderFooter(site2, options = {}) {
  const generatedBy = options.generatedBy === false ? "" : `
        <span class="generated-by">
          Generated by Paideia Framework v${escapeHtml(FRAMEWORK_VERSION)}.
        </span>`;
  const author = site2.author ?? AUTHOR_NAME;
  const authorText = site2.authorUrl ? `${escapeHtml(author)} <a href="${escapeHtml(site2.authorUrl)}" rel="me">${escapeHtml(authorSocialLabel(site2))}</a>` : escapeHtml(author);
  return `<footer>
        <span>
          ${authorText}
        </span>
        ${generatedBy}
        <a href="${escapeHtml(site2.sourceUrl ?? SOURCE_URL)}">Source</a>
      </footer>`;
}
function renderAgentFileLinks() {
  return `<p class="agent-files">
          <a href="/system.json">system.json</a>
          <a href="/runtime.json">runtime.json</a>
          <a href="/context.json">context.json</a>
          <a href="/llms.txt">llms.txt</a>
        </p>`;
}
function renderInline(value) {
  const pattern = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let rendered = "";
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    rendered += escapeHtml(value.slice(cursor, index));
    if (match[2]) {
      rendered += `<strong>${escapeHtml(match[2])}</strong>`;
    } else {
      const href = match[4];
      const safeHref = /^(?:https?:\/\/|mailto:|\/)/.test(href) ? href : "#";
      rendered += `<a href="${escapeHtml(safeHref)}">${escapeHtml(match[3])}</a>`;
    }
    cursor = index + match[0].length;
  }
  return rendered + escapeHtml(value.slice(cursor));
}
function renderBody(value) {
  const blocks = value.trim().split(/\n{2,}/);
  const rendered = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index].trim();
    if (!block) {
      continue;
    }
    if (block.startsWith("```")) {
      const code = block.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/, "");
      rendered.push(`<pre><code>${escapeHtml(code)}</code></pre>`);
      continue;
    }
    if (block.startsWith("## ")) {
      rendered.push(`<h2>${renderInline(block.slice(3).trim())}</h2>`);
      continue;
    }
    if (block.startsWith("### ")) {
      rendered.push(`<h3>${renderInline(block.slice(4).trim())}</h3>`);
      continue;
    }
    if (block.split("\n").every((line) => line.trim().startsWith("* "))) {
      const items = block.split("\n").map((line) => `<li>${renderInline(line.trim().slice(2))}</li>`).join("");
      rendered.push(`<ul>${items}</ul>`);
      continue;
    }
    const paragraph = block.replace(/\s*\n\s*/g, " ");
    const className = /^\[[^\]]+\]\([^)\s]+\)$/.test(paragraph) ? ` class="page-actions"` : "";
    rendered.push(`<p${className}>${renderInline(paragraph)}</p>`);
  }
  return rendered.join("\n        ");
}
function renderStyles() {
  return `:root {
        --accent: #5f6f52;
        --bg: #fbfaf7;
        --line: #e8e2d8;
        --muted: #6f6a61;
        --text: #151515;

        color-scheme: light dark;
        font-family:
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;

        background: var(--bg);
        color: var(--text);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --accent: #a7b995;
          --bg: #181815;
          --line: #303026;
          --muted: #9b958a;
          --text: #eeeae2;
        }
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
      }

      .shell {
        display: flex;
        flex-direction: column;
        max-width: 42rem;
        min-height: 100vh;
        margin: 0 auto;
        padding: 1.5rem 1.5rem 4rem;
      }

      header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-bottom: 2.5rem;
        padding-bottom: 8px;
      }

      header a,
      header .brand,
      nav a {
        color: inherit;
        text-decoration: none;
      }

      header a,
      header .brand {
        font-size: 1.125rem;
        font-weight: 700;
        line-height: 1.75rem;
      }

      nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      nav a {
        color: var(--muted);
        display: inline-flex;
        align-items: center;
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1rem;
        padding: 0.125rem 0.375rem;
        border-radius: 0.75rem;
      }

      main {
        padding-top: 0;
      }

      a:hover {
        color: var(--accent);
        text-decoration: underline;
        text-underline-offset: 3px;
      }

      nav a:hover {
        background: var(--line);
        color: var(--text);
        text-decoration: none;
      }

      footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-top: auto;
        padding: 0.75rem 0 1.5rem;
        border-top: 1px solid var(--line);
        color: var(--muted);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
        line-height: 1rem;
      }

      footer a {
        color: inherit;
      }

      footer a:hover {
        color: var(--accent);
      }

      .generated-by {
        color: var(--muted);
      }

      .page-title,
      .not-found-title {
        margin: 0;
        max-width: 680px;
        font-size: clamp(1.8rem, 5vw, 3rem);
        line-height: 1;
        letter-spacing: 0;
      }

      .page-body p,
      .not-found-copy {
        max-width: 620px;
        margin: 18px 0 0;
        color: var(--text);
        font-size: 1rem;
        line-height: 1.75;
      }

      .page-lede {
        max-width: 620px;
        margin: 0.8rem 0 0;
        color: var(--muted);
        font-size: 1rem;
        font-style: italic;
        line-height: 1.65;
      }

      .page-body h2 {
        max-width: 620px;
        margin: 2.25rem 0 0.75rem;
        font-size: 1.15rem;
        line-height: 1.4;
      }

      .page-body ul {
        max-width: 620px;
        margin: 0.75rem 0 1.5rem;
        padding-left: 1.25rem;
      }

      .page-body li {
        margin: 0.45rem 0;
        line-height: 1.6;
      }

      .page-body a {
        color: inherit;
        text-underline-offset: 3px;
      }

      .page-body .page-actions {
        margin-top: 1.25rem;
      }

      .page-actions a {
        display: inline-flex;
        align-items: center;
        min-height: 2rem;
        padding: 0.35rem 0.65rem;
        border: 1px solid var(--line);
        border-radius: 0.35rem;
        color: var(--text);
        font-size: 0.78rem;
        font-weight: 650;
        line-height: 1.2;
        text-decoration: none;
      }

      .page-actions a:hover {
        border-color: var(--accent);
        color: var(--accent);
        text-decoration: none;
      }


      .not-found-copy {
        line-height: 1.7;
      }

      .post-list {
        display: grid;
        gap: 20px;
        margin-top: 0;
        padding-top: 0;
      }

      .post-list > h2 {
        margin: 0;
        font-size: 1rem;
        letter-spacing: 0;
      }

      .empty-state {
        margin-top: 0;
        font-size: 1rem;
      }

      .post-item {
        display: grid;
        grid-template-columns: 112px minmax(0, 1fr);
        gap: 18px;
        align-items: start;
      }

      time {
        color: var(--muted);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
        white-space: nowrap;
      }

      .post-kicker {
        margin: 0 0 5px;
        color: var(--accent);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.72rem;
        letter-spacing: 0.08em;
        line-height: 1.4;
        text-transform: uppercase;
      }

      .post-item h2 {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 560;
        letter-spacing: 0;
        line-height: 1.25rem;
      }

      .post-item h2 a {
        color: inherit;
        text-decoration: none;
      }

      .post-title-link {
        transition: color 0.15s ease;
      }

      .post-item:hover .post-title-link {
        color: var(--accent);
        text-decoration: none;
      }

      .post-topics {
        margin: 5px 0 0;
        color: var(--muted);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
        line-height: 1.5;
      }

      .page-body .agent-files {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        max-width: 620px;
        margin: 2rem 0 2.25rem;
        color: #6f6a61;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .page-body .agent-files a {
        color: inherit;
      }

      .page-body .agent-files a:hover {
        color: var(--accent);
      }

      .meta {
        margin-top: 0;
        color: var(--muted);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.75rem;
        line-height: 1.5;
      }

      .meta a {
        color: inherit;
      }

      .meta a:hover {
        color: var(--accent);
      }

      .post-title {
        margin: 0 0 0.25rem;
        max-width: 100%;
        font-size: 1.5rem;
        line-height: 2rem;
        letter-spacing: 0;
      }

      .description {
        max-width: 100%;
        margin: 0.5rem 0 0;
        color: var(--muted);
        font-size: 1rem;
        font-style: italic;
        line-height: 1.65;
      }

      .post-body {
        margin-top: 0.5rem;
      }

      .post-body p {
        max-width: 100%;
        margin: 1.25rem 0;
        color: var(--text);
        font-size: 1rem;
        line-height: 1.5;
      }

      .post-body h2,
      .post-body h3 {
        max-width: 100%;
        margin: 2rem 0 1rem;
        color: var(--text);
        font-size: 1.25rem;
        line-height: 1.35;
      }

      .post-body ul {
        margin: 1rem 0 1.5rem;
        padding-left: 1.25rem;
      }

      .post-body li {
        margin: 0.45rem 0;
        line-height: 1.55;
      }

      .post-body pre {
        max-width: 100%;
        margin: 1.25rem 0;
        padding: 1rem;
        overflow-x: auto;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: color-mix(in srgb, var(--line) 42%, transparent);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.86rem;
        line-height: 1.6;
      }

      @media (max-width: 640px) {
        .shell {
          padding-top: 0.75rem;
        }

        header {
          align-items: baseline;
          gap: 14px;
          margin-bottom: 1.25rem;
        }

        header .brand {
          font-size: 1rem;
          line-height: 1.5rem;
        }

        nav {
          gap: 24px;
        }

        footer {
          justify-content: space-between;
          gap: 16px;
          margin-top: auto;
          padding: 1rem 0 0;
          border-top: 1px solid var(--line);
          font-size: 0.75rem;
        }

        .generated-by {
          display: none;
        }

        .post-list {
          gap: 24px;
        }

        .post-item {
          grid-template-columns: 1fr;
          gap: 6px;
        }

        .post-item h2 {
          font-weight: 560;
          line-height: 1.42;
        }

        .post-topics {
          max-width: 28rem;
        }

        .post-kicker {
          margin-bottom: 0.75rem;
        }

        .meta {
          margin-top: 0;
          line-height: 1.6;
        }

        .post-title {
          margin-top: 0;
        }

        .description {
          margin-top: 0.5rem;
          font-size: 1rem;
          line-height: 1.6;
        }

        .post-body {
          margin-top: 0.5rem;
        }

        .post-body p {
          line-height: 1.5;
        }
      }`;
}
function renderLayout(options) {
  const shellClass = options.shell === "full" ? "shell shell-full" : options.shell === "wide" ? "shell shell-wide" : "shell";
  const customStyles = options.site.styles ? `
      ${options.site.styles}` : "";
  return `<!doctype html>
<html lang="${escapeHtml(options.language ?? siteLanguage(options.site))}">
  <head>
    ${renderHead({
    site: options.site,
    path: options.path,
    title: options.title,
    description: options.description,
    imagePath: options.imagePath,
    type: options.type,
    publishedAt: options.publishedAt,
    topics: options.topics,
    structuredData: options.structuredData,
    robots: options.robots,
    canonical: options.canonical,
    canonicalPath: options.canonicalPath,
    alternates: options.alternates
  })}
    <style>
      ${renderStyles()}${customStyles}
    </style>
  </head>
  <body>
    <div class="${shellClass}">
      ${options.headerHtml ?? options.site.headerHtml ?? renderHeader(options.site, options.path)}
      <main id="content" tabindex="-1">
${options.body}
      </main>
      ${options.footerHtml ?? options.site.footerHtml ?? renderFooter(options.site)}
    </div>
  </body>
</html>
`;
}
function renderPostList(posts, options = {}) {
  const orderedPosts = sortPosts(posts);
  if (orderedPosts.length === 0) {
    return `
        <section class="post-list" aria-label="Writing">
          <p class="empty-state">No writing published yet.</p>
        </section>`;
  }
  const visiblePosts = typeof options.limit === "number" ? orderedPosts.slice(0, options.limit) : orderedPosts;
  const heading = options.heading ? `<h2>${escapeHtml(options.heading)}</h2>` : "";
  return `
        <section class="post-list" aria-label="Writing">
          ${heading}
          ${visiblePosts.map((post) => `<article class="post-item">
            <time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(formatDate(post.publishedAt))}</time>
            <div>
              <h2><a class="post-title-link" href="${escapeHtml(postPath(post))}">${escapeHtml(post.title)}</a></h2>
              ${renderPostTopics(post)}
            </div>
          </article>`).join("\n          ")}
        </section>`;
}
function getSiteOutputPath(page) {
  return pageOutputPath(page);
}
function generateSitePage(site2, page) {
  const title = page.seoTitle ?? (page.path === "/" ? site2.title : `${page.title} - ${site2.author ?? AUTHOR_NAME}`);
  const description = page.description ?? site2.description;
  const isHome = normalizePath(page.path) === "/";
  const isAbout = normalizePath(page.path) === "/about";
  const isServices = ["/web", "/web/es"].includes(normalizePath(page.path));
  const pageBody = page.html ? page.html : isHome ? "" : `        <h1 class="page-title">${escapeHtml(page.title)}</h1>
        ${isServices && page.description ? `<p class="page-lede">${escapeHtml(page.description)}</p>` : ""}
        <div class="page-body">
          ${renderBody(page.body)}
          ${isAbout ? renderAgentFileLinks() : ""}
        </div>`;
  const postList = normalizePath(page.path) === "/" && !page.html ? renderPostList(site2.posts) : "";
  const canonical = canonicalUrl(site2, page.canonicalPath ?? page.path);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": isAbout ? "AboutPage" : "WebSite",
    name: title,
    description,
    url: canonical ?? void 0,
    inLanguage: page.language ?? siteLanguage(site2),
    author: site2.author ? {
      "@type": "Person",
      name: site2.author,
      url: site2.authorUrl ?? site2.url ?? void 0
    } : void 0
  };
  return renderLayout({
    site: site2,
    path: page.path,
    title,
    description,
    body: `${pageBody}
${postList}`,
    shell: page.shell,
    canonicalPath: page.canonicalPath,
    headerHtml: page.headerHtml,
    footerHtml: page.footerHtml,
    imagePath: page.imagePath,
    alternates: page.alternates,
    language: page.language,
    structuredData: page.structuredData ?? structuredData
  });
}
function generatePostPage(site2, post, options = {}) {
  const canonical = canonicalUrl(site2, postPath(post));
  return renderLayout({
    site: site2,
    path: postPath(post),
    title: `${post.title} - ${site2.author ?? AUTHOR_NAME}`,
    description: post.description,
    imagePath: options.imagePath,
    type: "article",
    publishedAt: post.publishedAt,
    topics: post.topics,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      url: canonical ?? void 0,
      mainEntityOfPage: canonical ?? void 0,
      keywords: post.topics ?? [],
      author: {
        "@type": "Person",
        name: site2.author ?? AUTHOR_NAME,
        url: site2.authorUrl ?? site2.url ?? void 0
      },
      publisher: {
        "@type": "Person",
        name: site2.author ?? AUTHOR_NAME
      }
    },
    body: `        <h1 class="post-title">${escapeHtml(post.title)}</h1>
        <div class="meta"><a href="${escapeHtml(site2.authorUrl ?? X_PROFILE_URL)}" rel="me">${escapeHtml(authorSocialLabel(site2))}</a> | <time datetime="${escapeHtml(post.publishedAt)}">${escapeHtml(formatDate(post.publishedAt))}</time><span data-relative-date-label data-published-at="${escapeHtml(post.publishedAt)}" hidden> | <span data-relative-date></span></span></div>
        <p class="description">${escapeHtml(post.description)}</p>
        <div class="post-body">
          ${renderBody(post.body)}
        </div>`
  });
}
function generateNotFoundPage(site2) {
  return renderLayout({
    site: site2,
    path: "/404",
    title: `Page not found - ${site2.title}`,
    description: "The requested page could not be found.",
    robots: "noindex,follow",
    canonical: false,
    body: `        <h1 class="not-found-title">Page not found</h1>
        <p class="not-found-copy">The page you are looking for does not exist yet.</p>`
  });
}
function generateLlmsText(site2) {
  const orderedPosts = sortPosts(site2.posts);
  const pages = site2.pages.map((page) => {
    const summary = page.tokenSummary ? ` - ${page.tokenSummary}` : "";
    return `- ${page.title}: ${normalizePath(page.path)}${summary}`;
  }).join("\n");
  const posts = orderedPosts.map((post) => `- ${post.title}: ${postPath(post)} - ${post.tokenSummary}`).join("\n");
  return `# ${site2.title}

This site is generated by Paideia Framework.

Useful agent entrypoints:
- /system.json - runtime and site contract
- /runtime.json - runtime identity and build metadata
- /context.json - compressed site map and summaries
- /llms.txt - agent guidance

## Site

${site2.description}
${site2.url ? `
Canonical site URL: ${site2.url}` : ""}
${site2.author ? `
Author: ${site2.author}` : ""}
Language: ${siteLanguage(site2)}

## Pages

${pages}

## Writing

${posts}

## Generated By

Paideia Framework v${FRAMEWORK_VERSION}
`;
}
function generateContextJson(site2) {
  const orderedPosts = sortPosts(site2.posts);
  const latestPost = orderedPosts[0] ?? null;
  const context = {
    site: {
      title: site2.title,
      description: site2.description,
      url: site2.url ?? null,
      author: site2.author ?? null,
      language: siteLanguage(site2)
    },
    pages: site2.pages.map((page) => ({
      path: normalizePath(page.path),
      canonical: canonicalUrl(site2, page.path),
      title: page.title,
      description: page.description ?? site2.description,
      tokenSummary: page.tokenSummary ?? page.body
    })),
    posts: orderedPosts.map((post) => ({
      slug: post.slug,
      path: postPath(post),
      canonical: canonicalUrl(site2, postPath(post)),
      title: post.title,
      topics: post.topics ?? [],
      publishedAt: post.publishedAt,
      tokenSummary: post.tokenSummary
    })),
    writing: {
      postCount: orderedPosts.length,
      latestPost: latestPost?.slug ?? null
    },
    generatedBy: {
      name: "Paideia Framework",
      version: FRAMEWORK_VERSION
    }
  };
  return JSON.stringify(context, null, 2);
}
function generateRobotsTxt(site2) {
  const sitemapUrl = site2.url ? `${site2.url.replace(/\/+$/g, "")}/sitemap.xml` : null;
  let content = `User-agent: *
Allow: /`;
  if (sitemapUrl) {
    content += `

Sitemap: ${sitemapUrl}`;
  }
  return content;
}
function generateSitemapXml(site2) {
  if (!site2.url) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
  }
  const baseUrl = site2.url.replace(/\/+$/g, "");
  const orderedPosts = sortPosts(site2.posts);
  const urls = [];
  for (const page of site2.pages.filter((page2) => !page2.canonicalPath || page2.canonicalPath === page2.path)) {
    const canonical = canonicalUrl(site2, page.canonicalPath ?? page.path);
    if (canonical) {
      urls.push(`  <url>
    <loc>${escapeHtml(canonical)}</loc>
  </url>`);
    }
  }
  for (const post of orderedPosts) {
    const canonical = canonicalUrl(site2, postPath(post));
    if (canonical) {
      urls.push(`  <url>
    <loc>${escapeHtml(canonical)}</loc>
    <lastmod>${escapeHtml(post.publishedAt)}</lastmod>
  </url>`);
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
}

// site/routes.mjs
function composeRoutes(site2, copy2, { escape: e2, mailto: mailto2, picture: picture2 }) {
  const criticalBoot = "// Critical first-paint state. CSS completes the reveal even if the later controller fails.\n(() => {\n try{\n  const navigationType=performance.getEntriesByType('navigation')[0]?.type;\n  const restored=navigationType==='back_forward';\n  if(restored||matchMedia('(prefers-reduced-motion: reduce)').matches)return;\n  const normalize=path=>path.replace(/\\/+$/,'')||'/';\n  const path=normalize(location.pathname),home=['/','/es','/web','/web/es'].includes(path);\n  let route;try{route=JSON.parse(sessionStorage.getItem('portfolio-route-transition')||'null');}catch{}\n  const fresh=route&&Date.now()-route.createdAt<60000;\n  const internal=navigationType!=='reload'&&fresh&&normalize(route.path)===path;window.__portfolioInternalNavigation=Boolean(internal);\n  if(internal){window.__portfolioRouteEnterStarted=performance.now();document.documentElement.classList.add('route-enter');}\n  if(home&&!internal){window.__portfolioOpeningStarted=performance.now();document.documentElement.classList.add('motion-enter','opening-pending');setTimeout(()=>document.documentElement.classList.remove('motion-enter','opening-pending','home-route-enter'),4500);}\n }catch{}\n})();\n";
  const scriptVersion = createHash("sha256").update(criticalBoot + "(() => {\n document.documentElement?.classList?.remove('opening-pending');\n const equivalents = {offer:'oferta',work:'trabajos','about-me':'sobre-mi',contact:'contacto',tiki:'tiki',lucia:'lucia',filsen:'filsen'};\n const updateLanguage = () => {\n  const link=document.querySelector('[data-language]'); if(!link) return;\n  const hash=decodeURIComponent(location.hash.slice(1));\n  const map=link.dataset.language==='es'?equivalents:Object.fromEntries(Object.entries(equivalents).map(([a,b])=>[b,a]));\n  link.href=link.pathname+(map[hash]?'#'+map[hash]:'');\n };\n updateLanguage(); window.addEventListener('hashchange',updateLanguage);\n const clocks=[...(document.querySelectorAll?.('[data-local-time]')||[])];\n if(clocks.length){\n  let clockTimer;\n  const updateClock=()=>{\n   window.clearTimeout(clockTimer);if(document.visibilityState==='hidden')return;\n   const now=new Date();clocks.forEach(clock=>{clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:clock.dataset.timezone,hour:'2-digit',minute:'2-digit',hour12:false}).format(now);clock.dateTime=now.toISOString();});\n   clockTimer=window.setTimeout(updateClock,60000-(Date.now()%60000));\n  };\n  updateClock();document.addEventListener('visibilitychange',updateClock);\n }\n if('IntersectionObserver' in window){\n  const graphics=document.querySelectorAll('[data-motion-graphic]');\n  const graphicObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-motion-visible',entry.isIntersecting)),{rootMargin:'40px'});\n  graphics.forEach(graphic=>graphicObserver.observe(graphic));\n }\n const button=document.querySelector('.copy-email'),status=document.querySelector('.copy-status');\n if(button) button.addEventListener('click',async()=>{\n  try { if(!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(button.dataset.email); status.textContent=button.dataset.success; }\n  catch { status.textContent=button.dataset.failure; const range=document.createRange(); range.selectNodeContents(document.querySelector('.email-address')); const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }\n });\n // The scene has one interruptible state shared by title, tiles and collage.\n // Server-rendered content stays readable when scripts or motion are disabled.\n const scene=document.querySelector('[data-scene]');\n if(scene&&location.hash){\n  const lang=(location.pathname||'/').startsWith('/es')||(location.pathname||'').endsWith('/es')?'es':'en';\n  const legacy={offer:'services',oferta:'services',work:'work',trabajos:'work','about-me':'about','sobre-mi':'about',contact:'contact',contacto:'contact',tiki:'work/tiki',lucia:'work/lucia',filsen:'work/filsen'};\n  const route=legacy[location.hash.slice(1)];\n  if(route&&location.replace){location.replace((lang==='es'?'/es':'')+'/'+route);return;}\n }\n const draft=document.querySelector('[data-contact-draft]');\n if(draft)draft.addEventListener('submit',event=>{\n  event.preventDefault();if(!draft.reportValidity())return;\n  const values=new FormData(draft);\n  const text=`Email: ${values.get('email')}\\n\\n${values.get('project')}\\n\\n${values.get('website')||''}`;\n  location.href=`mailto:${draft.dataset.to}?subject=${encodeURIComponent(draft.dataset.subject)}&body=${encodeURIComponent(text)}`;\n });\n const workIndex=document.querySelector('[data-work-index]');\n if(workIndex){\n  document.querySelectorAll('[data-work-filter]').forEach(button=>button.addEventListener('click',()=>{\n   const category=button.dataset.workFilter;\n   document.querySelectorAll('[data-work-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));\n   workIndex.querySelectorAll('[data-category]').forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;});\n  }));\n  document.querySelectorAll('[data-work-view]').forEach(button=>button.addEventListener('click',()=>{\n   workIndex.dataset.view=button.dataset.workView;\n   document.querySelectorAll('[data-work-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));\n  }));\n }\n if(scene){\n  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');\n  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');\n  const mobileLayout=window.matchMedia('(max-width: 740px)');\n  const tiles=[...scene.querySelectorAll('[data-project]')];\n  const contexts=[...scene.querySelectorAll('[data-context]')];\n  const reset=scene.querySelector('[data-scene-reset]');\n  let pinned=null,leaveTimer=0,frame=0,opening=false;\n  const cancelLeave=()=>window.clearTimeout(leaveTimer);\n  const select=(project)=>{\n   cancelLeave();\n   if(project){opening=false;document.documentElement.classList.remove('motion-enter');}\n   scene.dataset.focus=project||'overview';\n   tiles.forEach(tile=>tile.setAttribute('aria-pressed',String(tile.dataset.project===project)));\n   contexts.forEach(context=>{\n    const active=context.dataset.context===project;\n    context.setAttribute('aria-hidden',String(!active));\n    context.querySelector('a').tabIndex=active?0:-1;\n   });\n   scene.querySelector('.scene-overview a').tabIndex=project&&!mobileLayout.matches?-1:0;\n   reset.tabIndex=project?0:-1;\n  };\n  const restore=()=>{pinned=null;select(null);tiles.forEach(tile=>{tile.style.removeProperty('--float-x');tile.style.removeProperty('--float-y');});};\n  tiles.forEach(tile=>{\n   tile.addEventListener('pointerenter',()=>{if(finePointer.matches&&!pinned&&!opening)select(tile.dataset.project);});\n   tile.addEventListener('pointerleave',()=>{if(!pinned)leaveTimer=window.setTimeout(()=>{if(!scene.contains(document.activeElement))select(null);},110);});\n   tile.addEventListener('focus',()=>{pinned=null;select(tile.dataset.project);});\n   tile.addEventListener('click',()=>{const id=tile.dataset.project;const link=contexts.find(context=>context.dataset.context===id)?.querySelector('a');if(finePointer.matches&&!mobileLayout.matches&&link?.click){link.click();return;}pinned=pinned===id?null:id;select(pinned);});\n   tile.addEventListener('pointermove',event=>{\n    if(reduced.matches||!finePointer.matches||frame)return;\n    frame=window.requestAnimationFrame(()=>{\n     frame=0;const box=tile.getBoundingClientRect();\n     tile.style.setProperty('--float-x',`${((event.clientX-box.left)/box.width-.5)*10}px`);\n     tile.style.setProperty('--float-y',`${((event.clientY-box.top)/box.height-.5)*10}px`);\n    });\n   });\n  });\n  contexts.forEach(context=>context.addEventListener('pointerenter',cancelLeave));\n  scene.addEventListener('pointerleave',()=>{if(!pinned&&!scene.contains(document.activeElement))select(null);});\n  scene.addEventListener('focusout',()=>{window.setTimeout(()=>{if(!scene.contains(document.activeElement)&&!pinned)select(null);},0);});\n  scene.addEventListener('keydown',event=>{if(event.key==='Escape'){restore();document.activeElement?.blur?.();}});\n  reset.addEventListener('click',restore);\n  select(null);\n  const backForward=typeof performance!=='undefined'&&performance.getEntriesByType?.('navigation')?.[0]?.type==='back_forward';\n  if(!reduced.matches&&!backForward&&!window.__portfolioInternalNavigation){\n   const elapsed=window.__portfolioOpeningStarted&&typeof performance!=='undefined'?performance.now()-window.__portfolioOpeningStarted:0;\n   const remaining=Math.max(0,3800-elapsed);\n   opening=remaining>0;\n   if(opening)document.documentElement.classList.add('motion-enter');\n   window.setTimeout(()=>{\n    opening=false;document.documentElement.classList.remove('motion-enter');\n    try{sessionStorage.setItem('portfolio-opening-v3','seen');}catch{}\n   },remaining);\n  }\n  window.addEventListener('pageshow',event=>{if(event.persisted)document.documentElement.classList.remove('motion-enter');});\n  // Native scrolling keeps browser history, anchors and keyboard behavior.\n  // Reveal animation never hides content while waiting for an observer.\n  if('IntersectionObserver' in window){\n   const observer=new IntersectionObserver(entries=>{\n    entries.forEach(entry=>{\n     if(!entry.isIntersecting)return;\n     observer.unobserve(entry.target);\n     if(!reduced.matches)entry.target.animate([\n      {opacity:.35,transform:'translateY(28px)'},\n      {opacity:1,transform:'translateY(0)'}\n     ],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});\n    });\n   },{threshold:.12});\n   document.querySelectorAll('.project,.section-grid,.steps article,.contact,.recent-writing').forEach(element=>observer.observe(element));\n  }\n  reduced.addEventListener('change',()=>{\n   if(reduced.matches){document.documentElement.classList.remove('motion-enter');document.getAnimations().forEach(animation=>animation.cancel());tiles.forEach(tile=>{tile.style.removeProperty('--float-x');tile.style.removeProperty('--float-y');});}\n  });\n }\n})();\n" + "(() => {\n const root=document.documentElement;\n const reduced=matchMedia('(prefers-reduced-motion: reduce)');\n const fine=matchMedia('(hover: hover) and (pointer: fine)');\n const ease='cubic-bezier(.76,0,.24,1)';\n const menu=document.querySelector('.site-menu'),open=document.querySelector('[data-menu-open]'),close=document.querySelector('[data-menu-close]');\n let menuClosing=0,previousOverflow='';\n const closeMenu=()=>{\n  if(!menu?.open||menuClosing)return;\n  root.classList.remove('menu-visible');open?.setAttribute('aria-expanded','false');\n  menuClosing=setTimeout(()=>{menu.close();document.body.style.overflow=previousOverflow;menuClosing=0;},reduced.matches?0:850);\n };\n open?.addEventListener('click',()=>{\n  if(menu.open){closeMenu();return;}\n  previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';\n  menu.showModal();void menu.offsetWidth;open.setAttribute('aria-expanded','true');requestAnimationFrame(()=>root.classList.add('menu-visible'));\n });\n close?.addEventListener('click',closeMenu);\n menu?.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});\n menu?.addEventListener('click',event=>{if(event.target===menu)closeMenu();});\n\n // Preserve native history/new tabs/external URLs; cover only ordinary internal navigation.\n const curtain=document.querySelector('.route-curtain');let navigating=false;\n try{\n  const stored=sessionStorage.getItem('portfolio-route-transition');const arriving=stored?JSON.parse(stored):null;\n  sessionStorage.removeItem('portfolio-route-transition');\n  const navigationType=performance.getEntriesByType('navigation')[0]?.type;\n  const fresh=arriving&&Date.now()-arriving.createdAt<60000;\n  if(fresh&&navigationType!=='reload'&&navigationType!=='back_forward'&&arriving.path.replace(/\\/+$/,'')===location.pathname.replace(/\\/+$/,'')){\n   curtain.querySelector('span').textContent='';\n   sessionStorage.removeItem('portfolio-route-transition');\n   if(!reduced.matches){window.__portfolioRouteEnterStarted??=performance.now();root.classList.add('route-enter');setTimeout(()=>{root.classList.remove('route-enter','home-route-enter');document.querySelector('#content')?.focus({preventScroll:true});},Math.max(0,1050-(performance.now()-window.__portfolioRouteEnterStarted)));}\n  }\n }catch{}\n document.addEventListener('click',event=>{\n  const anchor=event.target.closest?.('a[href]');\n  if(!anchor||reduced.matches||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.target||anchor.hasAttribute('download'))return;\n  const url=new URL(anchor.href,location.href);\n  if(url.origin!==location.origin||url.protocol!=='http:'&&url.protocol!=='https:'||url.pathname.startsWith('/admin')||url.pathname.startsWith('/api'))return;\n  if(navigating){event.preventDefault();return;}\n  const normalize=path=>path.replace(/\\/+$/,'')||'/';\n  if(normalize(url.pathname)===normalize(location.pathname)&&url.search===location.search){\n   if(!url.hash){event.preventDefault();document.querySelector('[data-scene-reset]')?.click();scrollTo({top:0,behavior:'smooth'});}\n   return;\n  }\n  event.preventDefault();navigating=true;\n  const beginExit=()=>{\n   const opening=root.classList.contains('motion-enter')?document.querySelector('.opening-curtain'):null;\n   const cover=opening?getComputedStyle(opening):null;\n   const from=cover?{transform:cover.transform,borderRadius:cover.borderRadius}:null;\n   curtain.getAnimations().forEach(animation=>animation.cancel());curtain.style.removeProperty('animation');\n   root.classList.remove('motion-enter','route-enter');root.classList.add('route-exit');\n   curtain.querySelector('span').textContent='';\n   if(from){curtain.style.animation='none';curtain.animate([from,{transform:'none',borderRadius:'0px'}],{duration:650,easing:ease,fill:'forwards'});}\n   try{sessionStorage.setItem('portfolio-route-transition',JSON.stringify({path:url.pathname,title:'',createdAt:Date.now()}));}catch{}\n   setTimeout(()=>{if(menu?.open){menu.close();open?.setAttribute('aria-expanded','false');document.body.style.overflow=previousOverflow;root.classList.remove('menu-visible');}location.assign(url.href);},720);\n  };\n  // Finish an incoming reveal before starting a new cover; never reset a moving curtain offscreen.\n  const remaining=root.classList.contains('route-enter')?Math.max(0,1050-(performance.now()-(window.__portfolioRouteEnterStarted||0))):0;\n  if(remaining)setTimeout(beginExit,remaining);else beginExit();\n });\n window.addEventListener('pageshow',event=>{\n  if(event.persisted){navigating=false;clearTimeout(menuClosing);menuClosing=0;open?.setAttribute('aria-expanded','false');root.classList.remove('route-exit','route-enter','home-route-enter','menu-visible','work-cursor-visible');if(menu?.open)menu.close();document.body.style.overflow=previousOverflow;}\n });\n\n // Magnetic motion stays attached to the actual accessible link/button.\n document.querySelectorAll('.portfolio-header nav a,.header-contact,.writing-utility,.languages a,.brand-roll,.round-link,.round-submit,.floating-menu-button,.menu-close,.site-menu nav a').forEach(element=>{\n  if(element.matches('.portfolio-header nav a,.header-contact,.writing-utility,.languages a,.site-menu nav a,.round-link,.round-submit')){const label=document.createElement('span');label.className='magnetic-label';while(element.firstChild)label.append(element.firstChild);element.append(label);}\n  let box;\n  const reset=()=>{element.style.removeProperty('--magnet-x');element.style.removeProperty('--magnet-y');box=null;};\n  element.addEventListener('pointerenter',()=>{if(fine.matches&&!reduced.matches)box=element.getBoundingClientRect();});\n  element.addEventListener('pointermove',event=>{\n   if(!box||reduced.matches||!fine.matches)return;\n   const round=element.matches('.round-link,.round-submit,.floating-menu-button,.menu-close');\n   const limit=round?18:9;\n   element.style.setProperty('--magnet-x',`${Math.max(-limit,Math.min(limit,(event.clientX-box.left-box.width/2)*.22))}px`);\n   element.style.setProperty('--magnet-y',`${Math.max(-limit,Math.min(limit,(event.clientY-box.top-box.height/2)*.22))}px`);\n  });\n  element.addEventListener('pointerleave',reset);element.addEventListener('blur',reset);element.addEventListener('pointerdown',reset);\n });\n\n const work=document.querySelector('[data-work-index]'),scene=document.querySelector('[data-scene]');\n if((work||scene)&&fine.matches&&!reduced.matches){\n  const cursor=document.createElement('span');cursor.className='work-view-cursor';const cursorLabel=document.createElement('span');cursorLabel.textContent=document.documentElement.lang==='es'?'Ver':'View';cursor.append(cursorLabel);cursor.setAttribute('aria-hidden','true');document.body.append(cursor);\n  const preview=document.createElement('div');preview.className='work-hover-preview';preview.setAttribute('aria-hidden','true');const stack=document.createElement('div');stack.className='work-preview-stack';const cards=[...(work||scene).querySelectorAll(work?'.work-card':'[data-project]')];if(work)cards.forEach(card=>{const img=document.createElement('img'),main=card.querySelector('img'),source=card.querySelector('source');img.alt='';img.src=main.currentSrc||main.src;if(source){img.srcset=source.srcset;img.sizes='310px';}stack.append(img);});preview.append(stack);document.body.append(preview);\n  let frame=0,last;\n  cards.forEach((card,index)=>{\n   card.addEventListener('pointerenter',event=>{if(!fine.matches||reduced.matches)return;cursor.style.transition='none';cursor.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;void cursor.offsetWidth;cursor.style.removeProperty('transition');preview.style.transform=`translate3d(${Math.min(innerWidth-350,Math.max(16,event.clientX-155))}px,${Math.max(20,event.clientY-240)}px,0)`;preview.style.setProperty('--preview-index',index);root.classList.add('work-cursor-visible');root.classList.toggle('work-preview-visible',work?.dataset.view==='list');});\n   card.addEventListener('pointermove',event=>{if(!fine.matches||reduced.matches)return;last=event;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;cursor.style.transform=`translate3d(${last.clientX}px,${last.clientY}px,0)`;preview.style.transform=`translate3d(${Math.min(innerWidth-350,Math.max(16,last.clientX-155))}px,${Math.max(20,last.clientY-240)}px,0)`;});});\n   card.addEventListener('pointerleave',()=>root.classList.remove('work-cursor-visible','work-preview-visible'));\n  });\n }\n\n // Direction indicator is decorative; native links and viewport scrolling retain their meaning.\n document.querySelectorAll('.route-head,.scene-topline,.about-orbit').forEach(host=>{const arrow=document.createElement('span');arrow.className='scroll-direction';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox=\"0 0 24 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2v27m-7-7 7 7 7-7\" stroke=\"currentColor\" stroke-width=\"1.5\"/></svg>';host.append(arrow);});\n root.dataset.scrollDirection='down';let directionOrigin=scrollY;\n const footer=document.querySelector('.studio-footer');let scrollFrame=0;\n const paintScroll=()=>{\n  scrollFrame=0;if(Math.abs(scrollY-directionOrigin)>=12){root.dataset.scrollDirection=scrollY>directionOrigin?'down':'up';directionOrigin=scrollY;}root.classList.toggle('is-scrolled',scrollY>Math.min(260,innerHeight*.45));\n  if(footer){const box=footer.getBoundingClientRect();const progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight-box.top)/box.height));footer.style.setProperty('--footer-progress',progress.toFixed(4));footer.style.setProperty('--footer-bend',`${Math.round(110*(1-progress))}px`);footer.style.setProperty('--footer-shift',`${Math.round(45*(1-progress))}px`);}\n };\n window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paintScroll);},{passive:true});window.addEventListener('resize',paintScroll);paintScroll();\n if('IntersectionObserver' in window){\n  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(!reduced.matches&&!root.classList.contains('route-enter')&&!root.classList.contains('motion-enter'))entry.target.animate([{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:750,easing:ease});}),{threshold:.12});\n  document.querySelectorAll('.route-head,.case-intro,.case-cover,.case-gallery figure,.work-card,.about-identity,.post-body h2').forEach(element=>observer.observe(element));\n }\n reduced.addEventListener('change',()=>{if(reduced.matches){root.classList.remove('work-cursor-visible','work-preview-visible','route-exit','route-enter');document.getAnimations().forEach(animation=>animation.cancel());paintScroll();}});\n})();\n").digest("hex").slice(0, 12);
  const arrow2 = '<span aria-hidden="true">\u2197</span>';
  const path2 = (lang, route = "") => `${lang === "es" ? "/es" : ""}${route ? "/" + route : lang === "es" ? "" : "/"}`;
  const globe = `<span class="wire-globe motion-graphic" data-motion-graphic aria-hidden="true"><span class="globe-equator"></span><span class="globe-latitude globe-latitude--north"></span><span class="globe-latitude globe-latitude--south"></span>${[0, 1, 2].map((i) => `<span class="globe-meridian" style="--ring:${i}"></span>`).join("")}</span>`;
  const graphic = (kind) => `<span class="signal-mark signal-mark--${kind} motion-graphic" data-motion-graphic aria-hidden="true"><span class="signal-sheet signal-sheet--back"></span><span class="signal-sheet signal-sheet--middle"></span><span class="signal-sheet signal-sheet--front"></span><span class="signal-pulse"></span></span>`;
  const nav = (lang, route = "") => {
    const c = copy2[lang], other = lang === "es" ? "en" : "es";
    return `<script>${criticalBoot}</script><a class="skip-link" href="#content">${lang === "es" ? "Saltar al contenido" : "Skip to content"}</a><header class="portfolio-header"><a class="identity brand-roll" href="${path2(lang)}" aria-label="Lautaro G\xE4rtner"><span class="brand-roll-main" aria-hidden="true">Lautaro G\xE4rtner</span><span class="brand-roll-hover" aria-hidden="true">Coded by Lautaro</span></a><nav aria-label="${lang === "es" ? "Navegaci\xF3n principal" : "Main navigation"}"><a href="${path2(lang, "work")}"${route === "work" || route.startsWith("work/") ? ' aria-current="page"' : ""}>${e2(c.nav.work)}</a><a href="${path2(lang, "about")}"${route === "about" ? ' aria-current="page"' : ""}>${lang === "es" ? "Sobre m\xED" : "About"}</a></nav><div class="header-end"><a class="writing-utility" href="/writing"${route === "writing" ? ' aria-current="page"' : ""}>${lang === "es" ? "Art\xEDculos" : "Writing"}</a><div class="languages" aria-label="${lang === "es" ? "Idioma" : "Language"}"><span aria-current="page">${lang.toUpperCase()}</span><span aria-hidden="true">/</span><a data-language="${other}" href="${path2(other, route === "writing" ? "" : route)}" lang="${other}" hreflang="${other}">${other.toUpperCase()}</a></div>${route === "contact" ? `<span class="header-contact" aria-current="page">${e2(c.nav.contact)}</span>` : `<a class="header-contact" href="${path2(lang, "contact")}">${e2(c.nav.contact)} ${arrow2}</a>`}</div></header><button class="floating-menu-button" data-menu-open aria-expanded="false" aria-label="${lang === "es" ? "Abrir men\xFA" : "Open menu"}" aria-haspopup="dialog" aria-controls="site-menu"><span></span><span></span></button><dialog id="site-menu" class="site-menu" aria-labelledby="menu-label"><div class="menu-inner"><button class="menu-close" data-menu-close aria-label="${lang === "es" ? "Cerrar men\xFA" : "Close menu"}">\xD7</button><p id="menu-label" class="section-label">${lang === "es" ? "Navegaci\xF3n" : "Navigation"}</p><nav aria-label="${lang === "es" ? "Men\xFA" : "Menu"}">${[["work", c.nav.work], ["about", lang === "es" ? "Sobre m\xED" : "About"], ["contact", c.nav.contact]].map(([r, label]) => `<a href="${r === "writing" ? "/writing" : path2(lang, r)}"${route === r || r === "work" && route.startsWith("work/") ? ' aria-current="page"' : ""}>${e2(label)}</a>`).join("")}</nav><div class="menu-socials"><a href="https://www.linkedin.com/in/lautarogartner">LinkedIn</a><a href="mailto:${e2(c.contact.email)}">Email</a></div></div></dialog><div class="route-curtain" aria-hidden="true"><span></span></div>`;
  };
  const foot = (lang, { sales = true, writing: writing2 = false } = {}) => `<footer class="studio-footer ${sales ? "" : "studio-footer--quiet"}" data-footer-kind="${sales ? "commercial" : writing2 ? "writing" : "simple"}">${sales ? `<div class="footer-invitation"><h2>${lang === "es" ? "\xBFTrabajamos juntos?" : "Let\u2019s work together."}</h2><a class="round-link" href="${path2(lang, "contact")}" aria-label="${e2(copy2[lang].nav.contact)}">${arrow2}</a></div>` : writing2 ? `<a class="writing-back" href="/writing">\u2190 Writing</a>` : ""}<div class="footer-meta"><div><span>Lautaro G\xE4rtner</span><p>Crespo, Argentina ${globe}</p></div><div class="footer-local"><span>${lang === "es" ? "Hora local" : "Local time"}</span><time data-local-time data-timezone="America/Argentina/Buenos_Aires">${new Intl.DateTimeFormat("en-GB", { timeZone: "America/Argentina/Buenos_Aires", hour: "2-digit", minute: "2-digit", hour12: false }).format(/* @__PURE__ */ new Date())}</time></div><a href="${e2(mailto2(lang))}">${e2(copy2[lang].contact.email)}</a><nav aria-label="${lang === "es" ? "Enlaces del pie" : "Footer links"}"><a href="/writing">${lang === "es" ? "Art\xEDculos" : "Writing"}</a><a href="https://www.linkedin.com/in/lautarogartner">LinkedIn</a><a href="https://x.com/lautarogartner_">X</a><a href="https://github.com/LautaroGartner/lautarogartner.com">GitHub</a></nav></div><script async src="/portfolio.js?v=${scriptVersion}"></script><script defer src="/motion-shell.js?v=${scriptVersion}"></script></footer>`;
  const head = (lang, kicker, title, body = "") => `<section class="route-head"><p class="section-label">${e2(kicker)}</p><h1>${e2(title)}</h1>${body ? `<p class="route-lede">${e2(body)}</p>` : ""}</section>`;
  const script = "";
  const section = (html, cls) => [...html.matchAll(/<section\b[\s\S]*?<\/section>/g)].map((m) => m[0]).find((s) => s.includes(`class="${cls}"`)) || "";
  const graph = (lang, route, title) => {
    const base = site2.url.replace(/\/$/, "");
    return { "@context": "https://schema.org", "@graph": [{ "@type": "Person", "@id": base + "/#person", name: site2.author, url: base, jobTitle: "Independent software developer", sameAs: ["https://www.linkedin.com/in/lautarogartner", "https://x.com/lautarogartner_"] }, { "@type": "WebSite", "@id": base + "/#website", url: base, name: site2.title, inLanguage: ["en", "es"], publisher: { "@id": base + "/#person" } }, { "@type": "WebPage", "@id": base + path2(lang, route) + "#webpage", url: base + path2(lang, route), name: title, inLanguage: lang, isPartOf: { "@id": base + "/#website" }, about: { "@id": base + "/#person" } }] };
  };
  const page = (lang, route, title, description, html) => ({ path: path2(lang, route), title, seoTitle: `${title} | Lautaro G\xE4rtner`, description, body: description, html, shell: "wide", nav: false, language: lang, headerHtml: nav(lang, route), footerHtml: foot(lang, { sales: route !== "contact" }), canonicalPath: path2(lang, route), imagePath: "/work/social.jpg", alternates: [{ language: "en", path: path2("en", route) }, { language: "es", path: path2("es", route) }, { language: "x-default", path: path2("en", route) }], structuredData: graph(lang, route, title), tokenSummary: description });
  const pages = [];
  for (const lang of ["en", "es"]) {
    const c = copy2[lang], old = site2.pages.find((p) => p.path === path2(lang)), legacy = old.html;
    const legacyLinks = Object.entries(c.anchors).map(([key, id]) => {
      const target = { offer: "services", work: "work", about: "about", contact: "contact" }[key];
      return target ? `<a id="${e2(id)}" href="${path2(lang, target)}">${e2({ offer: c.nav.offer, work: c.nav.work, about: lang === "es" ? "Sobre m\xED" : "About", contact: c.nav.contact }[key])}</a>` : "";
    }).join("") + c.projects.map((p) => `<a id="${p.id}" href="${path2(lang, "work/" + p.id)}">${e2(p.name)}</a>`).join("");
    let scene = section(legacy, "hero motion-scene").replaceAll(`href="#${c.anchors.work}"`, `href="${path2(lang, "work")}"`);
    for (const p of c.projects) scene = scene.replaceAll(`href="#${p.id}"`, `href="${path2(lang, "work/" + p.id)}"`);
    const summary = `<section class="home-summary"><p>${e2(c.hero.Body)}</p><a class="text-link" href="${path2(lang, "services")}">${e2(c.nav.offer)} ${arrow2}</a><a class="round-link" href="${path2(lang, "contact")}" aria-label="${e2(c.nav.contact)}">${arrow2}</a>${graphic("flow")}</section>`;
    pages.push({ ...old, html: scene + summary + `<nav class="legacy-links" aria-label="${lang === "es" ? "Enlaces del sitio" : "Site links"}">${legacyLinks}</nav>` + script, headerHtml: nav(lang), footerHtml: foot(lang) });
    const workTitle = lang === "es" ? "Trabajos" : "Work";
    const work = `<div class="work-toolbar"><div role="group" aria-label="${lang === "es" ? "Filtrar trabajos" : "Filter work"}"><button data-work-filter="all" aria-pressed="true">${lang === "es" ? "Todos" : "All"}</button><button data-work-filter="published" aria-pressed="false">${lang === "es" ? "Publicados" : "Published"}</button><button data-work-filter="beta" aria-pressed="false">${lang === "es" ? "Producto propio" : "Own product"}</button></div><div role="group" aria-label="${lang === "es" ? "Vista de trabajos" : "Work view"}"><button data-work-view="grid" aria-pressed="true">${lang === "es" ? "Grilla" : "Grid"}</button><button data-work-view="list" aria-pressed="false">${lang === "es" ? "Lista" : "List"}</button></div></div><section class="work-index" data-work-index data-view="grid">${c.projects.map((p) => `<article class="work-card" data-category="${p.id === "filsen" ? "beta" : "published"}"><a href="${path2(lang, "work/" + p.id)}"><figure>${picture2(p, false, "(max-width: 740px) calc(100vw - 40px), 48vw")}</figure><div class="work-card-caption"><h2>${e2(p.name)}</h2>${arrow2}<p>${e2(p.label)}</p></div></a></article>`).join("")}</section>`;
    pages.push(page(lang, "work", workTitle, c.work.intro, head(lang, "", workTitle) + work + script));
    const services = ["offer section-grid"].map((cls) => section(legacy, cls)).join("").replace(/(<p class="section-label">)\d+ \/ /g, "$1");
    pages.push(page(lang, "services", c.offer.label, c.offer.body, head(lang, c.offer.label, c.offer.heading, c.hero.Body) + services + script));
    const fields = lang === "es" ? ["Tu email", "\xBFQu\xE9 necesit\xE1s mejorar?", "Tu web (opcional)", "Continuar por email"] : ["Your email", "What would you like to improve?", "Your website (optional)", "Continue by email"];
    const form = `<section class="contact-layout"><form class="contact-draft" data-contact-draft data-to="${e2(c.contact.email)}" data-subject="${e2(c.contact.subject)}" action="mailto:${e2(c.contact.email)}" method="post" enctype="text/plain"><div class="contact-field"><label for="contact-email">${fields[0]}</label><input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="254"></div><div class="contact-field"><label for="contact-need">${fields[1]}</label><textarea id="contact-need" name="project" required maxlength="4000" rows="3"></textarea></div><div class="contact-field"><label for="contact-site">${fields[2]}</label><input id="contact-site" name="website" type="text" inputmode="url" autocomplete="url" maxlength="2048"></div><button class="round-submit" type="submit">${fields[3]} ${arrow2}</button></form><aside class="contact-details">${graphic("message")}<p class="section-label">${lang === "es" ? "CONTACTO" : "CONTACT DETAILS"}</p><a class="contact-direct" href="${e2(mailto2(lang))}">${e2(c.contact.email)}</a><p class="section-label">${lang === "es" ? "UBICACI\xD3N" : "BASED IN"}</p><p class="contact-location">${globe}<span>Crespo, Argentina</span></p><a href="https://www.linkedin.com/in/lautarogartner">LinkedIn ${arrow2}</a></aside></section>`;
    pages.push(page(lang, "contact", lang === "es" ? "Contacto" : "Contact", c.contact.body, '<div class="route-contact" data-route="contact">' + head(lang, "", c.contact.heading, c.contact.body) + form + "</div>" + script));
    for (const p of c.projects) {
      const shots = projectMedia[p.id].map((shot) => [shot.id, shot[lang]]);
      const extra = shots.length ? `<div class="case-gallery">${shots.map(([id, label]) => `<figure>${picture2({ id, alt: label }, false, "(max-width: 740px) calc(100vw - 40px), 48vw")}<figcaption>${e2(label)}</figcaption></figure>`).join("")}</div>` : "";
      pages.push(page(lang, "work/" + p.id, p.name, p.description, head(lang, p.label, p.name, p.title) + `<section class="case-intro"><p>${e2(p.description)}</p><div><ul class="deliverables">${p.deliverables.map((x) => `<li>${e2(x)}</li>`).join("")}</ul><a class="text-link" href="${e2(p.url)}">${e2(p.cta)} ${arrow2}</a></div></section><figure class="case-cover">${picture2(p, true, "calc(100vw - 64px)")}</figure>` + extra + `<a class="case-back text-link" href="${path2(lang, "work")}">${e2(c.nav.work)} ${arrow2}</a>` + script));
    }
  }
  const about = site2.pages.find((p) => p.path === "/about");
  if (about) {
    const publicBody = about.body.split("\n\n").filter((block) => !block.startsWith("The machine-readable files below")).join("\n\n");
    const spanishBody = `Soy Lautaro G\xE4rtner, desarrollador de software y creador independiente de Crespo, Argentina. Desarrollo sitios web, aplicaciones y herramientas a medida para negocios y para mis propios experimentos.

## Trabajo

Trabajo directamente con personas que necesitan software para resolver un problema concreto: un sitio claro para su negocio, un cat\xE1logo, una p\xE1gina para un evento, un sistema de presupuestos o una aplicaci\xF3n a medida. Me importa que el resultado sea comprensible y \xFAtil, incluidas las partes menos vistosas, como los dominios, el despliegue, la anal\xEDtica y la entrega de la propiedad real del proyecto.

## Software y escritura

Trabajo principalmente con TypeScript, React, Node.js, Ruby on Rails y SQL. Los art\xEDculos de este sitio tratan sobre ingenier\xEDa de software, decisiones de producto, sistemas que los agentes pueden interpretar y aprendizajes al crear y operar productos peque\xF1os.

Paideia Framework es uno de esos proyectos: un experimento de software generado que puede describir su propia estructura y ejecuci\xF3n. Influye en algunos de los ensayos de este sitio, pero es un proyecto entre los distintos trabajos reunidos aqu\xED.

## Contacto

Para un proyecto, una colaboraci\xF3n o una conversaci\xF3n, escribime a [contact@lautarogartner.com](mailto:contact@lautarogartner.com) o encontrame en [LinkedIn](https://www.linkedin.com/in/lautarogartner).`;
    for (const lang of ["en", "es"]) {
      const translated = { ...about, path: path2(lang, "about"), title: lang === "es" ? "Sobre m\xED" : about.title, body: lang === "es" ? spanishBody : publicBody, description: lang === "es" ? "Desarrollador de software independiente en Crespo, Argentina. Sitios web, aplicaciones y herramientas a medida, y art\xEDculos sobre software y producto." : about.description, tokenSummary: lang === "es" ? "Sobre Lautaro G\xE4rtner, desarrollador independiente de Argentina que crea sitios web, aplicaciones y herramientas y escribe sobre software." : about.tokenSummary, language: lang };
      const rendered = generateSitePage(site2, translated);
      const html = rendered.match(/<main id="content" tabindex="-1">([\s\S]*?)<\/main>/)[1].replace(/<p class="agent-files">[\s\S]*?<\/p>/, "");
      pages.push({ ...translated, html, shell: "wide", nav: false, headerHtml: nav(lang, "about") + `<div class="about-orbit">${globe}<p>Crespo, Argentina</p></div>`, footerHtml: foot(lang), alternates: [{ language: "en", path: "/about" }, { language: "es", path: "/es/about" }, { language: "x-default", path: "/about" }], structuredData: graph(lang, "about", translated.title) });
    }
  }
  const writing = site2.pages.find((p) => p.path === "/writing");
  if (writing) pages.push({ ...writing, headerHtml: nav("en", "writing"), footerHtml: foot("en", { sales: false }) });
  for (const [alias, canonical] of [["/web", "/"], ["/web/es", "/es"]]) pages.push({ ...pages.find((p) => p.path === canonical), path: alias, canonicalPath: canonical });
  return { ...site2, headerHtml: nav("en", "writing"), footerHtml: foot("en", { sales: false, writing: true }), pages };
}

// site/presentation.mjs
var copy = JSON.parse("{\n  \"en\": {\n    \"hero\": {\n      \"Eyebrow\": \"Lautaro G\u00e4rtner \u00b7 Independent developer\",\n      \"H1\": \"Turn more visitors into sales enquiries.\",\n      \"Body\": \"I help service businesses fix the friction between an interested visitor and a completed quote or contact request. One focused improvement to the website you already have.\",\n      \"Primary CTA\": \"Send me your page\",\n      \"Secondary CTA\": \"See the work\",\n      \"Small line\": \"For service businesses with an existing website and traffic. Based in Crespo, Argentina.\"\n    },\n    \"problem\": {\n      \"heading\": \"They were interested. What stopped them?\",\n      \"body\": \"A hard-to-use mobile form, repeated questions, an unclear next step or a request that fails to arrive can interrupt a sales enquiry. I look at the existing flow and fix the obstacle we can actually verify.\"\n    },\n    \"offer\": {\n      \"heading\": \"One enquiry flow. A focused conversion fix.\",\n      \"label\": \"Enquiry Conversion Sprint\",\n      \"body\": \"We choose one quote or contact flow, identify a useful improvement, and I implement it on your existing website. We check that requests can be completed and received, and agree how to measure what changes.\",\n      \"pricing\": \"The sprint is quoted after reviewing your flow. Small, isolated fixes start at USD 100. Scope, price and delivery date are agreed before work begins.\",\n      \"boundary\": \"A new website, new integrations or ongoing experimentation are scoped separately.\",\n      \"CTA\": \"Discuss your enquiry flow\",\n      \"scope\": [\n        \"One existing page and enquiry flow.\",\n        \"One agreed improvement, implemented and checked on desktop and mobile.\",\n        \"A clear handoff and measurement plan using the data you already have.\"\n      ]\n    },\n    \"process\": {\n      \"heading\": \"Find the friction. Ship the fix. Check the result.\",\n      \"steps\": [\n        [\n          \"Start with the real flow.\",\n          \"Send the page and tell me what a useful enquiry looks like. We review the current experience and any available traffic and submission data.\"\n        ],\n        [\n          \"Agree one change.\",\n          \"We define the improvement, the delivery checks, the scope and the price. I implement it on your existing site.\"\n        ],\n        [\n          \"Measure without guessing.\",\n          \"We verify the working flow and review the available evidence. If traffic is too low to establish a conversion lift, the report says so.\"\n        ]\n      ],\n      \"ownership\": \"Your domain, accounts and source code stay in your hands. Any ongoing services or costs are agreed separately.\"\n    },\n    \"work\": {\n      \"heading\": \"Work you can explore\",\n      \"intro\": \"Published websites and an own product in beta. Here\u2019s what I built and what you can explore.\"\n    },\n    \"contact\": {\n      \"heading\": \"Where does an interested visitor get stuck?\",\n      \"body\": \"Send your page and tell me what you want visitors to do. If you know your traffic or current enquiry numbers, include them. We can define a useful first change from there.\",\n      \"CTA\": \"Send me your page\",\n      \"secondary\": \"Copy email\",\n      \"success\": \"Email copied\",\n      \"failure\": \"Select and copy the email address below.\",\n      \"subject\": \"Improve my enquiry flow\",\n      \"mailBody\": \"Hi Lautaro,\\n\\nPage URL:\\nWhat visitors should do:\\nWhat seems to get in the way:\\nTraffic or enquiries, if known:\\n\",\n      \"email\": \"contact@lautarogartner.com\"\n    },\n    \"about\": {\n      \"heading\": \"The person doing the work.\",\n      \"body\": \"I\u2019m Lautaro, an independent developer based in Crespo, Argentina. I build websites and small software products, with attention to the details that make a flow usable and reliable. You work directly with me, from the agreed change to the handoff.\"\n    },\n    \"faq\": [\n      {\n        \"question\": \"Will this bring me more traffic?\",\n        \"answer\": \"This work focuses on helping the visitors you already receive complete a useful enquiry. Advertising, traffic acquisition and a full website rebuild are outside the sprint.\"\n      },\n      {\n        \"question\": \"Do you guarantee a percentage increase?\",\n        \"answer\": \"No. I commit to the agreed implementation and checks. We can measure the effect when the traffic and data allow it; results depend on the offer, audience and existing flow.\"\n      },\n      {\n        \"question\": \"What if my website has little traffic?\",\n        \"answer\": \"We can still repair a clear technical or usability problem. We should judge that job by whether the agreed problem is fixed, rather than claim a conversion increase that the data cannot establish.\"\n      },\n      {\n        \"question\": \"How much does it cost?\",\n        \"answer\": \"I quote the sprint after reviewing the flow. Small, isolated fixes start at USD 100. A broader redesign, new tracking setup or ongoing testing needs its own scope.\"\n      },\n      {\n        \"question\": \"Can you work on my current website?\",\n        \"answer\": \"Yes, when the platform and access allow it. I check that before proposing the work. You receive the agreed changes, relevant access and a clear handoff.\"\n      }\n    ],\n    \"projects\": [\n      {\n        \"name\": \"Tiki C\u00f3ctel Show\",\n        \"id\": \"tiki\",\n        \"url\": \"https://www.tikicoctelshow.com/\",\n        \"label\": \"Event services \u00b7 Live website\",\n        \"title\": \"From event details to a clear quote.\",\n        \"description\": \"A website for a cocktail service with a configurator for guest count, service options and extras, plus an estimated total and a prepared WhatsApp handoff.\",\n        \"cta\": \"Explore Tiki\u2019s website\",\n        \"deliverables\": [\n          \"Service selection and quote calculator\",\n          \"PDF proposal flow\",\n          \"A clear path from inquiry to personal confirmation\"\n        ],\n        \"alt\": \"Tiki C\u00f3ctel Show homepage with access to the event quote flow\"\n      },\n      {\n        \"name\": \"Luc\u00eda Frick / Luli Digital\",\n        \"id\": \"lucia\",\n        \"url\": \"https://luciafrick.com/\",\n        \"label\": \"Professional services \u00b7 Live website\",\n        \"title\": \"A website with a clear visual identity.\",\n        \"description\": \"A personal website for Luli Digital that brings together Luc\u00eda\u2019s services, visual identity and contact options, with attention to mobile navigation and accessible motion.\",\n        \"cta\": \"Explore Luc\u00eda\u2019s website\",\n        \"deliverables\": [\n          \"Responsive website\",\n          \"Service and contact structure\",\n          \"Mobile navigation and motion refinements\"\n        ],\n        \"alt\": \"Luli Digital homepage presenting Luc\u00eda\u2019s services and visual identity\"\n      },\n      {\n        \"name\": \"Filsen\",\n        \"id\": \"filsen\",\n        \"url\": \"https://filsen.com.ar/\",\n        \"label\": \"Own product \u00b7 Beta\",\n        \"title\": \"A local marketplace, from discovery to orders.\",\n        \"description\": \"A marketplace for discovering local businesses, exploring merchant storefronts and product catalogues, and placing orders. Appointment booking is one feature within the broader product. Built as my own product and currently in beta.\",\n        \"cta\": \"Explore Filsen\",\n        \"deliverables\": [\n          \"Local business and product discovery\",\n          \"Merchant storefronts and product catalogues\",\n          \"Order flow and appointment booking\"\n        ],\n        \"alt\": \"Filsen local marketplace with business discovery and merchant storefronts\"\n      }\n    ],\n    \"nav\": {\n      \"offer\": \"Offer\",\n      \"work\": \"Work\",\n      \"writing\": \"Writing\",\n      \"contact\": \"Contact\"\n    },\n    \"anchors\": {\n      \"offer\": \"offer\",\n      \"work\": \"work\",\n      \"about\": \"about-me\",\n      \"contact\": \"contact\"\n    },\n    \"seo\": {\n      \"title\": \"Lautaro G\u00e4rtner | Website Enquiry Conversion\",\n      \"description\": \"Focused improvements to existing quote and contact flows for service businesses. Explore real work and discuss a measurable website change with Lautaro G\u00e4rtner.\"\n    }\n  },\n  \"es\": {\n    \"hero\": {\n      \"Eyebrow\": \"Lautaro G\u00e4rtner \u00b7 Desarrollador independiente\",\n      \"H1\": \"Convert\u00ed m\u00e1s visitas en consultas comerciales.\",\n      \"Body\": \"Ayudo a negocios de servicios a corregir las trabas entre una visita interesada y una consulta enviada. Una mejora concreta en la web que ya ten\u00e9s.\",\n      \"Primary CTA\": \"Mandame tu p\u00e1gina\",\n      \"Secondary CTA\": \"Ver trabajos\",\n      \"Small line\": \"Para negocios de servicios que ya tienen web y visitas. Desde Crespo, Argentina.\"\n    },\n    \"problem\": {\n      \"heading\": \"Hab\u00eda inter\u00e9s. \u00bfQu\u00e9 fren\u00f3 la consulta?\",\n      \"body\": \"Un formulario inc\u00f3modo en celular, preguntas repetidas, un pr\u00f3ximo paso confuso o una solicitud que no llega pueden cortar una consulta comercial. Reviso el recorrido actual y corrijo la traba que podamos comprobar.\"\n    },\n    \"offer\": {\n      \"heading\": \"Un flujo de consultas. Una mejora concreta.\",\n      \"label\": \"Mejora de conversi\u00f3n de consultas\",\n      \"body\": \"Elegimos un flujo de contacto o solicitud de presupuesto, identificamos una mejora \u00fatil y la implemento en tu web actual. Verificamos que las consultas se puedan completar y recibir, y acordamos c\u00f3mo medir el cambio.\",\n      \"pricing\": \"Cotizo la mejora despu\u00e9s de revisar el flujo. Los arreglos peque\u00f1os y aislados parten de USD 100. Acordamos alcance, precio y fecha de entrega antes de empezar.\",\n      \"l\u00edmite\": \"Un sitio nuevo, nuevas integraciones o experimentos continuos se cotizan aparte.\",\n      \"CTA\": \"Hablemos de tu flujo de consultas\",\n      \"scope\": [\n        \"Una p\u00e1gina y un flujo de consultas existentes.\",\n        \"Una mejora acordada, implementada y revisada en desktop y celular.\",\n        \"Una entrega clara y un plan de medici\u00f3n con los datos que ya ten\u00e9s.\"\n      ]\n    },\n    \"process\": {\n      \"heading\": \"Encontrar la traba. Corregirla. Revisar qu\u00e9 cambi\u00f3.\",\n      \"steps\": [\n        [\n          \"Empezamos por el recorrido real.\",\n          \"Mandame la p\u00e1gina y contame qu\u00e9 consulta te sirve. Revisamos la experiencia actual y los datos disponibles de visitas y solicitudes.\"\n        ],\n        [\n          \"Definimos un cambio.\",\n          \"Acordamos la mejora, c\u00f3mo verificar la entrega, el alcance y el precio. La implemento sobre tu sitio actual.\"\n        ],\n        [\n          \"Medimos sin adivinar.\",\n          \"Verificamos que el flujo funcione y revisamos la evidencia disponible. Si el tr\u00e1fico no alcanza para demostrar una mejora de conversi\u00f3n, el informe lo aclara.\"\n        ]\n      ],\n      \"ownership\": \"El dominio, las cuentas y el c\u00f3digo quedan en tus manos. Los servicios o costos de mantenimiento se acuerdan aparte.\"\n    },\n    \"work\": {\n      \"heading\": \"Trabajo que pod\u00e9s ver\",\n      \"intro\": \"Sitios publicados y un producto propio en beta. Qu\u00e9 constru\u00ed y qu\u00e9 pod\u00e9s explorar en cada uno.\"\n    },\n    \"contact\": {\n      \"heading\": \"\u00bfD\u00f3nde se frena una visita interesada?\",\n      \"body\": \"Mandame tu p\u00e1gina y contame qu\u00e9 quer\u00e9s que haga quien la visita. Si conoc\u00e9s las visitas o consultas actuales, sum\u00e1 esos datos. Con eso podemos definir una primera mejora \u00fatil.\",\n      \"CTA\": \"Mandame tu p\u00e1gina\",\n      \"secondary\": \"Copiar email\",\n      \"success\": \"Email copiado\",\n      \"failure\": \"Seleccion\u00e1 y copi\u00e1 el email que aparece abajo.\",\n      \"subject\": \"Mejorar el flujo de consultas\",\n      \"mailBody\": \"Hola Lautaro,\\n\\nURL de la p\u00e1gina:\\nQu\u00e9 deber\u00edan hacer las visitas:\\nQu\u00e9 parece trabarse:\\nVisitas o consultas, si conozco el dato:\\n\",\n      \"email\": \"hola@lautarogartner.com\"\n    },\n    \"about\": {\n      \"heading\": \"La persona que hace el trabajo.\",\n      \"body\": \"Soy Lautaro, desarrollador independiente de Crespo, Argentina. Construyo sitios y peque\u00f1os productos de software, con atenci\u00f3n a los detalles que hacen que un recorrido sea claro y funcione. Trabaj\u00e1s directamente conmigo, desde el cambio acordado hasta la entrega.\"\n    },\n    \"faq\": [\n      {\n        \"question\": \"\u00bfEsto me va a traer m\u00e1s visitas?\",\n        \"answer\": \"El trabajo apunta a que las visitas que ya recib\u00eds puedan completar una consulta \u00fatil. La publicidad, la generaci\u00f3n de tr\u00e1fico y una reconstrucci\u00f3n completa quedan fuera de este alcance.\"\n      },\n      {\n        \"question\": \"\u00bfGarantiz\u00e1s un porcentaje de mejora?\",\n        \"answer\": \"No. Me comprometo con la implementaci\u00f3n y las verificaciones acordadas. Podemos medir el efecto cuando el tr\u00e1fico y los datos lo permitan; el resultado depende de la oferta, el p\u00fablico y el recorrido actual.\"\n      },\n      {\n        \"question\": \"\u00bfY si mi web tiene pocas visitas?\",\n        \"answer\": \"Igual podemos corregir un problema t\u00e9cnico o de uso bien definido. En ese caso evaluamos si el problema qued\u00f3 resuelto, sin afirmar una mejora de conversi\u00f3n que los datos no alcanzan a demostrar.\"\n      },\n      {\n        \"question\": \"\u00bfCu\u00e1nto cuesta?\",\n        \"answer\": \"Cotizo la mejora despu\u00e9s de revisar el flujo. Los arreglos peque\u00f1os y aislados parten de USD 100. Un redise\u00f1o m\u00e1s amplio, medici\u00f3n nueva o pruebas continuas necesitan su propio alcance.\"\n      },\n      {\n        \"question\": \"\u00bfPod\u00e9s trabajar sobre mi web actual?\",\n        \"answer\": \"S\u00ed, cuando la plataforma y los accesos lo permitan. Lo reviso antes de proponer el trabajo. Recib\u00eds los cambios acordados, los accesos correspondientes y una entrega clara.\"\n      }\n    ],\n    \"projects\": [\n      {\n        \"name\": \"Tiki C\u00f3ctel Show\",\n        \"id\": \"tiki\",\n        \"url\": \"https://www.tikicoctelshow.com/\",\n        \"label\": \"Servicios para eventos \u00b7 Sitio publicado\",\n        \"title\": \"Del evento a un presupuesto claro.\",\n        \"description\": \"Un sitio para un servicio de cocteler\u00eda con selecci\u00f3n de invitados, servicios y adicionales, un total estimado y un resumen preparado para continuar por WhatsApp.\",\n        \"cta\": \"Ver el sitio de Tiki\",\n        \"deliverables\": [\n          \"Selecci\u00f3n de servicios y cotizador\",\n          \"Flujo de propuesta en PDF\",\n          \"Consulta y confirmaci\u00f3n personal bien diferenciadas\"\n        ],\n        \"alt\": \"P\u00e1gina de Tiki C\u00f3ctel Show con acceso al cotizador de eventos\"\n      },\n      {\n        \"name\": \"Luc\u00eda Frick / Luli Digital\",\n        \"id\": \"lucia\",\n        \"url\": \"https://luciafrick.com/\",\n        \"label\": \"Servicios profesionales \u00b7 Sitio publicado\",\n        \"title\": \"Una web con identidad propia.\",\n        \"description\": \"Un sitio para Luli Digital que re\u00fane los servicios, la identidad visual y las formas de contacto de Luc\u00eda, con atenci\u00f3n a la navegaci\u00f3n m\u00f3vil y al movimiento accesible.\",\n        \"cta\": \"Ver el sitio de Luc\u00eda\",\n        \"deliverables\": [\n          \"Sitio adaptable a distintas pantallas\",\n          \"Servicios y contacto bien organizados\",\n          \"Mejoras en navegaci\u00f3n m\u00f3vil y animaciones\"\n        ],\n        \"alt\": \"P\u00e1gina de Luli Digital con los servicios y la identidad visual de Luc\u00eda\"\n      },\n      {\n        \"name\": \"Filsen\",\n        \"id\": \"filsen\",\n        \"url\": \"https://filsen.com.ar/\",\n        \"label\": \"Producto propio \u00b7 Beta\",\n        \"title\": \"Un marketplace local, del descubrimiento al pedido.\",\n        \"description\": \"Un marketplace para descubrir comercios locales, explorar sus tiendas y cat\u00e1logos de productos, y realizar pedidos. Los turnos son una funci\u00f3n dentro del producto. Es un producto propio, actualmente en beta.\",\n        \"cta\": \"Conocer Filsen\",\n        \"deliverables\": [\n          \"Descubrimiento de comercios y productos locales\",\n          \"Tiendas de comercios y cat\u00e1logos de productos\",\n          \"Flujo de pedidos y reserva de turnos\"\n        ],\n        \"alt\": \"Marketplace local Filsen con descubrimiento de comercios y tiendas\"\n      }\n    ],\n    \"nav\": {\n      \"offer\": \"Oferta\",\n      \"work\": \"Trabajos\",\n      \"writing\": \"Notas (en ingl\u00e9s)\",\n      \"contact\": \"Contacto\"\n    },\n    \"anchors\": {\n      \"offer\": \"oferta\",\n      \"work\": \"trabajos\",\n      \"about\": \"sobre-mi\",\n      \"contact\": \"contacto\"\n    },\n    \"seo\": {\n      \"title\": \"Lautaro G\u00e4rtner | M\u00e1s consultas desde tu web\",\n      \"description\": \"Mejoras concretas en p\u00e1ginas y formularios de consulta para negocios de servicios. Mir\u00e1 trabajo real y definamos un cambio medible en tu web.\"\n    }\n  }\n}\n");
var styles = "/* A single visual system for the entire portfolio, not an overlay on the previous theme. */\n:root{font-family:Arial,Helvetica,system-ui,sans-serif;color:var(--text);background:var(--bg);color-scheme:light}\nbody{margin:0;font-size:16px;line-height:1.6;background:var(--bg);color:var(--text)}\n*{box-sizing:border-box}a{color:inherit}button{font-family:inherit}button,a,summary{-webkit-tap-highlight-color:transparent}a:hover{color:var(--accent)}a:focus-visible,button:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:5px}img{display:block;max-width:100%;height:auto}figure{margin:0}svg{flex:none}h1,h2,h3,p{margin-top:0}h1,h2,h3{letter-spacing:-.05em;line-height:1.08;color:var(--text)}p{color:var(--muted)}\n.shell{max-width:860px;margin:0 auto;padding:0 32px 32px}.shell-wide{margin:0 auto}main{min-width:0;flex:1}main:focus{outline:none}.portfolio-header{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:16px 0}.portfolio-header a{display:inline-flex;align-items:center;min-height:44px;text-decoration:none;font-size:13px}.identity{font-size:20px!important;letter-spacing:-.06em;font-weight:700;white-space:nowrap}.identity-dot{height:7px;width:7px;border-radius:100%;margin-left:10px}.portfolio-header nav{display:flex;gap:30px}.header-end{display:flex;align-items:center;gap:30px}.languages{display:flex;align-items:center;gap:8px;font-size:12px}.languages span[aria-current]{font-weight:700}.header-contact{gap:10px}.skip-link{position:absolute;left:24px;top:-100px;z-index:20;background:var(--text);color:var(--bg);padding:12px 18px}.skip-link:focus{top:10px}\n.section-label,.mono{font:10px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.035em}.section-label{color:var(--muted);margin-bottom:25px}.small{font-size:12px;line-height:1.7}.actions{display:flex;align-items:center;gap:28px;flex-wrap:wrap}.button{display:inline-flex;align-items:center;justify-content:center;gap:20px;min-height:54px;padding:15px 23px;background:var(--text);color:var(--bg);font-size:13px;text-decoration:none;font-weight:500}.button:hover{background:var(--accent);color:white}.text-link{display:inline-flex;align-items:center;gap:18px;min-height:44px;font-size:13px;text-decoration:none;font-weight:500}.text-link:hover{color:var(--accent)}.hero-note{margin:24px 0 0;max-width:440px}\n.section-grid{display:grid;grid-template-columns:1fr 1fr;gap:10%;border-top:1px solid var(--line)}.section-grid h2{font-size:clamp(36px,4.5vw,64px);font-weight:400;margin-bottom:24px}.lede{font-size:20px;line-height:1.5}.offer-label{font-size:13px;text-transform:uppercase;letter-spacing:.03em;margin-bottom:22px}.scope{list-style:none;padding:0;margin:32px 0}.scope li{position:relative;padding:17px 0 17px 24px;border-top:1px solid var(--line);font-size:14px}.scope li:before{content:'+';position:absolute;left:0;color:var(--accent);font-size:18px}.pricing{font-size:15px;color:var(--text)}.offer .small{margin-bottom:20px}.process{border-top:1px solid var(--line)}.process h2{font-size:clamp(36px,4.5vw,64px);font-weight:400;max-width:820px}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:50px;margin-top:45px}.steps article{border-top:1px solid var(--line);padding-top:20px}.steps .mono{display:block;font:46px/1 Arial,Helvetica,sans-serif;letter-spacing:-.06em;margin-bottom:36px;color:var(--accent)}.steps h3{font-size:26px;font-weight:400;margin-bottom:18px}.steps p{font-size:14px;line-height:1.65}.ownership{font:11px/1.6 ui-monospace,monospace;padding-top:30px;margin:0;max-width:600px}\n.work{border-top:1px solid var(--line)}.work-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:60px;margin-bottom:40px}.work-heading h2{max-width:600px;margin:0;font-weight:400;line-height:1}.work-heading>p{max-width:300px;font-size:14px;margin:0}.project{display:grid;align-items:center;border-top:1px solid var(--line)}.project-copy{padding:16px 0}.project-copy .section-label{margin-bottom:25px}.project-name{font-size:12px;text-transform:uppercase;letter-spacing:.035em;margin-bottom:15px;color:var(--text)}.project h3{margin-bottom:22px}.project-copy>p:not(.project-name):not(.section-label):not(.small){font-size:15px;line-height:1.6}.project-copy>p.small{font-size:11px}.deliverables{font-size:12px;color:var(--muted);list-style:none;padding:0;margin:26px 0}.deliverables li{padding:6px 0;border-top:1px solid var(--line)}.project-image{overflow:hidden}.project-image img{width:100%;aspect-ratio:1.6;object-fit:cover}.evidence-note{border-top:1px solid var(--line);padding-top:24px;margin:0;font:10px/1.7 ui-monospace,monospace;max-width:700px}\n.about .text-link{margin-top:15px}.faq details{border-top:1px solid var(--line);padding:18px 0}.faq details:last-child{border-bottom:1px solid var(--line)}.faq summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:18px;font-size:16px;min-height:44px;cursor:pointer;color:var(--text)}.faq summary::-webkit-details-marker{display:none}.faq summary:after{content:'+';font:24px/1 Arial;flex:none}.faq details[open] summary:after{content:'\u2212'}.faq details p{font-size:14px;margin:16px 25px 8px 0;line-height:1.7}.contact .section-label{color:#babdb6}.contact p{color:#babdb6}.contact .lede{max-width:650px;font-size:18px}.contact .actions{margin-top:36px}.contact .button{background:#f0eee8;color:#171917}.contact .button:hover{background:white}.copy-email{min-height:48px;border:0;border-bottom:1px solid #969b90;background:none;color:#eef0e7;font-size:13px;cursor:pointer;padding:10px 0}.email-address{display:inline-block;margin-top:25px;overflow-wrap:anywhere;text-decoration:none;color:#eef0e7;font-size:14px}.copy-status{min-height:22px;margin:8px 0 0}.contact a:hover{color:white}.recent-writing{display:grid;grid-template-columns:1fr 1fr;gap:10%;border-top:1px solid var(--line)}.recent-writing h2{font-weight:400;font-size:40px;max-width:400px}.recent-writing article,.writing-list article{border-top:1px solid var(--line);padding:24px 0}.recent-writing time,.writing-list time{font:10px ui-monospace,monospace;color:var(--muted)}.recent-writing h3{font-size:20px;font-weight:400;line-height:1.4;margin:14px 0 0}.recent-writing a,.writing-list a{text-decoration:none}.portfolio-footer{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;border-top:1px solid var(--line);font-size:12px}.portfolio-footer strong{font-size:17px;letter-spacing:-.04em}.portfolio-footer p{margin:12px 0}.portfolio-footer nav{display:flex;gap:24px;flex-wrap:wrap}.portfolio-footer a{display:inline-flex;align-items:center;min-height:44px;text-decoration:none}.page-title{font-size:clamp(40px,5vw,66px);font-weight:450;margin-top:65px}.page-body,.post-body{font-size:17px;line-height:1.85}.page-body h2,.post-body h2{font-size:28px;font-weight:450;margin-top:40px}.post-title{font-size:clamp(36px,4vw,58px);font-weight:450;margin-top:50px}.writing-list{margin:40px 0 70px}.writing-list h2{font-size:30px;line-height:1.25;font-weight:450;margin-top:18px}.writing-list p{font-size:15px}section[id],article[id]{scroll-margin-top:25px}\n/* Original scene choreography, using the portfolio's own screenshots. */\n:root{--bg:#f0eee8;--text:#191918;--muted:#595952;--accent:#2144d5;--line:#cac8be;--soft:#e5e5dc}\nhtml{scroll-behavior:smooth}\n.shell-wide{max-width:1600px;padding:0 32px 32px}\n.portfolio-header{min-height:92px;border:0;margin:0;position:relative;z-index:5}\n.portfolio-header a{transition:color .25s}\n.portfolio-header nav a:after{content:'';height:1px;background:currentColor;position:absolute;bottom:8px;left:0;width:100%;transform:scaleX(0);transform-origin:left;transition:transform .3s}\n.portfolio-header nav a{position:relative}\n.portfolio-header nav a:hover:after,.portfolio-header nav a:focus-visible:after{transform:scaleX(1)}\n.identity-dot{background:var(--accent);animation:none}\n.hero.motion-scene{display:block;position:relative;padding:0;min-height:440px;height:calc(100svh - 92px);max-height:1000px;isolation:isolate;border-top:1px solid var(--line);overflow:clip}\n.scene-topline,.scene-bottomline{position:absolute;left:0;right:0;display:flex;justify-content:space-between;gap:16px;align-items:center;font:11px/1.5 ui-monospace,SFMono-Regular,monospace;letter-spacing:.02em;z-index:4}\n.scene-topline{top:22px}.scene-bottomline{bottom:22px}.scene-bottomline p{margin:0;font:inherit;color:var(--muted)}\n.scene-coordinate{color:var(--muted)}\n.scene-center{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:3}\n.scene-overview{text-align:center;width:66%;max-width:950px;transition:opacity .5s,transform .7s cubic-bezier(.2,.7,.2,1),filter .5s}\n.motion-scene h1{font-size:clamp(52px,6.8vw,112px);font-weight:550;line-height:.98;letter-spacing:-.068em;margin:0 auto 28px;max-width:950px;text-wrap:balance}\n.scene-scroll{pointer-events:auto;font-weight:450;gap:26px}\n.scene-context{position:absolute;width:52%;text-align:center;opacity:0;visibility:hidden;transform:translateY(30px);transition:opacity .4s,transform .65s cubic-bezier(.2,.7,.2,1),visibility .4s;pointer-events:none}\n.scene-context h2{font-size:clamp(56px,7vw,110px);font-weight:500;line-height:1;max-width:none;margin:14px auto;letter-spacing:-.07em;text-wrap:balance}\n.scene-context .section-label{margin:0;font-size:10px}.scene-context>p:not(.section-label){max-width:350px;margin:18px auto 10px;font-size:15px}.scene-context a{pointer-events:auto}\n.scene-projects{position:absolute;inset:0;pointer-events:none;z-index:2}\n.scene-tile{position:absolute;width:23%;padding:0;border:0;background:none;text-align:left;color:var(--text);cursor:pointer;pointer-events:auto;transition:opacity .45s,filter .6s;--float-x:0px;--float-y:0px;font:inherit}\n.scene-tile--tiki{left:1.5%;top:11%;width:25%}.scene-tile--lucia{right:2%;bottom:11%;width:26%}.scene-tile--filsen{right:4%;top:10%;width:19%}\n.scene-tile-image{display:block;overflow:hidden;background:var(--line);transform:translate(var(--float-x),var(--float-y));transition:transform .7s cubic-bezier(.2,.7,.2,1),box-shadow .4s;box-shadow:0 5px 20px #161c1710}\n.scene-tile img{aspect-ratio:1.6;object-fit:cover;width:100%;transition:transform .9s cubic-bezier(.2,.7,.2,1)}\n.scene-tile:hover img,.scene-tile:focus-visible img{transform:scale(1.035)}\n.scene-tile:hover .scene-tile-image,.scene-tile:focus-visible .scene-tile-image{box-shadow:0 16px 32px #161c1720}\n.scene-tile-label{display:flex;justify-content:space-between;gap:12px;font:10px/1.5 ui-monospace,monospace;margin-top:12px;text-transform:uppercase}\n.scene-collages{position:absolute;inset:0;pointer-events:none;z-index:1}.scene-collage{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity .55s,visibility .55s}\n.scene-frame{position:absolute;width:20%;overflow:hidden;background:var(--line);transform:translateY(42px) scale(.94);transition:transform .85s cubic-bezier(.2,.7,.2,1)}\n.scene-frame--a{top:9%;right:3%;width:27%;height:22%}.scene-frame--b{bottom:11%;left:5%;height:22%;width:23%}\n.scene-frame img{width:100%;height:100%;object-fit:cover;object-position:top}.scene-frame--b img{transform:scale(1.8);object-position:center}\n[data-collage=\"lucia\"] .scene-frame--a{right:4%;top:12%}[data-collage=\"lucia\"] .scene-frame--b{left:2%;top:14%;bottom:auto;height:26%}\n[data-collage=\"filsen\"] .scene-frame--a{right:2%;top:auto;bottom:11%}[data-collage=\"filsen\"] .scene-frame--b{left:3%;top:12%;bottom:auto}\n.motion-scene:not([data-focus=\"overview\"]) .scene-overview{opacity:0;transform:translateY(-20px);filter:blur(4px);pointer-events:none}\n.motion-scene:not([data-focus=\"overview\"]) .scene-overview a{pointer-events:none}\n.motion-scene:not([data-focus=\"overview\"]) .scene-tile{opacity:0;pointer-events:none;filter:blur(3px)}\n.motion-scene[data-focus=\"tiki\"] [data-project=\"tiki\"],.motion-scene[data-focus=\"lucia\"] [data-project=\"lucia\"],.motion-scene[data-focus=\"filsen\"] [data-project=\"filsen\"]{opacity:1;pointer-events:auto;filter:none}\n.motion-scene[data-focus=\"tiki\"] [data-context=\"tiki\"],.motion-scene[data-focus=\"lucia\"] [data-context=\"lucia\"],.motion-scene[data-focus=\"filsen\"] [data-context=\"filsen\"]{opacity:1;visibility:visible;transform:none}\n.motion-scene[data-focus=\"tiki\"] [data-collage=\"tiki\"],.motion-scene[data-focus=\"lucia\"] [data-collage=\"lucia\"],.motion-scene[data-focus=\"filsen\"] [data-collage=\"filsen\"]{opacity:1;visibility:visible}\n.motion-scene:not([data-focus=\"overview\"]) .scene-frame{transform:none}\n.scene-context h2 .scene-char{display:inline-block;opacity:0;transform:translateY(.55em);transition:opacity .28s,transform .42s cubic-bezier(.16,1,.3,1);transition-delay:0ms}\n.motion-scene[data-focus=\"tiki\"] [data-context=\"tiki\"] h2 .scene-char,.motion-scene[data-focus=\"lucia\"] [data-context=\"lucia\"] h2 .scene-char,.motion-scene[data-focus=\"filsen\"] [data-context=\"filsen\"] h2 .scene-char{opacity:1;transform:none;transition-delay:calc(min(var(--char),12)*20ms)}\n.motion-scene:not([data-focus=\"overview\"]) .scene-tile{transition-delay:calc(var(--order)*45ms)}\n.scene-frame--b{transition-delay:60ms}\n.scene-overview{width:46%;max-width:720px}\n.motion-scene h1{font-size:clamp(48px,4.8vw,76px);line-height:1.02}\n.scene-context{width:46%}.scene-context h2{font-size:clamp(48px,4.6vw,74px)}\n.scene-tile--tiki{left:1.5%;top:9%;width:22%}.scene-tile--filsen{right:2%;top:9%;width:18%}.scene-tile--lucia{right:1.5%;bottom:10%;width:22%}\n.scene-frame--a{right:1.5%;top:9%;width:22%;height:auto;aspect-ratio:1.6}\n.scene-frame--b{left:1.5%;bottom:10%;width:22%;height:auto;aspect-ratio:1.6}\n.scene-frame img{object-fit:contain;object-position:center}.scene-frame--b img{transform:none}\n.scene-frame{overflow:visible;background:none}.scene-frame img{height:auto;aspect-ratio:1.6}.scene-frame figcaption{font:10px/1.5 ui-monospace,monospace;margin-top:12px;color:var(--muted)}\n.scene-reset{background:none;border:0;border-bottom:1px solid currentColor;color:var(--text);padding:10px 0;cursor:pointer;font:inherit;min-height:44px;opacity:0;visibility:hidden;transition:opacity .3s}.scene-reset span{margin-left:15px;font:20px sans-serif}\n.motion-scene:not([data-focus=\"overview\"]) .scene-reset{opacity:1;visibility:visible}\n.hero-intro{display:grid;grid-template-columns:1fr 1fr;gap:15%;padding:64px 5% 80px;border-top:1px solid var(--line)}.hero-intro .hero-body{font-size:22px;max-width:620px;line-height:1.5;margin:0}.hero-intro .actions{margin-top:0}.hero-intro .hero-note{max-width:450px}\n.work{padding:60px 5%}.work-heading h2{font-size:clamp(40px,5vw,72px);font-weight:450}.project{gap:8%;padding:70px 0;grid-template-columns:1.2fr 1fr;position:relative}.project-image{padding:0;border-radius:0;background:none}.project-image img{border-radius:0;transition:transform .9s cubic-bezier(.2,.7,.2,1)}.project:hover .project-image img{transform:scale(1.025)}.project h3{font-size:clamp(28px,3.1vw,45px);font-weight:450;line-height:1.1}.project-name{font-weight:500}.project:nth-of-type(even){grid-template-columns:1fr 1.2fr}.project:nth-of-type(even) .project-image{order:2}.project-copy .text-link{border-bottom:1px solid var(--line)}\n.section-grid,.process,.recent-writing{margin-left:5%;margin-right:5%;padding-top:80px;padding-bottom:80px}.steps{gap:60px}.steps h3{font-weight:450;font-size:28px}.contact{margin:30px 5% 90px;padding:70px 5%;border-radius:0;background:var(--soft)}.contact h2{font-weight:450;letter-spacing:-.06em;font-size:clamp(42px,5.6vw,86px)}\n.button{border-radius:0;transition:background .25s,color .25s}.button svg,.text-link svg,.header-contact svg{transition:transform .3s}.button:hover svg,.text-link:hover svg,.header-contact:hover svg{transform:translateX(5px)}\n.portfolio-footer{padding:40px 5%}.recent-writing h2{font-weight:450;font-size:36px}.scene-tile:focus-visible{outline-offset:8px}.hero-intro,.work,.section-grid,.process,.contact,.recent-writing{scroll-margin-top:30px}\n.motion-enter .portfolio-header{animation:scene-header-in .8s cubic-bezier(.2,.7,.2,1) both}.motion-enter .scene-overview{animation:scene-title-in 1.1s .1s cubic-bezier(.16,1,.3,1) both}.motion-enter .scene-tile--tiki .scene-tile-image{animation:scene-image-in 1.2s .18s cubic-bezier(.16,1,.3,1) both}.motion-enter .scene-tile--lucia .scene-tile-image{animation:scene-image-in 1.2s .3s cubic-bezier(.16,1,.3,1) both}.motion-enter .scene-tile--filsen .scene-tile-image{animation:scene-image-in 1.2s .42s cubic-bezier(.16,1,.3,1) both}\n@keyframes scene-header-in{from{transform:translateY(-12px);opacity:.4}to{transform:none;opacity:1}}@keyframes scene-title-in{from{transform:translateY(35px);opacity:.2}to{transform:none;opacity:1}}@keyframes scene-image-in{from{transform:translateY(65px) scale(.93);opacity:.1}to{transform:none;opacity:1}}\n\n@media(min-width:741px) and (max-width:1050px){.scene-overview,.scene-context{width:46%}.motion-scene h1{font-size:clamp(40px,4.6vw,50px)}.scene-context h2{font-size:46px}.hero-intro{gap:8%}.hero-intro .hero-body{font-size:20px}.scene-coordinate{display:none}}\n@media(max-width:740px){.shell-wide{padding:0 20px 24px}.portfolio-header{min-height:105px}.hero.motion-scene{height:calc(90svh - 105px);min-height:640px;max-height:850px}.scene-topline{top:16px;font-size:9px}.scene-topline>span:last-child{display:none}.scene-overview{width:96%;transform:translateY(0)}.motion-scene h1{font-size:clamp(43px,10.6vw,70px);line-height:1.02;margin:0 0 20px}.scene-scroll{font-size:12px}.scene-context{width:88%}.scene-context h2{font-size:clamp(48px,13vw,78px)}.scene-context>p:not(.section-label){font-size:13px;max-width:240px}.scene-context .section-label{font-size:9px}.scene-tile--tiki{left:0;top:9%;width:42%}.scene-tile--filsen{right:0;top:13%;width:34%}.scene-tile--lucia{right:0;bottom:10%;width:45%}.scene-tile-label{font-size:8px;margin-top:8px}.scene-frame--a{top:10%;right:0;width:40%;height:14%}.scene-frame--b{left:0;bottom:11%;width:39%;height:14%}[data-collage=\"lucia\"] .scene-frame--a{top:12%;right:0;width:36%}[data-collage=\"lucia\"] .scene-frame--b{left:0;top:9%;height:14%}[data-collage=\"filsen\"] .scene-frame--a{right:0;bottom:11%;width:43%}[data-collage=\"filsen\"] .scene-frame--b{left:0;top:10%}.scene-bottomline{bottom:12px;font-size:9px;gap:10px}.scene-bottomline p{max-width:175px}.scene-reset{font-size:10px}.hero-intro{grid-template-columns:1fr;padding:35px 0 45px;gap:28px}.hero-intro .hero-body{font-size:18px}.hero-intro .hero-note{font-size:12px}.work{padding:40px 0}.work-heading h2{font-size:40px}.project,.project:nth-of-type(even){grid-template-columns:1fr;padding:40px 0;gap:24px}.project:nth-of-type(even) .project-image{order:0}.project h3{font-size:32px}.section-grid,.process,.recent-writing{margin:0;padding-top:50px;padding-bottom:50px}.contact{margin:25px 0 40px;padding:38px 24px}.contact h2{font-size:40px}.portfolio-footer{padding:30px 0}.steps{gap:28px}}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important}.scene-tile-image{transform:none!important}.motion-scene:not([data-focus=\"overview\"]) .scene-overview{filter:none}}\n\n.scene-word{display:inline-block;white-space:nowrap}.scene-context[data-context=\"lucia\"] h2{font-size:clamp(42px,5vw,78px)}\n@media(max-width:740px){.scene-context[data-context=\"lucia\"] h2{font-size:clamp(36px,10vw,56px)}}\n\n/* Full-page composition: generous editorial rows and a decisive contact close. */\n.problem{background:#e5e2d8;margin:0;padding:80px 5%;gap:10%;border:0}.problem h2{font-size:clamp(38px,5vw,72px);font-weight:400}.problem .lede{align-self:center;max-width:530px}.offer h2{font-size:clamp(40px,5vw,72px);font-weight:400}.contact{background:#171917;color:#eef0e7}.contact h2{color:#eef0e7}.contact .text-link{color:#eef0e7}.contact .small{color:#babdb6}.recent-writing h2{font-size:40px;font-weight:400}.portfolio-header nav a:hover{background:none}.work-heading .section-label{margin-bottom:18px}\n@media(max-width:740px){.shell{padding:0 20px 24px}.portfolio-header{flex-wrap:wrap;gap:4px 18px;min-height:100px;padding:13px 0}.identity{font-size:17px!important}.portfolio-header nav{order:3;width:100%;gap:24px}.header-end{gap:12px}.header-contact{display:none!important}.section-grid,.recent-writing{grid-template-columns:1fr;gap:22px}.work-heading{display:block}.work-heading>p{margin-top:24px;max-width:360px}.steps{grid-template-columns:1fr}.steps .mono{font-size:38px;margin-bottom:20px}.section-grid h2,.process h2{font-size:36px}.lede{font-size:17px}.problem{padding:45px 24px;margin:0 -20px;gap:12px}.problem h2{font-size:38px}.contact h2{font-size:40px}.recent-writing h2{font-size:34px}.portfolio-footer{flex-direction:column;gap:18px}.portfolio-footer nav{gap:20px}.actions{gap:20px}.button{font-size:12px;padding:14px 18px}.project-name{font-size:11px}.page-body,.post-body{font-size:16px}}\n/* Touch gets an editorial sequence, with details directly after its selected image. */\n@media(max-width:740px){\n .hero.motion-scene{display:flex;flex-direction:column;height:auto;min-height:0;max-height:none;overflow:visible;padding:20px 0 30px}\n .scene-topline{position:static;order:-2;margin-bottom:38px}\n .scene-center,.scene-projects{display:contents}\n .scene-overview,.motion-scene:not([data-focus=\"overview\"]) .scene-overview{order:-1;width:100%;text-align:left;opacity:1;transform:none;filter:none;margin-bottom:48px;pointer-events:auto}\n .motion-scene h1{font-size:clamp(46px,12vw,82px);font-weight:500;max-width:620px;line-height:1.02;text-wrap:normal;margin-bottom:22px}\n .motion-scene:not([data-focus=\"overview\"]) .scene-overview a{pointer-events:auto}\n .scene-tile,.motion-scene:not([data-focus=\"overview\"]) .scene-tile{position:relative;inset:auto;width:100%;opacity:1;filter:none;pointer-events:auto;margin:0 0 32px;transition-delay:0ms}\n .scene-tile--tiki{order:1}.scene-tile--lucia{order:3}.scene-tile--filsen{order:5}\n .scene-tile-image{transform:none!important;box-shadow:none;border:1px solid var(--line)}\n .scene-tile-label{font-size:11px;min-height:44px;align-items:center;margin-top:8px}\n .scene-tile[aria-pressed=\"true\"] .scene-tile-image{outline:2px solid var(--accent);outline-offset:4px}\n .scene-tile[aria-pressed=\"true\"] .scene-tile-label{color:var(--accent)}\n .scene-context{display:none;position:relative;width:100%;text-align:left;transform:none;margin:-12px 0 38px;padding:0 0 25px;border-bottom:1px solid var(--line);pointer-events:auto}\n .scene-context[aria-hidden=\"false\"]{display:block}\n .scene-context[data-context=\"tiki\"]{order:2}.scene-context[data-context=\"lucia\"]{order:4}.scene-context[data-context=\"filsen\"]{order:6}\n .scene-context h2,.scene-context[data-context=\"lucia\"] h2{font-size:clamp(36px,9vw,56px);margin:16px 0;text-wrap:balance}\n .scene-context>p:not(.section-label){margin:0 0 12px;max-width:360px;font-size:15px;line-height:1.5}\n .scene-context .text-link{min-height:48px}\n .scene-collages{display:none}.scene-bottomline{position:static;order:7;font-size:10px;align-items:center;min-height:44px}\n .scene-bottomline p{max-width:240px}.scene-reset{font-size:10px;white-space:nowrap}\n}\n\n/* Shared route system: a quiet header, large editorial type and one contact destination. */\n@view-transition{navigation:none}::view-transition-old(root){animation:route-out .22s both}::view-transition-new(root){animation:route-in .5s cubic-bezier(.2,.7,.2,1) both}\n@keyframes route-out{to{opacity:0;transform:translateY(-12px)}}@keyframes route-in{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}\n.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}\n.portfolio-header a[aria-current=page]{color:var(--accent)}.route-head{padding:85px 5% 70px;border-top:1px solid var(--line)}.route-head h1{font-size:clamp(55px,7.8vw,124px);font-weight:400;letter-spacing:-.065em;line-height:1.02;max-width:1120px;margin:0}.route-head .section-label:empty{display:none}.route-head .route-lede{max-width:650px;font-size:20px;line-height:1.6;margin:35px 0 0}.route-head h1{animation:route-in .7s cubic-bezier(.2,.7,.2,1) both}\n.home-summary{display:flex;gap:40px;align-items:center;padding:48px 0;border-top:1px solid var(--line)}.home-summary>p{font-size:17px;line-height:1.5;max-width:650px;margin:0 auto 0 0}.home-summary>.wire-globe{width:54px;height:54px;flex:none;color:var(--text)}.legacy-links{display:flex;gap:24px;flex-wrap:wrap;padding:0 0 35px}.legacy-links a{font-size:12px;text-decoration:none;min-height:44px;display:inline-flex;align-items:center}.legacy-links a[id]{scroll-margin-top:25px}\n.round-link,.round-submit{display:inline-flex;align-items:center;justify-content:center;flex:none;width:90px;height:90px;border-radius:50%;border:1px solid var(--line);background:var(--accent);color:white;text-decoration:none;font-size:28px;transition:transform .4s,background .4s}.round-link:hover,.round-submit:hover{background:var(--text);color:var(--bg);transform:scale(1.04)}\n.work-toolbar{display:flex;justify-content:space-between;gap:25px;padding:0 5% 35px}.work-toolbar>div{display:flex;gap:10px;flex-wrap:wrap}.work-toolbar button{border:1px solid var(--line);border-radius:40px;padding:12px 20px;min-height:48px;background:transparent;color:var(--text);cursor:pointer;font-size:13px}.work-toolbar button[aria-pressed=true]{background:var(--text);color:var(--bg);border-color:var(--text)}.work-index{padding:0 5% 95px;display:grid;grid-template-columns:1fr 1fr;gap:65px 40px}.work-card[hidden]{display:none!important}.work-card a{text-decoration:none}.work-card figure{overflow:hidden;background:var(--soft)}.work-card img{width:100%;aspect-ratio:1.6;object-fit:cover;transition:transform .75s cubic-bezier(.2,.7,.2,1)}.work-card a:hover img{transform:scale(1.035)}.work-card-caption{display:grid;grid-template-columns:1fr auto;gap:15px;border-bottom:1px solid var(--line);padding:24px 0}.work-card h2{font-size:32px;font-weight:400;margin:0;letter-spacing:-.04em}.work-card-caption>span{font-size:30px}.work-card p{grid-column:1/-1;font-size:12px;margin:0}.work-index[data-view=list]{grid-template-columns:1fr;gap:0}.work-index[data-view=list] .work-card a{display:grid;grid-template-columns:180px 1fr;gap:45px;align-items:center;padding:30px 0;border-top:1px solid var(--line)}.work-index[data-view=list] .work-card-caption{border:0}.work-index[data-view=list] .work-card h2{font-size:clamp(30px,4vw,64px)}\n.case-intro{display:grid;grid-template-columns:1fr 1fr;gap:12%;margin:0 5% 75px;border-top:1px solid var(--line);padding-top:35px}.case-intro>p{font-size:22px;line-height:1.6}.case-intro .deliverables{margin-top:0}.case-cover{margin:0 0 60px;background:var(--soft)}.case-cover img{width:100%;height:auto}.case-gallery{display:grid;grid-template-columns:1fr 1fr;gap:35px;padding:0 5% 60px}.case-gallery img{width:100%;height:auto}.case-gallery figcaption{font-size:12px;margin-top:18px}.case-back{margin:0 5% 65px;border-bottom:1px solid var(--line)}\n.contact-layout{display:grid;grid-template-columns:1.6fr 1fr;gap:12%;padding:0 5% 100px}.contact-field{padding:28px 0;border-top:1px solid var(--line)}.contact-field label{display:flex;gap:24px;font-size:20px;margin-bottom:22px}.contact-field label span{font:11px/2 ui-monospace,monospace;color:var(--muted)}.contact-field input,.contact-field textarea{display:block;width:100%;border:0;border-radius:0;padding:10px 0 10px 40px;background:transparent;color:var(--text);font:18px/1.5 Arial,Helvetica,sans-serif;resize:vertical;outline-offset:3px}.contact-field input:focus,.contact-field textarea:focus{outline:2px solid var(--accent)}.round-submit{width:170px;height:170px;font-size:14px;gap:10px;margin-top:10px;cursor:pointer;border:0;line-height:1.5;padding:30px}.round-submit span{font-size:24px}.contact-details{padding-top:28px}.contact-details>.wire-globe{width:86px;height:86px;margin-bottom:65px;color:var(--text)}.contact-details .section-label{margin-top:38px;margin-bottom:15px}.contact-direct{font-size:18px;text-decoration:none;overflow-wrap:anywhere}.contact-details>p:not(.section-label){font-size:17px}.contact-details>a:last-child{font-size:14px;display:inline-block;margin-top:18px}.about-identity{padding:10px 5% 100px;display:flex;gap:40px;align-items:center}.about-identity>.wire-globe{width:180px;height:180px;color:var(--text)}.about-identity p{font-size:20px;margin:0 auto 0 0}\n.shell-wide>.page-title,.shell-wide main>.page-title{font-size:clamp(55px,8vw,124px);font-weight:400;margin:85px 5% 50px}.shell-wide .page-body{max-width:860px;margin:0 5% 100px;font-size:20px;line-height:1.75}.page-body h2{font-size:40px;font-weight:400}.page-body p{color:var(--text)}\n.studio-footer{background:#1c1d20;color:#f0eee8;padding:80px 5% 35px;margin:0 -32px -32px}.footer-invitation{display:flex;justify-content:space-between;gap:40px;align-items:center;padding-bottom:60px;border-bottom:1px solid #55565a}.footer-invitation h2{font-size:clamp(45px,6vw,90px);font-weight:400;color:inherit;max-width:780px;margin:0}.footer-invitation .round-link{width:125px;height:125px;border:0}.footer-meta{display:flex;justify-content:space-between;align-items:center;gap:30px;padding-top:40px;font-size:12px}.footer-meta p{display:flex;gap:15px;align-items:center;color:#b2b2b4;margin:12px 0 0}.footer-meta nav{display:flex;gap:25px}.footer-meta a{min-height:44px;display:inline-flex;align-items:center;text-decoration:none;color:inherit}.footer-meta a:hover{color:#a9baff}.footer-meta .wire-globe{width:24px;height:24px;color:#f0eee8}\n.wire-globe{display:inline-block;position:relative;width:54px;height:54px;border:1px solid currentColor;border-radius:50%;overflow:hidden;transform:rotate(-15deg);animation:globe-axis 5.4s ease-in-out infinite}.globe-equator,.globe-latitude,.globe-meridian{position:absolute;inset:0;border:1px solid currentColor;border-radius:50%}.globe-equator{top:35%;bottom:35%}.globe-latitude--north{top:15%;bottom:65%;left:8%;right:8%}.globe-latitude--south{top:65%;bottom:15%;left:8%;right:8%}.globe-meridian{animation:globe-ring 2.7s linear infinite;animation-delay:calc(var(--ring)*-.9s)}\n@keyframes globe-ring{0%{transform:scaleX(.04)}50%{transform:scaleX(1)}100%{transform:scaleX(.04)}}@keyframes globe-axis{0%,100%{transform:rotate(-15deg)}50%{transform:rotate(15deg)}}\n@media(max-width:740px){.route-head{padding:55px 0 45px}.route-head h1{font-size:clamp(48px,12vw,78px)}.route-head .route-lede{font-size:17px;margin-top:25px}.home-summary{display:grid;grid-template-columns:1fr auto;gap:25px;padding:35px 0}.home-summary>p{grid-column:1/-1;font-size:16px}.home-summary>.wire-globe{display:none}.home-summary .round-link{width:65px;height:65px}.legacy-links{gap:0 20px}.work-toolbar{padding:0 0 30px;flex-direction:column;gap:15px}.work-toolbar button{padding:10px 15px;font-size:12px}.work-index{padding:0 0 65px;grid-template-columns:1fr;gap:40px}.work-card h2{font-size:28px}.work-card-caption{padding:20px 0;gap:12px}.work-index[data-view=list] .work-card a{grid-template-columns:90px 1fr;gap:20px;padding:22px 0}.work-index[data-view=list] .work-card h2{font-size:25px}.work-index[data-view=list] .work-card-caption>span{font-size:22px}.case-intro{grid-template-columns:1fr;gap:20px;margin:0 0 40px;padding-top:25px}.case-intro>p{font-size:18px}.case-cover{margin:0 -20px 35px}.case-gallery{grid-template-columns:1fr;padding:0 0 35px;gap:35px}.case-back{margin-left:0;margin-bottom:45px}.contact-layout{grid-template-columns:1fr;padding:0 0 65px;gap:45px}.contact-field label{font-size:18px;gap:18px}.contact-field input,.contact-field textarea{font-size:16px;padding-left:30px}.contact-details{border-top:1px solid var(--line);padding-top:35px}.contact-details>.wire-globe{width:60px;height:60px;margin-bottom:0}.contact-details .section-label{margin-top:28px}.round-submit{width:140px;height:140px}.about-identity{padding:0 0 65px;gap:24px;flex-wrap:wrap}.about-identity>.wire-globe{width:115px;height:115px}.about-identity p{font-size:17px}.shell-wide main>.page-title{font-size:60px;margin:55px 0 35px}.shell-wide .page-body{margin:0 0 65px;font-size:17px}.page-body h2{font-size:32px}.studio-footer{margin:0 -20px -24px;padding:50px 20px 30px}.footer-invitation{gap:20px;padding-bottom:35px}.footer-invitation h2{font-size:44px}.footer-invitation .round-link{width:78px;height:78px}.footer-meta{flex-wrap:wrap;gap:20px;padding-top:30px}.footer-meta>div{width:100%}.footer-meta nav{gap:20px}}\n@media(prefers-reduced-motion:reduce){::view-transition-old(root),::view-transition-new(root){animation:none}.wire-globe,.globe-meridian{animation:none!important}.globe-meridian:nth-of-type(4){transform:scaleX(.35)}.globe-meridian:nth-of-type(5){transform:scaleX(.7)}}\nbody:has(.route-contact){background:#1c1d20;color:#f0eee8;--bg:#1c1d20;--text:#f0eee8;--muted:#b2b2b4;--line:#55565a;--soft:#292a2e}.route-contact h1{color:var(--text)}.route-contact .route-lede{color:var(--muted)}.route-contact .contact-direct{color:var(--text)}.route-contact input,.route-contact textarea{color:var(--text)}.route-contact .round-submit:hover{background:#f0eee8;color:#1c1d20}.route-contact .round-submit{color:#fff}.scene-topline{justify-content:flex-end}.scene-topline>span{color:var(--muted)}\n/* Article headings must override the framework's fixed 2rem line box. */\n.post-title{line-height:1.12;margin-bottom:24px;overflow-wrap:anywhere}.post-title+.meta{font-size:12px;line-height:1.75;margin-bottom:18px}.post-title~.description{font-size:17px;line-height:1.65;margin-bottom:32px}.post-body h2{line-height:1.25}.post-body h3{line-height:1.3}\n@media(max-width:740px){.post-title{font-size:36px;line-height:1.14;margin-top:42px;margin-bottom:22px}.post-title+.meta{font-size:11px;line-height:1.8}.post-title~.description{font-size:16px;line-height:1.65}}\n.about-orbit{position:absolute;right:max(7vw,40px);top:220px;color:var(--text);pointer-events:none}.about-orbit>.wire-globe{width:150px;height:150px}.contact-field input,.contact-field textarea{padding-left:0}.contact-field label{gap:0}\n@media(max-width:1050px){.about-orbit{position:relative;top:auto;right:auto;display:flex;justify-content:flex-end;padding-top:25px}.about-orbit>.wire-globe{width:65px;height:65px}}\nmain:has(.page-body) .page-body{max-width:min(860px,calc(100% - 230px))}\n@media(max-width:1050px){main:has(.page-body) .page-body{max-width:100%}}\n@media(max-width:740px){.portfolio-header .header-contact{display:inline-flex!important;font-size:12px;gap:6px}.header-end{gap:12px}.scene-topline{margin-bottom:25px}.scene-topline>span{display:inline!important}}\n.studio-footer{border-radius:50% 50% 0 0 / 45px 45px 0 0;padding-top:100px}\n@media(max-width:740px){.studio-footer{border-radius:50% 50% 0 0 / 25px 25px 0 0;padding-top:65px}}\n.contact-location{display:flex;align-items:center;gap:20px}.contact-location .wire-globe{width:50px;height:50px;flex:none}.about-orbit p{font-size:12px;text-align:center;margin:20px 0 0}.round-link>span{transition:transform .45s cubic-bezier(.2,.7,.2,1)}.round-link:hover>span{transform:translate(4px,-4px)}\n@media(max-width:1050px){.about-orbit{gap:18px;align-items:center}.about-orbit p{margin:0}}\n/* Mobile opens with a word reveal and image settling; navigation stays immediately available. */\n@media(max-width:740px){.shell-wide{padding-left:max(20px,env(safe-area-inset-left));padding-right:max(20px,env(safe-area-inset-right))}.hero-word{display:inline-block;overflow:hidden;vertical-align:top}.hero-word>span{display:block;line-height:1.12;padding-bottom:.02em;margin-bottom:-.02em}.motion-enter .portfolio-header,.motion-enter .scene-overview{animation:none}.motion-enter .hero-word>span{animation:mobile-word-in .82s calc(var(--word)*55ms) cubic-bezier(.16,1,.3,1) both;will-change:transform}.motion-enter .scene-tile--tiki .scene-tile-image{animation:mobile-image-in 1.05s .18s cubic-bezier(.16,1,.3,1) both}.motion-enter .scene-tile--lucia .scene-tile-image{animation:mobile-image-in 1.05s .3s cubic-bezier(.16,1,.3,1) both}.motion-enter .scene-tile--filsen .scene-tile-image{animation:mobile-image-in 1.05s .42s cubic-bezier(.16,1,.3,1) both}}\n@keyframes mobile-word-in{from{transform:translate3d(0,115%,0) rotate(3deg)}to{transform:translate3d(0,0,0) rotate(0)}}@keyframes mobile-image-in{from{opacity:.2;transform:translate3d(0,48px,0) scale(.96)}to{opacity:1;transform:translate3d(0,0,0) scale(1)}}\n@media(prefers-reduced-motion:reduce){.hero-word>span{transform:none!important;will-change:auto!important}}\n.footer-local{display:grid;gap:12px;font-size:11px;color:#b2b2b4}.footer-local time{font-size:15px;color:#f0eee8;font-variant-numeric:tabular-nums}.studio-footer--quiet{padding-top:40px;border-radius:0}.studio-footer--quiet .footer-meta{padding-top:0}.writing-back{display:inline-flex;min-height:44px;align-items:center;color:#f0eee8;text-decoration:none;margin-bottom:25px}.header-contact[aria-current]{display:inline-flex;min-height:44px;align-items:center;font-size:13px;color:var(--muted)}\n.signal-mark{display:inline-block;position:relative;flex:none;width:115px;height:100px;perspective:450px;color:var(--text)}.signal-sheet{position:absolute;width:58px;height:70px;left:28px;top:16px;border:1px solid currentColor;border-radius:5px;background:var(--bg);transform-style:preserve-3d;animation:signal-fold 4.8s ease-in-out infinite}.signal-sheet:before{content:'';position:absolute;left:12px;right:12px;top:18px;height:24px;border-top:1px solid currentColor;border-bottom:1px solid currentColor;opacity:.5}.signal-sheet--back{animation-delay:-1.6s;--sheet-x:-20px;--sheet-z:-45px;opacity:.35}.signal-sheet--middle{animation-delay:-.8s;--sheet-x:0px;--sheet-z:-10px;opacity:.6}.signal-sheet--front{--sheet-x:20px;--sheet-z:25px}.signal-pulse{position:absolute;left:20px;top:38px;width:11px;height:11px;background:var(--accent);border-radius:50%;box-shadow:0 0 20px #2144d530;animation:signal-pulse 3.6s cubic-bezier(.4,0,.2,1) infinite}\n@keyframes signal-fold{0%,100%{transform:translate3d(var(--sheet-x),0,var(--sheet-z)) rotateY(-25deg) rotateX(8deg)}50%{transform:translate3d(var(--sheet-x),-8px,var(--sheet-z)) rotateY(25deg) rotateX(-8deg)}}@keyframes signal-pulse{0%,100%{transform:translate3d(-4px,18px,0);opacity:.15}50%{transform:translate3d(60px,-8px,50px);opacity:1}}\n.signal-mark--message{width:155px;height:130px;margin-bottom:30px}.signal-mark--message .signal-sheet{width:95px;height:64px;top:30px;left:25px}.signal-mark--message .signal-sheet:before{width:53px;height:53px;left:20px;top:-24px;border:0;border-right:1px solid currentColor;border-bottom:1px solid currentColor;transform:rotate(45deg);opacity:.65}.signal-mark--message .signal-pulse{border-radius:0;width:18px;height:18px;clip-path:polygon(0 0,100% 50%,0 100%,25% 50%);animation:message-flight 4.8s cubic-bezier(.4,0,.2,1) infinite}\n@keyframes message-flight{0%,100%{transform:translate3d(-5px,48px,0) rotate(-25deg);opacity:0}35%{opacity:1}70%{transform:translate3d(92px,-18px,40px) rotate(-25deg);opacity:1}90%{transform:translate3d(130px,-50px,40px) rotate(-25deg);opacity:0}}\n.motion-graphic,.motion-graphic *{animation-play-state:paused}.motion-graphic.is-motion-visible,.motion-graphic.is-motion-visible *{animation-play-state:running}\n@media(max-width:740px){.home-summary .signal-mark{grid-column:1/-1;justify-self:center;width:140px;height:105px}.signal-mark--message{width:130px;height:105px;margin-bottom:25px}.footer-local{font-size:11px;gap:8px}.studio-footer--quiet{padding-top:35px}}\n/* A deliberate, interruptible entrance; navigation remains usable throughout. */\n.opening-curtain{display:none;pointer-events:none}.mobile-project-media{display:none}\n.hero-word{display:inline-block;overflow:hidden;vertical-align:top}.hero-word>span{display:block;padding-bottom:.02em;margin-bottom:-.02em}\n.motion-enter .opening-curtain{display:flex;position:fixed;inset:0;z-index:70;background:#1c1d20;align-items:center;justify-content:center;color:#f0eee8;border-radius:0 0 50% 50% / 0 0 8% 8%;animation:opening-curtain-out 3.1s cubic-bezier(.76,0,.24,1) both;will-change:transform}\n.opening-greeting{font-size:clamp(64px,9vw,132px);font-weight:450;letter-spacing:-.06em;animation:opening-greeting 2.2s ease both}\n.motion-enter .portfolio-header{position:relative;z-index:80;animation:opening-nav-color 3.1s linear both}\n.motion-enter .scene-overview{animation:none}.motion-enter .hero-word>span{animation:mobile-word-in .9s calc(2.1s + var(--word)*65ms) cubic-bezier(.16,1,.3,1) both;will-change:transform}\n.motion-enter .scene-tile--tiki .scene-tile-image{animation:mobile-image-in 1.1s 2.35s cubic-bezier(.16,1,.3,1) both}.motion-enter .scene-tile--lucia .scene-tile-image{animation:mobile-image-in 1.1s 2.5s cubic-bezier(.16,1,.3,1) both}.motion-enter .scene-tile--filsen .scene-tile-image{animation:mobile-image-in 1.1s 2.65s cubic-bezier(.16,1,.3,1) both}\n@keyframes opening-curtain-out{0%,60%{transform:translateY(0)}100%{transform:translateY(-115%)}}\n@keyframes opening-greeting{0%{opacity:0;transform:translateY(30px)}11%,86%{opacity:1;transform:none}100%{opacity:0;transform:translateY(-30px)}}\n@keyframes opening-nav-color{0%,67%{color:#f0eee8}100%{color:#191918}}\n.motion-enter .portfolio-header a,.motion-enter .portfolio-header span{color:inherit}\n[data-collage] .scene-frame--a{top:9%;right:1.5%;left:auto;bottom:auto;width:22%;height:auto;aspect-ratio:1.6}\n[data-collage] .scene-frame--b{top:auto;left:1.5%;right:auto;bottom:10%;width:22%;height:auto;aspect-ratio:1.6}\n[data-collage=\"filsen\"] .scene-frame--a{left:1.5%;right:auto}[data-collage=\"filsen\"] .scene-frame--b{right:1.5%;left:auto}\n@media(max-width:740px){.mobile-project-media{display:grid;gap:24px;margin-top:24px}.mobile-project-media figure{margin:0}.mobile-project-media img{display:block;width:100%;height:auto;aspect-ratio:1.6}.mobile-project-media figcaption{font:10px/1.5 ui-monospace,monospace;color:var(--muted);margin-top:10px}}\n@media(prefers-reduced-motion:reduce){.motion-enter .opening-curtain{display:none}.hero-word>span{transform:none!important}.motion-enter .portfolio-header{color:var(--text)}}\n/* Shared motion language: magnetic controls, curved navigation and native-scroll sweep. */\n:root{--motion-ease:cubic-bezier(.76,0,.24,1)}\n.brand-roll{position:relative;overflow:hidden;display:inline-block;line-height:1.4}.brand-roll-main,.brand-roll-hover{display:block;transition:transform .55s var(--motion-ease)}.brand-roll-hover{position:absolute;inset:0;transform:translateY(110%)}.brand-roll:hover .brand-roll-main,.brand-roll:focus-visible .brand-roll-main{transform:translateY(-110%)}.brand-roll:hover .brand-roll-hover,.brand-roll:focus-visible .brand-roll-hover{transform:translateY(0)}\n.portfolio-header nav a,.header-contact,.round-link,.round-submit,.floating-menu-button,.menu-close,.site-menu nav a{transform:translate(var(--magnet-x,0px),var(--magnet-y,0px));transition:transform .55s cubic-bezier(.2,.7,.2,1),background .3s,color .3s}\n.portfolio-header nav a{position:relative}.portfolio-header nav a::after{content:'';width:5px;height:5px;border-radius:50%;background:currentColor;position:absolute;left:50%;bottom:0;transform:translate(-50%,7px) scale(0);transition:transform .3s var(--motion-ease)}.portfolio-header nav a:hover::after,.portfolio-header nav a[aria-current]::after{transform:translate(-50%,7px) scale(1)}\n.floating-menu-button{position:fixed;z-index:90;right:24px;top:24px;width:64px;height:64px;border:0;border-radius:50%;background:#1c1d20;color:#f0eee8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;opacity:0;visibility:hidden;scale:.6;cursor:pointer;transition:opacity .4s,scale .6s var(--motion-ease),transform .55s}\n.floating-menu-button::before{content:'';position:absolute;inset:-7px;border:1px solid #8885;border-radius:50%;scale:.88;opacity:0;transition:scale .5s,opacity .5s}.floating-menu-button:hover::before{scale:1;opacity:1}.floating-menu-button span{width:22px;height:1px;background:currentColor}.is-scrolled .floating-menu-button{opacity:1;visibility:visible;scale:1}\n.site-menu{inset:0 0 0 auto;margin:0;width:min(520px,100vw);height:100dvh;max-height:none;max-width:none;padding:0;border:0;background:#1c1d20;color:#f0eee8;overflow:auto;transform:translateX(105%);border-radius:45% 0 0 45%;transition:transform .6s var(--motion-ease),border-radius .6s var(--motion-ease)}.site-menu::backdrop{background:#0007}.menu-visible .site-menu{transform:none;border-radius:0}.menu-inner{padding:105px 55px 45px;min-height:100%;display:flex;flex-direction:column}.menu-inner>.section-label{color:#9b9c9e;padding-bottom:30px;border-bottom:1px solid #ffffff30}.menu-inner nav{display:flex;flex-direction:column;gap:6px;margin:30px 0}.site-menu nav a{color:#f0eee8;text-decoration:none;font-size:clamp(40px,5vw,66px);line-height:1.2;letter-spacing:-.05em;position:relative;align-self:flex-start}.site-menu nav a[aria-current]::before{content:'';position:absolute;left:-25px;top:50%;height:7px;width:7px;border-radius:50%;background:currentColor}.menu-socials{display:flex;gap:30px;margin-top:auto;padding-top:40px}.menu-socials a{color:#f0eee8}.menu-close{position:absolute;right:25px;top:25px;width:64px;height:64px;border-radius:50%;background:#2144d5;color:white;border:0;font-size:32px;cursor:pointer}\n.route-curtain{display:none;pointer-events:none}.route-exit .route-curtain,.route-enter .route-curtain{display:flex;position:fixed;inset:0;z-index:120;background:#1c1d20;align-items:center;justify-content:center;color:#f0eee8;font-size:clamp(42px,8vw,110px);letter-spacing:-.06em;border-radius:50% 50% 0 0 / 8% 8% 0 0;will-change:transform}.route-exit .route-curtain{animation:route-cover .46s var(--motion-ease) both}.route-enter .route-curtain{border-radius:0 0 50% 50% / 0 0 8% 8%;animation:route-reveal .8s var(--motion-ease) both}.route-enter #content{animation:route-content-in .85s var(--motion-ease) both}\n@keyframes route-cover{from{transform:translateY(110%)}to{transform:none}}@keyframes route-reveal{from{transform:none}to{transform:translateY(-115%)}}@keyframes route-content-in{from{opacity:.6;translate:0 35px}to{opacity:1;translate:0 0}}\n.work-view-cursor{position:fixed;left:-38px;top:-38px;width:76px;height:76px;border-radius:50%;z-index:45;background:#2144d5;color:white;display:grid;place-items:center;font-size:13px;pointer-events:none;opacity:0;scale:.3;transition:scale .35s var(--motion-ease),opacity .2s}.work-cursor-visible .work-view-cursor{opacity:1;scale:1}.work-hover-preview{position:fixed;top:0;left:0;width:310px;z-index:40;pointer-events:none;opacity:0;scale:.92;transition:opacity .25s,scale .45s var(--motion-ease);box-shadow:0 20px 50px #0002}.work-hover-preview img{width:100%;height:auto;display:block}.work-preview-visible .work-hover-preview{opacity:1;scale:1}\n@media(hover:hover) and (pointer:fine){.work-cursor-visible .work-card a{cursor:none}}\n.studio-footer{position:relative;isolation:isolate;background:transparent;border-radius:0;overflow:visible}.studio-footer::before{content:'';position:absolute;inset:0;z-index:-1;background:#1c1d20;border-radius:50% 50% 0 0 / var(--footer-bend,110px) var(--footer-bend,110px) 0 0;transform:translateY(var(--footer-shift,45px));pointer-events:none}.footer-invitation,.footer-meta,.writing-back{position:relative;translate:0 calc(var(--footer-shift,45px)*.6)}.studio-footer--quiet::before{border-radius:50% 50% 0 0 / calc(var(--footer-bend,110px)*.35) calc(var(--footer-bend,110px)*.35) 0 0}\n@media(max-width:740px){.floating-menu-button{right:14px;top:14px;width:52px;height:52px}.is-scrolled .floating-menu-button{opacity:1;visibility:visible}.menu-inner{padding:100px 35px 35px}.site-menu nav a{font-size:52px}.menu-close{width:52px;height:52px;right:14px;top:14px}.work-view-cursor,.work-hover-preview{display:none}}\n@media(prefers-reduced-motion:reduce){.brand-roll-main,.brand-roll-hover{transition:none}.route-exit .route-curtain,.route-enter .route-curtain{display:none}.work-view-cursor,.work-hover-preview{display:none}.studio-footer::before{transform:none;border-radius:35px 35px 0 0}.footer-invitation,.footer-meta,.writing-back{translate:none}.site-menu{transition:none}}\n.site-menu{transition:transform .8s cubic-bezier(.7,0,.2,1),border-radius .85s cubic-bezier(.7,0,.2,1)}.menu-inner{transition:translate .6s cubic-bezier(.7,0,.2,1);translate:80px 0}.menu-visible .menu-inner{translate:0 0}.floating-menu-button{transition:opacity .4s,scale .4s cubic-bezier(.34,1.5,.64,1),transform .55s}.menu-visible .floating-menu-button{background:#2144d5}.menu-visible .floating-menu-button span:first-child{transform:translateY(3.5px) rotate(45deg)}.menu-visible .floating-menu-button span:last-child{transform:translateY(-3.5px) rotate(-45deg)}.floating-menu-button span{transition:transform .4s}\n@media(prefers-reduced-motion:reduce){.site-menu,.menu-inner,.floating-menu-button{transition:none}.menu-inner{translate:none}}\n.magnetic-label{display:inline-block;transform:translate(calc(var(--magnet-x,0px)*.5),calc(var(--magnet-y,0px)*.5));transition:transform .55s cubic-bezier(.2,.7,.2,1)}\n.work-hover-preview{height:310px;overflow:hidden;transition:opacity .4s,scale .4s cubic-bezier(.34,1,.64,1),transform .5s cubic-bezier(.2,.7,.2,1)}.work-preview-stack{transform:translateY(calc(var(--preview-index,0)*-310px));transition:transform .5s cubic-bezier(.65,0,.35,1)}.work-hover-preview img{width:310px;height:310px;object-fit:contain;background:#e5e2d8;padding:10px;box-sizing:border-box}.work-view-cursor{width:68px;height:68px;left:-34px;top:-34px;transition:scale .4s cubic-bezier(.34,1,.64,1),opacity .2s,transform .12s cubic-bezier(.2,.7,.2,1)}.work-view-cursor span{display:block}\n@media(hover:hover) and (pointer:fine){.work-index[data-view=list] .work-card:hover{opacity:.4}.work-index[data-view=list] .work-card:hover h2{translate:-7px 0}.work-index[data-view=list] .work-card:hover p{translate:7px 0}.work-card h2,.work-card p{transition:translate .3s var(--motion-ease)}}\n@media(prefers-reduced-motion:reduce){.magnetic-label{transform:none}.work-card h2,.work-card p{translate:none!important;transition:none!important}}\n.brand-roll-hover{transform:translateX(115%)}.brand-roll:hover .brand-roll-main,.brand-roll:focus-visible .brand-roll-main{transform:translateX(-115%)}.brand-roll:hover .brand-roll-hover,.brand-roll:focus-visible .brand-roll-hover{transform:translateX(0)}.brand-roll-main,.brand-roll-hover{transition:transform .5s cubic-bezier(.7,0,.3,1)}\n.route-exit .route-curtain{animation-duration:.65s}.route-enter .route-curtain{animation-duration:1.05s}.route-enter #content{animation-duration:1.05s}.route-exit .route-curtain span{animation:route-label-in .35s .3s both}.route-enter .route-curtain span{animation:route-label-out .45s .15s both}\n@keyframes route-reveal{0%,18%{transform:none}100%{transform:translateY(-115%)}}@keyframes route-label-in{from{opacity:0;translate:0 25px}to{opacity:1;translate:0 0}}@keyframes route-label-out{from{opacity:1;translate:0 0}to{opacity:0;translate:0 -25px}}\n.studio-footer::before{border-radius:0;transform:none}.studio-footer::after{content:'';position:absolute;inset:-1px 0 auto;height:var(--footer-bend,110px);background:#f0eee8;border-radius:0 0 50% 50% / 0 0 100% 100%;z-index:0;pointer-events:none}.studio-footer--quiet::after{height:calc(var(--footer-bend,110px)*.35)}.footer-invitation,.footer-meta,.writing-back{z-index:1}.footer-invitation .round-link{translate:calc((1 - var(--footer-progress,0))*-75px) 0}\n.round-link,.round-submit{position:relative;isolation:isolate;overflow:hidden}.round-link::before,.round-submit::before{content:'';position:absolute;inset:0;border-radius:50%;background:#142c99;transform:translateY(110%);transition:transform .55s var(--motion-ease);z-index:0;pointer-events:none}.round-link:hover::before,.round-submit:hover::before{transform:translateY(0)}.round-link>.magnetic-label,.round-submit>.magnetic-label{position:relative;z-index:1}\n@media(prefers-reduced-motion:reduce){.studio-footer::after{display:none}.footer-invitation .round-link{translate:none}.round-link::before,.round-submit::before{transition:none}}\n/* The brand window sizes to both complete labels, including the hover state. */\n.brand-roll{display:inline-grid;grid-template-columns:max-content;white-space:nowrap;flex-shrink:0;min-height:1.4em}.brand-roll-main,.brand-roll-hover{grid-area:1/1;position:static;inset:auto;width:max-content;white-space:nowrap}\n@keyframes route-cover{0%{transform:translateY(110%);border-radius:50% 50% 0 0 / 8% 8% 0 0}100%{transform:none;border-radius:0}}\n@keyframes route-reveal{0%,18%{transform:none;border-radius:0}35%{border-radius:0 0 50% 50% / 0 0 8% 8%}100%{transform:translateY(-115%);border-radius:0}}\n.portfolio-header nav a,.header-contact{isolation:isolate;overflow:hidden;border-radius:24px;padding:10px 14px}.portfolio-header nav a::before,.header-contact::before{content:'';position:absolute;inset:0;background:#2144d5;border-radius:50%;transform:translateY(130%);transition:transform .5s var(--motion-ease);z-index:-1;pointer-events:none}.portfolio-header nav a:hover::before,.header-contact:hover::before{transform:translateY(0)}.portfolio-header nav a:hover,.header-contact:hover{color:white}\nbody:has(.route-contact) .studio-footer::after{background:#1c1d20}\n@media(max-width:740px){.floating-menu-button{position:absolute;right:20px;top:67px;width:38px;height:38px;opacity:1;visibility:visible;scale:1}.is-scrolled .floating-menu-button{position:fixed;right:14px;top:14px;width:52px;height:52px}.portfolio-header nav{gap:12px}.portfolio-header nav a{padding:10px 12px}.header-contact{padding:8px 0}}\n@media(prefers-reduced-motion:reduce){.portfolio-header nav a::before,.header-contact::before{transition:none}}\n/* Loose navigation and one hover palette; eliminate inherited yellow link fills. */\na:hover{background:transparent}.portfolio-header,.hero.motion-scene,.route-head{border:0;background:transparent}.brand-roll:hover{background:transparent}.portfolio-header nav a[aria-current]:hover{color:white}\nhtml.opening-pending body{background:#1c1d20}.motion-enter .opening-curtain,.route-exit .route-curtain,.route-enter .route-curtain{inset:-2px;border-radius:0}.motion-enter .opening-curtain{min-height:calc(100dvh + 4px)}\n@keyframes opening-curtain-out{0%,60%{transform:none;border-radius:0}74%{border-radius:0 0 50% 50% / 0 0 8% 8%}100%{transform:translateY(-115%);border-radius:0}}\n.home-route-enter .route-curtain{animation:opening-curtain-out 3.1s var(--motion-ease) both}.home-route-enter.motion-enter .opening-curtain{display:none}.home-route-enter .route-curtain span{animation:opening-greeting 2.2s ease both}.home-route-enter #content{animation:none}\n.studio-footer::after{z-index:3}.writing-utility{display:inline-flex;align-items:center;min-height:44px;font-size:12px;text-decoration:none}\na:not(.button):hover{background:transparent}:root{--accent-soft:rgba(33,68,213,.12)}\n@media(hover:hover) and (pointer:fine){.work-cursor-visible .scene-tile{cursor:none}}\n@media(max-width:740px){.header-end{gap:8px}.writing-utility,.header-contact{font-size:11px}.languages{font-size:11px}}\n@media(prefers-reduced-motion:reduce){html.opening-pending body{background:var(--bg)}}\n/* A solid early layer prevents corner leaks while the curved reveal has yet to begin. */\nhtml.opening-pending body{background:var(--bg)}.motion-enter::before{content:'';position:fixed;inset:-2px;background:#1c1d20;z-index:65;pointer-events:none;animation:opening-solid 3.1s linear both}\n@keyframes opening-solid{0%,60%{opacity:1}61%,100%{opacity:0}}\n.site-menu nav a:hover{background:transparent!important;color:#f0eee8}.site-menu nav a::after{content:'';position:absolute;left:-25px;top:50%;width:7px;height:7px;border-radius:50%;background:#2144d5;transform:scale(0);transition:transform .3s var(--motion-ease)}.site-menu nav a:hover::after{transform:scale(1)}\n@media(prefers-reduced-motion:reduce){.motion-enter::before{display:none}}\n/* Article shell keeps editorial reading width while navigation uses the shared full width. */\n.shell:has(.post-title){max-width:1600px;padding:0 32px 32px}.shell:has(.post-title) main{max-width:760px;margin-inline:auto;padding-top:65px}.portfolio-header nav,.header-end,.languages{white-space:nowrap;flex-shrink:0}.portfolio-header nav{flex-wrap:nowrap}.header-contact{white-space:nowrap;flex-shrink:0}\n.portfolio-header nav a,.header-contact{border-radius:0;background:transparent!important}.portfolio-header nav a::before,.header-contact::before{display:none}.portfolio-header nav a:hover,.portfolio-header nav a[aria-current]:hover,.header-contact:hover{color:var(--accent)}.route-curtain span{display:none!important}\n@media(max-width:1000px) and (min-width:741px){.portfolio-header nav{gap:14px}.header-end{gap:14px}.identity{font-size:17px!important}.portfolio-header nav a{padding:10px 8px}}\n@media(max-width:740px){.shell:has(.post-title){padding:0 20px 24px}.shell:has(.post-title) main{padding-top:38px}.portfolio-header nav{flex-shrink:1}}\n\n/* One route compositor; native document crossfades must not blend the opaque curtain. */\n::view-transition-old(root),::view-transition-new(root){animation:none}.route-head h1{animation:none}\n.portfolio-header a:hover,.portfolio-header a[aria-current],.portfolio-header a[aria-current]:hover,.header-contact:hover,.header-contact[aria-current]{color:var(--text)!important;background:transparent!important;text-decoration:none}\n.site-menu nav a:hover,.site-menu nav a:focus-visible{color:#f0eee8;background:transparent!important}.site-menu nav a::after{background:currentColor}\n.portfolio-header nav a:hover::after{transform:translate(-50%,7px) scale(0)}.portfolio-header nav a[aria-current]::after{transform:translate(-50%,7px) scale(1)}\n.portfolio-header a:focus-visible,.site-menu nav a:focus-visible{outline:1px solid currentColor;outline-offset:5px}\n.route-enter::after{content:'';position:fixed;inset:-2px;background:#1c1d20;z-index:119;pointer-events:none;animation:route-boot-solid 1.05s linear both}\n@keyframes route-boot-solid{0%,18%{opacity:1}19%,100%{opacity:0}}\n\n/* Decorative direction responds to deliberate native scrolling, without changing links. */\n.scroll-direction{display:inline-flex;width:24px;height:30px;pointer-events:none;align-items:center;justify-content:center;transform:rotate(0deg);transition:transform .45s var(--motion-ease);color:var(--muted)}.scroll-direction svg{width:18px;height:26px}.route-head>.scroll-direction{margin-top:25px}.about-orbit>.scroll-direction{margin-top:15px}html[data-scroll-direction=\"up\"] .scroll-direction{transform:rotate(180deg)}\n.studio-footer::after{transition:height .3s cubic-bezier(.2,.7,.2,1)}.footer-invitation,.footer-meta,.writing-back{transition:translate .35s cubic-bezier(.2,.7,.2,1)}.footer-invitation .round-link{transition:translate .35s cubic-bezier(.2,.7,.2,1),transform .55s cubic-bezier(.2,.7,.2,1),background .3s,color .3s}\n@media(prefers-reduced-motion:reduce){.scroll-direction{display:none}.studio-footer::after,.footer-invitation,.footer-meta,.writing-back,.footer-invitation .round-link{transition:none!important}}\n\n/* Active dots sit outside the link box; only filled CTAs clip their hover waves. */\n.portfolio-header nav a,.header-contact{overflow:visible}.header-contact,.writing-utility{position:relative}.header-contact[aria-current]::after,.writing-utility[aria-current]::after{content:'';position:absolute;left:50%;bottom:0;width:5px;height:5px;background:currentColor;border-radius:50%;transform:translate(-50%,7px)}\n.brand-roll,.writing-utility,.languages a{transform:translate(var(--magnet-x,0px),var(--magnet-y,0px));transition:transform .55s cubic-bezier(.2,.7,.2,1)}\n\n/* Share the root overlay stack so the opaque backstop cannot conceal the greeting. */\n.motion-enter .hero.motion-scene{isolation:auto;overflow:visible}.portfolio-header a,.portfolio-header a:hover,.portfolio-header a[aria-current],.header-contact,.header-contact:hover{color:inherit!important}\n\n.site-menu nav a::after{display:none}.scene-topline>.scroll-direction{display:inline-flex!important}@media(prefers-reduced-motion:reduce){.scene-topline>.scroll-direction{display:none!important}}\n\n.studio-footer a:hover,.studio-footer a:focus-visible{color:inherit;background:transparent!important}\n";
var escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var e = escape;
function mailto(lang) {
  const c = copy[lang].contact;
  return `mailto:${c.email}?subject=${encodeURIComponent(c.subject)}&body=${encodeURIComponent(c.mailBody)}`;
}
var arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.6"/></svg>';
function action(lang, label, cls = "button") {
  return `<a class="${cls}" href="${e(mailto(lang))}">${e(label)}${arrow}</a>`;
}
function picture(project, eager = false, sizes = "(max-width: 740px) calc(100vw - 40px), 26vw") {
  const widths = [720, 1440, 2160, 3840];
  return `<picture><source type="image/webp" srcset="${widths.map((w) => `/work/${project.id}-${w}.webp ${w}w`).join(", ")}" sizes="${sizes}"><img src="/work/${project.id}-1440.jpg" alt="${e(project.alt)}" width="1440" height="900" loading="${eager ? "eager" : "lazy"}" ${eager ? 'fetchpriority="high"' : ""} decoding="async"></picture>`;
}
function header(lang, path2) {
  const c = copy[lang], base = lang === "es" ? "/es" : "/", other = lang === "es" ? "en" : "es";
  const pair = path2 === "/web" ? "/web/es" : path2 === "/web/es" ? "/web" : lang === "es" ? "/" : "/es";
  return `<a class="skip-link" href="#content">${lang === "es" ? "Saltar al contenido" : "Skip to content"}</a><header class="portfolio-header"><a class="identity" href="${base}">Lautaro G\xE4rtner<span class="identity-dot" aria-hidden="true"></span></a><nav aria-label="${lang === "es" ? "Navegaci\xF3n principal" : "Main navigation"}"><a href="${base}#${c.anchors.offer}">${e(c.nav.offer)}</a><a href="${base}#${c.anchors.work}">${e(c.nav.work)}</a><a class="writing-nav" href="/writing">${e(c.nav.writing)}</a></nav><div class="header-end"><div class="languages" aria-label="${lang === "es" ? "Idioma" : "Language"}"><span aria-current="page">${lang.toUpperCase()}</span><span aria-hidden="true">/</span><a data-language="${other}" href="${pair}" lang="${other}" hreflang="${other}">${other.toUpperCase()}</a></div><a class="header-contact" href="${e(mailto(lang))}">${e(c.nav.contact)}${arrow}</a></div></header>`;
}
function footer(lang) {
  const c = copy[lang];
  return `<footer class="portfolio-footer"><div><strong>Lautaro G\xE4rtner</strong><p>Crespo, Argentina</p><a href="${e(mailto(lang))}">${e(c.contact.email)}</a></div><nav aria-label="${lang === "es" ? "Enlaces del pie" : "Footer links"}"><a href="https://www.linkedin.com/in/lautarogartner">LinkedIn</a><a href="https://x.com/lautarogartner_">X</a><a href="/writing">${e(c.nav.writing)}</a><a href="https://github.com/LautaroGartner/lautarogartner.com">Source</a></nav></footer>`;
}
function home(lang, posts) {
  const c = copy[lang], a = c.anchors;
  return `<section class="hero motion-scene" aria-labelledby="hero-title" data-scene data-focus="overview">
 <div class="opening-curtain" aria-hidden="true"><span class="opening-greeting">${lang === "es" ? "Hola." : "Hello."}</span></div>
 <div class="scene-topline"><span>${lang === "es" ? "TRABAJOS" : "WORK"}</span></div>
 <div class="scene-center"><div class="scene-overview"><h1 id="hero-title" aria-label="${e(c.hero.H1)}">${c.hero.H1.split(" ").map((word, i) => `<span class="hero-word" aria-hidden="true" style="--word:${i}"><span>${e(word)}</span></span>`).join(" ")}</h1><a class="scene-scroll text-link" href="#${a.work}">${e(c.hero["Secondary CTA"])}${arrow}</a></div>
 ${c.projects.map((p) => `<div class="scene-context" data-context="${p.id}"><p class="section-label">${e(p.label)}</p><h2 aria-label="${e(p.name)}">${p.name.split(" ").map((word, wi) => `<span class="scene-word" aria-hidden="true">${[...word].map((char, ci) => `<span class="scene-char" style="--char:${p.name.split(" ").slice(0, wi).join(" ").length + ci}">${e(char)}</span>`).join("")}</span>`).join(" ")}</h2><p>${e(p.title)}</p><a class="text-link" href="#${p.id}" tabindex="-1">${lang === "es" ? "Ver el proyecto" : "View project"}${arrow}</a><div class="mobile-project-media">${projectMedia[p.id].slice(0, 2).map((shot) => `<figure>${picture({ id: shot.id, alt: shot[lang] })}<figcaption>${e(shot[lang])}</figcaption></figure>`).join("")}</div></div>`).join("")}</div>
 <div class="scene-projects" role="group" aria-label="${lang === "es" ? "Explorar proyectos" : "Explore projects"}">${c.projects.map((p, i) => `<button type="button" class="scene-tile scene-tile--${p.id}" data-project="${p.id}" style="--order:${i}" aria-pressed="false" aria-label="${lang === "es" ? "Explorar" : "Explore"} ${e(p.name)}"><span class="scene-tile-image">${picture(p, i === 0)}</span><span class="scene-tile-label"><span>${e(p.name)}</span><span aria-hidden="true">\u2197</span></span></button>`).join("")}</div>
 <div class="scene-collages" aria-hidden="true">${c.projects.map((p) => `<div class="scene-collage" data-collage="${p.id}">${projectMedia[p.id].slice(0, 2).map((shot, i) => `<figure class="scene-frame scene-frame--${i === 0 ? "a" : "b"}">${picture({ id: shot.id, alt: "" })}<figcaption>${e(shot[lang])}</figcaption></figure>`).join("")}</div>`).join("")}</div>
 <div class="scene-bottomline"><button type="button" class="scene-reset" data-scene-reset>${lang === "es" ? "Volver a todos" : "Back to all"} <span aria-hidden="true">\xD7</span></button><span class="scene-coordinate" aria-hidden="true">CRESPO / ARGENTINA</span></div>
 </section>
 <section class="hero-intro"><p class="hero-body">${e(c.hero.Body)}</p><div><div class="actions">${action(lang, c.hero["Primary CTA"])}<a class="text-link" href="#${a.work}">${e(c.hero["Secondary CTA"])}${arrow}</a></div><p class="small hero-note">${e(c.hero["Small line"])}</p></div></section>
 <section class="work" id="${a.work}"><div class="work-heading"><div><p class="section-label">${lang === "es" ? "04 / TRABAJO REAL" : "04 / REAL WORK"}</p><h2>${e(c.work.heading)}</h2></div><p>${e(c.work.intro)}</p></div>${c.projects.map((p, i) => `<article class="project" id="${p.id}"><div class="project-image">${picture(p)}</div><div class="project-copy"><p class="section-label">0${i + 1} / ${e(p.label)}</p><p class="project-name">${e(p.name)}</p><h3>${e(p.title)}</h3><p>${e(p.description)}</p><ul class="deliverables">${p.deliverables.map((s) => `<li>${e(s)}</li>`).join("")}</ul>${p.id === "filsen" ? `<p class="small">${lang === "es" ? "La captura muestra la portada p\xFAblica de comercios. El flujo de turnos es parte del producto en beta." : "The screenshot shows the public shops homepage. The appointment flow is part of the product in beta."}</p>` : ""}<a class="text-link" href="${e(p.url)}">${e(p.cta)}${arrow}</a></div></article>`).join("")}<p class="evidence-note small">${lang === "es" ? "Estos proyectos muestran trabajo de implementaci\xF3n. No hay resultados de conversi\xF3n o ingresos verificados para publicar." : "These projects show implementation work. There are no verified conversion or revenue results to publish."}</p></section>
 <section class="problem section-grid"><div><p class="section-label">${lang === "es" ? "01 / EL PUNTO DE PARTIDA" : "01 / THE STARTING POINT"}</p><h2>${e(c.problem.heading)}</h2></div><p class="lede">${e(c.problem.body)}</p></section>
 <section class="offer section-grid" id="${a.offer}"><div><p class="section-label">${lang === "es" ? "02 / LA OFERTA" : "02 / THE OFFER"}</p><p class="offer-label">${e(c.offer.label)}</p><h2>${e(c.offer.heading)}</h2></div><div><p class="lede">${e(c.offer.body)}</p><ul class="scope">${c.offer.scope.map((s) => `<li>${e(s)}</li>`).join("")}</ul><p class="pricing">${e(c.offer.pricing)}</p><p class="small">${e(c.offer.boundary ?? c.offer.l\u00EDmite)}</p>${action(lang, c.offer.CTA, "text-link")}</div></section>
 <section class="process"><p class="section-label">${lang === "es" ? "03 / C\xD3MO TRABAJAMOS" : "03 / HOW WE WORK"}</p><h2>${e(c.process.heading)}</h2><div class="steps">${c.process.steps.map(([title, body], i) => `<article><span class="mono">0${i + 1}</span><h3>${e(title)}</h3><p>${e(body)}</p></article>`).join("")}</div><p class="ownership">${e(c.process.ownership)}</p></section>

 <section class="about section-grid" id="${a.about}"><div><p class="section-label">${lang === "es" ? "05 / SOBRE M\xCD" : "05 / ABOUT ME"}</p><h2>${e(c.about.heading)}</h2></div><div><p class="lede">${e(c.about.body)}</p>${lang === "en" ? '<a class="text-link" href="/about">More about me' + arrow + "</a>" : ""}</div></section>
 <section class="faq section-grid"><div><p class="section-label">${lang === "es" ? "06 / PREGUNTAS" : "06 / QUESTIONS"}</p><h2>${lang === "es" ? "Antes de empezar." : "Before we start."}</h2></div><div>${c.faq.map((f) => `<details><summary>${e(f.question)}</summary><p>${e(f.answer)}</p></details>`).join("")}</div></section>
 <section class="contact" id="${a.contact}"><p class="section-label">${lang === "es" ? "07 / HABLEMOS" : "07 / LET\u2019S TALK"}</p><h2>${e(c.contact.heading)}</h2><p class="lede">${e(c.contact.body)}</p><div class="actions">${action(lang, c.contact.CTA)}<button class="copy-email" data-email="${e(c.contact.email)}" data-success="${e(c.contact.success)}" data-failure="${e(c.contact.failure)}">${e(c.contact.secondary)}</button></div><a class="email-address" href="${e(mailto(lang))}">${e(c.contact.email)}</a><p class="copy-status small" role="status" aria-live="polite"></p></section>
 <section class="recent-writing"><div><p class="section-label">${lang === "es" ? "NOTAS / EN INGL\xC9S" : "FROM THE NOTEBOOK"}</p><h2>${lang === "es" ? "Software, productos y sistemas legibles." : "Software, products & readable systems."}</h2><a class="text-link" href="/writing">${lang === "es" ? "Todas las notas (en ingl\xE9s)" : "All writing"}${arrow}</a></div><div>${posts.slice(0, 2).map((p) => `<article><time datetime="${e(p.publishedAt)}">${e(p.publishedAt)}</time><h3><a href="/${e(p.slug)}">${e(p.title)}</a></h3></article>`).join("")}</div></section><script defer src="/portfolio.js"></script>`;
}
function createLegacySite(settings, posts, pages) {
  const commercial = ["/", "/es", "/web", "/web/es"].map((path2) => {
    const lang = path2.endsWith("es") ? "es" : "en", c = copy[lang], en = "/", es = "/es";
    return { path: path2, structuredData: { "@context": "https://schema.org", "@graph": [{ "@type": "Person", "@id": `${settings.url}/#person`, name: settings.author, url: settings.url, jobTitle: "Independent software developer", sameAs: ["https://www.linkedin.com/in/lautarogartner", "https://x.com/lautarogartner_"] }, { "@type": "WebSite", "@id": `${settings.url}/#website`, url: settings.url, name: settings.title, inLanguage: ["en", "es"], publisher: { "@id": `${settings.url}/#person` } }, { "@type": "WebPage", "@id": `${settings.url}${lang === "es" ? "/es" : "/"}#webpage`, url: `${settings.url}${lang === "es" ? "/es" : "/"}`, name: c.seo.title, inLanguage: lang, isPartOf: { "@id": `${settings.url}/#website` }, about: { "@id": `${settings.url}/#person` } }] }, canonicalPath: lang === "es" ? "/es" : "/", title: c.seo.title, seoTitle: c.seo.title, description: c.seo.description, body: c.hero.Body, html: home(lang, posts), shell: "wide", nav: false, language: lang, headerHtml: header(lang, path2), footerHtml: footer(lang), imagePath: "/work/social.jpg", alternates: [{ language: "en", path: en }, { language: "es", path: es }, { language: "x-default", path: en }], tokenSummary: `${c.seo.description} Tiki and Luc\xEDa are published implementation projects; Filsen is an own product in beta. No conversion or revenue results claimed.` };
  });
  return { ...settings, language: "en", styles, headerHtml: header("en", "/"), footerHtml: footer("en"), posts: [...posts], pages: [...commercial, ...pages, { path: "/writing", title: "Writing", description: "Notes on software, products and agent-readable systems by Lautaro G\xE4rtner.", body: "Software, products and readable systems.", nav: false, tokenSummary: "Index of the original published essays; their URLs, text and dates are preserved.", html: `<h1 class="page-title">Writing</h1><p class="page-lede">Software, products and readable systems.</p><div class="writing-list">${posts.map((p) => `<article><time datetime="${e(p.publishedAt)}">${e(p.publishedAt)}</time><h2><a href="/${e(p.slug)}">${e(p.title)}</a></h2><p>${e(p.description)}</p></article>`).join("")}</div>` }] };
}
function createSite(settings, posts, pages) {
  return composeRoutes(createLegacySite(settings, posts, pages), copy, { escape, mailto, picture });
}

// scripts/refresh-preview.mjs
var output = process.env.PREVIEW_OUTPUT_DIR || "dist";
var outputs = {}; var write = (file,value) => outputs[file] = value;
var read = dir => ({"content/posts": [{"slug": "generated-systems-should-explain-themselves", "title": "Why Generated Systems Should Explain Themselves", "topics": ["runtime identity", "generated systems", "agents"], "description": "Why generated software should expose its shape, contracts, capabilities, and security-relevant runtime facts.", "publishedAt": "2026-05-20", "body": "\nGenerated software has a trust problem, not because generation is bad. Generation is useful. It saves time, removes repetition, and lets a framework create consistent output. The problem is what happens after generation. A build runs, a folder appears, and the developer is expected to trust that the output is correct, safe, and understandable. That is too much trust.\n\nA generated system should explain itself.\n\nIt should say what it produced, what kind of files exist, what capabilities are present, which build produced the output, and whether its contracts are valid. This is not just a developer-experience feature. It is also a security feature.\n\nSecurity starts with knowing what exists. If a runtime cannot list its own artifacts, you have to discover them manually. If it cannot say what capabilities it has, you have to infer behavior from code and conventions. If it cannot tell you whether its manifest is valid, you do not know whether the system you are inspecting matches the system the framework thinks it generated. That uncertainty becomes operational risk.\n\nPaideia tries to reduce that risk with small, explicit files.\n\nsystem.json describes the generated system contract. runtime.json describes the runtime identity: framework version, build ID, artifact inventory, declared capabilities, and build metadata. context.json gives agents a compact map of the site. llms.txt explains where agents should start. The doctor command validates that the generated runtime is internally consistent.\n\nThis matters for security because hidden behavior is hard to review. A simple artifact inventory can tell you whether the output contains only the files you expect. A deterministic build ID can tell you whether content changed between builds. Capability declarations can tell you what the runtime claims it can do: serve a static site, expose agent context, validate manifests, inspect runtime identity. Doctor checks can catch broken contracts before you ship. None of this replaces real security review, but it gives the review something concrete to start from.\n\nThe important part is that these files are boring. They are not a new permission system. They are not a cloud dependency. They are not a complex policy engine. They are plain generated outputs that can be read by humans, checked by scripts, and handed to agents. That is enough to make the system easier to inspect.\n\nDevelopers already do this kind of work informally. We check folders. We skim build output. We open generated files. We ask whether the runtime is serving more than it should. We wonder whether a change came from content or from tooling. Paideia makes some of those questions first-class.\n\nThat shift is small, but it changes the default posture. Instead of asking developers to reverse-engineer the generated system, the system gives them a map. Instead of hiding runtime behavior behind framework confidence, the runtime declares its capabilities. Instead of treating generated output as a side effect, the framework treats it as something that should be described and verified.\n\nThis also helps agents. An agent working on a codebase should not have to guess which files matter. It should not have to invent capabilities from folder names. It should not have to summarize an entire site from scratch if the system already has a compact context file. The same explicit surfaces that help security review also help automated tools behave more carefully.\n\nThat is the basic idea: make the generated system legible enough that humans and agents can inspect it before they trust it.\n\nReadable software is not only code with nice formatting. It is software whose shape can be discovered, whose output can be checked, and whose behavior is declared plainly.\n\nGenerated systems should explain themselves because understanding is part of safety.\n", "tokenSummary": "Developer-facing essay explaining why generated systems should expose runtime identity, artifact inventories, capabilities, diagnostics, and security-relevant facts.", "status": "published", "order": 3}, {"slug": "building-paideia", "title": "Building Paideia: Software That Explains Itself", "topics": ["inspectability", "system contracts", "framework notes"], "description": "Why I am building Paideia as a small framework for readable, inspectable, self-describing software systems.", "publishedAt": "2026-05-20", "body": "\nMost software does not introduce itself. It starts with a repository, a package file, a maze of conventions, and a long list of things you are supposed to already know. The first experience is not understanding. It is excavation. You open folders. You infer intent from filenames. You search for routes, build scripts, generated files, schemas, environment variables, and deployment assumptions. If the project is old enough, you also inherit a layer of folklore: why this file exists, why that output is checked in, why the build behaves differently on Tuesdays.\n\nThat is normal now, but it is strange.\n\nA software system should be able to answer basic questions about itself. What was generated? What exists? What kind of artifact is this? Which build produced it? What capabilities does the runtime claim? Are the contracts valid? Is this output meant for humans, agents, or both?\n\nPaideia is my attempt to build a small framework around that idea. The premise is simple: generated systems should explain themselves.\n\nNot through a huge dashboard, a cloud control plane, or a requirement that developers memorize a framework's internal mythology. A generated system should carry a small set of readable files that describe its shape. Those files should live beside the output. They should be boring enough to inspect with a text editor. They should help humans and agents understand the system without guessing.\n\nThat is why Paideia emits system.json, context.json, llms.txt, and runtime.json. Each one has a job.\n\nsystem.json is the system contract. It describes the generated site and its runtime structure. context.json is the compressed map for agents. It gives language models a concise summary of pages, posts, and important runtime facts. llms.txt is the plain-language guide. It tells agents where to start and what files matter. runtime.json is the runtime identity. It says what build produced the output, which artifacts exist, what kinds they are, how large they are, what capabilities the runtime declares, and whether the manifest is normalized.\n\nThis is not metadata for the sake of metadata. The point is to reduce archaeology.\n\nWhen a build finishes, the output should not feel like a pile of files. It should feel like a structured system. A person should be able to run paideia inspect and get a compact answer: framework version, build ID, page count, post count, artifact count, artifact kinds, capabilities, manifest state, diagnostic state. A machine should be able to read the same truth from runtime.json. A doctor command should be able to verify that the identity files are valid, that the artifact inventory points to real files, that the manifest is normalized, and that required capabilities are declared once.\n\nThis is the part that interests me most: inspectability is not decoration. It changes the relationship between the developer and the system. Most frameworks optimize for power by hiding complexity behind conventions. That can be useful. It can also produce a kind of learned helplessness. You know how to run the framework, but you do not really know what it made. You know the magic words, but not the shape of the spell. You become fast at using the tool and slow at understanding the output.\n\nPaideia is trying a different tradeoff.\n\nIt is not trying to be the biggest framework. It is not trying to compete with mature frontend ecosystems on breadth. It is not trying to own every layer of application development. It is trying to make small generated software more legible.\n\nThat constraint matters. The framework should remain tiny, readable, and finite. Every new surface has to earn its place by making the system more understandable or more verifiable. Artifact inventory earns its place because it answers what exists. A deterministic build ID earns its place because it answers whether the output changed. Capabilities earn their place because they answer what the runtime claims it can do. Doctor earns its place because it turns contracts into checks. Inspect earns its place because humans need a quick way to see the shape of the system.\n\nBut there is a danger here too. It is very easy for a project like this to turn into metadata theater. Once you start describing a system, there is always one more thing to describe. One more field. One more contract. One more schema. One more layer that explains the layer that explains the layer. That way lies a very polished swamp.\n\nSo Paideia has to stay disciplined.\n\nThe goal is not infinite self-description. The goal is enough self-description to make the generated system understandable. The test is practical: does this help someone inspect, verify, debug, operate, or hand the system to an agent? If the answer is no, it probably does not belong.\n\nThis is also why Paideia is intentionally low dependency. A framework about readability should not require a cathedral of hidden machinery to explain a small website. It should be possible to read the generator, inspect the output, understand the runtime, and run the diagnostics without needing to trust a large stack of invisible behavior.\n\nThe agent angle is important, but not in the breathless way software often talks about AI. Agents do not need mysticism. They need stable surfaces. They need files that say what exists. They need contracts that say what is valid. They need summaries that fit in context. They need deterministic identifiers so they can tell when something changed. They need runtime capabilities so they can reason about what tools are available without making things up.\n\nHumans need the same things. That is the quiet point under the whole project. The features that make software easier for agents often make it easier for humans too, as long as they stay explicit and boring. A good context file is useful for a model, but it is also useful for a tired developer. A good runtime identity is useful for automation, but it is also useful when you return to a project after three weeks and ask: what did this build produce?\n\nPaideia began as a small experiment around inspectable runtimes and explicit contracts. It is now becoming a framework for self-describing generated systems. That sounds grand, but the implementation is deliberately modest. Generate the site. Emit the contracts. Validate the contracts. Describe the artifacts. Declare the capabilities. Provide a human inspect command. Keep the runtime small.\n\nThat is enough to create a different feeling. The generated output no longer feels like residue from a build process. It feels like an object with identity. It has a contract. It has a map. It has a guide. It has a fingerprint. It has an inventory. It can be inspected. It can be checked.\n\nThat is the version of software I want more of: software that does not make understanding a scavenger hunt, and software that can be handed to a human or an agent and say: here is what I am, here is what I made, here is what I can do, here is how to verify me. That is what I am building with Paideia.\n", "tokenSummary": "Long-form positioning essay about building Paideia as a small framework for self-describing generated systems with runtime identity, artifact inventory, deterministic build IDs, capabilities, diagnostics, and inspectability.", "status": "published", "order": 4}, {"slug": "why-ai-agents-need-observable-runtime-receipts", "title": "Why AI Agents Need Observable Runtime Receipts", "topics": ["agent-readable web", "runtime receipts", "crawler diagnostics"], "description": "The modern web is increasingly difficult for legitimate machines to observe. Agents need explicit runtime receipts, not confident guesses.", "publishedAt": "2026-05-26", "body": "\nThe web was built for browsers, then optimized for humans, advertisers, analytics, platforms, search engines, and security systems. Machines were always there, but mostly in tolerated roles: search crawlers, uptime monitors, link unfurlers, feed readers, validators, scrapers, bots. Some were welcomed. Some were blocked. Most were ambiguously classified by infrastructure that had no reason to care about their intent.\n\nAI agents are entering that same web, but with a different expectation. They are not only fetching pages. They are trying to understand systems.\n\nThat distinction matters.\n\nA crawler can fetch HTML and extract links. An agent needs to know what it observed, what it missed, what failed, what was inferred, what was unavailable, and whether the output it is relying on represents the real runtime state of the site. Without that, agents do not become useful collaborators. They become confident guessers operating inside an environment designed to obscure, transform, defer, personalize, and rate-limit what they see.\n\nThe modern web is increasingly hostile to machines, often for good reasons.\n\nBot protection sits in front of many sites. Vercel, Cloudflare, Fastly, Akamai, and other platforms help defend applications from abuse, scraping, credential attacks, spam, and denial-of-service traffic. That protection is necessary. But from the perspective of a legitimate agent, the experience is often indistinguishable from failure. A request may receive a challenge page, a 403, a 429, a redirect loop, or a synthetic response that is not the page a human would see.\n\nRate limits are similarly ambiguous. A 429 can mean \"try later.\" It can mean \"slow down.\" It can mean \"you look automated.\" It can mean \"this endpoint is overloaded.\" It can also mean \"you are not allowed to learn this site this way.\" A crawler that hides that failure produces false confidence. A useful agent-readable system should preserve it as a receipt.\n\nJavaScript-only applications create another kind of opacity. A static HTTP fetch may see an empty shell, a loading div, or a bundle reference, while the meaningful application state exists only after hydration, API calls, authentication, feature flags, or client-side routing. If an agent reads that shell and summarizes the site as empty, it is wrong. If it silently executes nothing and reports success, it is worse than wrong. It has erased the conditions of observation.\n\nRedirects complicate source identity. Canonical tags complicate route identity. Authentication walls complicate completeness. CDNs complicate consistency. A homepage may advertise routes that differ from a sitemap. A sitemap may include stale URLs. Robots.txt may say one thing, server behavior another. A page may return 200 while rendering an error state. The web is full of hidden state, and agents need a way to say: this is what I saw, this is how I saw it, and this is where the observation stops.\n\nThat is the case for observable runtime receipts.\n\n## What A Receipt Is\n\nA runtime receipt is not marketing copy for a website. It is not a prompt. It is not a vague \"AI-ready\" badge. It is a structured record of observation.\n\nIt should answer basic questions:\n\n* What source URL was requested?\n* What final URL was observed?\n* Was JavaScript executed?\n* Were redirects followed?\n* Which routes were fetched?\n* Which routes failed?\n* What status codes were returned?\n* Was robots.txt fetched?\n* Was sitemap.xml discovered?\n* Were directives enforced or merely recorded?\n* Were descriptions, titles, canonicals, and headings present?\n* Were artifacts generated deterministically?\n* Can those artifacts be validated?\n\nThese questions sound mundane. That is the point. Operational trust is mundane. It is built from receipts.\n\nThe failure mode of AI tooling is often not that it lacks intelligence. It is that it lacks epistemic hygiene. It cannot reliably distinguish between \"this is true,\" \"this was visible,\" \"this was inferred,\" \"this failed,\" and \"this was not checked.\" On the web, that distinction is everything.\n\nAn agent-readable artifact should not pretend a partial crawl is complete. It should not collapse 429s into silence. It should not describe JavaScript-rendered applications as if static HTML told the whole story. It should not hide missing metadata because the happy path looks cleaner. It should make ambiguity explicit.\n\nThis changes the purpose of crawling. The goal is no longer just extraction. The goal is accountable observation.\n\n## Why Validation Matters\n\nThat is also why validation matters. If a site emits `system.json`, `runtime.json`, `context.json`, and `llms.txt`, those files should not simply exist. They should agree with each other. Their hashes should be stable. Their artifact inventory should match the generated files. Their warnings should be inspectable. Their schema should be testable. A receipt that cannot be validated is just another text artifact asking to be trusted.\n\nThe most interesting future for this kind of tooling is not a smarter crawler. It is CI.\n\nImagine a site that generates machine-readable runtime receipts during deployment. The build can fail if expected artifacts disappear, if routes regress, if sitemap discovery breaks, if crawl failures increase, if canonical identity changes unexpectedly, or if JavaScript dependence expands beyond an accepted threshold. In that world, agent-readability is not a documentation afterthought. It is part of the operational contract of the site.\n\nThat contract would help humans too.\n\nDevelopers would know when their generated site stopped explaining itself. Platform teams would see when bot protection made legitimate machine access impossible. Documentation owners would catch broken metadata before users did. Agents would consume explicit diagnostics instead of hallucinating around missing state.\n\n## Boundaries Are Part Of The System\n\nThis is not about making every website fully open to every machine. Some sites should block crawlers. Some pages should require authentication. Some data should remain inaccessible. Observable receipts do not remove those boundaries. They make the boundaries legible.\n\nThat is the important distinction. The web does not need to become less secure for agents to become more useful. It needs better ways to describe what happened at the boundary between a machine and a runtime system.\n\nThe web is becoming hostile to machines because it has had to defend itself from machines. AI agents inherit that distrust. The answer is not to bypass it with increasingly aggressive scraping. The answer is to build artifacts that let systems state their observable shape, limits, failures, and guarantees directly.\n\nAgents do not need a fantasy version of the web where every page is clean, static, public, and perfectly documented.\n\nThey need receipts from the real one.\n", "tokenSummary": "Essay arguing that AI agents need observable runtime receipts because modern websites are shaped by bot protection, 429s, JavaScript-only rendering, hidden state, crawler ambiguity, and explicit diagnostics.", "status": "published", "order": 0, "kind": "post"}, {"slug": "framework-becomes-a-tool", "title": "The Moment a Framework Becomes a Tool", "topics": ["project notes", "generated systems", "developer experience"], "description": "On the shift from an interesting framework repository to a tool that can generate runnable, inspectable systems.", "publishedAt": "2026-05-21", "body": "\nThere is a quiet threshold in a framework project where the question changes. At first, the question is: is this real?\n\nThat is not a cynical question. It is the correct one. A framework can have good ideas, a clean philosophy, a few working examples, and still not be real in the way software needs to be real. It can be a repository with potential. It can be an essay with source files attached. It can be a pile of experiments arranged in a promising shape. But until someone can start from nothing and create a working system, the project still lives mostly inside its own repo.\n\nPaideia crossed one small version of that threshold when it learned how to initialize a project.\n\nThe command is modest:\n\n```bash\npaideia init my-site\n```\n\nIt does not look dramatic. It creates a folder, writes a few files, gives the project a site definition, adds a first post, and sets up scripts for build, start, doctor, inspect, and new posts. Then the generated project can install dependencies, build itself, run a production server, expose runtime artifacts, and inspect its own output. That is a small feature, but it is also a category change.\n\nBefore init, Paideia was an interesting framework repo. You could clone it, read it, build the included site, inspect the generated artifacts, and understand the shape of the experiment. That was useful, but it kept the user inside the framework's house. The first experience was still: come into this repository and look around. After init, the first experience can become: make your own thing. That matters more than the amount of code involved.\n\nSoftware tools are partly technical objects and partly psychological objects. A tool does not only need capability. It needs an entry point that makes the user feel oriented. It needs to say, in a few steps: here is where you are, here is what exists, here is how to change it, here is how to check it, here is how to run it. The init flow is the beginning of that promise.\n\nA generated Paideia project is intentionally small. It has a homepage, an about page, one writing post, a site contract, and a README. It builds to ordinary files in dist. Alongside those pages it emits runtime.json, system.json, context.json, and llms.txt. Those files are not decorative. They are the part of the system that says what was generated, what capabilities exist, what the runtime identity is, and how a human or agent can inspect the output.\n\nThis is the important distinction: Paideia is not trying to generate Paideia-branded clones. It is trying to generate systems that can stand on their own.\n\nThat means the generated project should feel like the user's project, not like a copy of framework internals. The package name should be clean. The README should explain the local workflow. The site title, author, description, and URL should be obvious placeholders to edit. The scripts should be minimal and predictable. The runtime artifacts should belong to the generated system.\n\nThe framework can still be visible. It should be visible. Generated with Paideia Framework is an honest sentence. But the center of gravity has to move from the framework to the thing the user is making. That is why polish matters here.\n\nIt is tempting, after an init command works, to jump immediately toward bigger features: databases, authentication, admin dashboards, plugins, forms, deployments, integrations. Those are all interesting. They are also dangerous too early. A framework can become impressive before it becomes trustworthy. It can accumulate surfaces before the first surface feels good. Paideia needs the opposite discipline: the small path should be excellent before the large path exists.\n\nCan a stranger create a project in a few minutes? Can they tell where posts live? Can they build the site? Can they run doctor? Can they inspect the runtime? Can they open dist and understand the artifacts? Can they change the title without reading framework source? Can an agent orient itself from context.json and llms.txt without guessing?\n\nThose questions are not glamorous. They are the foundation. The verification surface is starting to reflect that. There are tests for init, scaffold shape, generated posts, site runtime, runtime identity, manifest contracts, manifest diagnostics, install smoke, and doctor. There is also a direct smoke path for generated projects: install, build, inspect, start, and hit the health endpoint.\n\nThat is how trust begins: not with a claim that the framework is production-ready, and not with a big roadmap, but when the tool can repeatedly create something small, understandable, and checkable. This also clarifies what Paideia is becoming.\n\nThe early language around the project was about AI-native software, runtime identity, and generated systems explaining themselves. Those ideas still matter. But the practical center is getting sharper: small understandable systems.\n\nThat phrase is less flashy, which is good. It is more concrete. It gives the project a test. If Paideia adds a feature, does it help create a small system that can be understood? If it emits an artifact, does that artifact make the system easier to inspect? If it adds a command, does the command reduce confusion? If it generates a project, does that project feel owned by the user?\n\nThe init flow is not the end of that work. It is the first real doorway.\n\nNow the next useful test is not another abstraction. It is another system. Something that is not this blog. A docs portal, a notes site, a changelog, a tiny CRM, an inventory tracker. The blog validated publishing. A second app will validate whether the architecture can hold a different shape without becoming vague.\n\nThat is the stage Paideia is entering now. Not \"is this real?\" and not yet \"how much can it do?\" The better question is: how sharp can the scope remain while becoming useful?\n\nThat is a healthier question. It asks the project to grow without swelling. It asks every feature to earn its place. It keeps the center small enough to inspect.\n\nPaideia should become useful the same way its generated systems should behave: plainly, deliberately, and with enough self-knowledge to be safely handled.\n", "tokenSummary": "Project note about Paideia crossing from framework repository to usable tool through the init command, emphasizing generated project polish, runtime trust, disciplined scope, and small understandable systems.", "status": "published", "order": 2}, {"slug": "agent-readable-web", "title": "The Agent-Readable Web", "topics": ["agent-readable web", "runtime receipts", "inspectable software"], "description": "Why websites may need small, honest runtime receipts for routes, crawl status, artifacts, and limits.", "publishedAt": "2026-05-22", "body": "\nThe web was built for browsers. That sounds obvious, but it explains a lot. A website is usually judged by what happens after a browser loads it: does it look good, is it fast enough, can a person find what they came for, does the writing make sense, does the interface feel trustworthy?\n\nOver time, the web also became readable by other systems. Search engines learned to index it. Social platforms learned to preview it. Analytics tools learned to observe it. APIs exposed parts of it. Feeds, sitemaps, metadata, and structured data all became ways for a site to say a little more about itself than the visible page alone could say.\n\nNow another kind of reader is becoming normal: agents. I do not mean that in a grand science fiction sense. I mean ordinary software that can fetch a page, summarize it, compare it with another page, monitor it, answer questions about it, or decide what to do next. Some of these systems are simple. Some are more capable. The important part is that they are not just looking at a page once. They are trying to build a working understanding of a site.\n\nMost websites are not very good at helping with that, and not because they lack content. The web has more content than anyone can read. The problem is that many sites do not explain themselves clearly. They show pages, but they rarely say what those pages mean in the structure of the site. They expose links, but not always which links matter. They return HTML, but not always enough HTML to understand the page without running a large client application. They may have metadata, but often it is missing, duplicated, stale, or written only for previews.\n\nA person can tolerate a surprising amount of ambiguity. We can skim. We can infer. We can click around. We can notice that a page is important because it is in the navigation, or that a missing description is not fatal, or that an error probably means a site is rate limiting us.\n\nSoftware is less graceful about that. It can guess, and modern systems can guess impressively well, but guessing is not the same as understanding. That is the gap I keep noticing: a site can be beautifully designed and still reveal almost nothing about what routes exist, what artifacts are authoritative, what was generated, what failed during a crawl, whether metadata is missing, whether JavaScript was required, or what limits shaped the observed result. The page is visible. The system is not. I think that distinction is going to matter more.\n\n## A Receipt Layer\n\nThe phrase \"agent-readable web\" can sound more futuristic than it needs to. I do not think the web needs a giant new layer of magic. I do not think every site should become an API. I do not think every page needs to be optimized for automated systems at the expense of people. What I think is simpler: websites should become better at publishing receipts.\n\nA receipt is not a pitch, a brand statement, or a confident summary written to sound impressive. It is a record of what happened.\n\nFor a website, that might mean:\n\n* these routes were discovered\n* these pages were fetched\n* these files were generated\n* these capabilities are declared\n* these failures occurred\n* these warnings apply\n* these limits shaped the output\n\nThat kind of information is boring in the best way. It is close to logs, manifests, health checks, build output, and diagnostics. It does not ask for belief. It gives you something to inspect.\n\nThis is why I find the current conversation around `llms.txt` useful but incomplete. `llms.txt` is a good idea. A plain text entry point for tools that want to understand a site is much better than asking every system to scrape from scratch. It gives the site a front door, but a front door is not a map.\n\nA single text file can introduce a site, but it cannot carry everything an agent or a careful human might need to know. It cannot fully explain crawl coverage, missing metadata, partial failures, route inventory, runtime capabilities, generated artifacts, or the difference between what was observed and what was inferred. That does not make `llms.txt` wrong. It makes it the beginning of a larger shape.\n\nThe next step is not necessarily a standard. It may be too early for that. The next step is a habit: when software observes or generates a site, it should leave behind small artifacts that explain what it knows.\n\n## The Problem With Successful Crawls\n\nOne of the odd problems with crawlers is that many of them are too eager to look successful. If a page fails, the error often disappears into logs. If metadata is missing, the crawler continues silently. If a site is mostly a client side application and the static HTML contains almost no meaningful content, the crawler may still return an output that looks finished.\n\nThat is dangerous because it creates confidence without observability. A thin result is not the problem. Thin results happen. Some pages are protected. Some sites rate limit. Some sites require JavaScript. Some metadata is missing. Some links break. The web is messy. The problem is pretending the result is thicker than it is.\n\nIf a crawl only saw three pages, say that. If one route failed with a 429, record it. If descriptions were missing, warn about them. If JavaScript was not executed, make that explicit. If robots.txt was fetched only for awareness and not enforced, say so plainly.\n\nThere is a calmness in that kind of artifact. It does not overclaim. It does not collapse because the world was imperfect. It says: here is what I observed, here is what I could not observe, and here are the limits of this result.\n\nThat is much more useful than a polished lie.\n\n## A Small Prototype\n\nI built a small prototype called `agentify` to explore this idea. The tool is intentionally modest. It fetches a website, follows same origin links from the homepage up to a small page limit, extracts basic route metadata, and writes an explanation bundle:\n\n```txt\nagent/\n  system.json\n  runtime.json\n  context.json\n  llms.txt\n```\n\nIt does not run JavaScript. It does not crawl deeply. It does not log in. It does not infer private backend behavior. It does not claim the site is secure, complete, or well documented. That restraint is part of the point.\n\nThe current version identifies itself as a static HTML renderer. It records that JavaScript was not executed. It records that recursive crawling was not performed. It records whether the crawl was complete or partial. It emits warning codes for missing titles, missing descriptions, JavaScript heavy pages, and partial crawls.\n\nIn other words, it does not only produce a summary. It produces a receipt. The bundle is small enough to read by hand. A person can open `llms.txt` first for the plain language version. A script can read `runtime.json` to see what happened during generation. Another tool can read `context.json` for routes and headings. `system.json` can describe the discovered shape of the site.\n\nNone of this is glamorous infrastructure. That is why I like it. It is just enough structure to reduce guessing.\n\n## The Demo That Looked Like Failure\n\nThe most clarifying test was not a clean static site. It was a JavaScript heavy app shell. The output was thin. There was little useful title metadata. There was little useful description metadata. The static HTML did not reveal much route structure. The artifact warned that JavaScript appeared to be required for meaningful content.\n\nAt first glance, that looks like the crawler failed, but I think it is the opposite. The tool did exactly what I wanted it to do. It refused to pretend that a mostly opaque page had become understandable. That distinction matters.\n\nIf a crawler says \"complete\" but the actual understanding is mostly fictional, the receiving system is now standing on bad ground. It may summarize confidently. It may recommend badly. It may compare two sites as if both were equally visible. It may act as if missing evidence is evidence.\n\nAn honest crawl gives the next system a better contract. It can say: this result is complete for the limits that were declared, but the static page was sparse. Or: this crawl is partial because one route failed. Or: this bundle was produced without executing JavaScript, so do not treat it as a full rendering of the application. That is not a weakness. That is the beginning of trust.\n\n## Why This Also Matters For People\n\nIt would be easy to frame all of this as something machines need. I think that misses the better point: people need it too. Anyone who has inherited a codebase knows the feeling of trying to understand a system from the outside. Where are the important routes? What does the build emit? Which files are source and which are generated? What changed? What failed? What does this project think it is?\n\nGood documentation helps. Good code helps. Good naming helps. But systems also need live, boring, generated facts about themselves.\n\nThis is why I have been exploring similar ideas in Paideia, the small framework this blog is built with. Paideia generates a site, but it also emits runtime artifacts: a system description, a runtime identity file, a compact context file, and an `llms.txt` entry point.\n\nThe philosophy is the same as `agentify`, but from the other direction. `agentify` is retrofit: it takes an existing site and tries to describe what can be observed. Paideia is native generation: the framework already knows what it created, so it can describe the system directly. Both paths matter.\n\nRetrofit matters because most of the web already exists. You cannot ask every site to rebuild itself before it becomes more inspectable. A small tool that can produce a useful receipt from the outside is practical.\n\nNative generation matters because it is cleaner. A framework does not need to guess its own routes, artifacts, capabilities, or diagnostics. It can publish them as part of the build. Manual retrofit is useful. Native explanation is stronger. The interesting thing is that both point toward the same idea: software should make its shape easier to inspect.\n\n## Caveats\n\nThere are plenty of caveats. Some sites cannot expose too much structure without creating security or abuse problems. Some crawls should respect robots.txt more deeply than a prototype does. Some pages need authenticated context. Some sites are intentionally dynamic. Some metadata is hard to summarize. Some agents will misuse good artifacts anyway.\n\nThere is also a risk of inventing too many files too quickly. The web does not need another pile of ceremonial formats that nobody maintains. If runtime receipts become useful, they will need to stay small, boring, and close to facts that software already knows.\n\nThat is why I am more interested in working examples than declarations. A route list is useful. A crawl status is useful. A warning code is useful. A generated artifact inventory is useful. A vague claim that a site is \"AI ready\" is not useful.\n\nThe standard should come after the habit, if it comes at all.\n\n## What I Mean By Agent Readable\n\nAn agent-readable site is not a site that flatters agents. It is not a site stuffed with keywords for language models. It is not a site that replaces human writing with machine instructions. It is not a site that assumes automation is the primary audience. An agent-readable site is a site that publishes enough context for another system to behave more carefully around it.\n\nThat can be modest.\n\nIt can mean a plain text guide. It can mean a route inventory. It can mean metadata that is accurate. It can mean a runtime receipt. It can mean warnings when a crawl is incomplete. It can mean saying \"this page requires JavaScript\" instead of pretending the static result was meaningful.\n\nThe web spent decades optimizing presentation. That work still matters. People should remain the first audience for most sites. But presentation is not the same as inspectability.\n\nAs more software reads, compares, and acts on the web, inspectability becomes part of the public surface of a site. Not every site needs the same depth. A personal blog, a government service, a documentation site, an online store, and a private dashboard have different risks and responsibilities.\n\nThe shared principle is smaller: do not make other systems guess more than they have to. Publish what exists. Say what failed. Mark the limits. Keep the artifacts readable. Let humans and tools inspect the same facts.\n\nThat is the agent-readable web I want: not a web that becomes less human, but a web where software is more honest about what it knows.\n", "tokenSummary": "Essay arguing that websites need small, honest runtime receipts for routes, crawl status, warnings, artifacts, and limits so humans and agents can inspect systems without guessing.", "status": "published", "order": 1}], "content/pages": [{"kind": "page", "slug": "about", "path": "/about", "title": "About", "description": "About Lautaro G\u00e4rtner, an independent software developer and creator in Argentina.", "body": "I'm Lautaro G\u00e4rtner, an independent software developer and creator based in Crespo, Argentina. I build tailored websites, applications, and tools for businesses and for my own experiments.\n\n## Work\n\nI work directly with people who need software to solve a concrete problem: a clear business site, a catalog, an event page, a quoting system, or a custom application. I care about making the result understandable and useful, including the less glamorous parts such as domains, deployment, analytics, and handing over real ownership.\n\n## Software and writing\n\nI mostly work with TypeScript, React, Node.js, Ruby on Rails, and SQL. The writing here covers software engineering, product decisions, agent-readable systems, and lessons from building and operating small products.\n\nPaideia Framework is one of those projects: an experiment in generated software that can describe its own structure and runtime. It informs some of the essays on this site, but it is one project among the broader work collected here.\n\n## Contact\n\nFor a project, collaboration, or conversation, email me at [contact@lautarogartner.com](mailto:contact@lautarogartner.com?subject=Hello%20from%20lautarogartner.com&body=Hi%20Lautaro%2C%0A%0AI%27m%20reaching%20out%20about%3A%0A%0A%0AThanks%2C%0A) or find me on [LinkedIn](https://www.linkedin.com/in/lautarogartner).\n\nThe machine-readable files below describe how this site is built and provide compact context for people and software agents that want to inspect it.", "nav": true, "tokenSummary": "About Lautaro G\u00e4rtner, an independent software developer in Argentina building websites, applications, tools, and writing about software."}]})[dir];
var site = createSite(JSON.parse("{\n  \"title\": \"Lautaro G\u00e4rtner\",\n  \"description\": \"Focused improvements to existing quote and contact flows for service businesses. Explore real work and discuss a measurable website change with Lautaro G\u00e4rtner.\",\n  \"url\": \"https://www.lautarogartner.com\",\n  \"author\": \"Lautaro G\u00e4rtner\",\n  \"authorUrl\": \"https://x.com/lautarogartner_\",\n  \"followLabel\": \"Follow\",\n  \"sourceUrl\": \"https://github.com/LautaroGartner/lautarogartner.com\"\n}\n"), read("content/posts").filter((x) => x.status === "published").sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), read("content/pages"));
for (const page of site.pages) write(getSiteOutputPath(page), generateSitePage(site, page));
for (const post of site.posts) write(`${post.slug}/index.html`, generatePostPage(site, post, { imagePath: `/social/${post.slug}.png` }));
for (const [file, value] of [["sitemap.xml", generateSitemapXml(site)], ["context.json", generateContextJson(site)], ["llms.txt", generateLlmsText(site)], ["robots.txt", generateRobotsTxt(site)], ["404.html", generateNotFoundPage(site)]]) write(file, value);
write("portfolio.js", "(() => {\n document.documentElement?.classList?.remove('opening-pending');\n const equivalents = {offer:'oferta',work:'trabajos','about-me':'sobre-mi',contact:'contacto',tiki:'tiki',lucia:'lucia',filsen:'filsen'};\n const updateLanguage = () => {\n  const link=document.querySelector('[data-language]'); if(!link) return;\n  const hash=decodeURIComponent(location.hash.slice(1));\n  const map=link.dataset.language==='es'?equivalents:Object.fromEntries(Object.entries(equivalents).map(([a,b])=>[b,a]));\n  link.href=link.pathname+(map[hash]?'#'+map[hash]:'');\n };\n updateLanguage(); window.addEventListener('hashchange',updateLanguage);\n const clocks=[...(document.querySelectorAll?.('[data-local-time]')||[])];\n if(clocks.length){\n  let clockTimer;\n  const updateClock=()=>{\n   window.clearTimeout(clockTimer);if(document.visibilityState==='hidden')return;\n   const now=new Date();clocks.forEach(clock=>{clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:clock.dataset.timezone,hour:'2-digit',minute:'2-digit',hour12:false}).format(now);clock.dateTime=now.toISOString();});\n   clockTimer=window.setTimeout(updateClock,60000-(Date.now()%60000));\n  };\n  updateClock();document.addEventListener('visibilitychange',updateClock);\n }\n if('IntersectionObserver' in window){\n  const graphics=document.querySelectorAll('[data-motion-graphic]');\n  const graphicObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-motion-visible',entry.isIntersecting)),{rootMargin:'40px'});\n  graphics.forEach(graphic=>graphicObserver.observe(graphic));\n }\n const button=document.querySelector('.copy-email'),status=document.querySelector('.copy-status');\n if(button) button.addEventListener('click',async()=>{\n  try { if(!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(button.dataset.email); status.textContent=button.dataset.success; }\n  catch { status.textContent=button.dataset.failure; const range=document.createRange(); range.selectNodeContents(document.querySelector('.email-address')); const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(range); }\n });\n // The scene has one interruptible state shared by title, tiles and collage.\n // Server-rendered content stays readable when scripts or motion are disabled.\n const scene=document.querySelector('[data-scene]');\n if(scene&&location.hash){\n  const lang=(location.pathname||'/').startsWith('/es')||(location.pathname||'').endsWith('/es')?'es':'en';\n  const legacy={offer:'services',oferta:'services',work:'work',trabajos:'work','about-me':'about','sobre-mi':'about',contact:'contact',contacto:'contact',tiki:'work/tiki',lucia:'work/lucia',filsen:'work/filsen'};\n  const route=legacy[location.hash.slice(1)];\n  if(route&&location.replace){location.replace((lang==='es'?'/es':'')+'/'+route);return;}\n }\n const draft=document.querySelector('[data-contact-draft]');\n if(draft)draft.addEventListener('submit',event=>{\n  event.preventDefault();if(!draft.reportValidity())return;\n  const values=new FormData(draft);\n  const text=`Email: ${values.get('email')}\\n\\n${values.get('project')}\\n\\n${values.get('website')||''}`;\n  location.href=`mailto:${draft.dataset.to}?subject=${encodeURIComponent(draft.dataset.subject)}&body=${encodeURIComponent(text)}`;\n });\n const workIndex=document.querySelector('[data-work-index]');\n if(workIndex){\n  document.querySelectorAll('[data-work-filter]').forEach(button=>button.addEventListener('click',()=>{\n   const category=button.dataset.workFilter;\n   document.querySelectorAll('[data-work-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));\n   workIndex.querySelectorAll('[data-category]').forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;});\n  }));\n  document.querySelectorAll('[data-work-view]').forEach(button=>button.addEventListener('click',()=>{\n   workIndex.dataset.view=button.dataset.workView;\n   document.querySelectorAll('[data-work-view]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));\n  }));\n }\n if(scene){\n  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');\n  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');\n  const mobileLayout=window.matchMedia('(max-width: 740px)');\n  const tiles=[...scene.querySelectorAll('[data-project]')];\n  const contexts=[...scene.querySelectorAll('[data-context]')];\n  const reset=scene.querySelector('[data-scene-reset]');\n  let pinned=null,leaveTimer=0,frame=0,opening=false;\n  const cancelLeave=()=>window.clearTimeout(leaveTimer);\n  const select=(project)=>{\n   cancelLeave();\n   if(project){opening=false;document.documentElement.classList.remove('motion-enter');}\n   scene.dataset.focus=project||'overview';\n   tiles.forEach(tile=>tile.setAttribute('aria-pressed',String(tile.dataset.project===project)));\n   contexts.forEach(context=>{\n    const active=context.dataset.context===project;\n    context.setAttribute('aria-hidden',String(!active));\n    context.querySelector('a').tabIndex=active?0:-1;\n   });\n   scene.querySelector('.scene-overview a').tabIndex=project&&!mobileLayout.matches?-1:0;\n   reset.tabIndex=project?0:-1;\n  };\n  const restore=()=>{pinned=null;select(null);tiles.forEach(tile=>{tile.style.removeProperty('--float-x');tile.style.removeProperty('--float-y');});};\n  tiles.forEach(tile=>{\n   tile.addEventListener('pointerenter',()=>{if(finePointer.matches&&!pinned&&!opening)select(tile.dataset.project);});\n   tile.addEventListener('pointerleave',()=>{if(!pinned)leaveTimer=window.setTimeout(()=>{if(!scene.contains(document.activeElement))select(null);},110);});\n   tile.addEventListener('focus',()=>{pinned=null;select(tile.dataset.project);});\n   tile.addEventListener('click',()=>{const id=tile.dataset.project;const link=contexts.find(context=>context.dataset.context===id)?.querySelector('a');if(finePointer.matches&&!mobileLayout.matches&&link?.click){link.click();return;}pinned=pinned===id?null:id;select(pinned);});\n   tile.addEventListener('pointermove',event=>{\n    if(reduced.matches||!finePointer.matches||frame)return;\n    frame=window.requestAnimationFrame(()=>{\n     frame=0;const box=tile.getBoundingClientRect();\n     tile.style.setProperty('--float-x',`${((event.clientX-box.left)/box.width-.5)*10}px`);\n     tile.style.setProperty('--float-y',`${((event.clientY-box.top)/box.height-.5)*10}px`);\n    });\n   });\n  });\n  contexts.forEach(context=>context.addEventListener('pointerenter',cancelLeave));\n  scene.addEventListener('pointerleave',()=>{if(!pinned&&!scene.contains(document.activeElement))select(null);});\n  scene.addEventListener('focusout',()=>{window.setTimeout(()=>{if(!scene.contains(document.activeElement)&&!pinned)select(null);},0);});\n  scene.addEventListener('keydown',event=>{if(event.key==='Escape'){restore();document.activeElement?.blur?.();}});\n  reset.addEventListener('click',restore);\n  select(null);\n  const backForward=typeof performance!=='undefined'&&performance.getEntriesByType?.('navigation')?.[0]?.type==='back_forward';\n  if(!reduced.matches&&!backForward&&!window.__portfolioInternalNavigation){\n   const elapsed=window.__portfolioOpeningStarted&&typeof performance!=='undefined'?performance.now()-window.__portfolioOpeningStarted:0;\n   const remaining=Math.max(0,3800-elapsed);\n   opening=remaining>0;\n   if(opening)document.documentElement.classList.add('motion-enter');\n   window.setTimeout(()=>{\n    opening=false;document.documentElement.classList.remove('motion-enter');\n    try{sessionStorage.setItem('portfolio-opening-v3','seen');}catch{}\n   },remaining);\n  }\n  window.addEventListener('pageshow',event=>{if(event.persisted)document.documentElement.classList.remove('motion-enter');});\n  // Native scrolling keeps browser history, anchors and keyboard behavior.\n  // Reveal animation never hides content while waiting for an observer.\n  if('IntersectionObserver' in window){\n   const observer=new IntersectionObserver(entries=>{\n    entries.forEach(entry=>{\n     if(!entry.isIntersecting)return;\n     observer.unobserve(entry.target);\n     if(!reduced.matches)entry.target.animate([\n      {opacity:.35,transform:'translateY(28px)'},\n      {opacity:1,transform:'translateY(0)'}\n     ],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});\n    });\n   },{threshold:.12});\n   document.querySelectorAll('.project,.section-grid,.steps article,.contact,.recent-writing').forEach(element=>observer.observe(element));\n  }\n  reduced.addEventListener('change',()=>{\n   if(reduced.matches){document.documentElement.classList.remove('motion-enter');document.getAnimations().forEach(animation=>animation.cancel());tiles.forEach(tile=>{tile.style.removeProperty('--float-x');tile.style.removeProperty('--float-y');});}\n  });\n }\n})();\n");
write("motion-shell.js", "(() => {\n const root=document.documentElement;\n const reduced=matchMedia('(prefers-reduced-motion: reduce)');\n const fine=matchMedia('(hover: hover) and (pointer: fine)');\n const ease='cubic-bezier(.76,0,.24,1)';\n const menu=document.querySelector('.site-menu'),open=document.querySelector('[data-menu-open]'),close=document.querySelector('[data-menu-close]');\n let menuClosing=0,previousOverflow='';\n const closeMenu=()=>{\n  if(!menu?.open||menuClosing)return;\n  root.classList.remove('menu-visible');open?.setAttribute('aria-expanded','false');\n  menuClosing=setTimeout(()=>{menu.close();document.body.style.overflow=previousOverflow;menuClosing=0;},reduced.matches?0:850);\n };\n open?.addEventListener('click',()=>{\n  if(menu.open){closeMenu();return;}\n  previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';\n  menu.showModal();void menu.offsetWidth;open.setAttribute('aria-expanded','true');requestAnimationFrame(()=>root.classList.add('menu-visible'));\n });\n close?.addEventListener('click',closeMenu);\n menu?.addEventListener('cancel',event=>{event.preventDefault();closeMenu();});\n menu?.addEventListener('click',event=>{if(event.target===menu)closeMenu();});\n\n // Preserve native history/new tabs/external URLs; cover only ordinary internal navigation.\n const curtain=document.querySelector('.route-curtain');let navigating=false;\n try{\n  const stored=sessionStorage.getItem('portfolio-route-transition');const arriving=stored?JSON.parse(stored):null;\n  sessionStorage.removeItem('portfolio-route-transition');\n  const navigationType=performance.getEntriesByType('navigation')[0]?.type;\n  const fresh=arriving&&Date.now()-arriving.createdAt<60000;\n  if(fresh&&navigationType!=='reload'&&navigationType!=='back_forward'&&arriving.path.replace(/\\/+$/,'')===location.pathname.replace(/\\/+$/,'')){\n   curtain.querySelector('span').textContent='';\n   sessionStorage.removeItem('portfolio-route-transition');\n   if(!reduced.matches){window.__portfolioRouteEnterStarted??=performance.now();root.classList.add('route-enter');setTimeout(()=>{root.classList.remove('route-enter','home-route-enter');document.querySelector('#content')?.focus({preventScroll:true});},Math.max(0,1050-(performance.now()-window.__portfolioRouteEnterStarted)));}\n  }\n }catch{}\n document.addEventListener('click',event=>{\n  const anchor=event.target.closest?.('a[href]');\n  if(!anchor||reduced.matches||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||anchor.target||anchor.hasAttribute('download'))return;\n  const url=new URL(anchor.href,location.href);\n  if(url.origin!==location.origin||url.protocol!=='http:'&&url.protocol!=='https:'||url.pathname.startsWith('/admin')||url.pathname.startsWith('/api'))return;\n  if(navigating){event.preventDefault();return;}\n  const normalize=path=>path.replace(/\\/+$/,'')||'/';\n  if(normalize(url.pathname)===normalize(location.pathname)&&url.search===location.search){\n   if(!url.hash){event.preventDefault();document.querySelector('[data-scene-reset]')?.click();scrollTo({top:0,behavior:'smooth'});}\n   return;\n  }\n  event.preventDefault();navigating=true;\n  const beginExit=()=>{\n   const opening=root.classList.contains('motion-enter')?document.querySelector('.opening-curtain'):null;\n   const cover=opening?getComputedStyle(opening):null;\n   const from=cover?{transform:cover.transform,borderRadius:cover.borderRadius}:null;\n   curtain.getAnimations().forEach(animation=>animation.cancel());curtain.style.removeProperty('animation');\n   root.classList.remove('motion-enter','route-enter');root.classList.add('route-exit');\n   curtain.querySelector('span').textContent='';\n   if(from){curtain.style.animation='none';curtain.animate([from,{transform:'none',borderRadius:'0px'}],{duration:650,easing:ease,fill:'forwards'});}\n   try{sessionStorage.setItem('portfolio-route-transition',JSON.stringify({path:url.pathname,title:'',createdAt:Date.now()}));}catch{}\n   setTimeout(()=>{if(menu?.open){menu.close();open?.setAttribute('aria-expanded','false');document.body.style.overflow=previousOverflow;root.classList.remove('menu-visible');}location.assign(url.href);},720);\n  };\n  // Finish an incoming reveal before starting a new cover; never reset a moving curtain offscreen.\n  const remaining=root.classList.contains('route-enter')?Math.max(0,1050-(performance.now()-(window.__portfolioRouteEnterStarted||0))):0;\n  if(remaining)setTimeout(beginExit,remaining);else beginExit();\n });\n window.addEventListener('pageshow',event=>{\n  if(event.persisted){navigating=false;clearTimeout(menuClosing);menuClosing=0;open?.setAttribute('aria-expanded','false');root.classList.remove('route-exit','route-enter','home-route-enter','menu-visible','work-cursor-visible');if(menu?.open)menu.close();document.body.style.overflow=previousOverflow;}\n });\n\n // Magnetic motion stays attached to the actual accessible link/button.\n document.querySelectorAll('.portfolio-header nav a,.header-contact,.writing-utility,.languages a,.brand-roll,.round-link,.round-submit,.floating-menu-button,.menu-close,.site-menu nav a').forEach(element=>{\n  if(element.matches('.portfolio-header nav a,.header-contact,.writing-utility,.languages a,.site-menu nav a,.round-link,.round-submit')){const label=document.createElement('span');label.className='magnetic-label';while(element.firstChild)label.append(element.firstChild);element.append(label);}\n  let box;\n  const reset=()=>{element.style.removeProperty('--magnet-x');element.style.removeProperty('--magnet-y');box=null;};\n  element.addEventListener('pointerenter',()=>{if(fine.matches&&!reduced.matches)box=element.getBoundingClientRect();});\n  element.addEventListener('pointermove',event=>{\n   if(!box||reduced.matches||!fine.matches)return;\n   const round=element.matches('.round-link,.round-submit,.floating-menu-button,.menu-close');\n   const limit=round?18:9;\n   element.style.setProperty('--magnet-x',`${Math.max(-limit,Math.min(limit,(event.clientX-box.left-box.width/2)*.22))}px`);\n   element.style.setProperty('--magnet-y',`${Math.max(-limit,Math.min(limit,(event.clientY-box.top-box.height/2)*.22))}px`);\n  });\n  element.addEventListener('pointerleave',reset);element.addEventListener('blur',reset);element.addEventListener('pointerdown',reset);\n });\n\n const work=document.querySelector('[data-work-index]'),scene=document.querySelector('[data-scene]');\n if((work||scene)&&fine.matches&&!reduced.matches){\n  const cursor=document.createElement('span');cursor.className='work-view-cursor';const cursorLabel=document.createElement('span');cursorLabel.textContent=document.documentElement.lang==='es'?'Ver':'View';cursor.append(cursorLabel);cursor.setAttribute('aria-hidden','true');document.body.append(cursor);\n  const preview=document.createElement('div');preview.className='work-hover-preview';preview.setAttribute('aria-hidden','true');const stack=document.createElement('div');stack.className='work-preview-stack';const cards=[...(work||scene).querySelectorAll(work?'.work-card':'[data-project]')];if(work)cards.forEach(card=>{const img=document.createElement('img'),main=card.querySelector('img'),source=card.querySelector('source');img.alt='';img.src=main.currentSrc||main.src;if(source){img.srcset=source.srcset;img.sizes='310px';}stack.append(img);});preview.append(stack);document.body.append(preview);\n  let frame=0,last;\n  cards.forEach((card,index)=>{\n   card.addEventListener('pointerenter',event=>{if(!fine.matches||reduced.matches)return;cursor.style.transition='none';cursor.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;void cursor.offsetWidth;cursor.style.removeProperty('transition');preview.style.transform=`translate3d(${Math.min(innerWidth-350,Math.max(16,event.clientX-155))}px,${Math.max(20,event.clientY-240)}px,0)`;preview.style.setProperty('--preview-index',index);root.classList.add('work-cursor-visible');root.classList.toggle('work-preview-visible',work?.dataset.view==='list');});\n   card.addEventListener('pointermove',event=>{if(!fine.matches||reduced.matches)return;last=event;if(frame)return;frame=requestAnimationFrame(()=>{frame=0;cursor.style.transform=`translate3d(${last.clientX}px,${last.clientY}px,0)`;preview.style.transform=`translate3d(${Math.min(innerWidth-350,Math.max(16,last.clientX-155))}px,${Math.max(20,last.clientY-240)}px,0)`;});});\n   card.addEventListener('pointerleave',()=>root.classList.remove('work-cursor-visible','work-preview-visible'));\n  });\n }\n\n // Direction indicator is decorative; native links and viewport scrolling retain their meaning.\n document.querySelectorAll('.route-head,.scene-topline,.about-orbit').forEach(host=>{const arrow=document.createElement('span');arrow.className='scroll-direction';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox=\"0 0 24 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M12 2v27m-7-7 7 7 7-7\" stroke=\"currentColor\" stroke-width=\"1.5\"/></svg>';host.append(arrow);});\n root.dataset.scrollDirection='down';let directionOrigin=scrollY;\n const footer=document.querySelector('.studio-footer');let scrollFrame=0;\n const paintScroll=()=>{\n  scrollFrame=0;if(Math.abs(scrollY-directionOrigin)>=12){root.dataset.scrollDirection=scrollY>directionOrigin?'down':'up';directionOrigin=scrollY;}root.classList.toggle('is-scrolled',scrollY>Math.min(260,innerHeight*.45));\n  if(footer){const box=footer.getBoundingClientRect();const progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight-box.top)/box.height));footer.style.setProperty('--footer-progress',progress.toFixed(4));footer.style.setProperty('--footer-bend',`${Math.round(110*(1-progress))}px`);footer.style.setProperty('--footer-shift',`${Math.round(45*(1-progress))}px`);}\n };\n window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paintScroll);},{passive:true});window.addEventListener('resize',paintScroll);paintScroll();\n if('IntersectionObserver' in window){\n  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(!reduced.matches&&!root.classList.contains('route-enter')&&!root.classList.contains('motion-enter'))entry.target.animate([{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:750,easing:ease});}),{threshold:.12});\n  document.querySelectorAll('.route-head,.case-intro,.case-cover,.case-gallery figure,.work-card,.about-identity,.post-body h2').forEach(element=>observer.observe(element));\n }\n reduced.addEventListener('change',()=>{if(reduced.matches){root.classList.remove('work-cursor-visible','work-preview-visible','route-exit','route-enter');document.getAnimations().forEach(animation=>animation.cancel());paintScroll();}});\n})();\n");
write("route-boot.js", "// Critical first-paint state. CSS completes the reveal even if the later controller fails.\n(() => {\n try{\n  const navigationType=performance.getEntriesByType('navigation')[0]?.type;\n  const restored=navigationType==='back_forward';\n  if(restored||matchMedia('(prefers-reduced-motion: reduce)').matches)return;\n  const normalize=path=>path.replace(/\\/+$/,'')||'/';\n  const path=normalize(location.pathname),home=['/','/es','/web','/web/es'].includes(path);\n  let route;try{route=JSON.parse(sessionStorage.getItem('portfolio-route-transition')||'null');}catch{}\n  const fresh=route&&Date.now()-route.createdAt<60000;\n  const internal=navigationType!=='reload'&&fresh&&normalize(route.path)===path;window.__portfolioInternalNavigation=Boolean(internal);\n  if(internal){window.__portfolioRouteEnterStarted=performance.now();document.documentElement.classList.add('route-enter');}\n  if(home&&!internal){window.__portfolioOpeningStarted=performance.now();document.documentElement.classList.add('motion-enter','opening-pending');setTimeout(()=>document.documentElement.classList.remove('motion-enter','opening-pending','home-route-enter'),4500);}\n }catch{}\n})();\n");
process.stdout.write(JSON.stringify(outputs));
