import { requireAuth } from "../server/auth.mjs";
import { listContent } from "../server/content.mjs";
import { generatePostPage, generateSitePage } from "../vendor/paideia-framework/build/site-build.js";

function clean(item) {
  const { kind: _kind, sha: _sha, status: _status, ...content } = item;
  return content;
}

export default async function handler(req, res) {
  if (!requireAuth(req, res, { csrf: true })) return;
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const item = req.body?.item;
    const settings = req.body?.settings;
    if (!item || !["post", "page"].includes(item.kind) || !settings) {
      return res.status(400).json({ error: "Preview content is required" });
    }

    const current = await listContent();
    const posts = current.posts
      .filter((post) => post.status === "published" && !(item.kind === "post" && post.slug === item.slug))
      .map(clean);
    const pages = current.pages
      .filter((page) => !(item.kind === "page" && page.slug === item.slug))
      .map(clean);
    const previewItem = clean(item);

    if (item.kind === "post") posts.push(previewItem);
    else pages.push(previewItem);

    const site = {
      title: settings.title,
      description: settings.description,
      url: settings.url,
      author: settings.author,
      authorUrl: settings.authorUrl,
      followLabel: settings.followLabel,
      sourceUrl: settings.sourceUrl,
      language: "en",
      posts,
      pages: [
        { path: "/", title: settings.title, description: settings.description, body: "", nav: false },
        ...pages,
      ],
    };

    let html = item.kind === "post"
      ? generatePostPage(site, previewItem)
      : generateSitePage(site, previewItem);

    html = html
      .replace(/\s*<script defer data-website-id="dfid_TicEthGphV3CzxqMiE8Oq" data-domain="www\.lautarogartner\.com" src="https:\/\/datafa\.st\/js\/script\.js"><\/script>/, "")
      .replace("<head>", `<head>\n    <base href="${settings.url.replace(/\/+$/, "")}/">`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Preview failed" });
  }
}
