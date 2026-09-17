import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { validateRequest, productSchema } from '@/lib/validations'
import { apiSuccess, apiError, apiInternalError } from '@/lib/api-response'

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const body = await request.json()
    const validation = validateRequest(productSchema, body)
    if (!validation.success) return apiError(validation.error)

    const existingSlug = await prisma.product.findUnique({ where: { slug: validation.data.slug } })
    if (existingSlug) return apiError('Ya existe un producto con ese slug')

    const product = await prisma.product.create({ data: validation.data })
    return apiSuccess(product)
  } catch (error) {
    console.error('[PRODUCTS_CREATE]', error)
    return apiInternalError()
  }
}
