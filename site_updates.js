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

  // Correct only the unsupported legacy contact numbers; the PDFs provide one approved mobile number.
  root.querySelectorAll('a[href="tel:+2348032004575"]').forEach((a) => {
    a.href = 'tel:+2348077892200';
    a.textContent = '+2348077892200';
  });
  root.querySelectorAll('a[href="tel:+447733717516"]').forEach((a) => {
    a.href = 'mailto:engage@elsmithconsulting.com';
    a.textContent = 'Contact by email';
  });

  const legacyPhone = exact('+234 803 200 4575');
  if (legacyPhone) legacyPhone.textContent = '+2348077892200';
  const legacyUkPhone = exact('+44 7733 717516');
  if (legacyUkPhone) legacyUkPhone.textContent = 'Contact by email';

  const heroLead = exact('ELSMITH Consulting is a global business and workforce advisory firm dedicated to transforming organizations through strategic insights, leadership development, and innovative solutions.');
  if (heroLead) heroLead.textContent = 'ELSMITH Consulting is a performance-focused organisation dedicated to enabling business excellence and driving impactful transformation.';

  // About: keep the existing layout, but remove the unsupported founder claim and use the approved profile.
  const founderTitle = exact('Lead Consultant & Founder');
  if (founderTitle) founderTitle.textContent = 'Lead Consultant';
  const founderParagraph = exact('Stanley Eluwa is the visionary founder and lead consultant at ELSMITH Consulting. With over two decades of experience in business advisory, organizational transformation, and talent development, Stanley has successfully guided numerous organizations across Africa, Europe, and the Middle East through complex transformation journeys.');
  if (founderParagraph) founderParagraph.textContent = 'Stanley Eluwa is a Lead Consultant with 20+ years of strategic HR and business leadership experience. He is a speaker, facilitator and coach who leads leadership and strategy workshops focused on leadership effectiveness, personal success and capability development. His experience includes talent development, business transformation, HR transformation, process improvement and reengineering, job evaluation, organisational restructuring, and HR, talent, performance, onboarding and succession frameworks.';

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

  // Services: add the missing approved category and the existing site's missing process section.
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

  // LICENSE to WORK: replace only the current generic programme copy with the supplied programme facts.
  const licenseHeading = heading('License to Work™ Graduate Employability Programme');
  if (licenseHeading) {
    const section = licenseHeading.closest('section');
    const paragraphs = section ? [...section.querySelectorAll('p')] : [];
    const first = paragraphs.find((p) => p.textContent.includes('career readiness programme'));
    if (first) first.textContent = 'LICENSE to WORK™ is a six-month Graduate Employability Programme for fresh graduates and professionals with 0–3 years of experience.';
    const second = paragraphs.find((p) => p.textContent.includes('career advancement program'));
    if (second) second.textContent = 'The programme combines three months of classroom learning with three months of internship, delivered in a hybrid format, and includes a certificate and employer partnership opportunity.';
    const duration = exact('Intensive, hands-on training');
    if (duration) duration.textContent = 'Six months: three months classroom learning and three months internship';
    const audience = exact('Recent graduates and early-career professionals');
    if (audience) audience.textContent = 'Fresh graduates and professionals with 0–3 years of experience';
  }

  // Executive coaching: add the supplied Joyce Coker profile and coaching framework without changing the page architecture.
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

  // Keep the footer copyright year current without changing the existing footer layout.
  textNodes().filter((el) => el.childElementCount === 0 && /^©\s*\d{4}\s+ELSMITH Consulting\. All rights reserved\.$/.test(el.textContent.trim())).forEach((el) => {
    el.textContent = `© ${new Date().getFullYear()} ELSMITH Consulting. All rights reserved.`;
  });

  // No booking URL was supplied. Do not leave a live placeholder destination.
  const bookingLink = root.querySelector('a[href="https://calendly.com/placeholder-link"]');
  if (bookingLink) {
    bookingLink.href = '/contact';
    bookingLink.removeAttribute('target');
    bookingLink.removeAttribute('rel');
    bookingLink.textContent = 'Contact us to schedule a session';
  }
  const placeholder = exact('**Booking Widget Placeholder**');
  if (placeholder) placeholder.textContent = 'Schedule a coaching or facilitation session';
  const placeholderNote = exact('The actual calendar widget (e.g., Calendly, Acuity) will be embedded here once the link is provided.');
  if (placeholderNote) placeholderNote.textContent = 'Please contact ELSMITH to discuss your coaching or facilitation requirements and arrange a session.';
  };
  window.addEventListener('load', apply);
  const root = document.getElementById('root');
  if (root) new MutationObserver(() => apply()).observe(root, { childList: true, subtree: true });
})();
