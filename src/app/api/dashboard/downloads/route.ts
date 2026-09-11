import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))

  const [downloads, total] = await Promise.all([
    prisma.download.findMany({
      where: { userId: session.user.id },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: { createdAt: 'desc' },
      include: { product: true },
    }),
    prisma.download.count({ where: { userId: session.user.id } }),
  ])

  return NextResponse.json({
    downloads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}