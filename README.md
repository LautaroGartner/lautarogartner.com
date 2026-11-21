# lautarogartner.com

The personal blog, separated from the Paideia Framework repository. Paideia remains the generator; this repository owns site identity, content, assets, and publishing.

## Local development

```bash
npm install
npm run dev
```

The public site runs through Paideia. The admin UI runs through Vite and expects the API routes under `api/`; use `vercel dev` when testing authenticated saves locally.

Assessment submissions appear in the private admin under **Leads** (`/admin/?view=leads`). The form and admin read the same `LEAD_DATABASE_URL`. Qualification tags are saved in that database. For local use, point both processes at the same SQLite file outside the public directory.

## Publishing

Posts are JSON documents in `content/posts`. The admin commits edits through GitHub's Contents API. A `draft` is committed but excluded from the public build; `published` is included on the next Vercel deployment.

Copy `.env.example` to `.env.local` and configure the values in Vercel. Generate `SESSION_SECRET` with `openssl rand -base64 48`.

Production admin authentication uses a GitHub OAuth app with callback URL `https://www.lautarogartner.com/api/auth-callback`. Access is allowlisted to the immutable `ADMIN_GITHUB_USER_ID`; no site password is stored. The OAuth token is used only to verify identity and is then revoked best-effort.

Use a fine-grained `GITHUB_TOKEN` restricted to this repository with Contents read/write access. This separate token performs content commits and must never be exposed to the browser.

## Deploy

Create a new GitHub repository named `lautarogartner.com`, push this project, import it into Vercel, and move the existing domain to the new Vercel project after the preview deployment passes.

## Portfolio content and presentation

The public website remains static Paideia HTML. React/Vite is only the admin.

- The public site is English only. Edit the consulting offer and website video script in `site/consulting.mjs`. English portfolio material lives in `content/portfolio/copy.json`. The build omits archived translations. Former Spanish URLs redirect to their English equivalents through `vercel.json`.
- `site/presentation.mjs` and `site/routes.mjs` compose the public routes, navigation, contact URLs and writing index.
- `content/pages/about.json` and `content/posts/*.json` remain editable in the existing admin. Draft filtering and saves are unchanged. `/writing` is derived from published posts. The commercial pages are **not editable in the admin**; their previous markdown sources are preserved in `docs/original`, rather than exposing controls that cannot save the new composition. The contextual admin shortcut opens the admin without a false post target on commercial routes.
- `api/preview.mjs` uses the same shared presentation for editable About/articles; authentication, CSRF and save APIs are unchanged. This route was covered by renderer tests, not a real production authenticated session. The iframe inherits the current preview host so local assets do not point to unpublished production paths.
- `public/work` contains local optimized captures and the original 1200×630 social composition. Asset provenance is in `docs/assets-manifest.json`; copy/evidence limits are in `docs/content-evidence.md`.
- The minimal vendor extension adds optional localized header/footer HTML, SEO title, social image, canonical path and alternate language links. Existing pages without these fields retain the default renderer. The site supplies its own content, styles and chrome; no framework migration.

### Check and preview

```bash
npm run check
npm run build
node --test tests/portfolio.test.mjs
npm run test:security
npm run doctor
npm run inspect
npm start
```

The built preview normally runs at http://localhost:3000. Check `/`, `/more-clients`, `/#discuss`, and `/writing`. The standalone Paideia runtime serves static pages. Test hosting redirects with a Vercel-compatible server.

Detailed results, laboratory reports, screenshots and verification limits: `docs/qa/verification.md`.
