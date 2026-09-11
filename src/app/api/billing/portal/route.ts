import { auth } from '@/lib/auth'
import { createStripePortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
  })

  if (!subscription?.stripeCustomerId) {
    return NextResponse.json({ error: 'No hay suscripción activa' }, { status: 400 })
  }

  const portalSession = await createStripePortalSession(
    subscription.stripeCustomerId,
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/suscripcion`
  )

  return NextResponse.json({ url: portalSession.url })
}