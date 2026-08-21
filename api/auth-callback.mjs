import { createSessionCookie } from "../server/auth.mjs";
import { clearOAuthCookie, exchangeCode, githubUser, readOAuth, revokeToken } from "../server/oauth.mjs";

function redirect(res, location, cookies = []) {
  if (cookies.length) res.setHeader("Set-Cookie", cookies);
  res.statusCode = 302;
  res.setHeader("Location", location);
  return res.end();
}

export default async function handler(req, res) {
  const code = typeof req.query?.code === "string" ? req.query.code : "";
  const state = typeof req.query?.state === "string" ? req.query.state : "";
  const pending = code && state ? readOAuth(req, state) : null;
  if (!pending) return redirect(res, "/admin/?error=invalid_oauth", [clearOAuthCookie()]);

  let token;
  try {
    token = await exchangeCode(code, pending.verifier);
    const user = await githubUser(token);
    if (String(user.id) !== String(process.env.ADMIN_GITHUB_USER_ID || "158626277")) {
      return redirect(res, "/admin/?error=not_authorized", [clearOAuthCookie()]);
    }
    return redirect(res, "/admin/", [clearOAuthCookie(), createSessionCookie(req, user)]);
  } catch {
    return redirect(res, "/admin/?error=oauth_failed", [clearOAuthCookie()]);
  } finally {
    if (token) await revokeToken(token);
  }
}
