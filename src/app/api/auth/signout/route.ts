import { auth } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('better-auth.session_token')?.value

    if (sessionToken) {
      // Delete session from database
      try {
        const handler = 'handler' in auth ? auth.handler : auth
        const req = new Request('http://localhost/api/auth/sign-out', {
          method: 'POST',
          headers: {
            cookie: `better-auth.session_token=${sessionToken}`,
          },
        })
        await handler(req)
      } catch {
        // Ignore errors, we'll clear the cookie anyway
      }
    }

    // Build response
    const response = NextResponse.json({ success: true })

    // Clear all possible session cookies
    const cookieNames = [
      'better-auth.session_token',
      'better-auth.session_data',
      '__Secure-better-auth.session_token',
      '__Secure-better-auth.session_data',
    ]

    for (const name of cookieNames) {
      response.headers.append(
        'Set-Cookie',
        `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
      )
    }

    return response
  } catch (error) {
    console.error('[SIGNOUT]', error)
    const response = NextResponse.json({ success: true })
    response.headers.append(
      'Set-Cookie',
      `better-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
    )
    return response
  }
}
