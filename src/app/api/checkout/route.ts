import { auth } from '@/lib/auth'
import { getStripeSession, getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { productId, plan, mode } = await request.json()

    let priceId: string | undefined
    if (mode === 'subscription') {
      if (plan === 'yearly') {
        priceId = process.env.STRIPE_PRICE_YEARLY
      } else {
        priceId = process.env.STRIPE_PRICE_MONTHLY
      }
    }

    if (!priceId && mode !== 'subscription') {
      return NextResponse.json({ error: 'Modo invalido' }, { status: 400 })
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

    let stripeSessionParams: Parameters<typeof getStripeSession>[0] = {
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
    }

    if (mode === 'payment' && productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true, name: true, currency: true },
      })

      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
      }

      const stripe = getStripe()
      const stripeProduct = await stripe.products.create({
        name: product.name,
        metadata: { productId },
      })

      const stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.price,
        currency: product.currency || 'eur',
      })

      stripeSessionParams = {
        ...stripeSessionParams,
        priceId: stripePrice.id,
      }
    }

    const stripeSession = await getStripeSession(stripeSessionParams)

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.error('[CHECKOUT]', error)
    return NextResponse.json({ error: 'Error al crear sesion de pago' }, { status: 500 })
  }
}
