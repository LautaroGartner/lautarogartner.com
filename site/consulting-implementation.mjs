const phases = [
  {
    title: 'Find the sale worth changing',
    result: 'A recommendation you can say yes or no to.',
    work: 'Bring a live opportunity. I’ll trace what the buyer is waiting for, when you’d get paid and what it would take to deliver. We’ll compare two ways to win the work and choose the one worth putting money behind.'
  },
  {
    title: 'Put the offer in a buyer’s hands',
    result: 'The quote, the terms and the words to introduce it.',
    work: 'I’ll write the offer as the buyer will see it, cost out the promise and prepare the follow-up. You approve the price and who receives it. If you already have someone selling, they can use it on their next call.'
  },
  {
    title: 'Run the test and decide what to repeat',
    result: 'A decision about the next batch of buyers.',
    work: 'I can manage the agreed outreach and follow-up. We’ll review who bought, what cash cleared and what you still owe in delivery. If buyers hesitate, we’ll use their actual objection to revise the offer before you spend more.'
  }
];

export function implementationSection(campaign, escape) {
  const groups = phases.map(phase => `<details><summary><strong>${escape(phase.title)}</strong><span>${escape(phase.result)}</span></summary><p>${escape(phase.work)}</p></details>`).join('');
  return `<section id="implementation" class="studio-wrap consult-section implementation" aria-labelledby="implementation-title">
    <div><h2 id="implementation-title">Here’s what you can <span class="copy-accent">hand over to me.</span></h2>
    <p>${campaign ? 'After the free call, the written plan is yours to use.' : 'You can use the free guide on your own.'} If you’d like help putting it to work, we’ll agree on what I’ll handle. You approve the budget and anything that goes to a buyer.</p></div>
    <div class="implementation-phases">${groups}</div>
  </section>`;
}
