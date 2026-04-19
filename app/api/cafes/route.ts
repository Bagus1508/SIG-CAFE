import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const query = searchParams.get('query')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const res = await fetch(
    `https://places-api.foursquare.com/places/search?query=${query}&ll=${lat},${lng}&limit=10`,
    {
    headers: {
        'X-Places-Api-Version': '2025-06-17',
        accept: 'application/json',
        authorization: process.env.FOURSQUARE_API_KEY
    }
    }
  )

  const data = await res.json()

  return NextResponse.json(data)
}