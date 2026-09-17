import { createStripePortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { apiSuccess, apiError, apiInternalError } from '@/lib/api-response'

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAuth(request)
    if (error) return error

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session!.user.id },
    })

    if (!subscription?.stripeCustomerId) return apiError('No hay suscripcion activa')

    const portalSession = await createStripePortalSession(
      subscription.stripeCustomerId,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion`
    )

    return apiSuccess({ url: portalSession.url })
  } catch (err) {
    console.error('[BILLING_PORTAL]', err)
    return apiInternalError()
  }
}
