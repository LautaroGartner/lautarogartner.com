export const stages = { established: 'Established business with paying customers', early: 'New business, already serving customers', firstsale: 'Operating, working toward my first sale', prelaunch: 'Not launched yet' };
export const constraints = {
  offer: 'Offer — buyers ask for a price but don’t see why it’s worth it',
  funnel: 'Funnel — too few people who need my work get in touch',
  sales: 'Sales process — buyers want the work, but the deal stalls before they commit'
};
export const challenges = { ...constraints, inquiries: 'Not enough consistent inquiries', quality: 'Too few inquiries are from qualified buyers', closing: 'Buyers inquire but too few close', retention: 'Too few customers buy again', cash: 'Sales are growing but cash is tight', scale: 'Acquisition works and I want to scale', unsure: 'I’m not sure where growth slows down' };
export const budgets = {
  none: 'No budget available yet',
  undecided: 'I need to see a plan before setting a budget',
  under5: 'Less than $5,000',
  from5: '$5,000 to under $15,000',
  from15: '$15,000 to under $50,000',
  from50: '$50,000 or more'
};
export const decisions = {
  solo: 'I can approve the investment myself',
  joint: 'My partner and I decide together',
  group: 'I share approval with other decision-makers',
  recommend: 'I can recommend it, but someone else approves'
};
export const timelines = {
  now: 'As soon as possible',
  month: 'Within 30 days',
  quarter: 'In one to three months',
  later: 'More than three months from now',
  exploring: 'I’m exploring without a start date'
};
// Older submissions use these answers in their delivery records.
export const investments = { yes: 'Yes, if the business case makes sense', maybe: 'Possibly, depending on cost and risk', advice: 'I’m only looking for free advice' };
export const roles = { owner: 'Owner / founder', coowner: 'Co-owner / partner', executive: 'Executive with decision authority', other: 'Employee or other role' };
export const callConsent = 'By submitting, I request a call from Lautaro Gärtner at the number provided about my free growth assessment and potential consulting services. I can decline further contact.';

const actions = {
  offer: ['Say the offer out loud', 'Finish this as your buyer: “I’d love that, but…” Take the strongest reason to hesitate and change what you promise. Try saying: “You’ll have [result] by [date]. We’ll check it by [test]. If it falls short, I’ll [remedy you can deliver].” Now ask, “What do I gain by saying yes today?” If booking now secures something real, say exactly what.'],
  funnel: ['Reach the buyer one purchase earlier', 'Think of something people book just before they need you. Ask one business that sells it to offer buyers a simple introduction: “Would it help to know what the next part will cost?” Give anyone who says yes a useful estimate. See whether those introductions produce profitable orders before you spend money reaching a bigger audience.'],
  sales: ['Give the buyer proof where they still have doubt', 'When someone says “I’ll think about it,” ask, “What would you need to see to feel good about going ahead?” Use their answer. If they’re unsure the work will fit their needs, show them how you’d handle the part they’re worried about. Then ask, “Does that settle it, or is something else still open?”'],
  inquiries: ['Give someone a reason to respond', 'Choose where you could reach someone facing the problem you solve. Identify one question they would need answered before buying. Make that answer useful on its own, name it on the button and choose how you’ll deliver it immediately.'],
  quality: ['Define what makes an inquiry a fit', 'Write down the conditions you need to deliver the result profitably. Turn the condition that matters most into a form question with clear choices. For each answer, decide what you would send or do next.'],
  closing: ['Make the decision easier', 'Read your offer as someone deciding whether to spend their own money. Identify the biggest uncertainty, the first proof you could deliver and how they would check it. Write those terms into the offer and estimate the cost of honoring them.'],
  retention: ['Find a reason to buy again', 'Picture what happens after someone gets the promised result. Decide whether the need recurs or a useful next need arises. Write down what would signal that moment and what further work would be worth offering then.'],
  cash: ['Price the first commitment', 'Sketch a possible order. List each bill you would pay and when each payment would reach you. Find the first cash shortfall. Decide what useful first delivery you can price to cover that gap.'],
  scale: ['Find out how much you can spend to win a buyer', 'Start with your expected selling price. Subtract delivery costs and the amount you want to keep. The remainder is your ceiling for winning a customer. Mark estimates and check how many additional orders you can actually deliver.'],
  unsure: ['Choose what to learn first', 'Write one sentence about who you could help and what they would pay to change. Underline the part you’re least sure of. Pick one observation that would change your mind and use it to decide what to test first.']
};
export function firstMove({challenge}) {
  return actions[challenge];
}

const readingPaths = {
  offer: {
    thanks: 'Thank you for trusting me with your offer. I wrote this guide so you can try the ideas on your own terms.',
    reading: 'Start with “Make the result worth buying.” Use the words you would actually say to a buyer.',
    bring: 'Have the offer you want to improve handy. We’ll read it out loud and work on the part that gives a buyer a reason to hesitate.',
    reply: 'When you try the read-aloud test, you can reply with the line you changed.'
  },
  funnel: {
    thanks: 'Thanks for telling me how hard it’s been to reach the right buyers. I appreciate you giving me a look at that part of your business.',
    reading: 'Start with “Attract people who need the paid work.” Pick one place to test your invitation.',
    bring: 'Think of one place people hear about you and what you invite them to do there. We’ll look at who that invitation is likely to attract.',
    reply: 'If you have a place in mind to try your invitation, reply and tell me where.'
  },
  sales: {
    thanks: 'Thank you for sharing where deals get stuck. I hope this gives you something useful to say the next time a buyer hesitates.',
    reading: 'Start with “Help a good buyer reach a decision.” Look for the doubt you could settle in your next conversation.',
    bring: 'Think of a question that might stop a buyer from saying yes. If you remember their exact words, bring those. We’ll work out how you could answer.',
    reply: 'You can reply with a question you hear from buyers. Their exact words are useful.'
  }
};

export function assessmentResponse(record) {
  const path = readingPaths[record.qualification.challenge] || {
    thanks: 'Thank you for sharing what you want to improve. I put this guide together so you can try a first step yourself.',
    reading: 'Start with “Follow the money” and choose the part that fits your business.',
    bring: 'Have one offer in mind and an idea of where the sale slows down.',
    reply: 'You can reply with what happened when you tried your first step.'
  };
  const result = { thanks: path.thanks, reading: path.reading };
  if (!record.planCall) return result;
  if (record.qualification.priority === 'High') {
    return { ...result, heading: 'What to have ready when I call',
      next: 'I’ll call the number you shared. ' + path.bring + ' After we talk, I’ll send you the plan in writing.' };
  }
  return { ...result, heading: 'I’ll follow up by email first',
    next: 'I’ve received your call request. I’ll check in by email after you’ve had a chance to try the first step. ' + path.reply };
}
