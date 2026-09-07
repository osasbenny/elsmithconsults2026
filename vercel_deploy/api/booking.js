const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, phone, company, session_type, message, date, time } = req.body;

  if (!name || !phone || !session_type || !date || !time) {
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
  const reference = 'ELS-' + Math.random().toString(36).substring(2, 12).toUpperCase();

  const html = `
    <div style="font-family:Arial,sans-serif;color:#1e293b;line-height:1.5">
      <h2 style="color:#123b78">New ELSMITH Website Booking</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:680px">
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0;width:35%">Reference</th><td style="border-bottom:1px solid #e2e8f0"><strong>${reference}</strong></td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Date</th><td style="border-bottom:1px solid #e2e8f0">${date}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Time</th><td style="border-bottom:1px solid #e2e8f0">${time} WAT</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Session Type</th><td style="border-bottom:1px solid #e2e8f0">${session_type}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Name</th><td style="border-bottom:1px solid #e2e8f0">${name}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Email</th><td style="border-bottom:1px solid #e2e8f0">${email}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Phone</th><td style="border-bottom:1px solid #e2e8f0">${phone}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Company</th><td style="border-bottom:1px solid #e2e8f0">${company || 'Not provided'}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Message</th><td style="border-bottom:1px solid #e2e8f0">${message || 'Not provided'}</td></tr>
        <tr><th align="left" style="border-bottom:1px solid #e2e8f0">Timestamp</th><td style="border-bottom:1px solid #e2e8f0">${timestamp}</td></tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"ELSMITH Consulting Website" <info@elsmithconsulting.com>',
      to: 'info@elsmithconsulting.com',
      replyTo: email,
      subject: `New ELSMITH Website Booking — ${name} — ${date} ${time}`,
      html: html
    });

    return res.status(200).json({
      success: true,
      reference,
      booking: { date, time, session_type },
      message: 'Your session has been requested successfully. A member of the ELSMITH team will follow up using the contact details you provided.'
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(502).json({
      success: false,
      error: 'We couldn’t complete your booking right now. Please try again or contact ELSMITH directly.'
    });
  }
}
