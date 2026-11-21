# Free audit campaign

## Customer guides

The homepage and ad URL serve one free growth assessment. The three-step form requests a callback. On submission the owner gets a challenge-specific first step, the downloadable assessment, and an email with the assessment and editable memo. The assessment ends with an email invitation for implementation help. After the call Lautaro sends his personal recommendation. Earlier homepage gift links still deliver the original general guide.

## First Meta campaign draft

Start with unpaid conversations and direct website visits. Record the source, callback permission, whether the owner answered, whether the conversation qualified and what was agreed next. Count each person once. A qualified conversation is a held conversation with a decision-maker serving paying customers who confirms a real acquisition problem and is open to acting if the economics work. Record $3M+ target fit separately. For paid traffic divide campaign spend by qualified conversations from that campaign over the same acquisition cohort and follow-up window. If none qualified, report spend and zero conversations. Keep unpaid results separate.

In Ads Manager, use Leads → Instant forms → Higher Intent. The built-in review gives prospects a chance to confirm their answers and phone number. The website version has three steps.

**Form introduction**

Get a free customer acquisition strategy for your business. Tell me how you win customers and where sales slow down. After we speak, I’ll send you the first change I’d test, how to run it and what to measure. You can use the plan yourself.

**Qualification questions**

1. Use a dropdown to identify the growth problem the owner wants solved. Ask how much they could put behind a promising plan in the next 90 days, in USD. Use the website budget choices, including no budget and undecided.
2. Ask for the respondent’s role (owner, co-owner, executive decision-maker or employee/other) and when they want to start. Collect business stage and annual revenue using the website bands.
3. Collect business website or name, full name, business email and phone. Submitting requests a call from Lautaro about the free assessment and potential consulting services. The owner may decline further contact. Verify the public privacy policy URL before entering it into Meta.

**Completion screen**

“Thank you. Before we speak, pick your last five inquiries. Mark which ones paid and what first brought those buyers to you. The pattern is a starting point for our call.” Confirm receipt of the requested assessment call. Meta submissions are separate from the website database. During the initial test review them in Leads Center and apply the same callback rules manually.

**Private callback order**

Call promptly when an established business at $3M+ in annual revenue identifies a growth challenge, can invest at least US$5,000 total over the next 90 days, is represented by an owner, co-owner or executive decision-maker and wants to begin within 30 days. The budget cutoff is an initial routing choice. Review it against actual qualified conversations. Others receive their first action and guide immediately. Use the day 2 and day 7 private reminders to personalize follow-up. The private notification includes the answers, callback number and next action.

[Meta Higher Intent settings](https://developers.facebook.com/docs/marketing-api/guides/lead-ads/create/v2.6/)

## Facebook ad

**Headline**

Build a $5M business that funds its own growth.

**Primary text**

Bring me your offer and what it costs to win a customer. I’ll send you a free written plan after we talk, with the first change I’d test and the numbers that would justify your next hire or ad buy.

**Button**

Learn more

**Destination**

[Get my free growth plan](https://www.lautarogartner.com/more-clients?utm_source=facebook&utm_medium=paid_social&utm_campaign=free_audit&utm_content=repeatable_5m)

**Facebook Page introduction**

I’m Lautaro Gärtner, a business consultant. I help owners decide which customers and offers are worth investing in as their business grows.

## Meta feed video

Record this as a separate direct-to-camera ad, about 25 seconds. Caption the final cut.

> Want a five-million-dollar business? Ask whether the next ten sales can pay for the ten after them. Say you collect five thousand at signing. Would a thousand-dollar incentive get the buyer to pay twenty-four thousand today? Let’s see what that leaves after delivery and what you can reinvest. Get your free growth plan.

## Landing-page video

Use the assessment script in `site/consulting.mjs`. Start with a proposal the owner can still change. Show how to specify the result, work back from the buyer’s deadline and price the first commitment. The owner receives Grow Your Business and Keep More of What You Earn immediately and can implement it independently.

Private references include *$100M Offers* on the value equation, *$100M Leads* on useful first steps and training employees through demonstration and practice, and *$100M Money Models* on incentives for earlier payment. The prices, payment schedule, and costs are illustrative.

Place the player directly under the $5M headline. Add the recording as `public/more-clients.mp4` and its reviewed English captions as `public/more-clients.vtt`. Match the transcript to the final take and rebuild. Until then, that space introduces the decision the assessment helps the owner make.

## Launch configuration

The English homepage and `/more-clients` use the same three-step form. The legacy English `/web` alias resolves to the homepage content. Former Spanish URLs redirect to the corresponding English pages. An application and its pending deliveries are written together to a private database. The browser receives an opaque conversion ID after that transaction commits. The email notification goes to the practice’s existing Resend recipient.

| Variable | Purpose |
| --- | --- |
| `LEAD_DATABASE_URL` | A private remote libSQL database for live submissions. Use a local `file:` URL for development. |
| `LEAD_DATABASE_AUTH_TOKEN` | Server-side database write credential. |
| `ENQUIRY_SECRET` | Existing form-signing secret, with `SESSION_SECRET` as the fallback. |
| `RESEND_API_KEY`, `ENQUIRY_FROM` | Existing server-side notification settings. |
| `CRON_SECRET` | Authenticates the Vercel background retry request. |
| `META_PIXEL_ID` | Verified web dataset ID for the personal consulting practice. |
| `META_CAPI_ACCESS_TOKEN` | Server-only token for that dataset. |
| `META_TEST_EVENT_CODE` | Temporary Test Events code on the test deployment. Remove after verification. |
| `GA_MEASUREMENT_ID` | Existing optional GA4 measurement configuration. |

A successful save triggers immediate delivery attempts. The daily Vercel cron retries outstanding work in bounded batches. Delivery problems leave the application in the database. The `applications` table is the lead record. It includes route, answers, and permitted campaign tags. The `application_jobs` table holds outstanding jobs and their attempt counts. Keep database credentials and access to both tables private.

GA4 measures the example opening (`growth_example_open`), first video playback (`growth_video_play`), first application input (`growth_form_start`), and confirmed database save (`enquiry_accepted`). These events follow the analytics preference. Compare the homepage and ad landing page by page path. The events carry no form answers.

### Verify before a later website-conversion campaign

1. In Events Manager, confirm the dataset belongs to the personal consulting practice. Record its name and ID and verify the intended ad account appears under its connected assets. Check that automatic advanced matching and automatic event setup are off. Use the verified ID and its token on the test deployment.
2. In Test Events, open the test website. Grant advertising consent and submit one clearly marked test application on each route. Check for one saved record and one founder notification per submission. In Events Manager inspect the Browser and Server copies of **Lead**. The pair should share the same event ID and deduplicate to one conversion for each application. The two applications should have different IDs.
3. On the test deployment, exercise a failed save with the test database temporarily unavailable. Restore it and retry the same application. The first attempt must show an error and retain the answers. Refresh the successful confirmation and check the saved record and conversion counts.
4. Repeat with advertising declined. Confirm the request and notification arrive and that Meta receives no event. Check that the application’s contact details, ownership, revenue, and prospect details are absent from the event inspector.
5. Remove the test code. For a website-conversion test, select **Website → the verified personal consulting dataset → Lead**. The owner can compare saved applications with conversations and proposals using their source route and permitted campaign tags.

[Meta event deduplication](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events) · [Meta Test Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api)
