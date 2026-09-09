import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, company, subject, message, website } = req.body;

    if (website) return res.status(200).json({ success: true, message: 'Enquiry received.' });

    if (!name || !message || !email) {
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
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 15000
    });

    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Lagos' });

    const html = `
      <div style="font-family:sans-serif;color:#333;line-height:1.6;max-width:600px;margin:auto;border:1px solid #eee;padding:20px;">
        <h2 style="color:#123b78;border-bottom:2px solid #e99253;padding-bottom:10px;">New Website Enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Reason:</strong> ${subject || 'General Enquiry'}</p>
        <p><strong>Message:</strong></p>
        <div style="background:#f9f9f9;padding:15px;border-radius:5px;border-left:4px solid #123b78;">${message}</div>
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0;">
        <p style="font-size:11px;color:#999;">Sent from ELSMITH Website at ${timestamp}</p>
      </div>
    `;

    await transporter.sendMail({
      from: 'info@elsmithconsulting.com', // Strictly matching user
      to: 'info@elsmithconsulting.com',
      replyTo: email,
      subject: `Web Enquiry: ${name}`,
      html: html
    });

    return res.status(200).json({
      success: true,
      message: 'Your enquiry has been received successfully.'
    });

  } catch (error) {
    return res.status(502).json({
      success: false,
      error: `Technical Error: ${error.message}. Please email us directly at info@elsmithconsulting.com`
    });
  }
}
