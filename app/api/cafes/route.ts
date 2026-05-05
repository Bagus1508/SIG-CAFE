import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { CafeImage, Prisma, Submission, User } from '@prisma/client'

type SubmissionWithImages = Submission & { images: CafeImage[] }
type FoursquareCategory = {
  fsq_category_id?: string | number
  id?: string | number
  name?: string
  short_name?: string
}
type FoursquarePlace = {
  fsq_id?: string
  fsq_place_id?: string
  name?: string
  latitude?: number
  longitude?: number
  geocodes?: { main?: { latitude?: number; longitude?: number } }
  location?: { formatted_address?: string; address?: string }
  categories?: FoursquareCategory[]
  distance?: number
  rating?: number
}
type CafeResult = Partial<Omit<SubmissionWithImages, 'id' | 'latitude' | 'longitude' | 'images'>> & {
  id?: number | string
  cafeName?: string
  name: string
  latitude: number | string
  longitude: number | string
  address?: string
  isDb: boolean
  isFoursquare: boolean
  source?: string
  fsqPlaceId?: string | null
  categories?: FoursquareCategory[]
  location?: FoursquarePlace['location']
  distance?: number
  rating?: number | null
  images?: CafeImage[]
}

const searchableFields = [
  'cafeName',
  'address',
  'kecamatan',
  'kelurahan',
  'facilities',
  'ambiance',
  'menuDescription',
  'description',
] as const

const ignoredLocalTokens = new Set(['cafe', 'kafe', 'coffee', 'kopi', 'shop'])
const allowedFoursquareCafeCategoryIds = new Set(['13032', '13034', '13035'])
const cafeNameWords = ['cafe', 'kafe', 'coffee', 'kopi', 'tea', 'teh', 'roastery']
const blockedNonCafeWords = ['bengkel', 'workshop', 'garage', 'repair', 'service', 'servis']

const localKeywordSynonyms: Record<string, string[]> = {
  aesthetic: ['aesthetic', 'estetik', 'instagrammable', 'instagramable'],
  estetik: ['aesthetic', 'estetik', 'instagrammable', 'instagramable'],
  instagrammable: ['aesthetic', 'estetik', 'instagrammable', 'instagramable'],
  instagramable: ['aesthetic', 'estetik', 'instagrammable', 'instagramable'],
  cozy: ['cozy', 'homey', 'nyaman', 'hangat'],
  outdoor: ['outdoor', 'garden', 'rooftop', 'teras'],
  work: ['work', 'coworking', 'work-friendly', 'wifi'],
  coworking: ['work', 'coworking', 'work-friendly', 'wifi'],
  wifi: ['wifi', 'internet', 'work-friendly'],
  belajar: ['belajar', 'study', 'quiet', 'senyap'],
  study: ['belajar', 'study', 'quiet', 'senyap'],
  meeting: ['meeting', 'rapat'],
  santai: ['santai', 'relaxing', 'casual', 'homey'],
  relaxing: ['santai', 'relaxing', 'casual', 'homey'],
  senyap: ['senyap', 'quiet', 'calm', 'tenang'],
  quiet: ['senyap', 'quiet', 'calm', 'tenang'],
  murah: ['murah', 'cheap', 'affordable', 'terjangkau'],
  cheap: ['murah', 'cheap', 'affordable', 'terjangkau'],
  premium: ['premium', 'fancy', 'elegant'],
  fancy: ['premium', 'fancy', 'elegant'],
  family: ['family', 'keluarga'],
  keluarga: ['family', 'keluarga'],
  malam: ['malam', 'night'],
  smoking: ['smoking', 'rokok'],
  rokok: ['smoking', 'rokok'],
  livemusic: ['livemusic', 'live music', 'musik'],
  musik: ['livemusic', 'live music', 'musik'],
}

