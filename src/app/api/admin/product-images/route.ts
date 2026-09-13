import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { getSignedUploadUrl, deleteFile } from '@/lib/r2'
import { NextResponse } from 'next/server'

async function requireAdminSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return null
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.role !== 'admin') return null
  return session
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { productId, fileName, contentType } = await request.json()

    if (!productId || !fileName) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    const key = `products/${product.slug}/images/${Date.now()}-${fileName}`
    const uploadUrl = await getSignedUploadUrl(key, contentType || 'image/jpeg', 3600)
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`

    return NextResponse.json({ key, uploadUrl, publicUrl })
  } catch (e) {
    console.error('[PRODUCT IMAGES PRESIGN]', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { productId, imageUrl } = await request.json()

    if (!productId || !imageUrl) {
      return NextResponse.json({ error: 'Faltan parametros' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    if (!product.images.includes(imageUrl)) {
      return NextResponse.json({ error: 'Imagen no pertenece al producto' }, { status: 400 })
    }

    const publicUrl = process.env.R2_PUBLIC_URL || ''
    const key = imageUrl.replace(`${publicUrl}/`, '')

    try {
      await deleteFile(key)
    } catch {
      console.error('[PRODUCT IMAGES DELETE] Failed to delete R2 file:', key)
    }

    const updatedImages = product.images.filter(img => img !== imageUrl)
    await prisma.product.update({
      where: { id: productId },
      data: { images: updatedImages },
    })

    return NextResponse.json({ ok: true, images: updatedImages })
  } catch (e) {
    console.error('[PRODUCT IMAGES DELETE]', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
