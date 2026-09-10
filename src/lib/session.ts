import { prisma } from './prisma'
import { cookies } from 'next/headers'

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('better-auth.session_token')?.value
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    select: { userId: true, expiresAt: true },
  })

  if (!session || session.expiresAt < new Date()) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true },
  })

  if (!user) return null
  return { session, user }
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
