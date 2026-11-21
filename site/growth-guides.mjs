export const spanishGuideTitle = 'Haz crecer tu negocio y conserva más de lo que ganas';
export const homeGuide = { title: 'Grow Your Sales, Keep More of What You Make', cta: 'Grow and keep more' };
export const adGuide = { title: 'Grow Your Business and Keep More of What You Earn', cta: 'Get my free growth assessment' };

export function guideForSource(source, qualification) {
  return qualification || ['/more-clients', '/cash-flow'].includes(source) ? adGuide : homeGuide;
}

export const callPrep = 'Have one offer in mind, what you charge and where you think the sale slows down. Rough numbers are enough. We’ll use that example to choose one change to test. After we talk, I’ll send you the plan in writing.';
