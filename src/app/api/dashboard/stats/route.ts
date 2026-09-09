import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const [purchases, downloads, subscription] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: session.user.id, status: 'completed' },
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    }),
    prisma.download.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    }),
    prisma.subscription.findFirst({
      where: { userId: session.user.id },
    }),
  ])

  const spent = purchases.reduce((sum, p) => sum + p.amount, 0)

  return NextResponse.json({
    purchases: purchases.length,
    downloads: downloads.length,
    subscription: subscription?.status || null,
    spent,
  })
}