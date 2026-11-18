(() => {
  const form = document.querySelector('[data-application]');
  if (!form) return;
  const source = location.pathname.replace(/\/$/, '') === '/cash-flow' ? '/cash-flow' : '/';
  const params = new URLSearchParams(location.search);
  const campaign = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = params.get(key);
    if (value && /^[\w.-]{1,100}$/.test(value)) campaign[key] = value;
  }
  const fbclid = params.get('fbclid');
  const click = fbclid && /^[\w-]{1,400}$/.test(fbclid) ? 'fb.1.' + Date.now() + '.' + fbclid : undefined;
  const fields = [...form.querySelectorAll('fieldset')];
  const back = form.querySelector('[data-back]'),
    next = form.querySelector('[data-next]');
  const progress = form.querySelector('[data-progress]'),
    status = form.querySelector('[data-status]');
  const confirmation = document.querySelector('[data-confirm]');
  let step = 0,
    token = null,
    busy = false;
  // Navigation state survives reloads and contains only opaque identifiers.
  let application = history.state?.consultingApplication ?? { key: crypto.randomUUID() };
  function remember(update) {
    application = { ...application, ...update };
    history.replaceState({ ...history.state, consultingApplication: application }, '');
  }
  remember({});
  window.addEventListener('hashchange', () => remember({}));
  function confirmed(focus) {
    form.hidden = true;
    confirmation.hidden = false;
    if (focus) confirmation.focus();
  }
  function show(index, focus) {
    step = index;
    fields.forEach((field, i) => {
      field.hidden = i !== index;
      field.disabled = i !== index;
    });
    progress.textContent = 'Step ' + (index + 1) + ' of 3';
    back.hidden = index === 0;
    next.textContent = index === 2 ? 'Send request' : 'Continue';
    next.disabled = false;
    back.disabled = false;
    status.textContent = '';
    if (focus) fields[index].querySelector('legend').focus();
  }
  async function ticket() {
    const response = await fetch('/api/application', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw Error('ticket');
    return (await response.json()).token;
  }
  function getCookie(name) {
    return document.cookie
      .split('; ')
      .find((value) => value.startsWith(name + '='))
      ?.slice(name.length + 1);
  }
  function permitted() {
    return (
      window.lgAdvertisingAllowed?.() === true &&
      navigator.globalPrivacyControl !== true &&
      navigator.doNotTrack !== '1'
    );
  }
  function sendPixel(id, eventID) {
    if (!permitted() || !/^\d{5,25}$/.test(id) || typeof eventID !== 'string') return;
    // Pixel's implicit URL context must never include visitor-supplied query or fragment values.
    history.replaceState(history.state, '', location.pathname + '#discuss');
    if (!window.fbq) {
      function fbq() {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
        else fbq.queue.push(arguments);
      }
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.push = fbq;
      window.fbq = window._fbq = fbq;
      const script = document.createElement('script');
      script.async = true;
      script.referrerPolicy = 'no-referrer';
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.append(script);
    }
    fbq('set', 'autoConfig', false, id);
    fbq('init', id);
    fbq('trackSingle', id, 'Lead', {}, { eventID });
  }
  window.addEventListener('lg:advertising-change', () => {
    if (!permitted()) window.fbq?.('consent', 'revoke');
  });
  form.addEventListener(
    'focusin',
    () => {
      if (!token) token = ticket().catch(() => null);
    },
    { once: true },
  );
  back.addEventListener('click', () => {
    if (!busy) show(Math.max(0, step - 1), true);
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    validatePhone();
    if (busy || !form.reportValidity()) return;
    if (step < 2) {
      show(step + 1, true);
      return;
    }
    busy = true;
    next.disabled = true;
    back.disabled = true;
    status.textContent = 'Saving your request…';
    const val = (name) => form.elements.namedItem(name).value;
    try {
      remember({});
      const ads = permitted();
      const data = {
        key: application.key,
        source,
        company: val('company'),
        name: val('name'),
        email: val('email'),
        tel: val('tel'),
        revenue: Number(val('revenue')),
        ownership: Number(val('ownership')),
        advertising: ads,
        ...(ads ? { campaign, fbp: getCookie('_fbp'), fbc: click || getCookie('_fbc') } : {}),
      };
      for (let attempt = 0; attempt < 2; attempt++) {
        data.token = (await token) || (await ticket());
        const response = await fetch('/api/application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const saved = await response.json();
        if (saved.error === 'token' && attempt === 0) {
          token = null;
          continue;
        }
        if (!response.ok || !saved.accepted || !saved.eventID) throw Error(saved.error || 'save');
        remember({ done: true });
        confirmed(true);
        form.reset();
        if (saved.pixelID) sendPixel(saved.pixelID, saved.eventID);
        window.dispatchEvent(new CustomEvent('enquiry:accepted', { detail: { language: 'en' } }));
        return;
      }
    } catch (error) {
      status.textContent =
        error.message === 'validation'
          ? 'Check your contact details. Use a valid email address and phone number.'
          : 'Your request could not be confirmed. Your answers are still here. Please try again.';
    } finally {
      busy = false;
      next.disabled = false;
      back.disabled = false;
    }
  });
  const phone = form.elements.namedItem('tel');
  function validatePhone() {
    const value = phone.value.trim();
    phone.setCustomValidity(
      value && (!/^\+?[\d ().-]+$/.test(value) || value.replace(/\D/g, '').length < 6)
        ? 'Enter a phone number with at least six digits.'
        : '',
    );
  }
  phone.addEventListener('input', validatePhone);
  if (application.done) confirmed(false);
  else show(0, false);
  const tool = document.querySelector('.cash-tool');
  const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
  tool.addEventListener('input', () => {
    const result = tool.querySelector('[data-gap]');
    const balances = [];
    let balance = 0,
      min = 0,
      previous = '';
    for (const row of tool.querySelectorAll('.cash-entry')) {
      const date = row.querySelector('[data-date]').value,
        amount = row.querySelector('[data-cash]');
      if (!date && !amount.value && !amount.validity.badInput) continue;
      if (!date || !amount.value || !amount.validity.valid || date < previous) {
        result.textContent = 'Enter a date and amount for each movement, in date order.';
        return;
      }
      previous = date;
      balance += Math.round(Number(amount.value) * 100);
      min = Math.min(min, balance);
      balances.push(usd.format(balance / 100));
    }
    result.textContent = balances.length
      ? 'Balances in order: ' + balances.join(' → ') + '. Cash to set aside: ' + usd.format(-min / 100) + '.'
      : '';
  });
  document.querySelector('a[href="#transcript"]')?.addEventListener('click', () => {
    document.querySelector('#transcript').open = true;
  });
})();
