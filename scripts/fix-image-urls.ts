import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const OLD_SUBDOMAIN = 'pub-1b83dccfaaca909b54c7550facf3dcf1.r2.dev'
const NEW_SUBDOMAIN = 'pub-45b8e0c4740c498f968382c24d5ef40a.r2.dev'

async function main() {
  const products = await prisma.product.findMany()

  for (const product of products) {
    const updatedImages = product.images.map(url =>
      url.replace(OLD_SUBDOMAIN, NEW_SUBDOMAIN)
    )
    const updatedFileKeys = product.fileKeys.map(key =>
      key.replace(OLD_SUBDOMAIN, NEW_SUBDOMAIN)
    )

    const needsUpdate =
      updatedImages.some((url, i) => url !== product.images[i]) ||
      updatedFileKeys.some((key, i) => key !== product.fileKeys[i])

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: updatedImages, fileKeys: updatedFileKeys },
      })
      console.log(`Updated: ${product.name}`)
    }
  }

  console.log('Done!')
}

main().finally(() => prisma.$disconnect())
