import { constructStripeEvent, stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendPurchaseConfirmationEmail, sendSubscriptionConfirmationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = constructStripeEvent(body, signature)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

function getPlanName(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'Plan Mensual'
  if (priceId === process.env.STRIPE_PRICE_YEARLY) return 'Plan Anual'
  return 'Plan Premium'
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { userId, productId, mode } = session.metadata || {}

  if (!userId) return

  if (mode === 'subscription') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const priceId = subscription.items.data[0].price.id
    const planName = getPlanName(priceId)

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: subscription.status,
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        status: subscription.status,
      },
    })

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    if (user?.email) {
      const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion`
      await sendSubscriptionConfirmationEmail(user.email, planName, portalUrl)
    }
  } else if (mode === 'payment' && productId) {
    const purchase = await prisma.purchase.create({
      data: {
        userId,
        productId,
        stripeSessionId: session.id,
        amount: session.amount_total || 0,
        currency: session.currency || 'eur',
        status: 'completed',
      },
      include: { product: true },
    })

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
    if (user?.email) {
      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/download/${productId}`
      await sendPurchaseConfirmationEmail(user.email, purchase.product.name, downloadUrl)
    }
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userSubscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  })

  if (!userSubscription) return

  await prisma.subscription.update({
    where: { id: userSubscription.id },
    data: {
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'canceled' },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  })

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'past_due' },
    })
  }
}
