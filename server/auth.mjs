import crypto from "node:crypto";

const MAX_AGE = 60 * 30;
const production = () => process.env.NODE_ENV === "production";
const cookieName = () => production() ? "__Host-lg_admin" : "lg_admin_dev";
const secret = () => process.env.SESSION_SECRET || "";
const encode = (value) => Buffer.from(value).toString("base64url");
const sign = (value) => crypto.createHmac("sha256", secret()).update(value).digest("base64url");
const userAgentHash = (req) => crypto.createHash("sha256").update(req.headers["user-agent"] || "unknown").digest("base64url");

function cookie(req, name = cookieName()) {
  const match = req.headers.cookie?.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function same(value, expected) {
  if (typeof value !== "string" || typeof expected !== "string" || value.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function createSessionCookie(req, user) {
  if (secret().length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  const payload = encode(JSON.stringify({
    sub: String(user.id),
    login: user.login,
    exp: Date.now() + MAX_AGE * 1000,
    nonce: crypto.randomBytes(24).toString("base64url"),
    ua: userAgentHash(req),
  }));
  const secure = production() ? "; Secure" : "";
  return `${cookieName()}=${payload}.${sign(payload)}; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=${MAX_AGE}`;
}

export function clearSessionCookie() {
  const secure = production() ? "; Secure" : "";
  return `${cookieName()}=; Path=/; HttpOnly${secure}; SameSite=Strict; Max-Age=0`;
}

export function readSession(req) {
  if (secret().length < 32) return null;
  const raw = cookie(req);
  if (!raw) return null;
  const [payload, signature] = raw.split(".");
  if (!payload || !same(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (session.exp < Date.now() || !same(session.ua, userAgentHash(req))) return null;
    if (String(session.sub) !== String(process.env.ADMIN_GITHUB_USER_ID || "158626277")) return null;
    return session;
  } catch { return null; }
}

export function csrfFor(session) {
  return sign(`csrf:${session.nonce}`);
}

export function requireAuth(req, res, options = {}) {
  const session = readSession(req);
  if (!session) { res.status(401).json({ error: "Sign in required" }); return null; }
  if (options.csrf && !same(req.headers["x-csrf-token"], csrfFor(session))) {
    res.status(403).json({ error: "Invalid request token. Refresh and try again." });
    return null;
  }
  return session;
}

export function localPasswordMatches(candidate) {
  if (production()) return false;
  const expected = process.env.LOCAL_ADMIN_PASSWORD || "local-paideia";
  return same(candidate, expected);
}
