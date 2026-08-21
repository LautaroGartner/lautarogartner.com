import assert from "node:assert/strict";
import test from "node:test";

process.env.NODE_ENV = "production";
process.env.SESSION_SECRET = "a-production-test-secret-that-is-longer-than-thirty-two-characters";
process.env.ADMIN_GITHUB_USER_ID = "158626277";
process.env.GITHUB_OAUTH_CLIENT_ID = "test-client-id";

const auth = await import("../server/auth.mjs");
const oauth = await import("../server/oauth.mjs");

function request(cookie = "", userAgent = "security-test-browser") {
  return { headers: { cookie, "user-agent": userAgent } };
}

test("session cookies are production hardened and restricted to the owner", () => {
  const req = request();
  const header = auth.createSessionCookie(req, { id: 158626277, login: "LautaroGartner" });
  assert.match(header, /^__Host-lg_admin=/);
  assert.match(header, /HttpOnly/);
  assert.match(header, /Secure/);
  assert.match(header, /SameSite=Strict/);
  assert.match(header, /Max-Age=1800/);
  const session = auth.readSession(request(header.split(";")[0]));
  assert.equal(session.login, "LautaroGartner");
  assert.equal(session.sub, "158626277");
});

test("session is rejected when copied to a different browser user agent", () => {
  const header = auth.createSessionCookie(request(), { id: 158626277, login: "LautaroGartner" });
  assert.equal(auth.readSession(request(header.split(";")[0], "different-browser")), null);
});

test("a validly signed session for any other GitHub user is rejected", () => {
  const header = auth.createSessionCookie(request(), { id: 999, login: "not-the-owner" });
  assert.equal(auth.readSession(request(header.split(";")[0])), null);
});

test("write authentication requires the session-derived CSRF token", () => {
  const header = auth.createSessionCookie(request(), { id: 158626277, login: "LautaroGartner" });
  const req = request(header.split(";")[0]);
  const session = auth.readSession(req);
  req.headers["x-csrf-token"] = auth.csrfFor(session);
  const res = { status() { throw new Error("valid request should not be rejected"); } };
  assert.equal(auth.requireAuth(req, res, { csrf: true }).sub, "158626277");
});

test("missing CSRF token rejects an authenticated write", () => {
  const header = auth.createSessionCookie(request(), { id: 158626277, login: "LautaroGartner" });
  let rejected = null;
  const res = { status(code) { rejected = { code }; return { json(body) { rejected.body = body; } }; } };
  assert.equal(auth.requireAuth(request(header.split(";")[0]), res, { csrf: true }), null);
  assert.equal(rejected.code, 403);
});

test("production disables the local password endpoint", () => {
  assert.equal(auth.localPasswordMatches("local-paideia"), false);
});

test("OAuth starts with state, PKCE, and a hardened short-lived cookie", () => {
  const started = oauth.beginOAuth();
  const url = new URL(started.url);
  assert.equal(url.hostname, "github.com");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.ok(url.searchParams.get("state")?.length >= 40);
  assert.ok(url.searchParams.get("code_challenge")?.length >= 40);
  assert.match(started.cookie, /^__Host-lg_oauth=/);
  assert.match(started.cookie, /HttpOnly; Secure; SameSite=Lax; Max-Age=600/);
});
