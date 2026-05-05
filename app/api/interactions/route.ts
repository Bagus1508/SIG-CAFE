import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const allowedTypes = new Set(['click', 'view', 'route', 'search'])

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const cafeId = Number(body?.cafeId)
    const type = String(body?.type || '')

    if (!Number.isInteger(cafeId) || !allowedTypes.has(type)) {
      return NextResponse.json({ success: false }, { status: 400 })
    }

    await prisma.interaction.create({
      data: { cafeId, type },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Interaction API error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
