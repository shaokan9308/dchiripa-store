import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { uploadFile, deleteFile } from '@/lib/r2'
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

    const formData = await request.formData()
    const productId = formData.get('productId') as string
    const file = formData.get('file') as File

    if (!productId || !file) {
      return NextResponse.json({ error: 'Faltan parametros', status: 400 }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    const key = `products/${product.slug}/images/${Date.now()}-${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const publicUrl = await uploadFile(key, buffer, file.type || 'image/jpeg')

    return NextResponse.json({ key, publicUrl })
  } catch (e) {
    console.error('[PRODUCT IMAGES UPLOAD]', e)
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
