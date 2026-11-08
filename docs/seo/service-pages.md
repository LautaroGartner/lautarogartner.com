# Service search implementation

8 November 2026. Based on main at `3b859cf`. The user excluded Tiki/bartending positioning; project descriptions and case content are unchanged. No new city pages, keyword domains, subscriptions or outside outreach.

## Delivered

- English and Spanish quote-calculator service pages: `/services/quote-calculator-development` and `/es/services/quote-calculator-development`.
- English and Spanish repair pages: `/services/contact-form-repair` and `/es/services/contact-form-repair`.
- English and Spanish interactive examples: `/demo/quote-calculator` and `/es/demo/quote-calculator`. The example is also embedded on the calculator service pages. The existing Spanish design demo is untouched.
- Fictional USD rules, quantities, optional extras, a priority surcharge, invalid-input handling, reset and copyable summaries. Static initial example and page shell render without waiting for JavaScript. The demo sends and stores no enquiry data.
- Service navigation, homepage/category copy, relevant links from About, CarCost and the existing repair article. The duplicate consumer calculator spotlight above the homepage hero is removed; CarCost remains as implementation evidence below the service offer.
- Distinct page titles, descriptions, self-canonicals, reciprocal language alternatives, Service descriptions linked to the existing Person identity, sitemap entries and framework context/manifest entries. No fabricated reviews, customer counts, rankings or results.
- Service-specific contact CTAs preselect an allowlisted existing form option. The new quote-calculator option reaches the shared API/email service catalogue. No change to the provider, destination, anti-abuse controls or email acceptance contract.
- Existing consent-based GA4 `enquiry_accepted` can include the allowlisted service category. No form content, email or other personal field is added to analytics. Local previews still do not collect live analytics.

## What is not a measurement

The example amounts are fictional and are not development prices. The calculator service is individually scoped; the repair page preserves the current USD 100 entry price only for small isolated fixes. Analytics acceptance means the email provider accepted the enquiry, not inbox receipt, qualification, a proposal or a sale. No new production email was sent while testing.

No claimed search volume, rank guarantee, fixed deadline for organic results or observed AI recommendation. Page/schema eligibility does not guarantee indexation or citation.

## Search Console and launch checks

The accessible Search Console browser session opened its public About/Start now page, without an authenticated property. Index coverage, queries and sitemap submission therefore remain unverified. No verification DNS record or new tracking provider was added.

After the approved release:

1. Open the existing property for the canonical `https://www.lautarogartner.com` site (or its domain property). Inspect `/`, `/services` and `/services/quote-calculator-development`. Review the Google-selected canonical, crawl/index status and any stated exclusion reason. Do not treat an empty `site:` query as proof of deindexing.
2. Confirm `https://www.lautarogartner.com/sitemap.xml` is submitted and read successfully. It includes all six new routes. Request indexing only as appropriate; repeated submissions do not create demand.
3. Check a production service CTA and confirm the contact selector retains its service. Coordinate any real delivery test with the owner; do not count it as a lead.
4. Confirm the existing public GA4 ID is configured. The existing consent UI still governs collection. If service-level reporting is wanted, register the event-scoped `service` custom dimension for `enquiry_accepted`; reports are consent-dependent and may omit traffic. Do not interpret missing events as zero enquiries without checking the inbox/provider evidence.
5. Keep a small owner-maintained log: enquiry reference/date, known source, service, qualified yes/no with a reason, proposal sent and paid engagement. Do not place customer data in this repository. Count unique genuine enquiries and separate them from tests/spam/duplicates. No CRM or customer records were created by this change.
6. At 30/60/90 days after publication, review relevant Search Console query/page impressions and clicks, actual received qualified enquiries, proposals and paid work. If indexed pages have no relevant impressions, reconsider demand and language before adding pages; if clicks arrive but enquiries do not, review the offer and path. Tiny counts cannot establish conversion lift.
7. Evaluate AI visibility separately using consistent buyer prompts: “Who can build a custom quote calculator for my service business?” and “Who can fix a contact form that says sent but never reaches the inbox?” Record engine, date, exact prompt, cited pages and whether the site is recommended. These are future tests, not observed mentions. Do not inject the domain into the prompt and call the result discovery.

Current robots.txt permits crawling, including OAI-SearchBot under `User-agent: *`. This does not establish crawler access from the provider's published IP ranges; use host logs if access is in doubt. Existing machine-readable files remain descriptive framework output, not a promise of AI ranking.

## Verification

Browser plugin not available; used the installed Playwright CLI skill. Local preview: `http://127.0.0.1:4319`. Desktop 1440×1000 and mobile 390×844. Calculator selection/quantity/charges, invalid input, reset, copy and contact preselection were checked. Final build, TypeScript, repository tests and Paideia diagnostics are recorded in the PR. Contact token requests return 404 on the static preview because it does not run Vercel API routes; provider behavior is tested with an injected mock, not a production send. Screenshots are temporary local QA artifacts, not shipped assets.
