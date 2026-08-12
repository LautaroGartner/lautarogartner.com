# lautarogartner.com

Lautaro Gärtner's personal blog about inspectable software, developer tooling, and the agent-readable web.

The site is generated with [Paideia Framework](https://github.com/LautaroGartner/paideia-framework). Its source content lives here so the framework and the website have independent histories and deployment lifecycles.

## Run locally

```bash
npm install
npm run build
npm run start
```

Then open `http://localhost:3000`.

## Write a post

```bash
npm run new:post -- "Post title"
```

Posts live in `src/writing/`. Site metadata and pages live in `src/site.ts`.

## Verify the generated site

```bash
npm run build
npm run doctor
npm run inspect
```

The production build is written to `dist/` and includes the human-facing pages plus `system.json`, `runtime.json`, `context.json`, and `llms.txt`.

## Deployment

Vercel runs `npm run build` and publishes `dist/`. The framework dependency is pinned to an immutable commit so deployments remain reproducible.
