import { ownershipBands, revenueBands } from '../site/application-options.mjs';
export function deliverApplication(env, request = fetch) {
  return async (kind, id, event, record) => {
    let response;
    if (kind === 'notify') {
      const lines = [
        ['Name', record.name],
        ['Email', record.email],
        ['Phone', record.phone],
        ['Annual revenue', revenueBands[record.revenue]],
        ['Ownership', ownershipBands[record.ownership]],
        ['Page', record.source],
        ...Object.entries(record.campaign),
      ];
      response = await request('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: 'Bearer ' + env.RESEND_API_KEY,
          'Content-Type': 'application/json',
          'Idempotency-Key': 'consulting/' + id,
        },
        body: JSON.stringify({
          from: env.ENQUIRY_FROM,
          to: ['lautaro@lautarogartner.com'],
          reply_to: record.email,
          subject: 'Consulting application · Lautaro Gärtner',
          text: lines.map(([k, v]) => k + ' — ' + v).join('\n'),
        }),
      });
      if (!response.ok || !(await response.json()).id) throw Error('Notification not accepted');
    } else {
      if (!record.pixelID || record.pixelID !== env.META_PIXEL_ID)
        throw Error('Dataset configuration changed');
      const data = { data: [event] };
      if (env.META_TEST_EVENT_CODE && env.VERCEL_ENV !== 'production')
        data.test_event_code = env.META_TEST_EVENT_CODE;
      response = await request('https://graph.facebook.com/v25.0/' + env.META_PIXEL_ID + '/events', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: 'Bearer ' + env.META_CAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok || (await response.json()).events_received !== 1)
        throw Error('Conversion not accepted');
    }
  };
}
