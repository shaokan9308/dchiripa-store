import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const userId = session.user.id

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

  return NextResponse.json({
    purchases: purchasesCount,
    downloads: downloadsCount,
    subscription: subscription?.status || null,
    spent: spentResult._sum.amount || 0,
  })
}
