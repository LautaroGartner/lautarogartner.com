# Free audit campaign

## Public offer

Tell me about work you expected to win and didn’t. After we speak, I’ll send you a free written audit with what I’d change first, why, and how to try it. You can implement it yourself or ask me to help your team.

## Facebook ad

**Headline**

You sent the quote. You followed up. Then silence.

**Primary text**

Want more paying clients for your service business? Bring me one job you expected to win. We’ll look at what the buyer asked for, what you offered, and where the conversation stopped. After we speak, I’ll send you a free audit with the first change I’d test. Use it yourself or ask me to help you implement it.

**Button**

Learn more

**Destination**

[Request a free audit](https://www.lautarogartner.com/more-clients?utm_source=facebook&utm_medium=paid_social&utm_campaign=free_audit&utm_content=lost_quote)

**Feed creative**

[Download the 1080 × 1350 ad](more-clients-ad.jpg)

**Facebook Page introduction**

I’m Lautaro Gärtner, a business consultant for service businesses. I help owners figure out where they’re losing business and what to change first.

## Recording the walkthrough

Use the transcript on the landing page. Open with the unanswered quote. Show a hypothetical buyer asking about the opening date next to a proposal that mentions only scope and price. Walk through what you would check, what the team could try, and how the owner would judge it. End with the free written audit and the choice to implement it independently or with your help.

Add the recording as `public/more-clients.mp4` and its reviewed English captions as `public/more-clients.vtt`. Match the transcript to the final take and rebuild.

## Launch configuration

The English homepage and `/more-clients` use the same three-step form. The legacy English `/web` alias resolves to the homepage content. The Spanish portfolio uses its existing routes. An application and its pending deliveries are written together to a private database. The browser receives an opaque conversion ID after that transaction commits. The email notification goes to the practice’s existing Resend recipient.

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

### Verify before using the first ad

1. In Events Manager, confirm the dataset belongs to the personal consulting practice. Record its name and ID and verify the intended ad account appears under its connected assets. Check that automatic advanced matching and automatic event setup are off. Use the verified ID and its token on the test deployment.
2. In Test Events, open the test website. Grant advertising consent and submit one clearly marked test application on each route. Check for one saved record and one founder notification per submission. In Events Manager inspect the Browser and Server copies of **Lead**. The pair should share the same event ID and deduplicate to one conversion for each application. The two applications should have different IDs.
3. On the test deployment, exercise a failed save with the test database temporarily unavailable. Restore it and retry the same application. The first attempt must show an error and retain the answers. Refresh the successful confirmation and check the saved record and conversion counts.
4. Repeat with advertising declined. Confirm the request and notification arrive and that Meta receives no event. Check that the application’s contact details, ownership, revenue, and prospect details are absent from the event inspector.
5. Remove the test code. For the ad, select **Website → the verified personal consulting dataset → Lead**. The owner can compare saved applications with conversations and proposals using their source route and permitted campaign tags.

[Meta event deduplication](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events) · [Meta Test Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api)
