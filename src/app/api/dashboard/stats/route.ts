import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { apiSuccess, apiInternalError } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth(request)
    if (error) return error

    const userId = session!.user.id

    const [purchasesCount, downloadsCount, spentResult, subscription] = await Promise.all([
      prisma.purchase.count({
        where: { userId, status: 'completed' },
      }),
      prisma.download.count({
        where: { userId },
      }),
      prisma.purchase.aggregate({
        where: { userId, status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.subscription.findFirst({
        where: { userId },
        select: { status: true },
      }),
    ])

    return apiSuccess({
      purchases: purchasesCount,
      downloads: downloadsCount,
      subscription: subscription?.status || null,
      spent: spentResult._sum.amount || 0,
    })
  } catch (err) {
    console.error('[STATS_GET]', err)
    return apiInternalError()
  }
}
