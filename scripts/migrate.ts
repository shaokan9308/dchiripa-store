const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ALTER COLUMN "stripeCustomerId" DROP NOT NULL')
  console.log('1/4 Dropped NOT NULL on stripeCustomerId')

  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ALTER COLUMN "stripeSubscriptionId" DROP NOT NULL')
  console.log('2/4 Dropped NOT NULL on stripeSubscriptionId')

  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ALTER COLUMN "stripePriceId" DROP NOT NULL')
  console.log('3/4 Dropped NOT NULL on stripePriceId')

  await prisma.$executeRawUnsafe('ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "isManual" BOOLEAN NOT NULL DEFAULT false')
  console.log('4/4 Added isManual column')

  console.log('Done!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
