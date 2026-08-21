import { requireAuth } from "../server/auth.mjs";
import { readSiteSettings, writeSiteSettings } from "../server/content.mjs";

const required = ["title", "description", "url", "author", "authorUrl", "followLabel", "sourceUrl"];

function validate(settings) {
  for (const field of required) if (typeof settings?.[field] !== "string" || !settings[field].trim()) return `${field} is required`;
  for (const field of ["url", "authorUrl", "sourceUrl"]) {
    try { const parsed = new URL(settings[field]); if (!['http:', 'https:'].includes(parsed.protocol)) return `${field} must use HTTP or HTTPS`; }
    catch { return `${field} must be a valid URL`; }
  }
  return null;
}

export default async function handler(req, res) {
  if (!requireAuth(req, res, { csrf: req.method !== "GET" })) return;
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") return res.status(200).json({ settings: await readSiteSettings() });
    if (req.method === "PUT") {
      const error = validate(req.body?.settings);
      if (error) return res.status(400).json({ error });
      return res.status(200).json({ settings: await writeSiteSettings(req.body.settings) });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Request failed" });
  }
}
