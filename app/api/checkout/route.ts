import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { priceId, userId } = await req.json()
    console.log('userId reçu:', userId, 'priceId:', priceId)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      metadata: { userId },
      custom_text: {
        submit: {
          message: 'En finalisant cet achat, vous confirmez avoir lu et accepté les Conditions Générales d\'Utilisation de HéphIAstos.'
        }
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/credits?cancelled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erreur paiement' }, { status: 500 })
  }
}