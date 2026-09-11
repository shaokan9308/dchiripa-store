import { auth } from '@/lib/auth'
import { getStripeSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { productId, mode } = await request.json()

    let priceId: string | undefined
    if (mode === 'subscription') {
      priceId = process.env.STRIPE_PRICE_MONTHLY
    }

    if (!priceId && mode !== 'subscription') {
      return NextResponse.json({ error: 'priceId requerido para compras individuales' }, { status: 400 })
    }

    let customerId: string | undefined
    let customerEmail: string | undefined

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    })

    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId
    } else {
      customerEmail = session.user.email
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!

    const stripeSession = await getStripeSession({
      customerId,
      customerEmail,
      priceId: priceId!,
      successUrl: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/dashboard?canceled=true`,
      metadata: {
        userId: session.user.id,
        productId: productId || '',
        mode: mode || 'subscription',
      },
      mode: mode || 'subscription',
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error('[CHECKOUT]', error)
    return NextResponse.json({ error: 'Error al crear sesion de pago' }, { status: 500 })
  }
}
