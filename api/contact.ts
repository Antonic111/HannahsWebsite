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

    const hasCourse = course && course.trim() !== '' && course !== 'General Inquiry';
    const emailSubject = hasCourse
      ? `[Course Inquiry: ${course}] from ${name}`
      : `New Website Inquiry from ${name}`;

    // Send the email
    const data = await resend.emails.send({
      // IMPORTANT: Until you buy and verify readytorespond.ca in Resend, 
      // you MUST use 'onboarding@resend.dev' to test.
      // Once verified, change this back to: 'Ready to Respond <contact@readytorespond.ca>'
      from: 'onboarding@resend.dev', 
      
      // Note: When using onboarding@resend.dev, the 'to' email MUST be the 
      // exact email address you used to create your Resend.com account.
      to: ['readytorespond4u@gmail.com'], 
      subject: emailSubject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">New Contact Form Submission</h2>
          
          ${hasCourse ? `
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 16px; margin: 18px 0; border-radius: 6px;">
              <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #b91c1c; font-weight: 700;">Inquiring About Course</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #991b1b;">${course}</p>
            </div>
          ` : ''}

          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; width: 140px; color: #64748b;">Full Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Email Address:</td>
              <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Phone Number:</td>
              <td style="padding: 8px 0; color: #0f172a;">${phone || 'Not provided'}</td>
            </tr>
            ${hasCourse ? `
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Course / Program:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${course}</td>
            </tr>
            ` : ''}
          </table>

          <div style="margin-top: 24px;">
            <p style="font-weight: 600; color: #64748b; margin-bottom: 8px;">Message:</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #334155;">
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
}
