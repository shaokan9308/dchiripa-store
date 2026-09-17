import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { validateRequest, passwordSchema } from '@/lib/validations'
import { apiSuccess, apiError, apiInternalError } from '@/lib/api-response'
import bcrypt from 'bcryptjs'

export async function PATCH(request: Request) {
  try {
    const { session, error } = await requireAuth(request)
    if (error) return error

    const body = await request.json()
    const validation = validateRequest(passwordSchema, body)
    if (!validation.success) return apiError(validation.error)

    const { currentPassword, newPassword } = validation.data

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { password: true },
    })

    if (!user?.password) return apiError('No se puede cambiar contrasena (cuenta OAuth)')

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return apiError('Contrasena actual incorrecta', 401)

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: session!.user.id },
      data: { password: hashedPassword },
    })

    return apiSuccess({ ok: true })
  } catch (err) {
    console.error('[PASSWORD_UPDATE]', err)
    return apiInternalError()
  }
}
