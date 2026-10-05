# Portrait and favicon revision

Prepared on a separate local branch, based on `b3a681dc91940698b852cd3c18d7202caa925918`. This revision has not been pushed or deployed.

The supplied Library portrait (`libfile_e4c393c573488191a316da6b54e51f7a`, version 0) is 1122 × 1402 pixels. It is an actual portrait, not a design reference. Responsive WebP derivatives are 360, 640, 960 and 1122 pixels wide, with a 640-pixel JPEG fallback. No portrait pixels were upscaled, retouched or generated. A native 4K portrait requires a larger original.

Both `/about` and `/es/about` now pair the portrait with the existing biography. A subtle 18-pixel scroll parallax and short clip reveal run as progressive enhancement; reduced-motion and JavaScript-disabled views remain static and visible. Mobile layout stacks the photograph above the biography. The photograph is not interactive and adds no keyboard focus stop.

The original LG favicon uses geometric paths rather than font-dependent text. It is SVG and therefore resolution-independent, with 16/32/48 ICO, 32-pixel PNG, 180-pixel Apple, and 192/512-pixel manifest icons. A 4096 × 4096 raster master was rendered from the vector, independently of the portrait. Metadata is emitted by the existing Paideia head builder.

Validation: `npm run build`, `npm run check`, and all 25 existing Node tests passed. The asset-link test now recognizes file extensions generically so ICO, PNG and manifest links are validated. Chromium checks passed for desktop English, touch mobile Spanish, reduced motion, and JavaScript disabled: decoded portrait, no horizontal overflow, localized heading/alt text, scroll response only when enabled, keyboard skip link, and successful icon/manifest responses. Desktop and mobile screenshots were visually inspected. Safari was not tested.

Local preview: http://127.0.0.1:8767/about and http://127.0.0.1:8767/es/about . Previous approved preview remains on port 8766. API and admin source files were not changed.

Supporting logs: `/tmp/portfolio-portrait-build.log`, `/tmp/portfolio-portrait-check.log`, `/tmp/portfolio-portrait-tests.log`, `/tmp/portrait-browser-review.log`. Screenshots: `/tmp/portrait-desktop.png`, `/tmp/portrait-mobile-es.png`, `/tmp/portrait-reduced.png`, `/tmp/portrait-no-js.png`.
