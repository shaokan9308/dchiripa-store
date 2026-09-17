import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { requireAuth } from '@/lib/session'
import { apiSuccess, apiInternalError } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth(request)
    if (error) return error

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session!.user.id },
    })

    if (!subscription) return apiSuccess({ subscription: null })

    let stripeSubscription = null
    if (subscription.stripeSubscriptionId) {
      try {
        stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)
      } catch {
        // Ignore Stripe errors
      }
    }

    return apiSuccess({
      subscription: {
        ...subscription,
        stripeData: stripeSubscription,
      },
    })
  } catch (err) {
    console.error('[SUBSCRIPTION_GET]', err)
    return apiInternalError()
  }
}
