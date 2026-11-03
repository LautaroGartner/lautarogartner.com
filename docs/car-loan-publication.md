# Car loan calculator publication

## Public surfaces

- `/` and `/es`: interactive-tool feature linking to the calculator and matching-language tutorial. Existing featured client-work composition stays at three tiles.
- `/work` and `/es/work`: published calculator project in the work index.
- `/work/carcost` and `/es/work/carcost`: project details, genuine product screenshots, calculator and tutorial links.
- `/building-a-car-loan-calculator` and `/es/building-a-car-loan-calculator`: paired tutorials with reciprocal language links, canonicals, social images and sitemap entries.
- `/downloads/car-loan-calculator-source.zip`: the tested Next.js calculator source without dependencies, build files, credentials or local deployment configuration.
- `/articles/car-loan/`: three optimized article images and three 3840×2160 JPG masters.

## Content and calculation checks

The tutorials explain the 35,000 USD price / 5,000 USD down / 8% APR example, compare 36/60/84 months, distinguish loan payments from purchase cost, describe financed tax and fees, disclose excluded ownership costs, and explain cent rounding and the adjusted final payment. They include a runnable TypeScript payment example and instructions for the complete source download. The TypeScript example was executed independently against the preset, 0% APR, no principal, one-month repayment and invalid-principal cases.

The calculator's existing 27 amortization tests still describe the downloaded source. The website's production build and TypeScript check passed. All 53 website tests passed, including existing content preservation, reciprocal language metadata, canonical URLs, contact validation mocks, admin authentication tests and public route/assets checks. No real enquiry or email was sent.

The bilingual-writing fixture counts now include seven article pairs; all existing metadata and language safeguards remain active. Browser checks verified the homepage tutorial link, project actions, both translated articles, all three loaded images and independent code-block overflow. A discovered mobile article width issue was fixed by making the existing bounded article main column explicitly 100% wide.

## Image provenance and resolution

The built-in Image Gen tool produced three original concept illustrations at 1672×941. Their publication masters were technically resampled to 3840×2160 and are explicitly labeled upscaled in both articles. They are not claimed to be native 4K renders. An attempted native-4K batch through the connected image service was rejected before submission because the plan was insufficient; no paid job ran and no plan was changed.

The page versions are 1600×900 WebP files, approximately 41–65 KB each, loaded with fixed dimensions and lazy loading. Full-resolution masters are separate links. The three artworks are conceptual metaphors, while the project gallery uses real captures of the public calculator. Responsive work-image variants follow the site's existing 720/1440/2160/3840px convention. Prompt briefs and original filenames are recorded in `car-loan-image-prompts.md` and `car-loan-assets.json`.

## Release scope

Based on the verified production source at `14f30d025c1f19867ab903bec9913730d7095331`. Changes were prepared in an isolated worktree, preserving the older local checkout's unrelated uncommitted work. Publication uses one purposeful Git push and the existing Vercel Git deployment. No GitHub Actions workflow, database resource, DNS, billing setting, payment flow or application API was changed.
