/**
 * ELSMITH Site Updates - Stability Version
 * Safely applies text and layout updates without causing infinite loops.
 */
(() => {
  const apply = () => {
    const root = document.getElementById('root');
    if (!root || !root.children.length) return;

    const textNodes = (selector = '*') => [...root.querySelectorAll(selector)];
    const exact = (value) => textNodes().find((el) => el.childElementCount === 0 && el.textContent.trim() === value);
    const heading = (value) => textNodes('h1,h2,h3,h4,h5').find((el) => el.textContent.trim() === value);
    const make = (tag, className, text) => {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text) el.textContent = text;
      return el;
    };

    // 1. Correct legacy contact numbers
    root.querySelectorAll('a[href="tel:+2348032004575"]').forEach((a) => {
      a.href = 'tel:+2348077892200';
      a.textContent = '+2348077892200';
    });

    // 2. Profile & Hero Updates
    const founderTitle = exact('Lead Consultant & Founder');
    if (founderTitle) founderTitle.textContent = 'Lead Consultant';

    const founderPara = exact('Stanley Eluwa is the visionary founder and lead consultant at ELSMITH Consulting. With over two decades of experience in business advisory, organizational transformation, and talent development, Stanley has successfully guided numerous organizations across Africa, Europe, and the Middle East through complex transformation journeys.');
    if (founderPara) founderPara.textContent = 'Stanley Eluwa is a Lead Consultant with 20+ years of strategic HR and business leadership experience. He is a speaker, facilitator and coach who leads leadership and strategy workshops focused on leadership effectiveness, personal success and capability development.';

    // 3. Values Section (Conditional injection)
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
  };

  // Run on load and periodically to catch React renders without using a recursive observer
  window.addEventListener('load', apply);
  let runCount = 0;
  const interval = setInterval(() => {
    apply();
    if (++runCount > 20) clearInterval(interval);
  }, 1000);
})();
