const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const payload = req.body;

  // Honeypot check
  if (payload.website) {
    return res.status(200).json({ success: true, message: 'Your enquiry has been received.' });
  }

  const { name, email, phone, company, subject, message } = payload;

  if (!name || !message || !email) {
    return res.status(422).json({ success: false, error: 'Please complete all required fields.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'mail.elsmithconsulting.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@elsmithconsulting.com',
      password: '$R!e0KzGp02ca]zE'
    }
  });

  const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.5">
      <h2 style="color:#123b78">New ELSMITH Website Enquiry</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:680px">
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0;width:35%">Name</th><td style="border-bottom:1px solid #e2e8f0">${name}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Email</th><td style="border-bottom:1px solid #e2e8f0">${email}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Phone</th><td style="border-bottom:1px solid #e2e8f0">${phone || 'Not provided'}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Company</th><td style="border-bottom:1px solid #e2e8f0">${company || 'Not provided'}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Subject</th><td style="border-bottom:1px solid #e2e8f0">${subject || 'Not provided'}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Message</th><td style="border-bottom:1px solid #e2e8f0">${message}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Timestamp</th><td style="border-bottom:1px solid #e2e8f0">${timestamp}</td></tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"ELSMITH Consulting Website" <info@elsmithconsulting.com>',
      to: 'info@elsmithconsulting.com',
      replyTo: email,
      subject: `New ELSMITH Website Enquiry — ${name}`,
      html: html
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you for contacting ELSMITH Consulting. Your enquiry has been received successfully. Our team will review your message and get back to you shortly.'
    });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(502).json({
      success: false,
      error: 'We couldn’t complete your enquiry right now. Please try again or contact ELSMITH directly.'
    });
  }
}
