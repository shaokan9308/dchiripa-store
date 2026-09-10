import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/api/dashboard', '/api/checkout', '/api/billing', '/api/download']
const adminRoutes = ['/admin', '/api/admin']
const authRoutes = ['/auth/login', '/auth/register']

async function getSessionFromCookie(headers: Headers): Promise<{ userId: string; role?: string } | null> {
  try {
    const cookieHeader = headers.get('cookie') || ''
    const sessionToken = cookieHeader
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith('better-auth.session_token='))
      ?.split('=')[1]

    if (!sessionToken) return null

    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const session = await prisma.session.findFirst({
      where: { token: sessionToken },
      include: { user: { select: { role: true } } },
    })
    
    await prisma.$disconnect()
    
    if (!session || session.expiresAt < new Date()) return null
    return { userId: session.userId, role: session.user.role }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const session = await getSessionFromCookie(request.headers)
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
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhooks (Stripe webhooks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/webhooks|_next/static|_next/image|favicon.ico|public).*)',
  ],
}