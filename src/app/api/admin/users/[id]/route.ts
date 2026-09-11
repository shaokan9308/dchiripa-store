import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const { role } = body

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Rol invalido' }, { status: 400 })
    }

    if (id === session.user.id && role !== 'admin') {
      return NextResponse.json({ error: 'No puedes cambiarte el rol a ti mismo' }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
