import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const postsDir = path.join(root, "content", "posts");
const pagesDir = path.join(root, "content", "pages");
const outputPath = path.join(root, "src", "generated", "content.ts");
const siteOutputPath = path.join(root, "src", "generated", "site-settings.ts");
const required = ["slug", "title", "description", "publishedAt", "body", "tokenSummary"];

const posts = fs.readdirSync(postsDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => {
    const post = JSON.parse(fs.readFileSync(path.join(postsDir, name), "utf8"));
    for (const field of required) {
      if (typeof post[field] !== "string" || !post[field].trim()) {
        throw new Error(`${name}: ${field} must be a non-empty string`);
      }
    }
    if (post.status !== "draft" && post.status !== "published") {
      throw new Error(`${name}: status must be draft or published`);
    }
    return { ...post, kind: "post" };
  })
  .filter((post) => post.status === "published")
  .sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt) ||
    (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
  )
  .map(({ status: _status, kind: _kind, order: _order, ...post }) => post);

const pages = fs.readdirSync(pagesDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => {
    const page = JSON.parse(fs.readFileSync(path.join(pagesDir, name), "utf8"));
    for (const field of ["path", "title", "description", "body", "tokenSummary"]) {
      if (typeof page[field] !== "string" || !page[field].trim()) throw new Error(`${name}: ${field} must be a non-empty string`);
    }
    const { kind: _kind, slug: _slug, ...compiled } = page;
    return compiled;
  });

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `export const posts = ${JSON.stringify(posts, null, 2)} as const;\n\nexport const contentPages = ${JSON.stringify(pages, null, 2)} as const;\n`);
const siteSettings = JSON.parse(fs.readFileSync(path.join(root, "content", "site.json"), "utf8"));
for (const field of ["title", "description", "url", "author", "authorUrl", "followLabel", "sourceUrl"]) {
  if (typeof siteSettings[field] !== "string" || !siteSettings[field].trim()) throw new Error(`site.json: ${field} must be a non-empty string`);
}
fs.writeFileSync(siteOutputPath, `export const siteSettings = ${JSON.stringify(siteSettings, null, 2)} as const;\n`);
console.log(`[content] compiled ${posts.length} published posts and ${pages.length} editable pages`);
