const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const counts = await prisma.submission.groupBy({
    by: ['status', 'source'],
    _count: true
  })
  console.log('Submission counts:', counts)

  const samples = await prisma.submission.findMany({
    take: 5,
    where: { source: 'owner' }
  })
  console.log('Owner samples:', samples)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
