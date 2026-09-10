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

export async function GET(request: Request) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const products = await prisma.product.findMany({
      select: { tags: true },
    })

    const tagMap = new Map<string, number>()
    for (const product of products) {
      for (const tag of product.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      }
    }

    const tags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(tags)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { oldName, newName } = await request.json()

    if (!oldName || !newName || oldName === newName) {
      return NextResponse.json({ error: 'Nombres inválidos' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { tags: { has: oldName } },
    })

    for (const product of products) {
      const newTags = product.tags.map(t => t === oldName ? newName : t)
      await prisma.product.update({
        where: { id: product.id },
        data: { tags: newTags },
      })
    }

    return NextResponse.json({ ok: true, updated: products.length })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: { tags: { has: name } },
    })

    for (const product of products) {
      const newTags = product.tags.filter(t => t !== name)
      await prisma.product.update({
        where: { id: product.id },
        data: { tags: newTags },
      })
    }

    return NextResponse.json({ ok: true, removed: products.length })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
