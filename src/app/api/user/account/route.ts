import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const userId = session.user.id

  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    select: { stripeCustomerId: true, stripeSubscriptionId: true },
  })

  if (subscription?.stripeSubscriptionId) {
    try {
      await getStripe().subscriptions.cancel(subscription.stripeSubscriptionId)
    } catch (err) {
      console.error('[ACCOUNT] Failed to cancel Stripe subscription:', err)
    }
  }

  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}
