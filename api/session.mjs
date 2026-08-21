import { csrfFor, readSession } from "../server/auth.mjs";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const session = readSession(req);
  return res.status(200).json(session
    ? { authenticated: true, csrf: csrfFor(session), user: { login: session.login } }
    : { authenticated: false });
}
