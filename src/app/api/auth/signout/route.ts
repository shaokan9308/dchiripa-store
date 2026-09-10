import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('better-auth.session_token')?.value

    if (sessionToken) {
      // Find and delete session from database
      const session = await prisma.session.findUnique({
        where: { token: sessionToken },
      })
      if (session) {
        await prisma.session.delete({ where: { token: sessionToken } })
      }
    }

    // Clear cookies using Next.js cookies API
    cookieStore.set('better-auth.session_token', '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
    })
    cookieStore.set('better-auth.session_data', '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
    })
    cookieStore.set('__Secure-better-auth.session_token', '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
    })
    cookieStore.set('__Secure-better-auth.session_data', '', {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      sameSite: 'lax',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SIGNOUT]', error)
    return NextResponse.json({ success: true })
  }
}
