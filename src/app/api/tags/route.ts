import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { tags: true },
    })

    const tagMap = new Map<string, number>()
    for (const product of products) {
      for (const tag of product.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      }
    }

    const tags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(tags)
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
