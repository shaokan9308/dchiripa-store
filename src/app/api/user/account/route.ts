import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { requireAuth } from '@/lib/session'
import { validateRequest, passwordSchema } from '@/lib/validations'
import { apiSuccess, apiError, apiInternalError } from '@/lib/api-response'
import bcrypt from 'bcryptjs'

export async function DELETE(request: Request) {
  try {
    const { session, error } = await requireAuth(request)
    if (error) return error

    const body = await request.json()
    const validation = validateRequest(passwordSchema.pick({ currentPassword: true }), body)
    if (!validation.success) return apiError(validation.error)

    const { currentPassword } = validation.data

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { password: true },
    })

    if (!user?.password) return apiError('Cuenta OAuth, no se puede eliminar desde aqui')

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return apiError('Contrasena incorrecta', 401)

    const userId = session!.user.id

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      select: { stripeSubscriptionId: true },
    })

    if (subscription?.stripeSubscriptionId) {
      try {
        await getStripe().subscriptions.cancel(subscription.stripeSubscriptionId)
      } catch {
        // Continue even if Stripe cancel fails
      }
    }

    await prisma.user.delete({ where: { id: userId } })

    return apiSuccess({ ok: true })
  } catch (err) {
    console.error('[ACCOUNT_DELETE]', err)
    return apiInternalError()
  }
}
