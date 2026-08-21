import { createSessionCookie, localPasswordMatches } from "../server/auth.mjs";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!localPasswordMatches(req.body?.password)) return res.status(404).json({ error: "Not found" });
  try {
    res.setHeader("Set-Cookie", createSessionCookie(req, { id: process.env.ADMIN_GITHUB_USER_ID || "158626277", login: "local-development" }));
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : "Authentication is not configured" });
  }
}
