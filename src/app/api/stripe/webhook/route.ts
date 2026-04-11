import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/client';
import { paymentConfirmationEmail } from '@/lib/email/templates';

// Use service role client for webhook since there's no user session
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret is not configured' },
      { status: 400 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (userId) {
      const supabase = createServiceClient();

      await supabase
        .from('profiles')
        .update({
          has_paid: true,
          stripe_customer_id: session.customer as string | null,
        })
        .eq('id', userId);

      // Fire-and-forget payment confirmation email
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        const name = session.customer_details?.name || customerEmail.split('@')[0];
        sendEmail({
          to: customerEmail,
          subject: 'Payment Confirmed - Waggingtails',
          html: paymentConfirmationEmail(name),
        }).catch((err) => console.error('Failed to send payment email:', err));
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
