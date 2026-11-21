export const planningCall = {
  label: 'Email Lautaro two times that work',
  href: 'mailto:lautaro@lautarogartner.com?' + new URLSearchParams({
    subject: 'Free 90-day sales planning call',
    body: [
      'Hi Lautaro, I’d like to arrange a planning call.',
      '',
      'Two dates and times that work for me:',
      'My time zone:',
      '',
      'If helpful, here are my rough numbers:',
      'Paid wins last quarter:',
      'Extra jobs we can deliver next quarter:',
      'The growth move I’d like to discuss:',
    ].join('\r\n'),
  }).toString().replaceAll('+', '%20'),
};
