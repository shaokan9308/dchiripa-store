import { prisma } from '@/lib/prisma'
import { uploadFile, deleteFile, listFiles } from '@/lib/r2'
import { requireAdmin } from '@/lib/session'
import { apiSuccess, apiError, apiInternalError, apiNotFound } from '@/lib/api-response'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const { id } = await params
    const product = await prisma.product.findUnique({ where: { id }, select: { fileKeys: true, slug: true } })
    if (!product) return apiNotFound('Producto')

    const r2Files = await listFiles(`products/${product.slug}/`)
    const productFiles = r2Files
      .filter(f => f.Key && product.fileKeys.includes(f.Key))
      .map(f => ({ key: f.Key!, size: f.Size || 0, lastModified: f.LastModified }))

    return apiSuccess({ files: productFiles })
  } catch (e) {
    console.error('[FILES GET]', e)
    return apiSuccess({ files: [] })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error

    const { id } = await params

    let file: File | null = null
    try {
      const formData = await request.formData()
      file = formData.get('file') as File | null
    } catch {
      return apiError('No se pudo leer el FormData')
    }

    if (!file) return apiError('Archivo requerido')

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) return apiError('Archivo muy grande (max 50MB)')

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return apiNotFound('Producto')

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)
    const ext = safeName.split('.').pop() || ''
    const key = `products/${product.slug}/${Date.now()}-${safeName}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await uploadFile(key, buffer, file.type || `application/${ext}`)

    await prisma.product.update({
      where: { id },
      data: { fileKeys: { push: key } },
    })

    return apiSuccess({ key })
  } catch (e) {
    console.error('[FILES POST]', e)
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
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    if (!key) return apiError('Key requerida')

    const product = await prisma.product.findUnique({ where: { id }, select: { fileKeys: true, slug: true } })
    if (!product) return apiNotFound('Producto')

    if (!key.startsWith(`products/${product.slug}/`)) {
      return apiError('Key no pertenece a este producto')
    }

    if (!product.fileKeys.includes(key)) {
      return apiError('Archivo no encontrado en este producto')
    }

    await deleteFile(key)

    await prisma.product.update({
      where: { id },
      data: { fileKeys: product.fileKeys.filter(k => k !== key) },
    })

    return apiSuccess({ ok: true })
  } catch (e) {
    console.error('[FILES DELETE]', e)
    return apiInternalError()
  }
}
