/**
 * ELSMITH Site Updates - Professional Content Injection
 * Safely applies text and layout updates without causing infinite loops.
 */
(() => {
  const apply = () => {
    const root = document.getElementById('root');
    if (!root || !root.children.length) return;

    const textNodes = (selector = '*') => [...root.querySelectorAll(selector)];
    const findByText = (text) => textNodes().find(el => el.textContent.includes(text) && el.childElementCount === 0);
    const heading = (value) => textNodes('h1,h2,h3,h4,h5').find((el) => el.textContent.trim() === value);
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

    // 2. Profile & Hero Updates
    const heroLeadText = 'ELSMITH Consulting is a global business and workforce advisory firm dedicated to transforming organizations through strategic insights, leadership development, and innovative solutions.';
    const heroLead = findByText(heroLeadText);
    if (heroLead) heroLead.textContent = 'ELSMITH Consulting is a performance-focused organisation dedicated to enabling business excellence and driving impactful transformation.';

    const founderParaText = 'Stanley Eluwa is the visionary founder and lead consultant at ELSMITH Consulting. With over two decades of experience in business advisory, organizational transformation, and talent development, Stanley has successfully guided numerous organizations across Africa, Europe, and the Middle East through complex transformation journeys.';
    const founderPara = findByText(founderParaText);
    if (founderPara) founderPara.textContent = 'Stanley Eluwa is a Lead Consultant with 20+ years of strategic HR and business leadership experience. He is a speaker, facilitator and coach who leads leadership and strategy workshops focused on leadership effectiveness, personal success and capability development.';

    // 3. Values Section
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

    // 4. Copyright Year
    const year = new Date().getFullYear();
    textNodes().forEach((el) => {
      if (el.childElementCount === 0 && el.textContent.includes('©') && el.textContent.includes('ELSMITH Consulting')) {
          if (!el.textContent.includes(year.toString())) {
            el.textContent = `© ${year} ELSMITH Consulting. All rights reserved.`;
          }
      }
    });

    // 5. Remove Calendly Placeholders (Aggressive)
    textNodes().forEach(el => {
        if (el.textContent.includes('Booking Widget Placeholder')) {
            el.textContent = 'Schedule Your Executive Session';
            el.style.color = '#123b78';
            el.style.fontWeight = 'bold';
            el.style.fontSize = '1.8rem';
            el.style.display = 'block';
            el.style.margin = '20px 0';
        }
        if (el.textContent.includes('actual calendar widget')) {
            el.textContent = 'Click the button below to open our custom scheduler and secure your spot.';
        }
        if (el.textContent.includes('Go to Booking Page')) {
            el.textContent = 'Open Booking Scheduler';
            const a = el.closest('a');
            if (a) {
                a.href = '#';
                a.classList.add('elsmith-trigger-booking');
            }
        }
    });
  };

  window.addEventListener('load', apply);
  setInterval(apply, 1000);
})();
