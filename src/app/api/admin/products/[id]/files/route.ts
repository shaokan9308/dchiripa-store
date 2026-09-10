import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { uploadFile, deleteFile, listFiles } from '@/lib/r2'
import { NextResponse } from 'next/server'

async function requireAdminSession(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return null
    const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (currentUser?.role !== 'admin') return null
    return session
  } catch {
    return null
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const product = await prisma.product.findUnique({ where: { id }, select: { fileKeys: true } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const r2Files = await listFiles(`products/`)
    const productFiles = r2Files
      .filter(f => f.Key && product.fileKeys.includes(f.Key))
      .map(f => ({ key: f.Key!, size: f.Size || 0, lastModified: f.LastModified }))

    return NextResponse.json({ files: productFiles })
  } catch (e) {
    console.error('[FILES GET]', e)
    return NextResponse.json({ files: [] })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params

    let file: File | null = null
    try {
      const formData = await request.formData()
      file = formData.get('file') as File | null
    } catch {
      return NextResponse.json({ error: 'No se pudo leer el FormData' }, { status: 400 })
    }

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const ext = file.name.split('.').pop() || ''
    const key = `products/${product.slug}/${Date.now()}-${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await uploadFile(key, buffer, file.type || `application/${ext}`)

    await prisma.product.update({
      where: { id },
      data: { fileKeys: [...product.fileKeys, key] },
    })

    return NextResponse.json({ key })
  } catch (e) {
    console.error('[FILES POST]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminSession(request)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await deleteFile(key)

    await prisma.product.update({
      where: { id },
      data: { fileKeys: product.fileKeys.filter(k => k !== key) },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[FILES DELETE]', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
