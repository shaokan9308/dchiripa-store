import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  const cookieHeader = request.headers.get('cookie') || ''
  const hasSession =
    cookieHeader.includes('__Secure-better-auth.session_token=') ||
    cookieHeader.includes('better-auth.session_token=')

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/auth/:path*', '/dashboard/:path*', '/admin/:path*'],
}
