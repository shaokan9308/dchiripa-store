import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { password } = await request.json()
  if (!password) {
    return NextResponse.json({ error: 'Contrasena requerida para eliminar cuenta' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user?.password) {
    return NextResponse.json({ error: 'Cuenta OAuth, no se puede eliminar desde aqui' }, { status: 400 })
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return NextResponse.json({ error: 'Contrasena incorrecta' }, { status: 401 })
  }

  const userId = session.user.id

  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    select: { stripeSubscriptionId: true },
  })

  if (subscription?.stripeSubscriptionId) {
    try {
      await getStripe().subscriptions.cancel(subscription.stripeSubscriptionId)
    } catch {
      // Continue even if Stripe cancel fails
    }
  }

  await prisma.user.delete({ where: { id: userId } })

  return NextResponse.json({ success: true })
}
