import { prisma } from './prisma'
import { auth } from './auth'
import { cookies, headers } from 'next/headers'

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const headerStore = await headers()
    const allCookies = cookieStore.getAll()

    const cookieStr = allCookies
      .map(c => `${c.name}=${c.value}`)
      .join('; ')

    const reqHeaders = new Headers()
    for (const [key, value] of headerStore.entries()) {
      if (key.toLowerCase() !== 'connection') {
        reqHeaders.set(key, value)
      }
    }
    if (cookieStr) {
      reqHeaders.set('cookie', cookieStr)
    }

    const handler = 'handler' in auth ? auth.handler : auth
    const response = await handler(new Request('https://dchiripa-store.vercel.app/api/auth/get-session', {
      method: 'GET',
      headers: reqHeaders,
    }))

    if (!response.ok) return null
    const data = await response.json()
    if (!data?.session) return null

    const user = await prisma.user.findUnique({
      where: { id: data.session.userId || data.session.user?.id },
      select: { id: true, email: true, name: true, role: true },
    })

    if (!user) return null
    return { user }
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
