import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true, name: true, slug: true, description: true,
      price: true, currency: true, images: true, tags: true,
      accessType: true, isActive: true, createdAt: true, updatedAt: true,
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  return NextResponse.json({ product })
}