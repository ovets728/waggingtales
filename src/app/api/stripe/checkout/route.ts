import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/client';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If Stripe is not configured, mock the payment flow for development
    if (!stripe) {
      await supabase
        .from('profiles')
        .update({ has_paid: true })
        .eq('id', user.id);

      return NextResponse.json({ url: '/dashboard/upgrade/success' });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Waggingtails Story',
            },
            unit_amount: 999,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/upgrade`,
      client_reference_id: user.id,
      customer_email: user.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
