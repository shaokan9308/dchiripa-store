import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

async function requireAdminSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== 'admin') return null
  return session
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { productId, key } = await request.json()

    if (!productId || !key) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    await prisma.product.update({
      where: { id: productId },
      data: { fileKeys: [...product.fileKeys, key] },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[CONFIRM UPLOAD]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
