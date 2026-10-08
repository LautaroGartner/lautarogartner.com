# Organic growth and enquiry review — 8 October 2026

Review only. No push, PR, merge, deployment, account creation, provider configuration or real enquiry sending occurred.

## Source and preservation

On this connected Mac, the permitted task directory was empty. The app's saved Desktop project path no longer existed. The real checkout is `/Users/lautarogartner/Projects/lautarogartner.com`, on main at 576cd91 with the uncommitted October 4 redesign and unrelated checkout/payment work. No edits, reset, checkout, stash or fetch were performed in that original checkout.

Its complete non-secret source/Git snapshot was copied into the task's `review/` folder. Fetching public origin in that copy showed current main at 44e5f674 (October 6 canonical fixes included). The task's `growth-review/` worktree and `review/organic-growth-20261008` branch start from that current version. The snapshot retains the original dirty files for comparison. No AGENTS.md or .agents/skills instructions were present in the inspected ancestor directories or repository. Relevant local Codex memories were read, not changed.

The prepared Library brief `libfile_a8a651efd1488191a5b6d7118e0be795` was resolved using the current Library skill and its resolved-reference helper. Both fresh local transfer attempts returned HTTP 403. It was not readable locally and was not used. Content comes from the explicit scope, current repository and `docs/content-evidence.md`; Tiki's public flow was not submitted or PDF-delivery tested.

## Changes

- `/services` and `/es/services`: clear website-repair, quote/contact-form and small-business-site use cases, existing USD 100 isolated-repair boundary, scoped new-site language, practical first steps, FAQs and links to localized contact and Tiki pages. No new routes or unsupported business outcomes.
- Existing Tiki case in both languages: guest/service/extras choices, estimated total, WhatsApp handoff and personal confirmation. PDF is described as an action, not proven delivery. Explicitly distinguishes implementation from measured results and estimates from bookings. Adds a relevant contact CTA.
- `/contact` and `/es/contact`: real same-origin submission interface with localized pending, unavailable, rate-limit, error and provider-acceptance states. Direct mailto alternatives retain the intentional `contact@`/`hola@` addresses and disclose that they open drafts. No-JS view disables the API button and explains direct email. No existing article URLs, canonical fixes, About photo pixels, admin/auth APIs or other projects changed.
- `api/enquiry.mjs`: dependency-free Resend adapter, plain-text owner-only mail to `lautaro@lautarogartner.com`, visitor address as reply-to only. Fails closed without configuration. Signed expiring form token, same-origin check, field/body bounds, honeypot, bounded per-instance request limiting, provider timeout and idempotency key. No credentials or contents logged. This is prepared implementation, not a configured live delivery service.
- Frontend retains the exact first payload on ambiguous retries and locks edits after an attempted send; validation/token rejection unlocks it. Pending and accepted requests cannot be resubmitted from that page. Provider idempotency prevents duplicate email on matching retries. Success means provider acceptance, not confirmed inbox delivery.
- Analytics: the user subsequently requested replacing DataFast. Its site-wide loader and the newly prepared queue were removed from this review version. The form now dispatches a provider-neutral `enquiry:accepted` browser event after confirmed acceptance, containing only `language`. Session deduplication and accepted-state guard prevent repeated events. The selected replacement is free Google Analytics 4 standard: `public/analytics.js` connects that event to `enquiry_accepted` and records pageviews only after visitor opt-in. No Google network traffic occurs before consent or on localhost; advertising features are disabled and page queries/referrer paths are omitted. Declining or withdrawing stops tracking; a public GA4 measurement ID is still required. This local event alone is not external analytics ingestion. The unrelated Polar checkout cookie attribution code was left untouched.
- Favicons: actual About source `public/portrait/lautaro-1122.webp`, crop 1000×1000 at +61,+130 with a circular transparent mask, ImageMagick derivatives. ICO 16/32/48; PNG 32, Apple 180, manifest 192/512; self-contained 96px photo SVG. Original responsive portrait files unchanged. Versioned icon/head references; no generated imagery. SVG contains raster photo pixels rather than claiming vector photograph detail.

## Verification

Final checks passed:

- `npm run check`: vendored and app TypeScript checks, content compilation and admin Vite build.
- `npm run build`: 19 existing pages and 5 original posts, normalized manifest, passing diagnostics.
- `node --test tests/*.test.mjs`: 38 passed, 0 failed (30 original plus 8 new delivery-handler tests). Original security/canonical/route-boot regressions included.
- `npm run doctor`: 12 passed, 0 failed, 2 skips (static SQL and runtime-log creation).
- `npm run inspect`: normalized manifest, passing diagnostics.
- `git diff --check`: passed. Repository has no separate lint script.
- Real Chromium at 1440/390/320: all six service/contact/Tiki language routes have one H1, no horizontal overflow and paired language destinations. Actual EN→ES language navigation and localized service→contact CTA checked; mobile switching uses existing dialog. Direct email destinations/draft disclosures, unchanged decoded About photo, icon references and all seven icon/manifest HTTP paths checked. The manifest icons also use the new asset version.
- Synthetic form fixtures: empty validation, unconfigured local API, provider 502, rate 429, accepted state, retained details, exact retry payload, pending/accepted repeat prevention, visible button labels and one content-free goal passed. These fixture tests send no real email. No-JS Spanish direct-email fallback passed.
- Live production read-only observation: DataFast `/js/script.js` returned 304 and `window.datafast` was a function, with existing website identifier `dfid_TicEthGphV3CzxqMiE8Oq`. No confirmed ingestion POST/dashboard receipt was obtained; script loading alone is not an end-to-end analytics result.
- GA4 fixture checks passed at 1440 EN / 390 ES / 320 EN: no Google network before opt-in, persisted decline, one pageview and one accepted-enquiry event after consent, no form contents or URL query in queued payloads, and no further events/script reload after withdrawal. Canonical-origin HTML was served from the local build with a synthetic ID; Google requests were intercepted. This proves local event/consent behavior, not live Google ingestion.
- Final desktop/mobile screenshots visually reviewed. CSS and button-layer issues found during QA were corrected, then the complete browser suite rerun.

