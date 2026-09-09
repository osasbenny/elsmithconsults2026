import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // If it's a contact submission from the React app
  if (req.method === 'POST') {
    try {
      const payload = req.body;
      // tRPC usually wraps the input in a specific structure
      // We'll extract the data regardless of the exact path
      const data = payload.json || payload;

      const { name, email, message } = data;

      if (name && email && message) {
        const transporter = nodemailer.createTransport({
          host: '51.75.82.47',
          port: 465,
          secure: true,
          auth: {
            user: 'info@elsmithconsulting.com',
            pass: '$R!e0KzGp02ca]zE'
          },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000
        });

        await transporter.sendMail({
          from: 'info@elsmithconsulting.com',
          to: 'info@elsmithconsulting.com',
          replyTo: email,
          subject: `Web Contact: ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        });
      }

      return res.status(200).json({ result: { data: { success: true } } });
    } catch (e) {
      console.error('TRPC Error:', e);
      return res.status(200).json({ result: { data: { success: true } } });
    }
  }

  // Fallback for other tRPC queries
  res.status(200).json({ result: { data: {} } });
}
