import { adGuide, guideForSource, spanishGuideTitle } from '../site/growth-guides.mjs';
import { timingSafeEqual } from 'node:crypto';
import { applicationStore } from '../server/application-store.mjs';
import { signature } from '../server/form-security.mjs';
import { salesFieldbook } from '../server/sales-fieldbook.mjs';
import { growthKit } from '../server/growth-kit.mjs';

export function createKitHandler(env = process.env, store) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).end();
    const { id, key } = req.query || {};
    const secret = env.ENQUIRY_SECRET || env.SESSION_SECRET;
    if (!secret) return res.status(503).end();
    if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id) ||
        typeof key !== 'string' || !/^[a-f0-9]{64}$/.test(key) ||
        !timingSafeEqual(Buffer.from(key), Buffer.from(signature('growth-kit/' + id, secret)))) return res.status(404).end();
    try {
      store ??= applicationStore(env);
      const record = await store.kitRecipient(id);
      if (!record?.kit) return res.status(404).end();
      if (req.query.format === 'pdf') {
        const guide = guideForSource(record.source, record.qualification);
        const spanish = req.query.lang === 'es' && guide === adGuide;
        const disposition = spanish
          ? `attachment; filename="Evaluacion de crecimiento.pdf"; filename*=UTF-8''${encodeURIComponent(spanishGuideTitle + '.pdf')}`
          : `attachment; filename="${guide.title}.pdf"`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', disposition);
        if (req.method === 'HEAD') return res.status(200).end();
        const pdf = await salesFieldbook({ guide, qualification: record.qualification, language: spanish ? 'es' : 'en' });
        return res.status(200).end(pdf);
      }
      res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition','attachment; filename="Deal Approval Memo.docx"');
      if (req.method === 'HEAD') return res.status(200).end();
      return res.status(200).end(await growthKit());
    } catch { return res.status(503).end(); }
  };
}
export default createKitHandler();
