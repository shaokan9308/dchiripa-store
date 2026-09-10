import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { action } = await request.json()

  const subscription = await prisma.subscription.findUnique({ where: { id } })
  if (!subscription) {
    return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  }

  const stripe = getStripe()

  if (action === 'cancel') {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
    await prisma.subscription.update({
      where: { id },
      data: { cancelAtPeriodEnd: true },
    })
  } else if (action === 'reactivate') {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    })
    await prisma.subscription.update({
      where: { id },
      data: { cancelAtPeriodEnd: false },
    })
  }

  return NextResponse.json({ ok: true })
}
