const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const keywords = {
    cozy: "coffee lounge",
    outdoor: "outdoor cafe",
    work: "coworking cafe",
    wifi: "wifi cafe",
    murah: "cheap coffee",
    nongkrong: "coffee",
    belajar: "study cafe",
    meeting: "meeting cafe",
    estetik: "instagrammable cafe",
    aesthetic: "instagrammable cafe",
    santai: "relaxing cafe",
    senyap: "quiet cafe",
    kopi: "coffee shop",
    dessert: "dessert cafe",
    brunch: "brunch cafe",
    malam: "night cafe",
    family: "family cafe",
    keluarga: "family cafe",
    premium: "premium coffee shop",
    fancy: "premium coffee shop",
    rokok: "smoking area cafe",
    smoking: "smoking area cafe",
    livemusic: "live music cafe",
    musik: "live music cafe"
  }

  console.log('Seeding keywords...')

  for (const [key, value] of Object.entries(keywords)) {
    await prisma.keywordMapping.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
