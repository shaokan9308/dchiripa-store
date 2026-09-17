import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/session'
import { validateRequest, productSchema } from '@/lib/validations'
import { apiSuccess, apiError, apiInternalError, apiNotFound } from '@/lib/api-response'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const validation = validateRequest(productSchema.partial(), body)
    if (!validation.success) return apiError(validation.error)

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Producto')

    if (validation.data.slug && validation.data.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({ where: { slug: validation.data.slug } })
      if (slugExists) return apiError('Ya existe un producto con ese slug')
    }

    const product = await prisma.product.update({ where: { id }, data: validation.data })
    return apiSuccess(product)
  } catch (error) {
    console.error('[PRODUCTS_UPDATE]', error)
    return apiInternalError()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const { id } = await params
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) return apiNotFound('Producto')

    await prisma.product.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (error) {
    console.error('[PRODUCTS_DELETE]', error)
    return apiInternalError()
  }
}
