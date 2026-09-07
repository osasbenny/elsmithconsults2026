/**
 * ELSMITH Consulting - Main Application Logic
 * Standard Production Version (No Node/React dependencies)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Automatic Copyright Year ---
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 2. Mobile Navigation Logic ---
    const mobileMenuBtn = document.querySelector('.elsmith-mobile-menu-button');
    const mobileDrawer = document.querySelector('.elsmith-mobile-drawer');

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = mobileDrawer.style.display === 'flex';
            mobileDrawer.style.display = isOpen ? 'none' : 'flex';
            mobileMenuBtn.classList.toggle('is-active');
        });

        // Close drawer on link click
        mobileDrawer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.style.display = 'none';
                mobileMenuBtn.classList.remove('is-active');
            });
        });
    }

    // --- 3. Contact Form Submission ---
    const contactForm = document.querySelector('#contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const statusMsg = document.getElementById('form-status');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                // Connect to the actual PHP backend
                const response = await fetch('api/contact.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (result.success) {
                    alert('Success: ' + result.message);
                    contactForm.reset();
                } else {
                    alert('Error: ' + result.error);
                }
            } catch (error) {
                alert('Connection error. Please email us directly at info@elsmithconsulting.com');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }
});
