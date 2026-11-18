# Cash timeline campaign

## Public offer

I help service business owners decide what to change first when growth puts pressure on cash, sales, or delivery. We work through one recent example, choose a change the team can make, and agree how to tell whether it helped. I can help put it into practice.

## Facebook ad

**Headline**

You signed a $50,000 project. Why do you need $7,000 to start it?

**Primary text**

Suppose your customer pays $5,000 upfront and $12,000 of project costs come due before their next payment. I’m Lautaro, a business consultant. I’ve put the timeline on one page so you can try it with a project of your own.

**Button**

Learn more

**Destination**

[Cash timeline](https://www.lautarogartner.com/cash-flow?utm_source=facebook&utm_medium=paid_social&utm_campaign=cash_timeline&utm_content=worksheet)

**Feed creative**

The 1080 × 1350 portrait image shows the hypothetical customer receipt, delivery costs, and interim funding need. [Download the image](cash-flow-ad.jpg)

**Image description**

Hypothetical $50,000 service project. The customer pays $5,000 at confirmation. Delivery costs of $12,000 come due before the next payment, leaving $7,000 to cover.

**Facebook Page introduction**

I’m Lautaro Gärtner, a business consultant for service businesses. I help owners work out what to change first and help their teams put that change into practice.

## Recording the walkthrough

Use the transcript on the landing page as the script. Open on camera with the signed-project question. Show the worksheet as you say $5,000 and $12,000. Highlight the running balance when it reaches −$7,000. For three simultaneous starts, show three copies of the same gap totaling $21,000 and identify the assumption that all three gaps overlap. Return to camera for the choice between a milestone, a different start date, or keeping the terms. Finish on the three-date worksheet.

Export the actual recording as `public/cash-flow.mp4` and its reviewed, time-aligned English captions as `public/cash-flow.vtt`. Match the transcript to the final take and rebuild. The page enables the player when both files exist.

## Launch configuration

The English homepage and `/cash-flow` use the same three-step form. The legacy English `/web` alias resolves to the homepage content. The Spanish portfolio uses its existing routes. An application and its pending deliveries are written together to a private database. The browser receives an opaque conversion ID after that transaction commits. The email notification goes to the practice’s existing Resend recipient.

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
4. Repeat with advertising declined. Confirm the request and notification arrive and that Meta receives no event. Check that the application’s contact details, ownership, revenue, and worksheet values are absent from the event inspector.
5. Remove the test code. For the ad, select **Website → the verified personal consulting dataset → Lead**. The owner can compare saved applications with conversations and proposals using their source route and permitted campaign tags.

[Meta event deduplication](https://developers.facebook.com/documentation/ads-commerce/conversions-api/deduplicate-pixel-and-server-events) · [Meta Test Events](https://developers.facebook.com/documentation/ads-commerce/conversions-api/using-the-api)
