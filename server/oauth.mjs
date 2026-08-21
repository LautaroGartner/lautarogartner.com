import crypto from "node:crypto";

const OAUTH_COOKIE = "__Host-lg_oauth";
const callbackUrl = () => process.env.GITHUB_OAUTH_CALLBACK_URL || "https://www.lautarogartner.com/api/auth-callback";
const base64url = (buffer) => Buffer.from(buffer).toString("base64url");

export function beginOAuth() {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  if (!clientId) throw new Error("GitHub OAuth is not configured");
  const state = base64url(crypto.randomBytes(32));
  const verifier = base64url(crypto.randomBytes(48));
  const challenge = base64url(crypto.createHash("sha256").update(verifier).digest());
  const payload = base64url(JSON.stringify({ state, verifier, exp: Date.now() + 10 * 60 * 1000 }));
  const params = new URLSearchParams({ client_id: clientId, redirect_uri: callbackUrl(), state, code_challenge: challenge, code_challenge_method: "S256", allow_signup: "false", prompt: "select_account" });
  return {
    url: `https://github.com/login/oauth/authorize?${params}`,
    cookie: `${OAUTH_COOKIE}=${payload}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
  };
}

export function readOAuth(req, state) {
  const match = req.headers.cookie?.match(new RegExp(`(?:^|; )${OAUTH_COOKIE}=([^;]+)`));
  if (!match) return null;
  try {
    const data = JSON.parse(Buffer.from(decodeURIComponent(match[1]), "base64url").toString("utf8"));
    if (data.exp < Date.now() || data.state.length !== state.length || !crypto.timingSafeEqual(Buffer.from(data.state), Buffer.from(state))) return null;
    return data;
  } catch { return null; }
}

export const clearOAuthCookie = () => `${OAUTH_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export const oauthCallbackUrl = callbackUrl;

export async function exchangeCode(code, verifier) {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("GitHub OAuth is not configured");
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: callbackUrl(), code_verifier: verifier }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("GitHub rejected the authorization request");
  return data.access_token;
}

export async function githubUser(token) {
  const response = await fetch("https://api.github.com/user", { headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" } });
  if (!response.ok) throw new Error("Unable to verify GitHub identity");
  return response.json();
}

export async function revokeToken(token) {
  const credentials = Buffer.from(`${process.env.GITHUB_OAUTH_CLIENT_ID}:${process.env.GITHUB_OAUTH_CLIENT_SECRET}`).toString("base64");
  await fetch(`https://api.github.com/applications/${process.env.GITHUB_OAUTH_CLIENT_ID}/token`, {
    method: "DELETE",
    headers: { Accept: "application/vnd.github+json", Authorization: `Basic ${credentials}`, "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
    body: JSON.stringify({ access_token: token }),
  }).catch(() => {});
}
