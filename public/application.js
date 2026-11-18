(() => {
  const form = document.querySelector('[data-application]');
  if (!form) return;
  const source = ['/cash-flow', '/more-clients'].includes(location.pathname.replace(/\/$/, '')) ? '/more-clients' : '/';
  const params = new URLSearchParams(location.search);
  const campaign = {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = params.get(key);
    if (value && /^[\w.-]{1,100}$/.test(value)) campaign[key] = value;
  }
  const fbclid = params.get('fbclid');
  const click = fbclid && /^[\w-]{1,400}$/.test(fbclid) ? 'fb.1.' + Date.now() + '.' + fbclid : undefined;
  for (const picker of form.querySelectorAll('[data-picker]')) {
    const input = picker.querySelector('[role=combobox]');
    const stored = picker.querySelector('input[type=hidden]');
    const list = picker.querySelector('[role=listbox]');
    const options = [...list.children];
    const empty = picker.querySelector('[data-no-match]');
    let active = null;
    const matches = () => options.filter(option => !option.hidden);
    function highlight(option) {
      active?.removeAttribute('data-active');
      active = option;
      if (active) {
        active.dataset.active = '';
        input.setAttribute('aria-activedescendant',active.id);
        active.scrollIntoView({block:'nearest'});
      } else input.removeAttribute('aria-activedescendant');
    }
    function open(filter) {
      const query = filter ? input.value.trim().toLowerCase().replace(/[$,]/g,'') : '';
      for (const option of options) option.hidden = !option.textContent.toLowerCase().replace(/[$,]/g,'').includes(query);
      const visible = matches();
      list.hidden = !visible.length;
      empty.hidden = Boolean(visible.length);
      input.setAttribute('aria-expanded',String(visible.length>0));
      highlight(null);
    }
    function close() {
      list.hidden = true;
      empty.hidden = true;
      input.setAttribute('aria-expanded','false');
      highlight(null);
    }
    function select(option) {
      input.value = option.textContent;
      stored.value = option.dataset.value;
      for (const item of options) item.setAttribute('aria-selected',String(item===option));
      input.setCustomValidity('');
      close();
    }
    input.addEventListener('click',()=>open(!stored.value && Boolean(input.value)));
    input.addEventListener('input',()=>{
      stored.value='';
      options.forEach(option=>option.setAttribute('aria-selected','false'));
      input.setCustomValidity('Choose one of the listed options.');
      open(true);
      const exact=matches().find(option=>option.textContent.toLowerCase()===input.value.trim().toLowerCase());
      if(exact)select(exact);
    });
    picker.querySelector('[data-toggle]').addEventListener('click',()=>{
      const expanded=input.getAttribute('aria-expanded')==='true';
      input.focus();
      if(expanded)close();else open(false);
    });
    list.addEventListener('pointerdown',event=>event.preventDefault());
    list.addEventListener('click',event=>{
      const option=event.target.closest('[role=option]');
      if(option){input.focus();select(option);}
    });
    input.addEventListener('keydown',event=>{
      if(event.key==='Escape'){close();return;}
      if(event.key==='Enter' && !list.hidden){
        event.preventDefault();
        const option=active || (matches().length===1 ? matches()[0] : null);
        if(option)select(option);
        return;
      }
      if(!['ArrowDown','ArrowUp'].includes(event.key))return;
      event.preventDefault();
      if(list.hidden)open(false);
      const items=matches();
      const index=items.indexOf(active);
      highlight(items[index<0 ? (event.key==='ArrowDown'?0:items.length-1) :
        Math.max(0, Math.min(items.length-1,index+(event.key==='ArrowDown'?1:-1)))]);
    });
    picker.addEventListener('focusout',event=>{
      if(picker.contains(event.relatedTarget))return;
      if(!stored.value && !list.hidden && matches().length===1)select(matches()[0]);
      else close();
    });
  }
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
    next.firstElementChild.textContent = index === 2 ? 'Send request' : 'Continue';
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
        tel: parsedPhone().number,
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
  const country = form.elements.namedItem('phoneCountry');
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
  phone.addEventListener('input', validatePhone);
  country.addEventListener('change', validatePhone);
  if (application.done) confirmed(false);
  else show(0, false);
})();
