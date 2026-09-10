import { prisma } from './prisma'
import { cookies } from 'next/headers'

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const cookieStr = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    const res = await fetch(`${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/api/auth/get-session`, {
      headers: { cookie: cookieStr },
      cache: 'no-store',
    })

    if (!res.ok) return null
    const data = await res.json()
    if (!data?.session) return null

    const user = await prisma.user.findUnique({
      where: { id: data.session.userId || data.session.user?.id },
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
