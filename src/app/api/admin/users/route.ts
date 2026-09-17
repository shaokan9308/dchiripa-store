import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { apiSuccess, apiInternalError } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { purchases: true, downloads: true, subscriptions: true } },
        subscriptions: { select: { status: true } },
      },
    })

    return apiSuccess(users)
  } catch (error) {
    console.error('[USERS_GET]', error)
    return apiInternalError()
  }
}
