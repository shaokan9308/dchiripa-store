const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.tmqwdsnfutwfmjzvpnwv:FKM5Ow721b065tV3@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
    },
  },
})

async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "accessType" TEXT NOT NULL DEFAULT \'purchase\'')
  console.log('Added accessType column to Product')
  console.log('Done!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
