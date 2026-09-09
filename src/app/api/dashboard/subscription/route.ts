import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
  })

  if (!subscription) {
    return NextResponse.json({ subscription: null })
  }

  let stripeSubscription = null
  if (subscription.stripeSubscriptionId) {
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)
    } catch {
      // Ignore Stripe errors
    }
  }

  return NextResponse.json({
    subscription: {
      ...subscription,
      stripeData: stripeSubscription,
    },
  })
}