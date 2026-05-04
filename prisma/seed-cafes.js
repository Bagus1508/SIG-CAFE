const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding real cafes...')

  // Get or create an owner user
  let user = await prisma.user.findFirst({
    where: { role: 'admin' }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        username: 'admin_seeder',
        password: 'password123',
        name: 'Admin Seeder',
        role: 'admin'
      }
    })
  }

  const cafes = [
    {
      reqNumber: 'REQ-001-SEED',
      cafeName: 'Monopole Coffee Lab',
      capacity: 50,
      address: 'Jl. Raya Darmo Permai I No.38, Pradahkalikendal, Kec. Dukuhpakis, Surabaya',
      latitude: '-7.2831',
      longitude: '112.6715',
      facilities: 'WiFi, Colokan, AC, Area Smoking, Parkir Luas',
      phone: '0812-3456-7891',
      openingHours: 'Senin - Minggu, 08:00 - 22:00',
      ambiance: 'Modern, Minimalist, Work-friendly',
      menuDescription: JSON.stringify([
        { name: 'Caramel Macchiato', price: '45000' },
        { name: 'Truffle Fries', price: '35000' }
      ]),
      description: 'Coffee shop modern dengan suasana yang cocok untuk WFC (Work From Cafe). Menyediakan berbagai macam single origin coffee.',
      status: 'Disetujui',
      ownerId: user.id
    },
    {
      reqNumber: 'REQ-002-SEED',
      cafeName: 'Carpentier Kitchen',
      capacity: 80,
      address: 'Jl. Untung Suropati No.83, DR. Soetomo, Kec. Tegalsari, Surabaya',
      latitude: '-7.2625',
      longitude: '112.7441',
      facilities: 'WiFi, Toilet Bersih, AC, Spot Foto, Musholla',
      phone: '031-5683281',
      openingHours: 'Senin - Minggu, 10:00 - 22:00',
      ambiance: 'Vintage, Homey, Instagramable',
      menuDescription: JSON.stringify([
        { name: 'Carpentier Burger', price: '65000' },
        { name: 'Iced Latte', price: '38000' }
      ]),
      description: 'Cafe berkonsep vintage yang menyatu dengan toko pakaian (Oreon). Suasana yang hangat dan nyaman seperti di rumah sendiri.',
      status: 'Disetujui',
      ownerId: user.id
    },
    {
      reqNumber: 'REQ-003-SEED',
      cafeName: 'Kudos Café',
      capacity: 100,
      address: 'Pakuwon Square AK 2 No. 3, Jl. Yono Suwoyo, Babatan, Kec. Wiyung, Surabaya',
      latitude: '-7.2872',
      longitude: '112.6658',
      facilities: 'WiFi, Colokan, AC, Area Smoking, Live Music',
      phone: '0813-3333-8888',
      openingHours: 'Senin - Minggu, 09:00 - 23:00',
      ambiance: 'Industrial, Casual, Lively',
      menuDescription: JSON.stringify([
        { name: 'Aglio Olio', price: '55000' },
        { name: 'Signature Coffee Kudos', price: '40000' }
      ]),
      description: 'Kafe yang luas dengan desain industrial 3 lantai yang sangat ikonik di Surabaya Barat.',
      status: 'Disetujui',
      ownerId: user.id
    },
    {
      reqNumber: 'REQ-004-SEED',
      cafeName: 'Noach Café and Bistro',
      capacity: 120,
      address: 'Jl. Pregolan No.4, Tegalsari, Kec. Tegalsari, Surabaya',
      latitude: '-7.2858',
      longitude: '112.6710',
      facilities: 'VIP Room, WiFi, AC, Parkir Luas, Musholla, Spot Foto',
      phone: '031-5311360',
      openingHours: 'Senin - Minggu, 11:00 - 23:30',
      ambiance: 'Elegant, Romantic, Fancy',
      menuDescription: JSON.stringify([
        { name: 'Wagyu Steak', price: '185000' },
        { name: 'Red Velvet Cake', price: '45000' }
      ]),
      description: 'Bistro elegan dengan dekorasi kaca dan tanaman hijau yang asri. Sangat cocok untuk dinner romantis atau acara keluarga.',
      status: 'Disetujui',
      ownerId: user.id
    }
  ]

  for (const cafe of cafes) {
    await prisma.submission.upsert({
      where: { reqNumber: cafe.reqNumber },
      update: {
        ...cafe,
        images: {
          deleteMany: {},
          create: [
            { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800' },
            { url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800' }
          ]
        }
      },
      create: {
        ...cafe,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800' },
            { url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800' }
          ]
        }
      }
    })
    console.log(`Upserted: ${cafe.cafeName}`)
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
