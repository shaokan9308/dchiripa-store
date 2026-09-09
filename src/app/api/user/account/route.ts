import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  await prisma.user.delete({
    where: { id: session.user.id },
  })

  return NextResponse.json({ success: true })
}