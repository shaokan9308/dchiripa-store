import { prisma } from '@/lib/prisma'
import { apiSuccess, apiNotFound, apiInternalError } from '@/lib/api-response'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true, name: true, slug: true, description: true,
        price: true, currency: true, images: true, tags: true,
        accessType: true, isActive: true,
        createdAt: true, updatedAt: true,
      },
    })

    if (!product) return apiNotFound('Producto')

    return apiSuccess({ product })
  } catch (error) {
    console.error('[PRODUCT_SLUG]', error)
    return apiInternalError()
  }
}
