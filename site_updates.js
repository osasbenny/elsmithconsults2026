/**
 * ELSMITH Site Updates - Professional Content Injection (Safe Version)
 * Fixes the "vanishing homepage" by only targeting leaf nodes for text replacement.
 */
(() => {
  const apply = () => {
    const root = document.getElementById('root');
    if (!root || !root.children.length) return;

    // Helper: Find only elements with no children (leaf nodes) to prevent overwriting containers
    const leafNodes = () => [...root.querySelectorAll('*')].filter(el => el.children.length === 0);

    const heading = (value) => [...root.querySelectorAll('h1,h2,h3,h4,h5')].find((el) => el.textContent.trim() === value);
    const make = (tag, className, text) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text) el.textContent = text;
      return el;
    };

    // 1. Contact Numbers & Redirects
    root.querySelectorAll('a[href*="tel:+2348032004575"], a[href*="tel:+447733717516"]').forEach((a) => {
      if (a.href.includes('8032004575')) {
          a.href = 'tel:+2348077892200';
          a.textContent = '+2348077892200';
      } else {
          a.href = 'mailto:info@elsmithconsulting.com';
          a.textContent = 'Contact by email';
      }
    });

    // 2. Safe Text Replacements (Only targeting leaf elements)
    leafNodes().forEach(el => {
        const txt = el.textContent.trim();

        if (txt === 'Lead Consultant & Founder') {
            el.textContent = 'Lead Consultant';
        }

        if (txt.includes('Stanley Eluwa is the visionary founder')) {
            el.textContent = 'Stanley Eluwa is a Lead Consultant with 20+ years of strategic HR and business leadership experience. He is a speaker, facilitator and coach who leads leadership and strategy workshops focused on leadership effectiveness, personal success and capability development.';
        }

        if (txt.includes('ELSMITH Consulting is a global business and workforce advisory firm dedicated to transforming organizations')) {
            el.textContent = 'ELSMITH Consulting is a performance-focused organisation dedicated to enabling business excellence and driving impactful transformation.';
        }

        // 3. Remove Calendly Placeholders
        if (txt === '**Booking Widget Placeholder**') {
            el.textContent = 'Schedule Your Executive Session';
            el.style.color = '#123b78';
            el.style.fontWeight = 'bold';
            el.style.fontSize = '1.8rem';
        }

        if (txt.includes('actual calendar widget')) {
            el.textContent = 'Click the button below to open our custom scheduler and secure your spot.';
        }

        if (txt === 'Go to Booking Page (Placeholder Link)') {
            el.textContent = 'Open Booking Scheduler';
        }
    });

    // 4. Values Section Detail Injection
    const valuesHeading = heading('Our Values');
    if (valuesHeading && !root.querySelector('[data-elsmith-values-applied]')) {
      const detail = make('div', 'mt-6 space-y-3 text-foreground', '');
      detail.dataset.elsmithValuesApplied = 'true';
      [
        ['Accountability', 'Ownership of outcomes, integrity and transparency.'],
        ['Growth', 'Continuous personal and organisational improvement.'],
        ['Excellence', 'Maintaining the highest standards of value.']
      ].forEach(([name, desc]) => {
        const p = make('p', '', '');
        p.append(make('strong', '', `${name}: `), document.createTextNode(desc));
        detail.append(p);
      });
      valuesHeading.parentElement.append(detail);
    }

    // 5. Form Hijack (Contact Form)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        if (form.closest('.elsmith-booking-modal')) return;

        if (!form.dataset.elsmithHijacked) {
            form.dataset.elsmithHijacked = 'true';

            // Add Phone/Subject fields if on Contact page and they are missing
            if (window.location.pathname.includes('contact') && !form.querySelector('input[name="phone"]')) {
                const msgField = form.querySelector('textarea[name="message"]');
                if (msgField) {
                    const extra = document.createElement('div');
                    extra.className = "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4";
                    extra.innerHTML = `
                        <div><label class="block text-sm font-bold text-primary mb-1">Phone</label><input name="phone" placeholder="+234..." class="w-full px-4 py-2 border rounded-lg"></div>
                        <div><label class="block text-sm font-bold text-primary mb-1">Subject</label><select name="subject" class="w-full px-4 py-2 border rounded-lg"><option>General Enquiry</option><option>Executive Coaching</option><option>Business Advisory</option></select></div>
                    `;
                    msgField.parentElement.before(extra);
                }
            }

            form.onsubmit = async (e) => {
                e.preventDefault();
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.disabled = true;
                btn.textContent = 'Sending...';

                try {
                    const payload = Object.fromEntries(new FormData(form).entries());
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    const result = await response.json();
                    if (result.success) {
                        alert('Success: Your message has been sent successfully.');
                        form.reset();
                    } else throw new Error(result.error);
                } catch (error) {
                    alert('Error: ' + error.message);
                } finally {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            };
        }
    });

    // 6. Copyright Year Stability
    const year = new Date().getFullYear();
    [...root.querySelectorAll('*')].forEach((el) => {
      if (el.children.length === 0 && el.textContent.includes('©') && el.textContent.includes('ELSMITH Consulting')) {
          if (!el.textContent.includes(year.toString())) {
            el.textContent = `© ${year} ELSMITH Consulting. All rights reserved.`;
          }
      }
    });
  };

  window.addEventListener('load', apply);
  setInterval(apply, 2000);
})();
