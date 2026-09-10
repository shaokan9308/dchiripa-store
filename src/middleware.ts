import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/api/dashboard', '/api/checkout', '/api/billing', '/api/download']
const adminRoutes = ['/admin', '/api/admin']
const authRoutes = ['/auth/login', '/auth/register']

async function getSession(request: NextRequest): Promise<{ userId: string; role?: string } | null> {
  try {
    const url = new URL('/api/auth/get-session', request.url)
    const res = await fetch(url, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    })

    if (!res.ok) return null
    const data = await res.json()
    if (!data?.session) return null

    const userId = data.session.userId || data.session.user?.id
    if (!userId) return null

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    await prisma.$disconnect()

    return { userId, role: user?.role }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const session = await getSession(request)
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdmin && !session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (isAdmin && session && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/webhooks|api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
