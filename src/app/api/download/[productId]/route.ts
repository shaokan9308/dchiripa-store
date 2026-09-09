import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSignedDownloadUrl } from '@/lib/r2'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { productId } = await params

  const hasAccess = await checkAccess(session.user.id, productId)
  if (!hasAccess) {
    return NextResponse.json({ error: 'No tienes acceso a este archivo' }, { status: 403 })
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { fileKeys: true, name: true },
  })

  if (!product || !product.fileKeys.length) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  const fileKey = product.fileKeys[0]
  const signedUrl = await getSignedDownloadUrl(fileKey, 86400)

  await prisma.download.create({
    data: {
      userId: session.user.id,
      productId,
      fileKey,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    },
  })

  return NextResponse.redirect(signedUrl, 302)
}

async function checkAccess(userId: string, productId: string): Promise<boolean> {
  const purchase = await prisma.purchase.findFirst({
    where: { userId, productId, status: 'completed' },
  })

  if (purchase) return true

  const subscription = await prisma.subscription.findFirst({
    where: { userId },
  })

  if (subscription && ['active', 'trialing'].includes(subscription.status)) {
    return true
  }

  return false
}