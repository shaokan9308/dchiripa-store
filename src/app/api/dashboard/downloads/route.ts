import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/session'
import { apiSuccess, apiInternalError } from '@/lib/api-response'

export async function GET(request: Request) {
  try {
    const { session, error } = await requireAuth(request)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

    const [downloads, total] = await Promise.all([
      prisma.download.findMany({
        where: { userId: session!.user.id },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: 'desc' },
        include: { product: true },
      }),
      prisma.download.count({ where: { userId: session!.user.id } }),
    ])

    return apiSuccess({
      downloads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    console.error('[DOWNLOADS_GET]', err)
    return apiInternalError()
  }
}
