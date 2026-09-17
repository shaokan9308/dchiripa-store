import { auth } from './auth'
import { prisma } from './prisma'
import { NextResponse } from 'next/server'

export async function getSession(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    return session
  } catch {
    return null
  }
}

export async function requireAuth(request: Request) {
  const session = await getSession(request)
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  return { session, error: null }
}

export async function requireAdmin(request: Request) {
  const { session, error } = await requireAuth(request)
  if (error) return { session: null, user: null, error }

  const user = await prisma.user.findUnique({ where: { id: session!.user.id } })
  if (!user || user.role !== 'admin') {
    return { session, user: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 403 }) }
  }

  return { session, user, error: null }
}

export async function getServerSession() {
  try {
    const session = await auth.api.getSession({ headers: new Headers() })
    return session
  } catch {
    return null
  }
}

export async function requireServerAdmin() {
  const session = await getServerSession()
  if (!session) return null

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || user.role !== 'admin') return null

  return { session, user }
}
