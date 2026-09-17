import { prisma } from '@/lib/prisma'
import { getSignedDownloadUrl } from '@/lib/r2'
import { requireAuth } from '@/lib/session'
import { apiError, apiInternalError, apiNotFound } from '@/lib/api-response'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { session, error } = await requireAuth(request)
    if (error) return error

    const { productId } = await params

    const hasAccess = await checkAccess(session!.user.id, productId)
    if (!hasAccess) return apiError('No tienes acceso a este archivo', 403)

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { fileKeys: true, name: true },
    })

    if (!product || !product.fileKeys.length) return apiNotFound('Archivo')

    const ipAddress = request.headers.get('x-forwarded-for') || undefined
    const userAgent = request.headers.get('user-agent') || undefined

    if (product.fileKeys.length === 1) {
      const fileKey = product.fileKeys[0]
      const signedUrl = await getSignedDownloadUrl(fileKey, 86400)

      await prisma.download.create({
        data: {
          userId: session!.user.id,
          productId,
          fileKey,
          ipAddress,
          userAgent,
        },
      })

      return Response.redirect(signedUrl, 302)
    }

    const urls = await Promise.all(
      product.fileKeys.map(async (key) => ({
        key,
        name: key.split('/').pop() || key,
        url: await getSignedDownloadUrl(key, 86400),
      }))
    )

    await prisma.download.createMany({
      data: urls.map((file) => ({
        userId: session!.user.id,
        productId,
        fileKey: file.key,
        ipAddress,
        userAgent,
      })),
    })

    return Response.json({
      files: urls.map((f) => ({ name: f.name, url: f.url })),
    })
  } catch (error) {
    console.error('[DOWNLOAD]', error)
    return apiInternalError('Error al descargar')
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