const expandLocalSearchTerms = (...terms: string[]) => {
  const expanded = new Set<string>()

  terms
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean)
    .forEach((term) => {
      expanded.add(term)

      term
        .split(/\s+/)
        .filter((token) => token && !ignoredLocalTokens.has(token))
        .forEach((token) => {
          expanded.add(token)
          localKeywordSynonyms[token]?.forEach((synonym) => expanded.add(synonym))
        })

      localKeywordSynonyms[term]?.forEach((synonym) => expanded.add(synonym))
    })

  return Array.from(expanded)
}

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3 // metres
  const phi1 = lat1 * Math.PI / 180
  const phi2 = lat2 * Math.PI / 180
  const deltaPhi = (lat2 - lat1) * Math.PI / 180
  const deltaLambda = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const textIncludesAny = (text: string, words: string[]) =>
  words.some((word) => text.includes(word))

const hasCafeCategory = (categories?: FoursquareCategory[]) =>
  Boolean(categories?.some((cat) => {
    const catId = (cat.fsq_category_id || cat.id)?.toString()
    const categoryText = `${cat.name || ''} ${cat.short_name || ''}`.toLowerCase()

    return Boolean(
      (catId && allowedFoursquareCafeCategoryIds.has(catId)) ||
      textIncludesAny(categoryText, cafeNameWords)
    )
  }))

const hasNonCafeName = (name?: string) => {
  const normalizedName = (name || '').toLowerCase()
  return textIncludesAny(normalizedName, blockedNonCafeWords) &&
    !textIncludesAny(normalizedName, cafeNameWords)
}

const isNonCafeSearch = (...terms: string[]) => {
  const normalizedTerms = terms.join(' ').toLowerCase()
  return textIncludesAny(normalizedTerms, blockedNonCafeWords) &&
    !textIncludesAny(normalizedTerms, cafeNameWords)
}

const isFoursquareCafePlace = (place: FoursquarePlace) => {
  const normalizedName = (place.name || '').toLowerCase()

  if (hasNonCafeName(place.name)) return false
  if (hasCafeCategory(place.categories)) return true

  return textIncludesAny(normalizedName, cafeNameWords)
}