Local evidence (gitignored): `output/check.log`, `build.log`, `tests.log`, `doctor.log`, `inspect.log`, `browser.log`, `browser-evidence.json`, `browser-en.log`, `analytics-browser.log`, `analytics-browser-evidence.json` and `output/playwright/*.png`. Browser runner is `scripts/verify-growth-review.cjs` through the local Playwright skill CLI, against localhost port 8770.

Not run: real Resend test/inbox receipt, authenticated DataFast dashboard ingestion or live enquiry goal, production deployment, Safari/native tab-icon display, authenticated admin, actual OS zoom/media-preference switching. Most browser QA uses Chromium with reduced motion; an additional English accepted-flow check with motion enabled passed; existing motion/menu code was preserved. Favicon appearance was visually reviewed as an image and the browser paths/references verified, but native browser tab chrome was not captured.

## Configuration and release blockers

The user selected Resend. No approved credentials or verified sender for this site were available locally. Vercel environment metadata for `lautarogartner-blog` / `prj_zat7fpRehtsV4jS0HIa7Ri7cdQ4s`, team `team_9TYnlNc9FXWKvxiW5MjXQirA`, returned 403 for scope `lautarogartners-projects`. No Vercel CLI was installed for a credentials-based fallback.

Before real sending: make the site's existing approved Resend account configuration available; set server-only `RESEND_API_KEY` and a domain-verified `ENQUIRY_FROM` sender. The Vercel project-scope denial was respected; no alternate credentials route was attempted. Existing `SESSION_SECRET` signs tokens; optional dedicated `ENQUIRY_SECRET` is supported. Do not put keys in chat, client code or Git. No subscriber auto-reply is sent. The delivery recipient is fixed to the authorized owner address.

Before public release: review configuration and establish a Vercel/platform global rate-limit rule for `/api/enquiry`. The code's limiter is per warm instance and does not provide a global serverless quota. No persistent store or CAPTCHA provider was added. Provider idempotency follows Resend's retention rules; the form token expires after 30 minutes.

Then run one clearly labeled synthetic enquiry addressed only to the owner, confirm provider acceptance, and confirm inbox receipt when available. A provider receipt alone does not prove inbox delivery. Create the free GA4 standard property/web stream only after user confirmation, then set public `GA_MEASUREMENT_ID` (`G-…`) at build time. Disable enhanced measurement (especially automatic form interactions), Google Signals, advertising integrations and user-provided data collection; use only explicit `page_view` and `enquiry_accepted`, marking the latter as a key event. Confirm pageview and accepted-enquiry ingestion in Realtime/DebugView, without PII. No replacement account, subscription, API credential or property has been created. Credentials, access and deployment approval are separate remaining steps; nothing has been deployed.

Official references used for adapter/event behavior:
- https://resend.com/docs/api-reference/emails/send-email
- https://resend.com/docs/dashboard/emails/idempotency-keys
- https://marketingplatform.google.com/about/analytics/
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://developers.google.com/tag-platform/security/guides/consent
- https://vercel.com/docs/analytics/custom-events

## Replacement analytics choice

GA4 standard is free and supports the needed enquiry event. It is more complex than Vercel’s free pageview-only offering; Vercel custom events require Pro or Enterprise. GA4 sends usage data to Google and uses cookies after opt-in. This implementation deliberately sends no enquiry contents and disables advertising signals. Opt-in means reports represent consenting visitors; blockers also reduce collection. There is no session replay or Ads linkage. Choice retention is 90 days. Consent UI is EN/ES and remains accessible in the footer. Missing measurement ID keeps the integration inactive. Google property configuration and live ingestion remain separate from the locally tested code.

## Exact source files

- `.env.example`
- `api/enquiry.mjs`
- `content/portfolio/copy.json`
- `docs/review/organic-growth-20261008.md`
- `public/analytics.js`
- `public/apple-touch-icon.png`
- `public/contact.js`
- `public/favicon-32.png`
- `public/favicon.ico`
- `public/favicon.svg`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/portfolio.js`
- `public/site.webmanifest`
- `scripts/generate-profile-favicons.sh`
- `scripts/verify-analytics-review.cjs`
- `scripts/verify-growth-review.cjs`
- `site/motion.css`
- `site/routes.mjs`
- `tests/enquiry.test.mjs`
- `vendor/paideia-framework/src/site-build.ts`
