import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/api/dashboard', '/api/checkout', '/api/billing', '/api/download']
const adminRoutes = ['/admin', '/api/admin']
const authRoutes = ['/auth/login', '/auth/register']

function findSessionToken(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(';').map(c => c.trim())
  for (const c of cookies) {
    if (c.startsWith('__Secure-better-auth.session_token=') || c.startsWith('better-auth.session_token=')) {
      return c.split('=').slice(1).join('=')
    }
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  const cookieHeader = request.headers.get('cookie') || ''
  const hasSession = findSessionToken(cookieHeader) !== null

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
