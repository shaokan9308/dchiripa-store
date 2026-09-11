import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { id } = await params
    const { action, months } = await request.json()

    const subscription = await prisma.subscription.findUnique({ where: { id } })
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (action === 'cancel') {
      if (subscription.stripeSubscriptionId) {
        const stripe = getStripe()
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      }
      await prisma.subscription.update({
        where: { id },
        data: { cancelAtPeriodEnd: true },
      })
    } else if (action === 'reactivate') {
      if (subscription.stripeSubscriptionId) {
        const stripe = getStripe()
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: false,
        })
      }
      await prisma.subscription.update({
        where: { id },
        data: { cancelAtPeriodEnd: false },
      })
    } else if (action === 'extend') {
      const now = new Date()
      const currentEnd = subscription.stripeCurrentPeriodEnd > now
        ? new Date(subscription.stripeCurrentPeriodEnd)
        : now
      currentEnd.setMonth(currentEnd.getMonth() + (months || 1))

      await prisma.subscription.update({
        where: { id },
        data: {
          stripeCurrentPeriodEnd: currentEnd,
          status: 'active',
          cancelAtPeriodEnd: false,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
