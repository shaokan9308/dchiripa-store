import { auth } from '@/lib/auth'
import { getStripeSession, getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { validateRequest, checkoutSchema } from '@/lib/validations'
import { apiSuccess, apiError, apiInternalError, apiNotFound } from '@/lib/api-response'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return apiError('No autenticado', 401)

    const body = await request.json()
    const validation = validateRequest(checkoutSchema, body)
    if (!validation.success) return apiError(validation.error)

    const { productId, plan, mode } = validation.data

    let priceId: string | undefined
    if (mode === 'subscription') {
      priceId = plan === 'yearly'
        ? process.env.STRIPE_PRICE_YEARLY
        : process.env.STRIPE_PRICE_MONTHLY
    }

    if (mode === 'subscription' && !priceId) {
      return apiError('Plan de suscripcion invalido')
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
        mode,
      },
      mode,
    }

    if (mode === 'purchase' && productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { price: true, name: true, currency: true, stripeProductId: true, stripePriceId: true },
      })

      if (!product) return apiNotFound('Producto')

      const stripe = getStripe()

      let finalPriceId = product.stripePriceId

      if (!finalPriceId) {
        const stripeProduct = await stripe.products.create({
          name: product.name,
          metadata: { productId },
        })

        const stripePrice = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: product.price,
          currency: product.currency || 'mxn',
        })

        await prisma.product.update({
          where: { id: productId },
          data: {
            stripeProductId: stripeProduct.id,
            stripePriceId: stripePrice.id,
          },
        })

        finalPriceId = stripePrice.id
      }

      stripeSessionParams = {
        ...stripeSessionParams,
        priceId: finalPriceId,
      }
    }

    const stripeSession = await getStripeSession(stripeSessionParams)
    return apiSuccess({ url: stripeSession.url })
  } catch (error) {
    console.error('[CHECKOUT]', error)
    return apiInternalError('Error al crear sesion de pago')
  }
}
