import { prisma } from './prisma'
import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('better-auth.session_token')?.value
  
  if (!token) {
    console.log('[SESSION] No token found')
    return null
  }

  console.log('[SESSION] Token found, length:', token.length)

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      select: { userId: true, expiresAt: true },
    })

    if (!session) {
      console.log('[SESSION] No session in DB for token')
      return null
    }

    if (session.expiresAt < new Date()) {
      console.log('[SESSION] Session expired')
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) {
      console.log('[SESSION] User not found')
      return null
    }

    console.log('[SESSION] User found:', user.email, 'role:', user.role)
    return { session, user }
  } catch (e) {
    console.log('[SESSION] Error:', e)
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
