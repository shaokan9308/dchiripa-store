import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { id } = await params
    const body = await request.json()

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        images: body.images,
        tags: body.tags,
        isActive: body.isActive,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (currentUser?.role !== 'admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