const normalizeRating = (rating?: number) => {
  if (typeof rating !== 'number' || Number.isNaN(rating)) return null
  const fiveStarRating = rating > 5 ? rating / 2 : rating
  return Math.max(0, Math.min(5, fiveStarRating))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = (searchParams.get('query') || '').trim()
  const rawQuery = (searchParams.get('rawQuery') || '').trim()
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  const latNum = parseFloat(lat || '-7.2575')
  const lngNum = parseFloat(lng || '112.7521')
  const searchTerms = expandLocalSearchTerms(query, rawQuery)

  const buildLocalSearch = () => {
    if (searchTerms.length === 0) return {}

    return {
      OR: searchTerms.flatMap((term) =>
        searchableFields.map((field) => ({
          [field]: { contains: term }
        }))
      )
    } satisfies Prisma.SubmissionWhereInput
  }

  try {
    let fsqResults: CafeResult[] = []
    const fsqQuery = query || 'cafe'
    const shouldSearchFoursquare = !isNonCafeSearch(query, rawQuery)

    let places: FoursquarePlace[] = []
    try {
      if (!shouldSearchFoursquare) {
        console.log(`Skip FSQ non-cafe query: "${query}" / "${rawQuery}"`)
      } else {
      const res = await fetch(
        `https://places-api.foursquare.com/places/search?query=${encodeURIComponent(fsqQuery)}&ll=${latNum},${lngNum}&limit=10&categories=13032,13034,13035`,
        {
          headers: {
            'X-Places-Api-Version': '2025-06-17',
            accept: 'application/json',
            authorization: (process.env.FOURSQUARE_API_KEY as string) || ''
          }
        }
      )

      if (res.ok) {
        const data = await res.json()
        places = (data?.results || []) as FoursquarePlace[]
      } else {
        console.error('FSQ API error:', res.status, await res.text())
      }
      }
    } catch (e) {
      console.error('FSQ fetch error:', e)
    }

    let systemUser: User | null = null
    try {
      systemUser = await prisma.user.findFirst({ where: { username: 'foursquare_system' } })
      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            username: 'foursquare_system',
            password: 'SYSTEM_NOT_LOGIN',
            name: 'Foursquare System',
            role: 'admin'
          }
        })
      }
    } catch (e) {
      console.error('FSQ system user error:', e)
    }

    const validPlaces = places.filter((place) => {
      const latVal = place.latitude ?? place.geocodes?.main?.latitude
      const lngVal = place.longitude ?? place.geocodes?.main?.longitude
      const hasValidGeocode = latVal != null && lngVal != null && !isNaN(latVal) && !isNaN(lngVal)

      return hasValidGeocode && isFoursquareCafePlace(place)
    })

    fsqResults = (await Promise.all(
      validPlaces.map(async (place): Promise<CafeResult | null> => {
        const placeName = place.name?.trim()
        const latVal = place.latitude ?? place.geocodes?.main?.latitude
        const lngVal = place.longitude ?? place.geocodes?.main?.longitude
        if (!placeName || latVal == null || lngVal == null) return null

        const latStr = latVal.toString()
        const lngStr = lngVal.toString()
        const address = place.location?.formatted_address || place.location?.address || ''
        const fsqId = place.fsq_id || place.fsq_place_id
        const rating = normalizeRating(place.rating)

        if (!fsqId) return null

        if (systemUser) {
          try {
            const record = await prisma.submission.upsert({
              where: { fsqPlaceId: fsqId },
              update: { cafeName: placeName, address, latitude: latStr, longitude: lngStr },
              create: {
                reqNumber: `FSQ-${fsqId}`,
                cafeName: placeName,
                capacity: 0,
                address,
                latitude: latStr,
                longitude: lngStr,
                rating,
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
              rating: record.rating,
            }
          } catch (e) {
            console.error('FSQ upsert error:', e)
          }
        }

        return {
          id: `fsq-${fsqId}`,
          cafeName: placeName,
          name: placeName,
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
          rating,
          images: [],
        }
      })
    )).filter((result): result is CafeResult => result != null)

    if (fsqResults.length === 0 && shouldSearchFoursquare) {
      const cachedFoursquareResults = await prisma.submission.findMany({
        where: {
          status: 'Disetujui',
          source: 'foursquare',
          ...buildLocalSearch(),
        },
        include: { images: true }
      })
      console.log(`Cached FSQ fallback for "${query}" / "${rawQuery}":`, cachedFoursquareResults.length)

      fsqResults = cachedFoursquareResults
        .filter((c: SubmissionWithImages) => !hasNonCafeName(c.cafeName))
        .map((c: SubmissionWithImages) => {
        const cLat = parseFloat(c.latitude)
        const cLng = parseFloat(c.longitude)
        return {
          ...c,
          isDb: true,
          isFoursquare: true,
          name: c.cafeName,
          latitude: cLat,
          longitude: cLng,
          distance: calculateDistance(latNum, lngNum, cLat, cLng)
        }
      })
    }

    const ownerResults = await prisma.submission.findMany({
      where: {
        status: 'Disetujui',
        source: { not: 'foursquare' },
        ...buildLocalSearch(),
      },
      include: { images: true }
    })
    console.log(`Owner DB results for "${query}" / "${rawQuery}":`, ownerResults.length)

    const normalizedOwner: CafeResult[] = ownerResults.map((c: SubmissionWithImages) => {
      const cLat = parseFloat(c.latitude)
      const cLng = parseFloat(c.longitude)
      return {
        ...c,
        isDb: true,
        isFoursquare: false,
        name: c.cafeName,
        latitude: cLat,
        longitude: cLng,
        distance: calculateDistance(latNum, lngNum, cLat, cLng)
      }
    })

    const mergedMap = new Map()
    fsqResults.forEach((c) => {
      const key = c.fsqPlaceId || `fsq-${c.id}`
      mergedMap.set(key, c)
    })
    normalizedOwner.forEach((c) => mergedMap.set(`db-${c.id}`, c))

    const finalResults = Array.from(mergedMap.values())
    console.log(`API Search: query="${query}", raw="${rawQuery}", fsq=${fsqResults.length}, owner=${normalizedOwner.length}, final=${finalResults.length}`)

    return NextResponse.json({ results: finalResults })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.error('API Error:', message)
    return NextResponse.json({ results: [], error: message })
  }
}
