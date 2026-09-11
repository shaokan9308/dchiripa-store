import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSignedDownloadUrl } from '@/lib/r2'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
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

    if (product.fileKeys.length === 1) {
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

    const urls = await Promise.all(
      product.fileKeys.map(async (key) => ({
        key,
        name: key.split('/').pop() || key,
        url: await getSignedDownloadUrl(key, 86400),
      }))
    )

    for (const file of urls) {
      await prisma.download.create({
        data: {
          userId: session.user.id,
          productId,
          fileKey: file.key,
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })
    }

    return NextResponse.json({
      files: urls.map((f) => ({ name: f.name, url: f.url })),
    })
  } catch (error) {
    console.error('[DOWNLOAD]', error)
    return NextResponse.json({ error: 'Error al descargar' }, { status: 500 })
  }
}

async function checkAccess(userId: string, productId: string): Promise<boolean> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { accessType: true },
  })

  if (!product) return false

  if (product.accessType === 'subscription') {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
    })
    return !!subscription && ['active', 'trialing'].includes(subscription.status)
  }

  const purchase = await prisma.purchase.findFirst({
    where: { userId, productId, status: 'completed' },
  })

  return !!purchase
}
