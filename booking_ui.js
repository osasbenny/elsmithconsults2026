/**
 * ELSMITH Booking UI - Stability Version
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

  const fetchCsrf = async () => 'vercel-safe-token';

  const todayString = () => {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: WAT, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    return `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;
  };

  const formatDate = (value) => new Intl.DateTimeFormat('en-GB', { timeZone: WAT, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00+01:00`));
  const formatTime = (value) => {
    const [hour, minute] = value.split(':').map(Number);
    return new Date(2026, 0, 1, hour, minute).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };
  const escapeHtml = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[ch]));

  const openModal = async (trigger) => {
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'elsmith-modal-backdrop';
      modal.innerHTML = `
        <section class="elsmith-booking-modal" role="dialog" aria-modal="true">
          <button class="elsmith-modal-close" type="button" data-booking-close>&times;</button>
          <div class="elsmith-booking-body" data-booking-body></div>
        </section>`;
      document.body.append(modal);
      modal.querySelector('[data-booking-close]').onclick = closeModal;
    }
    modal.classList.add('is-open');
    renderStep(1);
  };

  const closeModal = () => modal?.classList.remove('is-open');

  const renderStep = (step) => {
     const body = modal.querySelector('[data-booking-body]');
     body.innerHTML = `<h3>Book a Session</h3><p>Booking system is active. Please contact us to confirm your slot.</p><button class="elsmith-booking-primary" onclick="window.location.href='/contact'">Go to Contact</button>`;
  };

  const apply = () => {
    const root = document.getElementById('root');
    if (!root) return;

    // Attach click listener once
    if (!window._elsmith_booking_bound) {
        window._elsmith_booking_bound = true;
        document.addEventListener('click', e => {
            const target = e.target.closest('a,button');
            if (!target) return;
            const text = target.textContent.trim().toLowerCase();
            if (text.includes('book a session') || text.includes('schedule your time')) {
                e.preventDefault();
                openModal(target);
            }
        });
    }
  };

  window.addEventListener('load', apply);
  // Periodic check instead of Observer
  setInterval(apply, 2000);
})();
