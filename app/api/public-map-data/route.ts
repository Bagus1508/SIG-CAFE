import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [cafes, keywords] = await Promise.all([
      prisma.submission.findMany({
        where: { status: 'Disetujui' },
        include: { images: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.keywordMapping.findMany({
        orderBy: { key: 'asc' },
      }),
    ])

    const keywordMapping: Record<string, string> = {}
    keywords.forEach((item) => {
      keywordMapping[item.key] = item.value
    })

    return NextResponse.json({ cafes, keywordMapping })
  } catch (error) {
    console.error('Public map data error:', error)
    return NextResponse.json({ cafes: [], keywordMapping: {} }, { status: 500 })
  }
}
