# lautarogartner.com

The personal blog, separated from the Paideia Framework repository. Paideia remains the generator; this repository owns site identity, content, assets, and publishing.

## Local development

```bash
npm install
npm run dev
```

The public site runs through Paideia. The admin UI runs through Vite and expects the API routes under `api/`; use `vercel dev` when testing authenticated saves locally.

## Publishing

Posts are JSON documents in `content/posts`. The admin commits edits through GitHub's Contents API. A `draft` is committed but excluded from the public build; `published` is included on the next Vercel deployment.

Copy `.env.example` to `.env.local` and configure the values in Vercel. Generate `SESSION_SECRET` with `openssl rand -base64 48`.

Production admin authentication uses a GitHub OAuth app with callback URL `https://www.lautarogartner.com/api/auth-callback`. Access is allowlisted to the immutable `ADMIN_GITHUB_USER_ID`; no site password is stored. The OAuth token is used only to verify identity and is then revoked best-effort.

Use a fine-grained `GITHUB_TOKEN` restricted to this repository with Contents read/write access. This separate token performs content commits and must never be exposed to the browser.

## Deploy

Create a new GitHub repository named `lautarogartner.com`, push this project, import it into Vercel, and move the existing domain to the new Vercel project after the preview deployment passes.
