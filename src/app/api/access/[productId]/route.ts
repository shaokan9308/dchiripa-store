import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { productId } = await params

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { accessType: true },
    })

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    if (product.accessType === 'subscription') {
      const subscription = await prisma.subscription.findFirst({
        where: { userId: session.user.id },
      })
      const hasAccess = !!subscription && ['active', 'trialing'].includes(subscription.status)
      return NextResponse.json({ hasAccess })
    }

    const purchase = await prisma.purchase.findFirst({
      where: { userId: session.user.id, productId, status: 'completed' },
    })

    return NextResponse.json({ hasAccess: !!purchase })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
