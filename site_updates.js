/**
 * ELSMITH Site Updates - Professional Content Injection
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

    // 1. Contact Numbers & Redirects (info@elsmithconsulting.com is the primary)
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
    const heroLead = exact(heroLeadText);
    if (heroLead) heroLead.textContent = 'ELSMITH Consulting is a performance-focused organisation dedicated to enabling business excellence and driving impactful transformation.';

    const founderTitle = exact('Lead Consultant & Founder');
    if (founderTitle) founderTitle.textContent = 'Lead Consultant';

    const founderParaText = 'Stanley Eluwa is the visionary founder and lead consultant at ELSMITH Consulting. With over two decades of experience in business advisory, organizational transformation, and talent development, Stanley has successfully guided numerous organizations across Africa, Europe, and the Middle East through complex transformation journeys.';
    const founderPara = exact(founderParaText);
    if (founderPara) founderPara.textContent = 'Stanley Eluwa is a Lead Consultant with 20+ years of strategic HR and business leadership experience. He is a speaker, facilitator and coach who leads leadership and strategy workshops focused on leadership effectiveness, personal success and capability development. His experience includes talent development, business transformation, HR transformation, process improvement and reengineering, job evaluation, organisational restructuring, and HR, talent, performance, onboarding and succession frameworks.';

    // 3. Values Section
    const valuesHeading = heading('Our Values');
    if (valuesHeading && !root.querySelector('[data-elsmith-values-applied]')) {
      const detail = make('div', 'mt-6 space-y-3 text-foreground', '');
      detail.dataset.elsmithValuesApplied = 'true';
      [
        ['Accountability', 'Ownership of outcomes, integrity, transparency and delivering on promises.'],
        ['Growth', 'Continuous personal, professional and organisational improvement.'],
        ['Innovation', 'Creativity, forward thinking and future-ready solutions.'],
        ['Leadership', 'Empowering people and teams to lead with purpose, clarity and confidence.'],
        ['Excellence', 'Maintaining the highest standards of quality and value.']
      ].forEach(([name, desc]) => {
        const p = make('p', '', '');
        p.append(make('strong', '', `${name}: `), document.createTextNode(desc));
        detail.append(p);
      });
      valuesHeading.parentElement.append(detail);
    }

    // 4. Employee Benefits & Wellbeing (Missing approved category)
    const servicesHeading = heading('Our Services');
    if (servicesHeading && !root.querySelector('[data-elsmith-wellbeing]')) {
      const section = make('section', 'py-16 md:py-20', '');
      section.dataset.elsmithWellbeing = 'true';
      const container = make('div', 'container', '');
      container.append(make('h2', 'text-4xl font-bold text-primary mb-10 text-center', 'Employee Benefits & Wellbeing'));
      const card = make('div', 'bg-white rounded-lg p-8 border border-secondary max-w-4xl mx-auto', '');
      card.append(make('p', 'text-foreground mb-4', 'Holistic wellbeing advisory and support services designed to help organisations build thriving, engaged and high-performing workforces.'));
      const ul = make('ul', 'grid md:grid-cols-2 gap-3 text-foreground', '');
      ['Mental health and emotional wellbeing', 'Men’s and women’s health', 'Employee benefits and lifestyle options', 'Physical health and lifestyle management', 'Financial wellbeing', 'Organisational culture and manager enablement'].forEach((item) => ul.append(make('li', '', `✓ ${item}`)));
      card.append(ul);
      container.append(card);
      section.append(container);
      const footer = root.querySelector('footer');
      if (footer) footer.before(section); else root.append(section);
    }

    // 5. Executive Coaching (Joyce Coker profile)
    const programsHeading = heading('Our Programs');
    if (programsHeading && !root.querySelector('[data-elsmith-coaching]')) {
      const section = make('section', 'py-16 md:py-20', '');
      section.dataset.elsmithCoaching = 'true';
      const container = make('div', 'container', '');
      container.append(make('h2', 'text-4xl font-bold text-primary mb-6', 'Executive Coaching'));
      container.append(make('p', 'text-lg text-foreground max-w-4xl mb-8', 'ELSMITH’s Executive Coaching programme is a structured and confidential development partnership designed to enhance the effectiveness, leadership capability and performance of senior leaders and high-potential executives.'));
      const grid = make('div', 'grid md:grid-cols-2 gap-8', '');
      const approach = make('div', 'bg-secondary/20 rounded-lg p-8', '');
      approach.append(make('h3', 'text-2xl font-bold text-primary mb-4', 'Coaching Approach'));
      approach.append(make('p', 'text-foreground leading-relaxed', 'Discovery & Assessment · Goal Setting & Development Planning · Leadership Development · Application & Practice · Sustainability & Growth'));
      const coach = make('div', 'bg-secondary/20 rounded-lg p-8', '');
      coach.append(make('h3', 'text-2xl font-bold text-primary mb-4', 'Joyce Coker — Managing Partner & Lead Coach'));
      coach.append(make('p', 'text-foreground leading-relaxed', 'Joyce is a business transformation leader with Leadership & HR experience across Financial Services, Consulting, Manufacturing and Consumer Goods. Her specialties include HR strategy, change management, business transformation, employee relations, resourcing, talent development, culture, performance management, succession planning, organisational effectiveness, HR service delivery, and HR applications & technology.'));
      grid.append(approach, coach);
      container.append(grid);
      section.append(container);
      const footer = root.querySelector('footer');
      if (footer) footer.before(section); else root.append(section);
    }

    // 6. Copyright Year Stability
    const year = new Date().getFullYear();
    textNodes().forEach((el) => {
      if (el.childElementCount === 0 && el.textContent.includes('©') && el.textContent.includes('ELSMITH Consulting')) {
          if (!el.textContent.includes(year.toString())) {
            el.textContent = `© ${year} ELSMITH Consulting. All rights reserved.`;
          }
      }
    });
  };

  window.addEventListener('load', apply);
  setInterval(apply, 3000); // Periodic check for React updates
})();
