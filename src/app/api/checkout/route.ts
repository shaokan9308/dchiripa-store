import { auth } from '@/lib/auth'
import { getStripeSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { priceId, productId, mode } = await request.json()

  if (!priceId) {
    return NextResponse.json({ error: 'priceId requerido' }, { status: 400 })
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
    priceId,
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
}