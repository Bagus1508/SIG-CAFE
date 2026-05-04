import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const latNum = parseFloat(lat || '-7.2575')
  const lngNum = parseFloat(lng || '112.7521')

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // metres
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.round(R * c)
  }

  try {
    // 1. Search in Local Database
    const localDbResults = await (prisma as any).submission.findMany({
      where: {
        status: 'Disetujui',
        ...(query ? {
          OR: [
            { cafeName: { contains: query } },
            { address: { contains: query } },
            { kecamatan: { contains: query } },
            { kelurahan: { contains: query } },
          ]
        } : {}) // If no query, return ALL 'Disetujui' records
      },
      include: { images: true }
    })
    console.log(`Local DB results for "${query}":`, localDbResults.length)
    if (localDbResults.length > 0) {
       console.log(`First local result:`, localDbResults[0].cafeName)
    }

    const normalizedLocal = localDbResults.map((c: any) => {
      const cLat = parseFloat(c.latitude)
      const cLng = parseFloat(c.longitude)
      return {
        ...c,
        isDb: true,
        isFoursquare: c.source === 'foursquare',
        name: c.cafeName,
        latitude: cLat,
        longitude: cLng,
        distance: calculateDistance(latNum, lngNum, cLat, cLng)
      }
    })

    // 2. Fetch from Foursquare
    let fsqResults: any[] = []
    // Always fetch from Foursquare if searching, default to 'cafe' if query is empty
    const fsqQuery = query || "cafe"
    if (true) {
      // Broaden to 13000 (Dining and Drinking) to ensure results while still excluding non-food places like "tambal ban"
      const res = await fetch(
        `https://places-api.foursquare.com/places/search?query=${encodeURIComponent(fsqQuery)}&ll=${lat},${lng}&limit=10&categories=13000`,
        {
          headers: {
            'X-Places-Api-Version': '2025-06-17',
            'accept': 'application/json',
            'authorization': (process.env.FOURSQUARE_API_KEY as string) || ''
          }
        }
      )
      const data = await res.json()
      const places = data?.results || []

      // Get or create system user (only if DB is needed for upserting FSQ results)
      let systemUser: any = null
      try {
        systemUser = await (prisma as any).user.findFirst({ where: { username: 'foursquare_system' } })
        if (!systemUser) {
          systemUser = await (prisma as any).user.create({
            data: {
              username: 'foursquare_system',
              password: 'SYSTEM_NOT_LOGIN',
              name: 'Foursquare System',
              role: 'admin'
            }
          })
        }
      } catch (e) {}

      // Filter only places with valid geocodes
      const validPlaces = places.filter((place: any) => {
        const latVal = place.latitude ?? place.geocodes?.main?.latitude
        const lngVal = place.longitude ?? place.geocodes?.main?.longitude
        return latVal != null && lngVal != null && !isNaN(latVal) && !isNaN(lngVal)
      })

      // Upsert FSQ results and normalize them
      fsqResults = await Promise.all(
        validPlaces.map(async (place: any) => {
          const latVal = place.latitude ?? place.geocodes?.main?.latitude
          const lngVal = place.longitude ?? place.geocodes?.main?.longitude
          const latStr = latVal.toString()
          const lngStr = lngVal.toString()
          const address = place.location?.formatted_address || place.location?.address || ''
          const fsqId = place.fsq_place_id

          if (systemUser) {
            try {
              const record = await (prisma as any).submission.upsert({
                where: { fsqPlaceId: fsqId },
                update: { cafeName: place.name, address, latitude: latStr, longitude: lngStr },
                create: {
                  reqNumber: `FSQ-${fsqId}`,
                  cafeName: place.name,
                  capacity: 0,
                  address,
                  latitude: latStr,
                  longitude: lngStr,
                  status: 'Disetujui',
                  source: 'foursquare',
                  fsqPlaceId: fsqId,
                  ownerId: systemUser.id,
                },
                include: { images: true }
              })
              return {
                ...record,
                name: record.cafeName,
                isDb: true,
                isFoursquare: true,
                categories: place.categories,
                location: place.location,
                distance: place.distance,
              }
            } catch (e) {}
          }

          return {
            id: `fsq-${fsqId}`,
            cafeName: place.name,
            name: place.name,
            latitude: latStr,
            longitude: lngStr,
            address,
            isDb: false,
            isFoursquare: true,
            source: 'foursquare',
            fsqPlaceId: fsqId,
            categories: place.categories,
            location: place.location,
            distance: place.distance,
            images: [],
          }
        })
      )
    }

    // 3. Merge Results (Deduplicate)
    const mergedMap = new Map()
    normalizedLocal.forEach((c: any) => mergedMap.set(c.fsqPlaceId || `db-${c.id}`, c))
    fsqResults.forEach((c: any) => {
      const key = c.fsqPlaceId || `db-${c.id}`
      mergedMap.set(key, { ...mergedMap.get(key), ...c })
    })

    const finalResults = Array.from(mergedMap.values())
    console.log(`API Search: query="${query}", local=${normalizedLocal.length}, fsq=${fsqResults.length}, final=${finalResults.length}`)

    return NextResponse.json({ results: finalResults })
  } catch (e: any) {
    console.error('API Error:', e.message)
    return NextResponse.json({ results: [], error: e.message })
  }
}
