import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CREDITS_MAP: Record<string, number> = {
  'price_1T8NClCzapu2pX6h2lFTVWtX': 10,
  'price_1T8NDbCzapu2pX6h8c4t9uUU': 20,
  'price_1T8NEACzapu2pX6h4DH5UI5C': 50,
  'price_1T8NEmCzapu2pX6hwXhk8BsV': 100,
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
    const priceId = session.line_items?.data[0]?.price?.id
    const userId = session.metadata?.userId
    const credits = CREDITS_MAP[priceId || ''] || 0

    if (userId && credits > 0) {
      await supabase.rpc('add_credits', { user_id: userId, amount: credits })
    }
  }

  return NextResponse.json({ received: true })
}