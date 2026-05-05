import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RatingRouteContext = {
  params: Promise<{ id: string }>
}

const resolveCafeWhere = (id: string) => {
  const numericId = Number(id)
  if (Number.isInteger(numericId)) return { id: numericId }

  return { fsqPlaceId: id.startsWith('fsq-') ? id.slice(4) : id }
}

export async function POST(req: Request, context: RatingRouteContext) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const score = Number(body?.score)

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return NextResponse.json({ success: false, error: 'Rating harus 1 sampai 5.' }, { status: 400 })
    }

    const cafe = await prisma.submission.findUnique({
      where: resolveCafeWhere(id),
      select: { id: true, rating: true, ratingCount: true, status: true },
    })

    if (!cafe || cafe.status !== 'Disetujui') {
      return NextResponse.json({ success: false, error: 'Cafe tidak ditemukan.' }, { status: 404 })
    }

    const ratingCount = cafe.ratingCount + 1
    const currentTotal = (cafe.rating || 0) * cafe.ratingCount
    const rating = (currentTotal + score) / ratingCount

    const updated = await prisma.submission.update({
      where: { id: cafe.id },
      data: { rating, ratingCount },
      select: { rating: true, ratingCount: true },
    })

    return NextResponse.json({ success: true, rating: updated.rating, ratingCount: updated.ratingCount })
  } catch (error) {
    console.error('Rating API error:', error)
    return NextResponse.json({ success: false, error: 'Gagal menyimpan rating.' }, { status: 500 })
  }
}
