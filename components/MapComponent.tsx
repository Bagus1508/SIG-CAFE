"use client"

import React, { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Search, Navigation, MapPin, ExternalLink, ShieldCheck, X, Maximize, Minimize, PanelLeftClose, PanelLeftOpen, Coffee, Wifi, CheckCircle2, Phone, Clock, Sparkles, Utensils, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchCafes } from '@/lib/foursquare'
import { recordInteraction } from '@/app/dashboard/actions'

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
  const southSurabaya: [number, number] = [-7.3365, 112.7378]
  const [mapCenter, setMapCenter] = useState<[number, number]>(southSurabaya)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  // cafes = hanya hasil Foursquare (persis seperti map/page.tsx)
  const [cafes, setCafes] = useState<any[]>([])
  const [selectedCafe, setSelectedCafe] = useState<any>(null)
  const [query, setQuery] = useState("")
  const [userIcon, setUserIcon] = useState<any>(null)
  const [cafeIcon, setCafeIcon] = useState<any>(null)
  const [dbIcon, setDbIcon] = useState<any>(null)
  const [searching, setSearching] = useState(false)
  const [searchMode, setSearchMode] = useState<'current' | 'surabaya'>('surabaya')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const searchRef = useRef<HTMLDivElement>(null)
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentImageIndex(0)
    if (imageContainerRef.current) {
      imageContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [selectedCafe])

  const handleNextImage = () => {
    if (!selectedCafe?.images || selectedCafe.images.length === 0) return
    const nextIndex = (currentImageIndex + 1) % selectedCafe.images.length
    setCurrentImageIndex(nextIndex)
    
    if (imageContainerRef.current) {
      const width = imageContainerRef.current.clientWidth
      imageContainerRef.current.scrollTo({
        left: width * nextIndex,
        behavior: 'smooth'
      })
    }
  }

  const handlePrevImage = () => {
    if (!selectedCafe?.images || selectedCafe.images.length === 0) return
    const prevIndex = (currentImageIndex - 1 + selectedCafe.images.length) % selectedCafe.images.length
    setCurrentImageIndex(prevIndex)

    if (imageContainerRef.current) {
      const width = imageContainerRef.current.clientWidth
      imageContainerRef.current.scrollTo({
        left: width * prevIndex,
        behavior: 'smooth'
      })
    }
  }

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
      const data = await fetchCafes(mapped, center[0], center[1])
      const results = (data.results || [])
      allResults.push(...results)
    }

    // Deduplicate by DB id (no more FSQ duplication since we upsert)
    const unique = Array.from(
      new Map(allResults.map((item: any) => [item.id, item])).values()
    ) as any[]

    // Normalize lat/lng and filter out records with invalid coordinates
    const normalized = unique
      .map((item: any) => ({
        ...item,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude),
      }))
      .filter((item: any) => !isNaN(item.latitude) && !isNaN(item.longitude))

    // Sort by distance if available
    normalized.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))

    setCafes(normalized)
    setSearching(false)

    // --- INTERACTION TRACKING ---
    dbCafes.forEach(c => recordInteraction(c.id, 'search'))
    dbCafes.forEach(c => recordInteraction(c.id, 'view'))
    // --- END TRACKING ---

    // Only fly to first result if it has valid coordinates
    const first = normalized[0]
    if (first && !isNaN(first.latitude) && !isNaN(first.longitude)) {
      setSelectedCafe(first)
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
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {allCafes.length > 0 ? (
                allCafes.map((cafe) => (
                  <div
                    key={`sidebar-${cafe.id || cafe.fsq_place_id}`}
                    onClick={() => {
                      setSelectedCafe(cafe)
                      if (!isNaN(cafe.latitude) && !isNaN(cafe.longitude)) {
                        setMapCenter([cafe.latitude, cafe.longitude])
                      }
                      if (cafe.id) {
                        recordInteraction(cafe.id, 'click')
                      }
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all shadow-sm ${selectedCafe?.fsq_place_id === cafe.fsq_place_id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-slate-50 border-transparent'
                      }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl shrink-0 ${cafe.isDb ? 'bg-orange-100' : 'bg-slate-100'}`}>
                        ☕
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-semibold text-sm text-slate-700 truncate">
                            {cafe.name}
                          </h2>
                          {cafe.isDb && <ShieldCheck size={13} className="text-blue-500 shrink-0" />}
                        </div>

                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {cafe.location?.formatted_address}
                        </p>

                        <div className="mt-2 flex justify-between">
                          <span className={`text-[10px] px-2 py-1 rounded-full ${cafe.isDb ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {cafe.categories?.[0]?.short_name || 'Cafe'}
                          </span>

                          <span className="text-[10px] text-slate-400">
                            {cafe.distance > 0 ? `${cafe.distance} m` : '–'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
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
                const icon = cafe.source === 'foursquare' ? cafeIcon : dbIcon;
                if (!icon) return null;

                return (
                  <Marker
                    key={`marker-${cafe.id || cafe.fsqPlaceId}`}
                    position={[cafe.latitude, cafe.longitude]}
                    icon={icon}
                    eventHandlers={{
                      click: () => {
                        setSelectedCafe(cafe)
                        if (cafe.id) recordInteraction(cafe.id, 'click')
                      }
                    }}
                  >
                    <Popup>{cafe.cafeName || cafe.name}</Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Floating Detail Card - Bottom Sheet style on Mobile */}
          {selectedCafe && (
            <div className="fixed inset-x-0 bottom-0 sm:absolute sm:bottom-4 sm:left-auto sm:right-4 sm:w-80 z-[2000] sm:z-[1000] bg-white rounded-t-[32px] sm:rounded-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] sm:shadow-2xl border-t sm:border border-slate-100 overflow-hidden flex flex-col h-[75vh] sm:h-auto sm:max-h-[calc(100%-4rem)] transition-all duration-500 ease-out translate-y-0 animate-in slide-in-from-bottom">

              {/* Mobile Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedCafe(null)}
                className="absolute top-3 right-3 z-[1010] bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition-all shadow-lg"
              >
                <X size={18} />
              </button>

              {/* Image Header */}
              <div className={`h-48 sm:h-56 shrink-0 relative overflow-hidden m-4 rounded-xl ${selectedCafe.isDb ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                {selectedCafe.images && selectedCafe.images.length > 0 ? (
                  <>
                    <div 
                      ref={imageContainerRef}
                      className="w-full h-full flex overflow-x-hidden snap-x snap-mandatory scroll-smooth"
                    >
                      {selectedCafe.images.map((img: any, i: number) => (
                        <img key={i} src={img.url} alt="" className="w-full h-full object-cover shrink-0 snap-center" />
                      ))}
                    </div>
                    {/* Gradient Overlay for better UI depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

                    {selectedCafe.images.length > 1 && (
                      <>
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                            className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-1.5 rounded-full transition-all shadow-md"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                            className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-1.5 rounded-full transition-all shadow-md"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg tracking-wider">
                          {currentImageIndex + 1} / {selectedCafe.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl shadow-inner">
                      ☕
                    </div>
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">No Image Available</span>
                  </div>
                )}
              </div>

              {/* Scrollable Body */}
              <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="flex justify-between items-start">
                  <h2 className="font-bold text-lg text-slate-700 leading-tight">
                    {selectedCafe.cafeName || selectedCafe.name}
                  </h2>

                  <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ml-2 font-bold ${
                    selectedCafe.source === 'foursquare'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {selectedCafe.source === 'foursquare' ? '📍 Foursquare' : '✅ Terverifikasi'}
                  </span>
                </div>

                {selectedCafe.source !== 'foursquare' && (
                  <div className="flex items-center gap-1 mt-1">
                    <ShieldCheck size={12} className="text-orange-500" />
                    <span className="text-[10px] text-orange-500 font-bold">SIG Terverifikasi</span>
                  </div>
                )}

                <p className="text-sm flex gap-2 mt-3 text-slate-500">
                  <MapPin size={16} className="shrink-0 mt-[2px]" />
                  {selectedCafe.address || selectedCafe.location?.formatted_address}
                </p>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone size={14} className="text-blue-500" />
                    <span className={!selectedCafe.phone ? 'text-slate-400 italic' : ''}>
                      {selectedCafe.phone || 'Belum ada informasi kontak'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock size={14} className="text-blue-500" />
                    <span className={!selectedCafe.openingHours ? 'text-slate-400 italic' : ''}>
                      {selectedCafe.openingHours || 'Belum ada informasi jam operasional'}
                    </span>
                  </div>
                </div>

                {/* Fasilitas Cafe */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Wifi size={12} /> Fasilitas
                  </div>
                  {selectedCafe.facilities ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCafe.facilities.split(", ").map((f: string) => (
                        <span key={f} className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg border border-blue-100">
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Belum ada informasi fasilitas.</p>
                  )}
                </div>

                {/* Menu */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Utensils size={12} /> Menu Unggulan
                  </div>
                  {(() => {
                    if (!selectedCafe.menuDescription) {
                      return <p className="text-sm text-slate-400 italic">Belum ada informasi menu.</p>;
                    }
                    try {
                      const items = JSON.parse(selectedCafe.menuDescription);
                      if (Array.isArray(items) && items.length > 0) {
                        return (
                          <div className="flex flex-col gap-2">
                            {items.map((item: any, i: number) => (
                              <div key={i} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                                {item.price && (
                                  <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                                    {item.price.toLowerCase().includes('rp') ? item.price : `Rp ${item.price}`}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      }
                    } catch (e) {
                      // Fallback
                    }
                    return <p className="text-sm text-slate-600 leading-relaxed">{selectedCafe.menuDescription}</p>;
                  })()}
                </div>

                <div className="mt-3 flex justify-between text-[10px] text-slate-400 italic">
                  <span>Distance</span>
                  <span>{selectedCafe.distance > 0 ? `${selectedCafe.distance} meter` : '–'}</span>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-3 bg-white border-t border-slate-100 shrink-0">
                <a
                  href={selectedCafe.source === 'foursquare' 
                    ? `https://www.google.com/maps/search/?api=1&query=${selectedCafe.latitude},${selectedCafe.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCafe.name)}`
                  }
                  target="_blank"
                  onClick={() => {
                    if (selectedCafe.isDb && selectedCafe.id) {
                      recordInteraction(selectedCafe.id, 'route')
                    }
                  }}
                  className="w-full flex gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl justify-center font-bold text-sm shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  <ExternalLink size={16} />
                  Navigasi ke Lokasi
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}