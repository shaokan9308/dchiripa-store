import { prisma } from './prisma'
import { auth } from './auth'
import { cookies } from 'next/headers'

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const cookieStr = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    const headers = new Headers()
    headers.set('cookie', cookieStr)

    const session = await auth.api.getSession({ headers } as any)

    if (!session) return null

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) return null
    return { user }
  } catch {
    return null
  }
}

export async function requireAuth() {
  const data = await getSession()
  if (!data) throw new Error('UNAUTHORIZED')
  return data
}

export async function requireAdmin() {
  const data = await requireAuth()
  if (data.user.role !== 'admin') throw new Error('FORBIDDEN')
  return data
}
