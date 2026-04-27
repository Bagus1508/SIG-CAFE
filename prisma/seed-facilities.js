const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const facilities = ["WiFi", "AC", "Colokan", "Toilet", "Parkir", "Outdoor", "Musholla", "Smoking Area"]
  
  for (const name of facilities) {
    await prisma.facility.upsert({
      where: { name },
      update: {},
      create: { name }
    })
  }
  
  console.log('Seed facilities successful')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
