import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const OLD = 'pub-1b83dccfaaca909b54c7550facf3dcf1.r2.dev'
const NEW = 'pub-45b8e0c4740c498f968382c24d5ef40a.r2.dev'

export async function POST(request: Request) {
  const { secret } = await request.json()
  if (secret !== process.env.BETTER_AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const products = await prisma.product.findMany()
  let updated = 0

  for (const product of products) {
    const newImages = product.images.map(url => url.replace(OLD, NEW))
    const changed = newImages.some((url, i) => url !== product.images[i])
    if (changed) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: newImages },
      })
      updated++
    }
  }

  return NextResponse.json({ ok: true, updated, total: products.length })
}
