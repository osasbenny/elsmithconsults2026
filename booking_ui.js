/**
 * ELSMITH Booking UI - Full Multi-Step Scheduler
 * Optimized for Vercel & Production stability.
 */
(() => {
  const SESSION_TYPES = [
    'Executive Coaching',
    'Leadership Coaching',
    'Business / Workforce Advisory',
    'Consultation',
    'General Enquiry'
  ];
  const WAT = 'Africa/Lagos';
  let modal = null;
  let lastTrigger = null;
  let availability = { dates: new Set(), timezone: WAT };

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
      console.warn('Booking availability load failed.');
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
      modal.querySelector('[data-booking-close]').onclick = closeModal;
      modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    }
    modal.classList.add('is-open');
    document.body.classList.add('elsmith-modal-open');
    modal.dataset.step = '1';
    modal._booking = { step: 1, date: '', time: '', details: {}, slots: [], month: new Date() };
    renderStep();
    await loadAvailability();
    renderStep();
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
      body.innerHTML = `<h3>Select a date</h3><p class="elsmith-step-copy">Choose an available weekday for your session.</p>${renderCalendar()}<div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="button" data-next disabled>Continue</button></div>`;
      body.querySelectorAll('[data-date]').forEach(button => button.onclick = () => { state.date = button.dataset.date; body.querySelector('[data-next]').disabled = false; body.querySelectorAll('[data-date]').forEach(item => item.classList.remove('is-selected')); button.classList.add('is-selected'); });
      body.querySelector('[data-month="prev"]').onclick = () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderStep(); };
      body.querySelector('[data-month="next"]').onclick = () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderStep(); };
      body.querySelector('[data-next]').onclick = async () => {
        const button = body.querySelector('[data-next]'); button.disabled = true; button.textContent = 'Loading times…';
        try { const response = await fetch(`/api/availability?date=${encodeURIComponent(state.date)}`); const payload = await response.json(); if (!payload.success) throw new Error(); state.slots = payload.slots || []; state.step = 2; renderStep(); } catch { body.insertAdjacentHTML('beforeend', '<p class="elsmith-booking-error" role="alert">We couldn’t load times. Please try again.</p>'); button.disabled = false; button.textContent = 'Continue'; }
      };
      return;
    }
    if (state.step === 2) {
      body.innerHTML = `<button class="elsmith-back-link" type="button" data-back>← Change date</button><h3>Select a time</h3><p class="elsmith-step-copy">${formatDate(state.date)} · 60 minutes · WAT</p><div class="elsmith-time-grid">${state.slots.length ? state.slots.map(slot => `<button type="button" class="elsmith-time-button" data-time="${slot}">${formatTime(slot)}</button>`).join('') : '<p class="elsmith-booking-error">No times are available for this date.</p>'}</div>`;
      body.querySelector('[data-back]').onclick = () => { state.step = 1; renderStep(); };
      body.querySelectorAll('[data-time]').forEach(button => button.onclick = () => { state.time = button.dataset.time; state.step = 3; renderStep(); });
      return;
    }
    if (state.step === 3) {
      body.innerHTML = `<button class="elsmith-back-link" type="button" data-back>← Change time</button><h3>Your details</h3><p class="elsmith-step-copy">${formatDate(state.date)} · ${formatTime(state.time)} WAT</p><form class="elsmith-booking-form" data-booking-form><label>Full name<input name="name" required autocomplete="name" maxlength="120"></label><label>Email address<input name="email" type="email" required autocomplete="email" maxlength="320"></label><label>Phone number<input name="phone" type="tel" required autocomplete="tel" maxlength="50"></label><label>Company / organisation<input name="company" autocomplete="organization" maxlength="160"></label><label>Session type<select name="session_type" required><option value="">Select a session type</option>${SESSION_TYPES.map(type => `<option>${type}</option>`).join('')}</select></label><label>Brief message / reason<textarea name="message" rows="4" maxlength="4000" placeholder="What would you like to discuss?"></textarea></label><input class="elsmith-honeypot" name="website" tabindex="-1" autocomplete="off"><div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="submit">Review booking</button></div></form>`;
      body.querySelector('[data-back]').onclick = () => { state.step = 2; renderStep(); };
      body.querySelector('form').onsubmit = event => { event.preventDefault(); state.details = Object.fromEntries(new FormData(event.currentTarget)); state.step = 4; renderStep(); };
      return;
    }
    if (state.step === 4) {
      const d = state.details;
      body.innerHTML = `<button class="elsmith-back-link" type="button" data-back>← Edit details</button><h3>Review your session</h3><div class="elsmith-review"><dl><dt>Date</dt><dd>${escapeHtml(formatDate(state.date))}</dd><dt>Time</dt><dd>${escapeHtml(formatTime(state.time))} WAT</dd><dt>Session</dt><dd>${escapeHtml(d.session_type)}</dd><dt>Name</dt><dd>${escapeHtml(d.name)}</dd><dt>Email</dt><dd>${escapeHtml(d.email)}</dd><dt>Company</dt><dd>${escapeHtml(d.company || 'Not provided')}</dd></dl></div><div data-booking-message></div><div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="button" data-confirm>Confirm Booking</button></div>`;
      body.querySelector('[data-back]').onclick = () => { state.step = 3; renderStep(); };
      body.querySelector('[data-confirm]').onclick = async event => {
        const button = event.currentTarget; button.disabled = true; button.textContent = 'Submitting…';
        try {
          const response = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ ...d, date: state.date, time: state.time, csrf: 'vercel-token' }) });
          const payload = await response.json();
          if (!response.ok || !payload.success) throw new Error(payload.error || 'Unable to submit');
          body.innerHTML = `<div class="elsmith-success" role="status"><div class="elsmith-success-mark">✓</div><h3>Your session has been requested successfully.</h3><p>${escapeHtml(payload.message)}</p><dl><dt>Date</dt><dd>${escapeHtml(formatDate(payload.booking.date))}</dd><dt>Time</dt><dd>${escapeHtml(formatTime(payload.booking.time))} WAT</dd><dt>Session</dt><dd>${escapeHtml(payload.booking.session_type)}</dd><dt>Reference</dt><dd>${escapeHtml(payload.reference)}</dd></dl><button class="elsmith-booking-primary" type="button" data-booking-close>Close</button></div>`;
          body.querySelector('[data-booking-close]').onclick = closeModal;
        } catch (error) {
          const message = error.message || 'We couldn’t complete your booking. Please email info@elsmithconsulting.com directly.';
          body.querySelector('[data-booking-message]').innerHTML = `<p class="elsmith-booking-error" role="alert">${escapeHtml(message)}</p>`;
          button.disabled = false; button.textContent = 'Confirm Booking';
        }
      };
    }
  };

  const apply = () => {
    const root = document.getElementById('root');
    if (!root) return;

    if (!window._elsmith_booking_bound) {
      window._elsmith_booking_bound = true;
      document.addEventListener('click', e => {
        const target = e.target.closest('a,button');
        if (!target) return;
        const text = target.textContent.trim().toLowerCase();
        if (text === 'book a session' || text === 'schedule your time' || text.includes('schedule a coaching')) {
          e.preventDefault();
          openModal(target);
        }
      });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    }

    // Contact form enhancement
    const form = document.querySelector('form');
    if (form && !form.dataset.elsmithEnhanced) {
       form.dataset.elsmithEnhanced = 'true';
       const msgField = form.querySelector('textarea[name="message"]');
       if (msgField) {
          const extra = document.createElement('div');
          extra.innerHTML = `
            <label>Phone number<input name="phone" type="tel" placeholder="+234…"></label>
            <label>Company / organisation<input name="company"></label>
            <label>Subject / reason<select name="subject"><option value="">Select a reason</option><option>Executive Coaching</option><option>Leadership Development</option><option>Business Advisory</option><option>General Enquiry</option></select></label>
            <input class="elsmith-honeypot" name="website" tabindex="-1" autocomplete="off" style="display:none">`;
          msgField.parentElement.before(extra);
       }

       form.onsubmit = async e => {
          e.preventDefault();
          const btn = form.querySelector('button[type="submit"]');
          const originalText = btn.textContent;
          btn.disabled = true; btn.textContent = 'Sending…';
          try {
             const data = Object.fromEntries(new FormData(form)); data.csrf = 'vercel-token';
             const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
             const payload = await res.json();
             if (!res.ok || !payload.success) throw new Error(payload.error || 'Submit failed');
             alert('Success: ' + payload.message);
             form.reset();
          } catch (err) {
             alert('Error: ' + err.message);
          } finally {
             btn.disabled = false; btn.textContent = originalText;
          }
       };
    }
  };

  window.addEventListener('load', apply);
  setInterval(apply, 2000);
})();
