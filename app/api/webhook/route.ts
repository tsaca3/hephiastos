import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CREDITS_MAP: Record<string, number> = {
  'price_1T8jf6Czapu2pX6hOplp2eN4': 10,
  'price_1T8jfWCzapu2pX6h23jhIj7x': 20,
  'price_1T8jgICzapu2pX6hRBmF94s5': 50,
  'price_1T8jh3Czapu2pX6hvYvl0oV0': 100,
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items']
    })
    const priceId = expandedSession.line_items?.data[0]?.price?.id
    const credits = CREDITS_MAP[priceId || ''] || 0

    if (userId && credits > 0) {
      await supabase.rpc('add_credits', { user_id: userId, amount: credits })
    }
  }

  return NextResponse.json({ received: true })
}