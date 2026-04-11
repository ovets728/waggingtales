import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (resend) {
    await resend.emails.send({
      from: 'Waggingtails <noreply@waggingtails.com>',
      ...options,
    });
  } else {
    console.log('[MOCK EMAIL]', {
      to: options.to,
      subject: options.subject,
      htmlLength: options.html.length,
    });
  }
}
