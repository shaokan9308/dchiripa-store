import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const authRoutes = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  const cookieHeader = request.headers.get('cookie') || ''
  const hasSession = cookieHeader.includes('better-auth.session_token=')

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
