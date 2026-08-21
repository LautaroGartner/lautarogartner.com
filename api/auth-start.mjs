import { beginOAuth } from "../server/oauth.mjs";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const auth = beginOAuth();
    res.setHeader("Set-Cookie", auth.cookie);
    res.statusCode = 302;
    res.setHeader("Location", auth.url);
    return res.end();
  } catch (error) {
    return res.status(503).json({ error: error instanceof Error ? error.message : "Authentication unavailable" });
  }
}
