(() => {
  const SESSION_TYPES = [
    'Executive Coaching',
    'Leadership Coaching',
    'Business / Workforce Advisory',
    'Consultation',
    'General Enquiry'
  ];
  const WAT = 'Africa/Lagos';
  let csrf = '';
  let modal = null;
  let lastTrigger = null;
  let availability = { dates: new Set(), timezone: WAT };

  const getRoot = () => document.getElementById('root');
  const fetchCsrf = async () => {
    return 'vercel-safe-token';
  };
  const todayString = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: WAT, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
  };
  const parseDate = (value) => new Date(`${value}T12:00:00+01:00`);
  const formatDate = (value) => new Intl.DateTimeFormat('en-GB', { timeZone: WAT, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(value));
  const formatTime = (value) => {
    const [hour, minute] = value.split(':').map(Number);
    const date = new Date(2026, 0, 1, hour, minute);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));

  const loadAvailability = async () => {
    try {
        const response = await fetch('/api/availability', { credentials: 'same-origin' });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || 'Availability unavailable');
        availability = { dates: new Set(payload.available_dates || []), timezone: payload.settings?.timezone || WAT };
    } catch (e) {
        console.warn('Availability check failed, using fallback.');
    }
  };

  const modalShell = () => `
    <div class="elsmith-modal-backdrop" data-booking-backdrop>
      <section class="elsmith-booking-modal" role="dialog" aria-modal="true" aria-labelledby="elsmith-booking-title">
        <button class="elsmith-modal-close" type="button" data-booking-close aria-label="Close booking scheduler">&times;</button>
        <div class="elsmith-booking-header">
          <p class="elsmith-eyebrow">ELSMITH CONSULTING</p>
          <h2 id="elsmith-booking-title">Book a Session</h2>
          <p>Choose a convenient time for a conversation with our team.</p>
        </div>
        <div class="elsmith-booking-steps" aria-label="Booking progress">
          <span data-step-dot="1">1&nbsp; Date</span><span data-step-dot="2">2&nbsp; Time</span><span data-step-dot="3">3&nbsp; Details</span><span data-step-dot="4">4&nbsp; Review</span>
        </div>
        <div class="elsmith-booking-body" data-booking-body></div>
      </section>
    </div>`;

  const openModal = async (trigger) => {
    lastTrigger = trigger || document.activeElement;
    if (!modal) {
      modal = document.createElement('div');
      modal.innerHTML = modalShell();
      document.body.append(modal.firstElementChild);
      modal = document.querySelector('[data-booking-backdrop]');
      modal.querySelector('[data-booking-close]').addEventListener('click', closeModal);
      modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    }
    modal.classList.add('is-open');
    document.body.classList.add('elsmith-modal-open');
    modal.dataset.step = '1';
    modal._booking = { step: 1, date: '', time: '', details: {}, slots: [], month: new Date() };
    renderStep();
    try {
      await loadAvailability();
      renderStep();
    } catch (error) {
      modal.querySelector('[data-booking-body]').innerHTML = '<div class="elsmith-booking-error" role="alert">We couldn’t load availability right now. Please contact ELSMITH directly and we will arrange a suitable time.</div><button class="elsmith-booking-secondary" type="button" data-booking-close>Close</button>';
      modal.querySelector('[data-booking-body] [data-booking-close]')?.addEventListener('click', closeModal);
    }
    modal.querySelector('[data-booking-close]').focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('elsmith-modal-open');
    lastTrigger?.focus?.();
  };

  const renderCalendar = () => {
    const state = modal._booking;
    const view = new Date(state.month.getFullYear(), state.month.getMonth(), 1);
    const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(view);
    const firstDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let cells = '';
    for (let i = 0; i < offset; i++) cells += '<span class="elsmith-calendar-empty" aria-hidden="true"></span>';
    for (let day = 1; day <= days; day++) {
      const date = `${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const disabled = !availability.dates.has(date) || date < todayString();
      const selected = date === state.date ? ' is-selected' : '';
      cells += `<button class="elsmith-calendar-day${selected}" type="button" data-date="${date}" ${disabled ? 'disabled' : ''} aria-label="${date}">${day}</button>`;
    }
    return `<div class="elsmith-calendar-toolbar"><button type="button" class="elsmith-icon-button" data-month="prev" aria-label="Previous month">‹</button><strong>${monthLabel}</strong><button type="button" class="elsmith-icon-button" data-month="next" aria-label="Next month">›</button></div><div class="elsmith-calendar-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div><div class="elsmith-calendar-grid">${cells}</div><p class="elsmith-helper">All times are shown in West Africa Time (WAT).</p>`;
  };

  const renderStep = () => {
    if (!modal) return;
    const state = modal._booking;
    modal.dataset.step = String(state.step);
    modal.querySelectorAll('[data-step-dot]').forEach(dot => dot.classList.toggle('is-active', Number(dot.dataset.stepDot) <= state.step));
    const body = modal.querySelector('[data-booking-body]');
    if (state.step === 1) {
      body.innerHTML = `<h3>Select a date</h3><p class="elsmith-step-copy">Choose an available weekday for your 60-minute session.</p>${renderCalendar()}<div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="button" data-next disabled>Continue</button></div>`;
      body.querySelectorAll('[data-date]').forEach(button => button.addEventListener('click', () => { state.date = button.dataset.date; body.querySelector('[data-next]').disabled = false; body.querySelectorAll('[data-date]').forEach(item => item.classList.remove('is-selected')); button.classList.add('is-selected'); }));
      body.querySelector('[data-month="prev"]').addEventListener('click', () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderStep(); });
      body.querySelector('[data-month="next"]').addEventListener('click', () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderStep(); });
      body.querySelector('[data-next]').addEventListener('click', async () => {
        const button = body.querySelector('[data-next]'); button.disabled = true; button.textContent = 'Loading times…';
        try { const response = await fetch(`/api/availability?date=${encodeURIComponent(state.date)}`); const payload = await response.json(); if (!payload.success) throw new Error(); state.slots = payload.slots || []; state.step = 2; renderStep(); } catch { body.insertAdjacentHTML('beforeend', '<p class="elsmith-booking-error" role="alert">We couldn’t load times for that date. Please try again.</p>'); button.disabled = false; button.textContent = 'Continue'; }
      });
      return;
    }
    if (state.step === 2) {
      body.innerHTML = `<button class="elsmith-back-link" type="button" data-back>← Change date</button><h3>Select a time</h3><p class="elsmith-step-copy">${formatDate(state.date)} · 60 minutes · WAT</p><div class="elsmith-time-grid">${state.slots.length ? state.slots.map(slot => `<button type="button" class="elsmith-time-button" data-time="${slot}">${formatTime(slot)}</button>`).join('') : '<p class="elsmith-booking-error">No times are available for this date. Please choose another date.</p>'}</div>`;
      body.querySelector('[data-back]').addEventListener('click', () => { state.step = 1; renderStep(); });
      body.querySelectorAll('[data-time]').forEach(button => button.addEventListener('click', () => { state.time = button.dataset.time; state.step = 3; renderStep(); }));
      return;
    }
    if (state.step === 3) {
      body.innerHTML = `<button class="elsmith-back-link" type="button" data-back>← Change time</button><h3>Your details</h3><p class="elsmith-step-copy">${formatDate(state.date)} · ${formatTime(state.time)} WAT</p><form class="elsmith-booking-form" data-booking-form><label>Full name<input name="name" required autocomplete="name" maxlength="120"></label><label>Email address<input name="email" type="email" required autocomplete="email" maxlength="320"></label><label>Phone number<input name="phone" type="tel" required autocomplete="tel" maxlength="50"></label><label>Company / organisation<input name="company" autocomplete="organization" maxlength="160"></label><label>Session type<select name="session_type" required><option value="">Select a session type</option>${SESSION_TYPES.map(type => `<option>${type}</option>`).join('')}</select></label><label>Brief message / reason<textarea name="message" rows="4" maxlength="4000" placeholder="What would you like to discuss?"></textarea></label><input class="elsmith-honeypot" name="website" tabindex="-1" autocomplete="off"><div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="submit">Review booking</button></div></form>`;
      body.querySelector('[data-back]').addEventListener('click', () => { state.step = 2; renderStep(); });
      body.querySelector('form').addEventListener('submit', event => { event.preventDefault(); state.details = Object.fromEntries(new FormData(event.currentTarget)); state.step = 4; renderStep(); });
      return;
    }
    if (state.step === 4) {
      const d = state.details;
      body.innerHTML = `<button class="elsmith-back-link" type="button" data-back>← Edit details</button><h3>Review your session</h3><div class="elsmith-review"><dl><dt>Date</dt><dd>${escapeHtml(formatDate(state.date))}</dd><dt>Time</dt><dd>${escapeHtml(formatTime(state.time))} WAT</dd><dt>Session</dt><dd>${escapeHtml(d.session_type)}</dd><dt>Name</dt><dd>${escapeHtml(d.name)}</dd><dt>Email</dt><dd>${escapeHtml(d.email)}</dd><dt>Company</dt><dd>${escapeHtml(d.company || 'Not provided')}</dd></dl></div><div data-booking-message></div><div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="button" data-confirm>Confirm Booking</button></div>`;
      body.querySelector('[data-back]').addEventListener('click', () => { state.step = 3; renderStep(); });
      body.querySelector('[data-confirm]').addEventListener('click', async event => {
        const button = event.currentTarget; button.disabled = true; button.textContent = 'Submitting…';
        try {
          const response = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ ...d, date: state.date, time: state.time, csrf: 'vercel-token' }) });
          const payload = await response.json();
          if (!response.ok || !payload.success) throw new Error(payload.error || 'Unable to submit');
          body.innerHTML = `<div class="elsmith-success" role="status"><div class="elsmith-success-mark">✓</div><h3>Your session has been requested successfully.</h3><p>${escapeHtml(payload.message)}</p><dl><dt>Date</dt><dd>${escapeHtml(formatDate(payload.booking.date))}</dd><dt>Time</dt><dd>${escapeHtml(formatTime(payload.booking.time))} WAT</dd><dt>Session</dt><dd>${escapeHtml(payload.booking.session_type)}</dd><dt>Reference</dt><dd>${escapeHtml(payload.reference)}</dd></dl><button class="elsmith-booking-primary" type="button" data-booking-close>Close</button></div>`;
          body.querySelector('[data-booking-close]').addEventListener('click', closeModal);
        } catch (error) {
          const message = error.message || 'We couldn’t complete your booking right now. Please try again or contact ELSMITH directly.';
          body.querySelector('[data-booking-message]').innerHTML = `<p class="elsmith-booking-error" role="alert">${escapeHtml(message)}</p>`;
          button.disabled = false; button.textContent = 'Confirm Booking';
        }
      });
    }
  };

  const enhanceContactForm = (root) => {
    const form = root.querySelector('form');
    if (!form || form.dataset.elsmithEnhanced) return;
    const message = form.querySelector('textarea[name="message"]');
    if (!message) return;
    form.dataset.elsmithEnhanced = 'true';
    const extra = document.createElement('div');
    extra.dataset.elsmithContactExtra = 'true';
    extra.innerHTML = '<label>Phone number<input name="phone" type="tel" autocomplete="tel" maxlength="50" placeholder="+234…"></label><label>Company / organisation<input name="company" autocomplete="organization" maxlength="160"></label><label>Subject / reason<select name="subject"><option value="">Select a reason</option><option>Executive Coaching</option><option>Leadership Development</option><option>Business / Workforce Advisory</option><option>General Enquiry</option></select></label><input class="elsmith-honeypot" name="website" tabindex="-1" autocomplete="off">';
    message.closest('div')?.before(extra);
    let status = form.querySelector('[data-contact-status]');
    if (!status) { status = document.createElement('p'); status.dataset.contactStatus = 'true'; status.setAttribute('role', 'status'); form.append(status); }
    form.addEventListener('submit', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true; submit.textContent = 'Sending…'; status.className = 'elsmith-form-status'; status.textContent = '';
      try {
        const data = Object.fromEntries(new FormData(form)); data.csrf = 'vercel-token';
        const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(data) });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error || 'Unable to submit');
        form.reset(); status.className = 'elsmith-form-status is-success'; status.textContent = payload.message;
      } catch (error) {
        status.className = 'elsmith-form-status is-error'; status.textContent = error.message || 'We couldn’t complete your enquiry right now. Please try again or contact ELSMITH directly.';
      } finally { submit.disabled = false; submit.textContent = 'Send Message'; }
    }, true);
  };

  const enhanceMobileNavigation = (root) => {
    root.querySelectorAll('nav').forEach(nav => {
      if (nav.dataset.elsmithMobileNav) return;
      const container = nav.firstElementChild;
      if (!container) return;
      nav.dataset.elsmithMobileNav = 'true';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'elsmith-mobile-menu-button';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation menu');
      toggle.innerHTML = '<span></span><span></span><span></span>';
      const drawer = document.createElement('div');
      drawer.className = 'elsmith-mobile-drawer';
      drawer.hidden = true;
      drawer.setAttribute('aria-label', 'Mobile navigation');
      const links = [...nav.querySelectorAll('a[href]')].filter(link => link.textContent.trim() && !link.querySelector('img'));
      drawer.innerHTML = links.map(link => `<a href="${link.getAttribute('href')}" class="elsmith-mobile-nav-link">${escapeHtml(link.textContent.trim())}</a>`).join('');
      const closeDrawer = () => { drawer.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open navigation menu'); };
      toggle.addEventListener('click', () => { const open = drawer.hidden; drawer.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu'); if (open) drawer.querySelector('a')?.focus(); });
      drawer.addEventListener('click', event => { if (event.target.closest('a')) closeDrawer(); });
      container.append(toggle);
      nav.append(drawer);
    });
  };

  const bindTriggers = () => {
    document.addEventListener('click', event => {
      const target = event.target.closest?.('a,button,[data-book-session]');
      if (!target) return;
      const text = target.textContent.trim().toLowerCase();
      const isBooking = target.matches('[data-book-session]') || text === 'book a session' || text === 'schedule your time' || text === 'contact us to schedule a session';
      if (isBooking) { event.preventDefault(); openModal(target); }
    }, true);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal?.classList.contains('is-open')) closeModal(); }, true);
  };

  let bound = false;
  const apply = () => {
    const root = getRoot();
    if (!root || !root.children.length) return;
    enhanceContactForm(root);
    enhanceMobileNavigation(root);
    if (!bound) { bound = true; bindTriggers(); }
  };
  window.addEventListener('load', apply);
  const root = getRoot();
  if (root) {
      let timeout;
      new MutationObserver(() => {
          clearTimeout(timeout);
          timeout = setTimeout(apply, 200);
      }).observe(root, { childList: true, subtree: true });
  }
})();
