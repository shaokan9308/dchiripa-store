import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { validateRequest, profileSchema } from '@/lib/validations'
import { apiSuccess, apiError, apiInternalError } from '@/lib/api-response'

export async function PATCH(request: Request) {
  try {
    const { session, error } = await requireAuth(request)
    if (error) return error

    const body = await request.json()
    const validation = validateRequest(profileSchema, body)
    if (!validation.success) return apiError(validation.error)

    await prisma.user.update({
      where: { id: session!.user.id },
      data: validation.data,
    })

    return apiSuccess({ ok: true })
  } catch (err) {
    console.error('[PROFILE_UPDATE]', err)
    return apiInternalError()
  }
}
