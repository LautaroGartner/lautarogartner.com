# Verified source recovery backup

This is a recovery branch, not a deployment candidate. It preserves readable current motion/routes/styles, original uncommitted portfolio work, and the readable self-contained ready-r4 renderer. Original main/Projects and evicted files are unchanged.

The source manifest hashes the actual backed-up bytes. `.env*`, credentials, dependencies and generated releases were excluded. Earlier original homepage assets are preserved; missing newer supporting captures have not been substituted or fabricated.

`ready-r4-render-input.mjs` preserves the actual current public presentation, copy, styles and runtime embedded before eviction, and emits generated output JSON with Node. It has public content and no environment credentials. It is recovery evidence; do not use it as a substitute for validating the production API/admin build.

Source still evicted includes current presentation.mjs, project-media.mjs, content/portfolio/copy.json, package/config/admin changes and supporting assets. vendor/src/site.ts was recovered from an earlier cache whose byte count matches; vendor/src/site-build.ts cache is empty and was not used. Original user-version site-build.ts is preserved here, not claimed identical to the evicted implementation.

Finder Download Now for the isolated portfolio-review folder is still needed. Foundation coordinated read fails NSFileProviderInternalErrorDomain12, provider download never starts, and UI automation is disabled. A successful current production build and critical asset/touch/API/admin checks are required before publication. Production authorization is already granted separately.
