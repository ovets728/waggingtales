import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/client';
import { welcomeEmail } from '@/lib/email/templates';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fire-and-forget welcome email
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          const name = user.user_metadata?.full_name || user.email.split('@')[0];
          sendEmail({
            to: user.email,
            subject: 'Welcome to Waggingtails!',
            html: welcomeEmail(name),
          }).catch((err) => console.error('Failed to send welcome email:', err));
        }
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${origin}/login`);
}
