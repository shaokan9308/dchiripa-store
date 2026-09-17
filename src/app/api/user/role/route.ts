import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiInternalError } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return apiSuccess({ role: null })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    return apiSuccess({ role: user?.role || 'user' })
  } catch (error) {
    console.error('[ROLE_GET]', error)
    return apiInternalError()
  }
}
