import { requireAuth } from "../server/auth.mjs";
import { listContent, writeContent } from "../server/content.mjs";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function validate(post) {
  const required = post?.kind === "page"
    ? ["slug", "path", "title", "description", "body", "tokenSummary"]
    : ["slug", "title", "description", "publishedAt", "body", "tokenSummary"];
  for (const field of required) if (typeof post?.[field] !== "string" || !post[field].trim()) return `${field} is required`;
  if (!slugPattern.test(post.slug)) return "Slug may contain lowercase letters, numbers, and hyphens";
  if (post.kind !== "page" && !/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt)) return "Date must use YYYY-MM-DD";
  if (post.kind !== "page" && !["draft", "published"].includes(post.status)) return "Status must be draft or published";
  if (post.topics && (!Array.isArray(post.topics) || post.topics.some(topic => typeof topic !== "string"))) return "Topics must be text";
  return null;
}

export default async function handler(req, res) {
  if (!requireAuth(req, res, { csrf: req.method !== "GET" })) return;
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const { posts, pages } = await listContent();
      posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      return res.status(200).json({ posts, pages });
    }
    if (req.method === "PUT") {
      const error = validate(req.body?.post);
      if (error) return res.status(400).json({ error });
      return res.status(200).json({ post: await writeContent(req.body.post) });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Request failed" });
  }
}
