/**
 * ELSMITH Booking UI - Professional Multi-Step Scheduler
 * Optimized for Vercel, Node.js API, and stable UI/UX.
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
  let availability = { dates: new Set(), timezone: WAT };

  const todayString = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: WAT, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
  };
  const formatDate = (v) => new Intl.DateTimeFormat('en-GB', { timeZone: WAT, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${v}T12:00:00+01:00`));
  const formatTime = (v) => {
    const [h, m] = v.split(':').map(Number);
    return new Date(2026, 0, 1, h, m).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));

  const loadAvailability = async () => {
    try {
      const res = await fetch('/api/availability');
      const data = await res.json();
      if (data.success) {
        availability = { dates: new Set(data.available_dates || []), timezone: data.settings?.timezone || WAT };
      }
    } catch (e) { console.warn('Availability check failed.'); }
  };

  const modalShell = () => `
    <div class="elsmith-modal-backdrop" data-booking-backdrop>
      <section class="elsmith-booking-modal" role="dialog" aria-modal="true">
        <button class="elsmith-modal-close" type="button" data-booking-close aria-label="Close">&times;</button>
        <div class="elsmith-booking-header">
          <p class="elsmith-eyebrow">ELSMITH CONSULTING</p>
          <h2 id="elsmith-booking-title">Book a Session</h2>
          <p>Choose a convenient time for a conversation with our team.</p>
        </div>
        <div class="elsmith-booking-steps">
          <span data-step-dot="1">1 Date</span><span data-step-dot="2">2 Time</span><span data-step-dot="3">3 Details</span><span data-step-dot="4">4 Review</span>
        </div>
        <div class="elsmith-booking-body" data-booking-body></div>
      </section>
    </div>`;

  const openModal = async () => {
    if (!modal) {
      modal = document.createElement('div');
      modal.innerHTML = modalShell();
      document.body.append(modal.firstElementChild);
      modal = document.querySelector('[data-booking-backdrop]');
      modal.querySelector('[data-booking-close]').onclick = closeModal;
      modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    }
    modal.classList.add('is-open');
    document.body.classList.add('elsmith-modal-open');
    modal._state = { step: 1, date: '', time: '', details: {}, slots: [], month: new Date() };
    renderStep();
    await loadAvailability();
    renderStep();
  };

  const closeModal = () => {
    if (modal) {
      modal.classList.remove('is-open');
      document.body.classList.remove('elsmith-modal-open');
    }
  };

  const renderCalendar = () => {
    const s = modal._state;
    const view = new Date(s.month.getFullYear(), s.month.getMonth(), 1);
    const label = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(view);
    const firstDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    let cells = '';
    for (let i = 0; i < offset; i++) cells += '<span class="elsmith-calendar-empty"></span>';
    for (let d = 1; d <= days; d++) {
      const date = `${view.getFullYear()}-${String(view.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = date < todayString();
      const isAvailable = availability.dates.has(date);
      const disabled = isPast || !isAvailable;
      const selected = date === s.date ? ' is-selected' : '';
      cells += `<button class="elsmith-calendar-day${selected}" type="button" data-date="${date}" ${disabled ? 'disabled' : ''}>${d}</button>`;
    }
    return `
      <div class="elsmith-calendar-toolbar">
        <button type="button" class="elsmith-icon-button" data-month="prev">‹</button>
        <strong>${label}</strong>
        <button type="button" class="elsmith-icon-button" data-month="next">›</button>
      </div>
      <div class="elsmith-calendar-weekdays"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
      <div class="elsmith-calendar-grid">${cells}</div>`;
  };

  const renderStep = () => {
    if (!modal) return;
    const s = modal._state;
    modal.querySelectorAll('[data-step-dot]').forEach(dot => dot.classList.toggle('is-active', Number(dot.dataset.stepDot) <= s.step));
    const body = modal.querySelector('[data-booking-body]');

    if (s.step === 1) {
      body.innerHTML = `<h3>Select a date</h3>${renderCalendar()}<div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="button" data-next disabled>Continue</button></div>`;
      body.querySelectorAll('[data-date]').forEach(btn => btn.onclick = () => { s.date = btn.dataset.date; body.querySelector('[data-next]').disabled = false; body.querySelectorAll('[data-date]').forEach(b => b.classList.remove('is-selected')); btn.classList.add('is-selected'); });
      body.querySelector('[data-month="prev"]').onclick = () => { s.month.setMonth(s.month.getMonth() - 1); renderStep(); };
      body.querySelector('[data-month="next"]').onclick = () => { s.month.setMonth(s.month.getMonth() + 1); renderStep(); };
      body.querySelector('[data-next]').onclick = async () => {
        body.querySelector('[data-next]').disabled = true;
        body.querySelector('[data-next]').textContent = 'Loading times...';
        try {
          const res = await fetch(`/api/availability?date=${s.date}`);
          const data = await res.json();
          s.slots = data.slots || [];
          s.step = 2; renderStep();
        } catch (e) { renderStep(); }
      };
    } else if (s.step === 2) {
      body.innerHTML = `<button class="elsmith-back-link" type="button" data-back>← Change date</button><h3>Select a time</h3><p class="elsmith-step-copy">${formatDate(s.date)}</p><div class="elsmith-time-grid">${s.slots.length ? s.slots.map(t => `<button type="button" class="elsmith-time-button" data-time="${t}">${formatTime(t)}</button>`).join('') : '<p>No availability.</p>'}</div>`;
      body.querySelector('[data-back]').onclick = () => { s.step = 1; renderStep(); };
      body.querySelectorAll('[data-time]').forEach(btn => btn.onclick = () => { s.time = btn.dataset.time; s.step = 3; renderStep(); });
    } else if (s.step === 3) {
      body.innerHTML = `
        <button class="elsmith-back-link" type="button" data-back>← Change time</button>
        <h3>Your details</h3>
        <form class="elsmith-booking-form space-y-4">
          <label class="block"><span class="text-sm font-bold">Full name</span><input name="name" required class="w-full px-4 py-2 border rounded-lg"></label>
          <label class="block"><span class="text-sm font-bold">Email address</span><input name="email" type="email" required class="w-full px-4 py-2 border rounded-lg"></label>
          <label class="block"><span class="text-sm font-bold">Phone number</span><input name="phone" type="tel" required class="w-full px-4 py-2 border rounded-lg"></label>
          <label class="block"><span class="text-sm font-bold">Session type</span><select name="session_type" required class="w-full px-4 py-2 border rounded-lg"><option value="">Select type</option>${SESSION_TYPES.map(t => `<option>${t}</option>`).join('')}</select></label>
          <label class="block"><span class="text-sm font-bold">Message</span><textarea name="message" rows="3" class="w-full px-4 py-2 border rounded-lg"></textarea></label>
          <div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="submit">Review</button></div>
        </form>`;
      body.querySelector('[data-back]').onclick = () => { s.step = 2; renderStep(); };
      body.querySelector('form').onsubmit = (e) => { e.preventDefault(); s.details = Object.fromEntries(new FormData(e.target)); s.step = 4; renderStep(); };
    } else if (s.step === 4) {
      body.innerHTML = `
        <button class="elsmith-back-link" type="button" data-back>← Edit details</button>
        <h3>Review & Confirm</h3>
        <div class="elsmith-review bg-secondary/10 p-4 rounded-lg space-y-2">
          <p><strong>Date:</strong> ${formatDate(s.date)}</p>
          <p><strong>Time:</strong> ${formatTime(s.time)} WAT</p>
          <p><strong>Name:</strong> ${s.details.name}</p>
        </div>
        <div class="elsmith-booking-actions"><button class="elsmith-booking-primary" type="button" data-confirm>Confirm Booking</button></div>`;
      body.querySelector('[data-back]').onclick = () => { s.step = 3; renderStep(); };
      body.querySelector('[data-confirm]').onclick = async (e) => {
        e.target.disabled = true; e.target.textContent = 'Submitting...';
        try {
          const res = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...s.details, date: s.date, time: s.time }) });
          const data = await res.json();
          if (data.success) {
            body.innerHTML = `<div class="text-center space-y-4"><div class="text-4xl text-green-500">✓</div><h3>Booking Requested</h3><p>${data.message}</p><button class="elsmith-booking-primary" onclick="location.reload()">Done</button></div>`;
          } else throw new Error(data.error);
        } catch (err) { alert(err.message); e.target.disabled = false; e.target.textContent = 'Confirm Booking'; }
      };
    }
  };

  const enhanceContactForm = () => {
    const form = document.querySelector('form');
    // Only enhance the actual contact page form, not the booking modal form
    if (!form || form.closest('.elsmith-booking-modal') || form.dataset.elsmithEnhanced) return;

    form.dataset.elsmithEnhanced = 'true';
    const messageContainer = form.querySelector('textarea[name="message"]')?.parentElement;
    if (messageContainer) {
      const extra = document.createElement('div');
      extra.className = "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4";
      extra.innerHTML = `
        <div>
          <label class="block text-sm font-bold text-primary mb-2">Phone number</label>
          <input name="phone" type="tel" placeholder="+234..." class="w-full px-4 py-3 rounded-lg border border-secondary outline-none focus:ring-2 focus:ring-accent">
        </div>
        <div>
          <label class="block text-sm font-bold text-primary mb-2">Company / organisation</label>
          <input name="company" placeholder="Your company" class="w-full px-4 py-3 rounded-lg border border-secondary outline-none focus:ring-2 focus:ring-accent">
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-bold text-primary mb-2">Subject / reason</label>
          <select name="subject" class="w-full px-4 py-3 rounded-lg border border-secondary outline-none focus:ring-2 focus:ring-accent">
            <option value="">Select a reason</option>
            <option>Executive Coaching</option>
            <option>Leadership Development</option>
            <option>Business Advisory</option>
            <option>General Enquiry</option>
          </select>
        </div>
        <input class="elsmith-honeypot" name="website" tabindex="-1" autocomplete="off" style="display:none">
      `;
      messageContainer.before(extra);
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending...';
      try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        alert('Success: ' + data.message);
        form.reset();
      } catch (err) { alert('Error: ' + err.message); }
      finally { btn.disabled = false; btn.textContent = original; }
    };
  };

  const init = () => {
    document.addEventListener('click', e => {
      const btn = e.target.closest('a, button');
      if (!btn) return;
      const txt = btn.textContent.toLowerCase();
      if (txt.includes('book a session') || txt.includes('schedule your time')) {
        e.preventDefault(); openModal();
      }
    });
    enhanceContactForm();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  setInterval(enhanceContactForm, 3000);
})();
