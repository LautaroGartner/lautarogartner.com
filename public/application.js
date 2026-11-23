(() => {
  const form = document.querySelector('[data-application]');
  const thanks = document.querySelector('[data-thank-you]');
  if (thanks) {
    const receipt = history.state?.consultingApplication;
    if (!receipt?.done) return;
    // Discard the signed download URL left in older browser history entries.
    if (Object.hasOwn(receipt, 'kitPath')) {
      delete receipt.kitPath;
      history.replaceState({ ...history.state, consultingApplication: receipt }, '');
    }
    thanks.querySelector('[data-receipt-label]').hidden = false;
    thanks.querySelector('[data-receipt-heading]').textContent = 'Thank you.';
    thanks.querySelector('[data-recovery]').hidden = true;
    if (receipt.firstMove) {
      let [title, body] = receipt.firstMove;
      // Older confirmations stored the recommendation text without its challenge key.
      const oldChallenges = {
        'Show what the price buys': 'offer', 'Put the payoff in the first line': 'offer',
        'Give the right person a reason to reply': 'funnel', 'Change who the invitation reaches': 'funnel',
        'Make your quote easy to accept': 'sales', 'Agree on the next step': 'sales'
      };
      const selected = receipt.challenge || oldChallenges[title];
      const current = Array.from(thanks.querySelectorAll('[data-current-move]'))
        .find(template => template.dataset.currentMove === selected)?.content;
      if (current) {
        title = current.querySelector('h2').textContent;
        body = current.querySelector('p').textContent;
      }
      const action = thanks.querySelector('[data-first-move]');
      action.querySelector('h2').textContent = title;
      action.querySelector('[data-action-copy]').textContent = body;
      action.hidden = false;
    }
    if (receipt.guideTitle) {
      thanks.querySelector('[data-guide-title]').textContent = receipt.guideTitle;
      thanks.querySelector('[data-email-delivery]').hidden = false;
    }
    const followUp = thanks.querySelector('[data-call-confirm]');
    const guidance = receipt.guidance;
    if (guidance?.reading) {
      const start = thanks.querySelector('[data-book-start]');
      start.textContent = guidance.reading;
      start.hidden = false;
    }
    if (guidance?.next) {
      followUp.querySelector('h2').textContent = guidance.heading;
      followUp.querySelector('p').textContent = guidance.next;
    }
    followUp.hidden = !receipt.planCall;
    if (receipt.pixelID) {
      history.replaceState({...history.state, consultingApplication: {...receipt, pixelID: null}}, '');
      sendPixel(receipt.pixelID, receipt.eventID);
      window.addEventListener('lg:advertising-change', () => window.fbq?.('consent', permitted() ? 'grant' : 'revoke'));
    }
    return;
  }
  if (!form) return;
  const policy = document.querySelector('.assessment-policy');
  const challenge = form.elements.namedItem('challenge');
  const signals = [...document.querySelectorAll('[data-constraint]')];
  function showConstraint() {
    for (const signal of signals) {
      signal.open = signal.dataset.constraint === challenge.value;
    }
  }
  if (challenge) {
    for (const signal of signals) {
      signal.querySelector('summary').addEventListener('click', event => {
        if (signal.open) return;
        event.preventDefault();
        challenge.value = signal.dataset.constraint;
        challenge.dispatchEvent(new Event('change', {bubbles:true}));
      });
    }
    challenge.addEventListener('change', showConstraint);
    showConstraint();
  }

  const policyLink = form.querySelector('[data-show-policy]');
  if (policy && typeof policy.showModal === 'function') {
    policyLink.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      policy.showModal();
    });
    policy.querySelector('[data-close-policy]').addEventListener('click', () => policy.close());
    policy.addEventListener('click', event => {
      if (event.target !== policy) return;
      const box = policy.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) policy.close();
    });
    policy.addEventListener('close', () => policyLink.focus({preventScroll:true}));
  }
  const source = ['/cash-flow', '/more-clients'].includes(location.pathname.replace(/\/$/, '')) ? '/more-clients' : '/';
  const params = new URLSearchParams(location.search);
  const campaign = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = params.get(key);
    if (value && /^[\w.-]{1,100}$/.test(value)) campaign[key] = value;
  }
  const fbclid = params.get('fbclid');
  const click = fbclid && /^[\w-]{1,400}$/.test(fbclid) ? 'fb.1.' + Date.now() + '.' + fbclid : undefined;
  const country = form.elements.namedItem('phoneCountry');
  const phone = form.elements.namedItem('tel');
  const regionOptions = new Map([...form.querySelectorAll('#region-options [role=option]')].map(
    option => [option.dataset.value, option]
  ));
  const countryToggle = form.querySelector('[data-country-toggle]');
  const prefix = form.querySelector('[data-dial-code]');
  let countryChosen = false;

  function setCountry(code) {
    const option = regionOptions.get(code);
    if (!option) return;
    regionOptions.get(country.value)?.setAttribute('aria-selected', 'false');
    option.setAttribute('aria-selected', 'true');
    country.value = code;
    prefix.textContent = '+' + option.dataset.code;
    countryToggle.querySelector('[data-flag]').textContent = option.firstElementChild.textContent;
    countryToggle.setAttribute('aria-label', 'Change phone country, ' + option.dataset.name + ' +' + option.dataset.code);
    validatePhone();
  }

  function browserCountry() {
    // The time zone is more useful than the interface language when they differ.
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    try {
      // WebKit can return America/Argentina/Cordoba while its region list
      // exposes America/Cordoba. Use the city only when it identifies one region.
      const cityKey = name => {
        const parts = name.split('/');
        return parts[0] + '/' + parts.at(-1);
      };
      const alternate = [];
      for (const code of regionOptions.keys()) {
        const locale = new Intl.Locale('und-' + code);
        const zones = locale.getTimeZones?.() ?? locale.timeZones ?? [];
        if (zones.includes(zone)) return code;
        if (zone.includes('/') && zones.some(name => cityKey(name) === cityKey(zone))) alternate.push(code);
      }
      if (alternate.length === 1) return alternate[0];
      return new Intl.Locale(navigator.language).region;
    } catch { return undefined; }
  }

  for (const picker of form.querySelectorAll('[data-picker]')) {
    const input = picker.querySelector('[role=combobox]');
    const stored = picker.querySelector('input[type=hidden]');
    const menu = picker.querySelector('[data-menu]');
    const list = menu.querySelector('[role=listbox]');
    const options = [...list.children];
    const empty = menu.querySelector('[data-no-match]');
    const region = stored === country;
    const trigger = region ? countryToggle : picker.querySelector('[data-toggle]');
    const anchor = region ? picker.parentElement : picker;
    let active = null;
    const matches = () => options.filter(option => !option.hidden);

    function position() {
      if (menu.hidden) return;
      const box = anchor.getBoundingClientRect();
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const height = viewport?.height ?? innerHeight;
      const below = top + height - box.bottom - 8;
      const above = box.top - top - 8;
      const up = below < 200 && above > below;
      menu.classList.toggle('opens-up', up);
      menu.style.maxHeight = Math.max(0, Math.min(270, up ? above : below)) + 'px';
    }
    function highlight(option) {
      active?.removeAttribute('data-active');
      active = option;
      if (!active) { input.removeAttribute('aria-activedescendant'); return; }
      active.dataset.active = '';
      input.setAttribute('aria-activedescendant', active.id);
      const row = active.getBoundingClientRect(), bounds = list.getBoundingClientRect();
      if (row.bottom > bounds.bottom) list.scrollTop += row.bottom - bounds.bottom;
      else if (row.top < bounds.top) list.scrollTop -= bounds.top - row.top;
    }
    function open(filter) {
      const wasClosed = menu.hidden;
      const query = filter ? input.value.trim().toLowerCase().replace(/[$,]/g,'') : '';
      for (const option of options) option.hidden = !option.textContent.toLowerCase().replace(/[$,]/g,'').includes(query) && !(region && option.dataset.value.toLowerCase() === query);
      const any = matches().length > 0;
      list.hidden = !any;
      empty.hidden = any;
      menu.hidden = false;
      input.setAttribute('aria-expanded','true');
      if (region) trigger.setAttribute('aria-expanded','true');
      position();
      highlight(null);
      list.scrollTop = 0;
      if (region && wasClosed) {
        input.focus({preventScroll:true});
        highlight(regionOptions.get(stored.value));
      }
    }
    function close() {
      menu.hidden = true;
      input.setAttribute('aria-expanded','false');
      if (region) trigger.setAttribute('aria-expanded','false');
      highlight(null);
    }
    function select(option) {
      if (region) {
        countryChosen = true;
        setCountry(option.dataset.value);
        close();
        trigger.focus({preventScroll:true});
      } else {
        input.value = option.textContent;
        stored.value = option.dataset.value;
        for (const item of options) item.setAttribute('aria-selected',String(item===option));
        input.setCustomValidity('');
        close();
      }
    }
    if (!region) input.addEventListener('click',()=>open(!stored.value && Boolean(input.value)));
    input.addEventListener('input',()=>{
      if (!region) {
        stored.value='';
        options.forEach(option=>option.setAttribute('aria-selected','false'));
        input.setCustomValidity('Choose one of the listed options.');
      }
      open(true);
      if (!region) {
        const exact=matches().find(option=>option.textContent.toLowerCase()===input.value.trim().toLowerCase());
        if(exact)select(exact);
      }
    });
    trigger.addEventListener('click',()=>{
      if(!menu.hidden){close();return;}
      if(region)input.value=''; else input.focus();
      open(false);
    });
    list.addEventListener('pointerdown',event=>event.preventDefault());
    list.addEventListener('click',event=>{
      const option=event.target.closest('[role=option]');
      if(option){input.focus({preventScroll:true});select(option);}
    });
    input.addEventListener('keydown',event=>{
      if(event.key==='Escape' && !menu.hidden){
        event.preventDefault(); close(); if(region)trigger.focus({preventScroll:true}); return;
      }
      if(event.key==='Enter' && !menu.hidden){
        event.preventDefault();
        const option=active || (matches().length===1 ? matches()[0] : null);
        if(option)select(option);
        return;
      }
      if(!['ArrowDown','ArrowUp'].includes(event.key))return;
      event.preventDefault();
      if(menu.hidden)open(false);
      const items=matches(), index=items.indexOf(active);
      highlight(items[index<0 ? (event.key==='ArrowDown'?0:items.length-1) :
        Math.max(0, Math.min(items.length-1,index+(event.key==='ArrowDown'?1:-1)))]);
    });
    picker.addEventListener('focusout',event=>{
      if(picker.contains(event.relatedTarget))return;
      if(!region && !stored.value && !menu.hidden && matches().length===1)select(matches()[0]);
      else close();
    });
    document.addEventListener('pointerdown',event=>{if(!picker.contains(event.target))close();});
    window.addEventListener('scroll',position,{passive:true});
    window.addEventListener('resize',position);
    window.visualViewport?.addEventListener('resize',position);
  }
  const fields = [...form.querySelectorAll('fieldset')];
  const back = form.querySelector('[data-back]'),
    next = form.querySelector('[data-next]');
  const progress = form.querySelector('[data-progress]'),
    status = form.querySelector('[data-status]');
  let step = 0,
    token = null,
    busy = false;
  // Navigation state survives reloads.
  let application = history.state?.consultingApplication ?? { key: crypto.randomUUID() };
  function remember(update) {
    application = { ...application, ...update };
    history.replaceState({ ...history.state, consultingApplication: application }, '');
  }
  remember({});
  window.addEventListener('hashchange', () => remember({}));
  function openThankYou() {
    // Keep the confirmation and first move available on refresh.
    history.replaceState(history.state, '', '/thank-you');
    location.reload();
  }
  function show(index, focus) {
    step = index;
    fields.forEach((field, i) => {
      field.hidden = i !== index;
      field.disabled = i !== index;
    });
    progress.textContent = 'Step ' + (index + 1) + ' of 3';
    back.hidden = index === 0;
    next.firstElementChild.textContent = index === 2 ? form.dataset.submitLabel : 'Continue';
    next.disabled = false;
    back.disabled = false;
    status.textContent = '';
    if (focus) fields[index].querySelector('legend').focus();
  }
  async function ticket() {
    const response = await fetch('/api/application', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw Error('ticket');
    const data = await response.json();
    if (!countryChosen && !phone.value.trim()) setCountry(data.country);
    return data.token;
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
    history.replaceState(history.state, '', location.pathname);
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
    window.fbq?.('consent', permitted() ? 'grant' : 'revoke');
  });
  back.addEventListener('click', () => {
    if (!busy) show(Math.max(0, step - 1), true);
  });
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    validatePhone();
    if (busy) return;
    if (!form.reportValidity()) return;
    if (step < 2) {
      show(step + 1, true);
      form.dispatchEvent(new Event(step === 1 ? 'growth:business-step' : 'growth:contact-step'));
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
        kit: true,
        planCall: true,
        assessment: true,
        email: val('email'),
        tel: parsedPhone()?.number || '',
        revenue: Number(val('revenue')),
        stage: val('stage'), challenge: val('challenge'),
          budget: val('budget'), role: val('role'), timing: val('timing'), business: val('business'), callback: true,
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
        remember({ done: true, challenge: data.challenge, firstMove: saved.firstMove, guidance: saved.guidance, guideTitle: saved.guideTitle, planCall: data.planCall, pixelID: saved.pixelID, eventID: saved.eventID });
        form.reset();
        window.dispatchEvent(new CustomEvent('enquiry:accepted', { detail: { language: 'en' } }));
        openThankYou();
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
  function parsedPhone() {
    return window.libphonenumber?.parsePhoneNumberFromString(phone.value.trim(), {
      defaultCountry: country.value || undefined, extract: false
    });
  }
  function validatePhone() {
    const number = parsedPhone();
    const needsCode = phone.value.trim() && !country.value && !phone.value.trim().startsWith('+');
    phone.setCustomValidity(!phone.value.trim() || number?.isPossible() ? '' : needsCode
      ? 'Choose a country code or enter the full number beginning with +.'
      : 'Enter a complete phone number for the selected country.');
  }
  phone.addEventListener('input', () => {
    prefix.hidden = phone.value.trim().startsWith('+');
    validatePhone();
  });
  phone.addEventListener('blur', () => {
    if (!phone.value.trim().startsWith('+')) return;
    const number = parsedPhone();
    if (!number?.country || !number.isPossible()) return;
    countryChosen = true;
    setCountry(number.country);
    phone.value = number.formatNational();
    prefix.hidden = false;
    validatePhone();
  });
  if (application.done) openThankYou();
  else {
    setCountry(browserCountry());
    show(0, false);
    token = ticket().catch(() => null);
  }
})();
