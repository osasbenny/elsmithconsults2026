(() => {
  let isUpdating = false;
  const apply = () => {
    if (isUpdating) return;
    const root = document.getElementById('root');
    if (!root || !root.children.length) return;

    isUpdating = true;
    try {
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
        if (a.href !== 'tel:+2348077892200') {
          a.href = 'tel:+2348077892200';
          a.textContent = '+2348077892200';
        }
      });

      const legacyPhone = exact('+234 803 200 4575');
      if (legacyPhone) legacyPhone.textContent = '+2348077892200';

      const legacyUkPhone = exact('+44 7733 717516');
      if (legacyUkPhone) {
          legacyUkPhone.textContent = 'Contact by email';
          const parentA = legacyUkPhone.closest('a');
          if (parentA) parentA.href = 'mailto:engage@elsmithconsulting.com';
      }

      // 2. Hero Text
      const heroLeadText = 'ELSMITH Consulting is a global business and workforce advisory firm dedicated to transforming organizations through strategic insights, leadership development, and innovative solutions.';
      const heroLead = exact(heroLeadText);
      if (heroLead) heroLead.textContent = 'ELSMITH Consulting is a performance-focused organisation dedicated to enabling business excellence and driving impactful transformation.';

      // 3. About Section
      const founderTitle = exact('Lead Consultant & Founder');
      if (founderTitle) founderTitle.textContent = 'Lead Consultant';

      const founderParagraphText = 'Stanley Eluwa is the visionary founder and lead consultant at ELSMITH Consulting. With over two decades of experience in business advisory, organizational transformation, and talent development, Stanley has successfully guided numerous organizations across Africa, Europe, and the Middle East through complex transformation journeys.';
      const founderParagraph = exact(founderParagraphText);
      if (founderParagraph) founderParagraph.textContent = 'Stanley Eluwa is a Lead Consultant with 20+ years of strategic HR and business leadership experience. He is a speaker, facilitator and coach who leads leadership and strategy workshops focused on leadership effectiveness, personal success and capability development. His experience includes talent development, business transformation, HR transformation, process improvement and reengineering, job evaluation, organisational restructuring, and HR, talent, performance, onboarding and succession frameworks.';

      // 4. Our Values
      const valuesHeading = heading('Our Values');
      if (valuesHeading && !root.querySelector('[data-elsmith-values-detail]')) {
        const detail = make('div', 'mt-6 space-y-3 text-foreground', '');
        detail.dataset.elsmithValuesDetail = 'true';
        [
          ['Accountability', 'Ownership of outcomes, integrity, transparency and delivering on promises.'],
          ['Growth', 'Continuous personal, professional and organisational improvement.'],
          ['Innovation', 'Creativity, forward thinking and future-ready solutions.'],
          ['Leadership', 'Empowering people and teams to lead with purpose, clarity and confidence.'],
          ['Excellence', 'Maintaining the highest standards of quality and value.']
        ].forEach(([name, description]) => {
          const p = make('p', '', '');
          p.append(make('strong', '', `${name}: `), document.createTextNode(description));
          detail.append(p);
        });
        valuesHeading.parentElement.append(detail);
      }

      // 5. Employee Benefits & Wellbeing
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

      // 6. How We Work
      if (servicesHeading && !root.querySelector('[data-elsmith-process]')) {
        const process = make('section', 'py-16 md:py-20 bg-secondary/20', '');
        process.dataset.elsmithProcess = 'true';
        const container = make('div', 'container', '');
        container.append(make('h2', 'text-4xl font-bold text-primary mb-10 text-center', 'How We Work'));
        const grid = make('div', 'grid md:grid-cols-5 gap-5', '');
        [
          ['Discover & Diagnose', 'Understand the organisation, challenges, people and business context.'],
          ['Design & Co-Create', 'Develop practical solutions collaboratively with stakeholders.'],
          ['Develop & Align', 'Build capability, leadership alignment and organisational readiness.'],
          ['Deliver & Execute', 'Translate strategy into practical execution and measurable outcomes.'],
          ['Evaluate & Sustain', 'Measure impact, embed improvements and support long-term sustainability.']
        ].forEach(([name, description]) => {
          const card = make('div', 'bg-white rounded-lg p-5 border border-secondary', '');
          card.append(make('h3', 'font-bold text-primary mb-3', name), make('p', 'text-foreground text-sm leading-relaxed', description));
          grid.append(card);
        });
        container.append(grid);
        process.append(container);
        const footer = root.querySelector('footer');
        if (footer) footer.before(process); else root.append(process);
      }

      // 7. LICENSE to WORK
      const licenseHeading = heading('License to Work™ Graduate Employability Programme');
      if (licenseHeading) {
        const section = licenseHeading.closest('section');
        const paragraphs = section ? [...section.querySelectorAll('p')] : [];
        const first = paragraphs.find((p) => p.textContent.includes('career readiness programme'));
        if (first) first.textContent = 'LICENSE to WORK™ is a six-month Graduate Employability Programme for fresh graduates and professionals with 0–3 years of experience.';
        const second = paragraphs.find((p) => p.textContent.includes('career advancement program'));
        if (second) second.textContent = 'The programme combines three months of classroom learning with three months of internship, delivered in a hybrid format, and includes a certificate and employer partnership opportunity.';
      }

      // 8. Executive Coaching
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

      // 9. Copyright Year
      const year = new Date().getFullYear();
      textNodes().forEach((el) => {
        if (el.childElementCount === 0 && el.textContent.includes('©') && el.textContent.includes('ELSMITH Consulting')) {
            el.textContent = `© ${year} ELSMITH Consulting. All rights reserved.`;
        }
      });

    } finally {
      // Debounce the next update to prevent CPU spikes
      setTimeout(() => { isUpdating = false; }, 100);
    }
  };

  // Initial Run
  window.addEventListener('load', apply);

  // Observe for dynamic navigation changes
  const root = document.getElementById('root');
  if (root) {
      let timeout;
      new MutationObserver(() => {
          clearTimeout(timeout);
          timeout = setTimeout(apply, 200);
      }).observe(root, { childList: true, subtree: true });
  }
})();
