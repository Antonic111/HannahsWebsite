import { Resend } from 'resend';

// In-memory sliding window cache for duplicate prevention and basic rate-limiting
interface SubmissionRecord {
  timestamp: number;
  hash: string;
}

const recentSubmissions = new Map<string, SubmissionRecord>();

// Clean entries older than 5 minutes to prevent memory leaks in persistent containers
const cleanStaleSubmissions = () => {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [key, record] of recentSubmissions.entries()) {
    if (record.timestamp < cutoff) {
      recentSubmissions.delete(key);
    }
  }
};

const sanitize = (val: unknown): string => {
  if (typeof val !== 'string') return '';
  // Trim and strip non-printable ASCII control characters (keep common whitespace)
  // eslint-disable-next-line no-control-regex
  return val.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
};

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export default async function handler(req: any, res: any) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    if (res.setHeader) res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // 2. Honeypot check (anti-bot)
    // If hidden honeypot fields (_hp, website, fax) are filled, silently drop the submission
    if (body._hp || body.website || body.fax) {
      console.warn('[Security] Bot submission detected and dropped via honeypot.');
      return res.status(200).json({ success: true });
    }

    // 3. Extract and sanitize inputs
    const rawName = sanitize(body.name);
    const rawEmail = sanitize(body.email).toLowerCase();
    const rawPhone = sanitize(body.phone);
    const rawCourse = sanitize(body.course);
    const rawMessage = sanitize(body.message);

    // 4. Server-side validation
    if (!rawName || rawName.length === 0) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (rawName.length > 100) {
      return res.status(400).json({ error: 'Name cannot exceed 100 characters.' });
    }

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail) || rawEmail.length > 254) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (rawPhone && rawPhone.length > 30) {
      return res.status(400).json({ error: 'Phone number cannot exceed 30 characters.' });
    }

    if (rawCourse && rawCourse.length > 100) {
      return res.status(400).json({ error: 'Course name is too long.' });
    }

    if (!rawMessage || rawMessage.length === 0) {
      return res.status(400).json({ error: 'Please enter your message or question.' });
    }
    if (rawMessage.length > 5000) {
      return res.status(400).json({ error: 'Message cannot exceed 5000 characters.' });
    }

    // 5. Duplicate submission prevention & rate limiting
    cleanStaleSubmissions();
    const headers = req.headers || {};
    const clientIp = (
      headers['x-forwarded-for'] || 
      headers['x-real-ip'] || 
      req.socket?.remoteAddress || 
      '127.0.0.1'
    ).toString().split(',')[0].trim();

    const submissionKey = `${clientIp}:${rawEmail}`;
    const submissionHash = `${rawName}|${rawCourse}|${rawMessage.slice(0, 50)}`;
    const now = Date.now();
    const existing = recentSubmissions.get(submissionKey);

    // If submitted within the last 15 seconds with identical content, prevent duplicate trigger
    if (existing && (now - existing.timestamp < 15000) && existing.hash === submissionHash) {
      console.warn(`[RateLimit] Duplicate submission prevented for ${rawEmail} within 15s.`);
      return res.status(200).json({ 
        success: true, 
        message: 'Inquiry already received. Thank you!' 
      });
    }

    recentSubmissions.set(submissionKey, { timestamp: now, hash: submissionHash });

    // 6. Check for Resend API key (never expose to client)
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[Resend Error] Missing RESEND_API_KEY in server environment variables.');
      return res.status(500).json({ 
        error: 'Inquiry service is temporarily unavailable. Please try again or contact us directly.' 
      });
    }

    const resend = new Resend(apiKey);

    const payload = {
      name: rawName,
      email: rawEmail,
      phone: rawPhone || '',
      course: rawCourse || 'General Inquiry',
      message: rawMessage,
    };

    // 7. Trigger the Resend Custom Event: inquiry.created
    // This allows Resend Automations to trigger customer confirmation emails, follow-ups, etc.
    const eventResponse = await resend.events.send({
      event: 'inquiry.created',
      email: rawEmail,
      payload,
    });

    if (eventResponse.error) {
      console.error('[Resend Event Error] Failed to trigger inquiry.created:', eventResponse.error.message || eventResponse.error);
      return res.status(500).json({ 
        error: 'Unable to process your inquiry right now. Please try again later.' 
      });
    }

    // 8. Deliver business notification email to readytorespond4u@gmail.com
    // (Preserves existing business notification flow without breaking)
    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const toEmail = process.env.BUSINESS_EMAIL || 'readytorespond4u@gmail.com';
      const hasCourse = payload.course && payload.course !== 'General Inquiry';
      const emailSubject = hasCourse
        ? `[Course Inquiry: ${payload.course}] from ${payload.name}`
        : `New Website Inquiry from ${payload.name}`;

      await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        replyTo: payload.email,
        subject: emailSubject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0;">New Contact Form Submission</h2>
            
            ${hasCourse ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 16px; margin: 18px 0; border-radius: 6px;">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #b91c1c; font-weight: 700;">Inquiring About Course</p>
                <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #991b1b;">${payload.course}</p>
              </div>
            ` : ''}

            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; width: 140px; color: #64748b;">Full Name:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${payload.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Email Address:</td>
                <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${payload.email}" style="color: #2563eb; text-decoration: none;">${payload.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Phone Number:</td>
                <td style="padding: 8px 0; color: #0f172a;">${payload.phone || 'Not provided'}</td>
              </tr>
              ${hasCourse ? `
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Course / Program:</td>
                <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${payload.course}</td>
              </tr>
              ` : ''}
            </table>

            <div style="margin-top: 24px;">
              <p style="font-weight: 600; color: #64748b; margin-bottom: 8px;">Message:</p>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #334155;">
                ${payload.message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}
              </div>
            </div>
          </div>
        `,
      });
    } catch (bizNotificationError: any) {
      // Log business email notification failure without failing the visitor response if event succeeded
      console.error('[Resend Business Notification Error]', bizNotificationError?.message || bizNotificationError);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    // Log internal error server-side without leaking stack or secrets to the visitor
    console.error('[Handler Error]', error?.message || 'Unexpected error');
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
}
