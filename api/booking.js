import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, company, session_type, message, date, time, website } = req.body;

    // Honeypot check
    if (website) {
      return res.status(200).json({ success: true, message: 'Booking requested.' });
    }

    if (!name || !phone || !session_type || !date || !time) {
      return res.status(422).json({ success: false, error: 'Please complete all required fields.' });
    }

    const transporter = nodemailer.createTransport({
      host: 'mail.elsmithconsulting.com',
      port: 465,
      secure: true,
      auth: {
        user: 'info@elsmithconsulting.com',
        pass: '$R!e0KzGp02ca]zE'
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000
    });

    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });
    const reference = 'ELS-' + Math.random().toString(36).substring(2, 12).toUpperCase();

    const html = `
      <div style="font-family:sans-serif;color:#333;line-height:1.6;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;">
        <h2 style="color:#123b78;border-bottom:2px solid #e99253;padding-bottom:10px;">New Booking Request</h2>
        <p><strong>Reference:</strong> <span style="color:#e99253;font-weight:bold;">${reference}</span></p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time} WAT</p>
        <p><strong>Session:</strong> ${session_type}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:15px 0;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Notes:</strong></p>
        <div style="background:#f9f9f9;padding:15px;border-radius:5px;border-left:4px solid #123b78;">${message || 'No additional notes provided.'}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="font-size:11px;color:#999;">Sent from ELSMITH Website at ${timestamp}</p>
      </div>
    `;

    await transporter.sendMail({
      from: '"ELSMITH Website" <info@elsmithconsulting.com>',
      to: 'info@elsmithconsulting.com',
      replyTo: email,
      subject: `Booking Request: ${name} — ${date} ${time}`,
      html: html
    });

    return res.status(200).json({
      success: true,
      reference,
      booking: { date, time, session_type },
      message: 'Your session has been requested successfully. A member of our team will follow up shortly.'
    });

  } catch (error) {
    console.error('SMTP Error:', error);
    return res.status(502).json({
      success: false,
      error: `Mail delivery error. Please contact us directly at info@elsmithconsulting.com`
    });
  }
}
