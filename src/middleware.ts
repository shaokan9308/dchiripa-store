import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`
}

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimit.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)

  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/auth/')) {
    const key = getRateLimitKey(ip, 'auth')
    if (!checkRateLimit(key, 10, 60000)) {
      return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 })
    }
  }

  if (pathname === '/api/checkout') {
    const key = getRateLimitKey(ip, 'checkout')
    if (!checkRateLimit(key, 10, 3600000)) {
      return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 })
    }
  }

  if (pathname === '/api/user/password') {
    const key = getRateLimitKey(ip, 'password')
    if (!checkRateLimit(key, 5, 3600000)) {
      return NextResponse.json({ error: 'Demasiadas peticiones' }, { status: 429 })
    }
  }

  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register')
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  const cookieHeader = request.headers.get('cookie') || ''
  const hasSession =
    (cookieHeader.includes('__Secure-better-auth.session_token=') ||
    cookieHeader.includes('better-auth.session_token=')) &&
    (() => {
      const match = cookieHeader.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/)
      return match && match[1].length >= 32
    })()

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
  matcher: ['/auth/:path*', '/dashboard/:path*', '/admin/:path*', '/api/auth/:path*', '/api/checkout', '/api/user/password'],
}
