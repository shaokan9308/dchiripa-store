import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      images: body.images || [],
      tags: body.tags || [],
      isActive: body.isActive ?? true,
    },
  })

  return NextResponse.json(product)
}
