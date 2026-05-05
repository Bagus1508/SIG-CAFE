"use client"

import React, { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Navigation, ShieldCheck, Star, X, Maximize, Minimize, PanelLeftClose, PanelLeftOpen, Map as MapIcon, Loader2, Sparkles } from 'lucide-react'
import { fetchCafes } from '@/lib/foursquare'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })
const ZoomControl = dynamic(() => import('react-leaflet').then(m => m.ZoomControl), { ssr: false })

const ChangeView = dynamic(
  async () => {
    const { useMap } = await import('react-leaflet')

    return function ChangeView({ center }: { center: [number, number] }) {
      const map = useMap()
      map.flyTo(center, 15)
      return null
    }
  },
  { ssr: false }
)

interface MapComponentProps {
  dbCafes: any[]
  keywordMapping: Record<string, string>
}

export default function MapComponent({ dbCafes, keywordMapping }: MapComponentProps) {
  const router = useRouter()
  const pathname = usePathname()
  const southSurabaya: [number, number] = [-7.3365, 112.7378]
  const [mapCenter, setMapCenter] = useState<[number, number]>(southSurabaya)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  // cafes = hanya hasil Foursquare (persis seperti map/page.tsx)
  const [cafes, setCafes] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [userIcon, setUserIcon] = useState<any>(null)
  const [cafeIcon, setCafeIcon] = useState<any>(null)
  const [dbIcon, setDbIcon] = useState<any>(null)
  const [bestMatchIcon, setBestMatchIcon] = useState<any>(null)
  const [searching, setSearching] = useState(false)
  const [searchMode, setSearchMode] = useState<'current' | 'surabaya'>('surabaya')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [detailLoadingHref, setDetailLoadingHref] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const isDetailMapPage = pathname === '/map'

  const getCafeDetailHref = (cafe: any) => {
    const id = cafe.id || (cafe.fsqPlaceId ? `fsq-${cafe.fsqPlaceId}` : null)
    return id ? `/cafes/${encodeURIComponent(String(id))}` : '#'
  }

  const getCafeImage = (cafe: any) => cafe.images?.[0]?.url || ''

  const getCafeAmbiance = (cafe: any) =>
    typeof cafe.ambiance === 'string' && cafe.ambiance.trim()
      ? cafe.ambiance.trim()
      : null

  const getCafeSummary = (cafe: any) =>
    cafe.description || cafe.facilities || cafe.categories?.[0]?.name || cafe.categories?.[0]?.short_name || 'Cafe'

  const getCafeRating = (cafe: any) =>
    typeof cafe.rating === 'number' && !Number.isNaN(cafe.rating)
      ? cafe.rating.toFixed(1)
      : null

  const recordInteraction = (cafeId: number, type: 'click' | 'view' | 'route' | 'search') => {
    fetch('/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cafeId, type }),
    }).catch((error) => console.error('Interaction tracking failed:', error))
  }

  const openCafeDetail = (cafe: any) => {
    const href = getCafeDetailHref(cafe)
    if (href === '#') return

    if (cafe.id && typeof cafe.id === 'number') {
      recordInteraction(cafe.id, 'click')
    }

    setDetailLoadingHref(href)
    router.push(href)
  }

  useEffect(() => {
    setDetailLoadingHref(null)
  }, [pathname])

  useEffect(() => {
    import('leaflet').then(L => {
      setUserIcon(new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }))

      // Foursquare cafes: merah (sama persis map/page.tsx)
      setCafeIcon(new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }))

      // DB cafes: oranye (berbeda agar bisa dibedakan)
      setDbIcon(new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [30, 46],
        iconAnchor: [15, 46],
      }))

      // Best Match: hijau (untuk hasil paling relevan)
      setBestMatchIcon(new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [35, 51],
        iconAnchor: [17, 51],
      }))
    })
  }, [])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      setUserLocation([lat, lng])
      setMapCenter([lat, lng])
    })
  }

  // Persis logika map/page.tsx — hanya tambahan DB cafes di sidebar & peta
  const handleSearch = async () => {
    const mapped = keywordMapping[query.toLowerCase()] || query || ""

    setSearching(true)
    setShowSuggestions(false)
    let allResults: any[] = []

    // Tentukan pusat pencarian berdasarkan mode
    const searchCenters = (searchMode === 'current' && userLocation)
      ? [userLocation]
      : [
        [-7.2915, 112.7348], // Wonokromo
        [-7.3385, 112.7297], // Gayungan
        [-7.3244, 112.7139], // Wiyung
        [-7.3507, 112.7013], // Karang Pilang
        [-7.3082, 112.7704], // Tenggilis Mejoyo
        [-7.3581, 112.7812], // Gunung Anyar
        [-7.3167, 112.7425], // Jambangan
        [-7.2874, 112.7189], // Dukuh Pakis
        [-7.2752, 112.7284], // Sawahan
      ]

    for (const center of searchCenters) {
      const data = await fetchCafes(mapped, center[0], center[1], query)
      const results = (data.results || [])
      allResults.push(...results)
    }

    // Deduplicate by DB id (no more FSQ duplication since we upsert)
    const unique = Array.from(
      new Map(allResults.map((item: any) => [item.id, item])).values()
    ) as any[]

    // Sort by relevance then distance
    const normalized = unique
      .map((item: any) => {
        // Calculate word-based relevance score
        const name = (item.name || item.cafeName || '').toLowerCase()
        const q = mapped.toLowerCase()
        const queryWords = q.split(/\s+/).filter(w => w.length > 0)
        
        let relevance = 0
        if (name === q) {
          relevance = 100
        } else if (name.startsWith(q)) {
          relevance = 90
        } else {
          // Count how many query words match
          let matches = 0
          queryWords.forEach(word => {
            if (name.includes(word)) matches++
          })
          
          if (matches > 0) {
            // Score based on percentage of words matched
            relevance = (matches / queryWords.length) * 80
          }
        }
        
        return {
          ...item,
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          relevance
        }
      })
      .filter((item: any) => !isNaN(item.latitude) && !isNaN(item.longitude))
      .sort((a: any, b: any) => {
        // First sort by relevance (descending)
        if (Math.abs(b.relevance - a.relevance) > 0.1) {
          return b.relevance - a.relevance
        }
        // Prioritize fresh Foursquare API results, owner data is supplemental
        const aIsFoursquare = a.source === 'foursquare' || a.isFoursquare
        const bIsFoursquare = b.source === 'foursquare' || b.isFoursquare
        if (aIsFoursquare !== bIsFoursquare) {
          return aIsFoursquare ? -1 : 1
        }
        // Then by distance (ascending)
        if (a.distance === 0) return 1
        if (b.distance === 0) return -1
        return a.distance - b.distance
      })
      .map((item, index) => ({
        ...item,
        isBestMatch: index === 0 && item.relevance > 0 // Only mark as best match if it has some relevance
      }))

    setCafes(normalized)
    setSearching(false)

    // --- INTERACTION TRACKING ---
    dbCafes.forEach(c => recordInteraction(c.id, 'search'))
    dbCafes.forEach(c => recordInteraction(c.id, 'view'))
    // --- END TRACKING ---

    // Highlight the top result
    const first = normalized[0]
    if (first) {
      setMapCenter([first.latitude, first.longitude])
    }
  }

  // Helper untuk hitung jarak (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // metres
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return Math.round(R * c) // dalam meter
  }

  // Filter out invalid coordinates from search results
  const allCafes = cafes
    .filter(c => !isNaN(c.latitude) && !isNaN(c.longitude))
    .sort((a, b) => {
      if (a.distance === 0) return 1
      if (b.distance === 0) return -1
      return a.distance - b.distance
    })

  const keywordOptions = Object.keys(keywordMapping).slice(0, 8) // Ambil 8 pertama untuk filter cepat

  // Filter suggestions based on typed query
  const allKeywords = Object.keys(keywordMapping)
  const filteredSuggestions = query.length > 0
    ? allKeywords.filter(k => k.toLowerCase().includes(query.toLowerCase()))
    : allKeywords

  return (
    <div className={`transition-all duration-500 bg-slate-100 flex flex-col ${isFullscreen
      ? 'fixed top-20 inset-x-0 bottom-0 z-[1500] p-0'
      : 'h-full w-full rounded-3xl overflow-hidden'
      }`}>

      <div className={`flex-1 flex flex-col lg:flex-row overflow-hidden ${isFullscreen ? '' : 'p-3 lg:p-4 gap-4'}`}>

        {/* Sidebar */}
        <div className={`transition-all duration-500 ease-in-out bg-white shadow-xl flex flex-col overflow-hidden relative z-[1000] ${showSidebar
          ? 'lg:w-[400px] h-[55vh] lg:h-full opacity-100'
          : 'w-0 h-0 lg:h-full lg:w-0 opacity-0 pointer-events-none'
          } ${isFullscreen ? 'lg:rounded-none' : 'rounded-3xl'}`}>

          <div className="p-3 lg:p-4 flex flex-col h-full min-w-[320px]">

            <h1 className="text-lg lg:text-xl font-bold text-slate-700 mb-2 lg:mb-4">
              Café Recommendation ☕
            </h1>

            <div className="mb-4">
              <div className="bg-slate-50 p-1 rounded-2xl flex gap-1 mb-3 border border-slate-100">
                <button
                  onClick={() => setSearchMode('surabaya')}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${searchMode === 'surabaya'
                    ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Surabaya Selatan
                </button>
                <button
                  onClick={() => {
                    setSearchMode('current')
                    if (!userLocation) detectLocation()
                  }}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${searchMode === 'current'
                    ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  Lokasi Terdekat
                </button>
              </div>

              {/* Search Input with Autocomplete */}
              <div ref={searchRef} className="relative mb-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="keyword-search-input-main"
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearch()
                        }
                      }}
                      placeholder="Cari keyword (misal: estetik, murah...)"
                      className="w-full pl-9 pr-8 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all"
                    />
                    {query && (
                      <button
                        onClick={() => { setQuery(''); setShowSuggestions(false) }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={detectLocation}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl shrink-0 transition-colors"
                    title="Deteksi Lokasi Saya"
                  >
                    <Navigation size={18} />
                  </button>

                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 rounded-xl flex items-center gap-2 shrink-0 transition-colors"
                  >
                    {searching ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Search size={18} />
                    )}
                    {searching ? 'Mencari...' : 'Cari'}
                  </button>
                </div>

                {/* Autocomplete Suggestions Dropdown */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((keyword) => (
                      <button
                        key={keyword}
                        onClick={() => {
                          setQuery(keyword)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <Search size={13} className="text-slate-400 shrink-0" />
                        <span>{keyword}</span>
                        <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{keywordMapping[keyword]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Keyword Chips */}
              <div className="flex flex-wrap gap-2">
                {keywordOptions.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item)
                      setShowSuggestions(false)
                    }}
                    className={`px-3 py-2 rounded-full text-sm transition-all ${query === item
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-3 px-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span> Database
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span> Foursquare
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0"></span> Hasil Terbaik
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {allCafes.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {allCafes.map((cafe) => {
                    const imageUrl = getCafeImage(cafe)
                    const href = getCafeDetailHref(cafe)
                    const rating = getCafeRating(cafe)
                    const ambiance = getCafeAmbiance(cafe)
                    const isOpeningDetail = detailLoadingHref === href

                    return (
                      <article
                        key={`sidebar-${cafe.id || cafe.fsqPlaceId}`}
                        onMouseEnter={() => {
                          if (!isNaN(cafe.latitude) && !isNaN(cafe.longitude)) {
                            setMapCenter([cafe.latitude, cafe.longitude])
                          }
                        }}
                        className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                          cafe.isBestMatch ? 'border-green-200 ring-1 ring-green-100' : 'border-slate-100'
                        }`}
                      >
                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                          {imageUrl ? (
                            <img src={imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className={`h-full w-full flex items-center justify-center text-3xl ${cafe.source === 'foursquare' ? 'bg-blue-100 text-blue-500' : 'bg-orange-100 text-orange-500'}`}>
                              ☕
                            </div>
                          )}
                          {cafe.isBestMatch && (
                            <span className="absolute left-2 top-2 rounded-full bg-green-600 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                              Terbaik
                            </span>
                          )}
                          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[9px] font-black text-slate-700 shadow-sm">
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            {rating || '-'}
                          </span>
                        </div>

                        <div className="p-2.5">
                          <div className="flex items-start gap-1.5">
                            <h2 className="min-w-0 flex-1 text-xs font-bold leading-snug text-slate-700 line-clamp-2">
                              {cafe.name || cafe.cafeName}
                            </h2>
                            {cafe.isDb && <ShieldCheck size={12} className="mt-0.5 shrink-0 text-blue-500" />}
                          </div>

                          <p className="mt-1.5 text-[10px] leading-snug text-slate-500 line-clamp-2">
                            {getCafeSummary(cafe)}
                          </p>

                          {ambiance && (
                            <div className="mt-2 inline-flex max-w-full items-center gap-1 rounded-lg border border-pink-100 bg-pink-50 px-2 py-1 text-[9px] font-bold text-pink-700">
                              <Sparkles size={10} className="shrink-0" />
                              <span className="truncate">Suasana: {ambiance}</span>
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-2">
                            <span className={`min-w-0 flex-1 truncate rounded-full px-2 py-1 text-[9px] font-bold ${cafe.source === 'foursquare' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                              {cafe.categories?.[0]?.short_name || cafe.categories?.[0]?.name || 'Cafe'}
                            </span>
                            <span className="shrink-0 text-[9px] font-semibold text-slate-400">
                              {cafe.distance > 0 ? `${cafe.distance} m` : '-'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              openCafeDetail(cafe)
                            }}
                            disabled={isOpeningDetail || href === '#'}
                            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-400"
                          >
                            {isOpeningDetail && <Loader2 size={12} className="animate-spin" />}
                            {isOpeningDetail ? 'Membuka...' : 'Lihat Detail'}
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-2xl">
                    🔍
                  </div>
                  <h3 className="font-medium text-slate-600">Tidak ada hasil</h3>
                  <p className="text-xs text-slate-400 mt-1">Coba kata kunci lain atau kosongkan untuk melihat semua.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className={`flex-1 relative transition-all duration-500 overflow-hidden ${isFullscreen ? '' : 'rounded-3xl shadow-xl'}`}>
          {detailLoadingHref && (
            <div className="absolute inset-0 z-[1200] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/95 px-5 py-3 text-sm font-bold text-slate-700 shadow-2xl">
                <Loader2 size={18} className="animate-spin text-blue-600" />
                Membuka detail cafe...
              </div>
            </div>
          )}

          {/* Floating Controls */}
          <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-2xl shadow-xl hover:bg-white transition-all text-slate-700 flex items-center justify-center"
              title={showSidebar ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
            >
              {showSidebar ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>

          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            {!isDetailMapPage && (
              <Link
                href="/map"
                className="bg-blue-600/95 backdrop-blur-md border border-blue-500 px-4 py-3 rounded-2xl shadow-xl hover:bg-blue-700 transition-all text-white flex items-center justify-center gap-2 text-sm font-bold"
                title="Buka Detail Map"
              >
                <MapIcon size={18} />
                <span className="hidden sm:inline">Detail Map</span>
              </Link>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-2xl shadow-xl hover:bg-white transition-all text-slate-700 flex items-center justify-center"
              title={isFullscreen ? "Keluar Tampilan Penuh" : "Tampilan Penuh"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>

          {!showSidebar && (
            <div className="absolute top-4 left-16 z-[1000] right-16 lg:right-auto lg:w-96">
              <div ref={searchRef} className="relative">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSearch()
                        }
                      }}
                      placeholder="Cari keyword..."
                      className="w-full pl-9 pr-8 py-3 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md text-sm text-slate-700 shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white p-3 rounded-2xl shadow-xl hover:bg-blue-700 transition-all"
                  >
                    <Search size={18} />
                  </button>
                </div>

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((keyword) => (
                      <button
                        key={keyword}
                        onClick={() => {
                          setQuery(keyword)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Search size={13} className="text-slate-400" />
                        <span>{keyword}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="h-full w-full">
            <MapContainer center={mapCenter} zoom={13} zoomControl={false} style={{ height: '100%', width: '100%' }}>
              <ZoomControl position="bottomleft" />
              <TileLayer
                attribution="OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <ChangeView center={mapCenter} />

              {userIcon && userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup>Lokasi Anda</Popup>
                </Marker>
              )}

              {/* Unified Cafe Markers */}
              {allCafes.map((cafe) => {
                let icon = cafe.source === 'foursquare' ? cafeIcon : dbIcon;
                if (cafe.isBestMatch && bestMatchIcon) icon = bestMatchIcon;
                if (!icon) return null;

                return (
                  <Marker
                    key={`marker-${cafe.id || cafe.fsqPlaceId}`}
                    position={[cafe.latitude, cafe.longitude]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        openCafeDetail(cafe)
                      }
                    }}
                  >
                    <Popup>{cafe.cafeName || cafe.name}</Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

        </div>
      </div>
    </div>
  )
}
