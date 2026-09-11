import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

async function requireAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== 'admin') return null
  return session
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { userId, months } = await request.json()

    if (!userId || !months || months < 1 || months > 12) {
      return NextResponse.json({ error: 'Parametros invalidos' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + months)

    const existing = await prisma.subscription.findUnique({ where: { userId } })

    if (existing) {
      const newEnd = existing.stripeCurrentPeriodEnd > now
        ? new Date(existing.stripeCurrentPeriodEnd)
        : now
      newEnd.setMonth(newEnd.getMonth() + months)

      await prisma.subscription.update({
        where: { userId },
        data: {
          status: 'active',
          stripeCurrentPeriodEnd: newEnd,
          cancelAtPeriodEnd: false,
          isManual: true,
        },
      })
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          status: 'active',
          stripeCurrentPeriodEnd: periodEnd,
          isManual: true,
        },
      })
    }

    return NextResponse.json({ ok: true, periodEnd })
  } catch (error) {
    console.error('[MANUAL SUBSCRIPTION]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
