import { Resend } from 'resend';

// Vercel serverless functions require this export signature
export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, course, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Initialize Resend with the API key from environment variables
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send the email
    const data = await resend.emails.send({
      // IMPORTANT: Until you buy and verify readytorespond.ca in Resend, 
      // you MUST use 'onboarding@resend.dev' to test.
      // Once verified, change this back to: 'Ready to Respond <contact@readytorespond.ca>'
      from: 'onboarding@resend.dev', 
      
      // Note: When using onboarding@resend.dev, the 'to' email MUST be the 
      // exact email address you used to create your Resend.com account.
      to: ['readytorespond4u@gmail.com'], 
      subject: `New Website Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Interested Course:</strong> ${course || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
