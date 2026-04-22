"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Search, Navigation, MapPin, ExternalLink, ShieldCheck } from 'lucide-react'
import { fetchCafes } from '@/lib/foursquare'
import { recordInteraction } from '@/app/dashboard/actions'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })

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
    const mapped = keywordMapping[query.toLowerCase()] || query || "coffee shop"

    setSearching(true)
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

      const filtered = (data.results || []).filter((place: any) =>
        place.categories?.some((cat: any) =>
          cat.name.toLowerCase().includes('coffee') ||
          cat.name.toLowerCase().includes('cafe')
        )
      )

      allResults.push(...filtered)
    }

    // Hapus duplikat berdasarkan fsq_place_id (persis map/page.tsx)
    const unique = Array.from(
      new Map(allResults.map(item => [item.fsq_place_id, item])).values()
    )

    // Sort terdekat (persis map/page.tsx)
    unique.sort((a: any, b: any) => a.distance - b.distance)

    setCafes(unique)
    setSearching(false)

    // --- INTERACTION TRACKING ---
    // 1. 'search': catat pencarian keyword untuk semua cafe DB milik owner
    dbCafes.forEach(c => recordInteraction(c.id, 'search'))

    // 2. 'view': catat setiap cafe DB yang muncul dalam jangkauan pencarian
    dbCafes.forEach(c => recordInteraction(c.id, 'view'))
    // --- END TRACKING ---

    if (unique.length > 0) {
      setSelectedCafe(unique[0])
      setMapCenter([
        unique[0].latitude,
        unique[0].longitude
      ])
    }
  }

  // Helper untuk hitung jarak (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // metres
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return Math.round(R * c) // dalam meter
  }

  // DB cafes di-normalize agar formatnya sama dengan Foursquare
  const normalizedDbCafes = dbCafes.map(c => {
    const lat = parseFloat(c.latitude)
    const lng = parseFloat(c.longitude)
    const dist = userLocation ? calculateDistance(userLocation[0], userLocation[1], lat, lng) : 0

    return {
      ...c,
      isDb: true,
      fsq_place_id: `db-${c.id}`,
      name: c.cafeName,
      latitude: lat,
      longitude: lng,
      location: { formatted_address: c.address },
      distance: dist,
      categories: [{ short_name: 'Verified' }]
    }
  })

  // Gabungan untuk sidebar: Sort berdasarkan jarak terdekat dari user
  const allCafes = [...normalizedDbCafes, ...cafes].sort((a, b) => {
    if (a.distance === 0) return 1
    if (b.distance === 0) return -1
    return a.distance - b.distance
  })

  const keywordOptions = Object.keys(keywordMapping).slice(0, 8) // Ambil 8 pertama untuk filter cepat

  return (
    <div className="h-screen overflow-hidden bg-slate-100 lg:grid lg:grid-cols-12 gap-4 p-3 lg:p-4 flex flex-col">

      {/* Sidebar */}
      <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl p-4 flex flex-col h-[40vh] lg:h-full overflow-hidden">

        <h1 className="text-xl font-bold text-slate-700 mb-4">
          Café Recommendation ☕
        </h1>

        <div className="mb-4">
          <div className="bg-slate-50 p-1 rounded-2xl flex gap-1 mb-3 border border-slate-100">
            <button
              onClick={() => setSearchMode('surabaya')}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                searchMode === 'surabaya' 
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
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                searchMode === 'current' 
                ? 'bg-white text-blue-600 shadow-sm border border-blue-100' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Lokasi Terdekat
            </button>
          </div>

          <div className="flex gap-2 mb-3">
            <button
              onClick={detectLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl"
              title="Deteksi Lokasi Saya"
            >
              <Navigation size={18} />
            </button>

            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 rounded-xl flex items-center gap-2 flex-1 justify-center"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={18} />
              )}
              {searching ? 'Mencari...' : 'Cari'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {keywordOptions.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className={`px-3 py-2 rounded-full text-sm transition-all ${query === item
                  ? 'bg-blue-600 text-white'
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
          {allCafes.map((cafe) => (
            <div
              key={cafe.fsq_place_id}
              onClick={() => {
                setSelectedCafe(cafe)
                setMapCenter([cafe.latitude, cafe.longitude])
                if (cafe.isDb && cafe.id) {
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
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="lg:col-span-8 flex-1 rounded-3xl overflow-hidden shadow-xl relative h-[55vh] lg:h-full">

        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
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

          {/* DB Cafes - selalu tampil, marker oranye */}
          {dbIcon && normalizedDbCafes.map((cafe) => (
            <Marker
              key={cafe.fsq_place_id}
              position={[cafe.latitude, cafe.longitude]}
              icon={dbIcon}
              eventHandlers={{
                click: () => {
                  setSelectedCafe(cafe)
                  recordInteraction(cafe.id, 'click')
                }
              }}
            >
              <Popup>{cafe.name}</Popup>
            </Marker>
          ))}

          {/* Foursquare Cafes - tampil setelah cari, marker merah persis map/page.tsx */}
          {cafeIcon && cafes.map((cafe) => (
            <Marker
              key={cafe.fsq_place_id}
              position={[cafe.latitude, cafe.longitude]}
              icon={cafeIcon}
              eventHandlers={{
                click: () => setSelectedCafe(cafe)
              }}
            >
              <Popup>{cafe.name}</Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Detail Card - persis struktur map/page.tsx */}
        {selectedCafe && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 sm:bottom-auto sm:w-80 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">

            <div className={`h-48 flex items-center justify-center text-white text-4xl relative ${selectedCafe.isDb ? 'bg-orange-500' : 'bg-blue-600'}`}>
              {selectedCafe.images && selectedCafe.images.length > 0 ? (
                <div className="w-full h-full flex overflow-x-auto snap-x scrollbar-hide">
                  {selectedCafe.images.map((img: any, i: number) => (
                    <img key={i} src={img.url} alt="" className="w-full h-full object-cover shrink-0 snap-center" />
                  ))}
                  {selectedCafe.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold">
                      1 / {selectedCafe.images.length}
                    </div>
                  )}
                </div>
              ) : (
                "☕"
              )}
            </div>

            <div className="p-4">

              <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg text-slate-700 leading-tight">
                  {selectedCafe.name}
                </h2>

                <span className={`text-[10px] px-2 py-1 rounded-full shrink-0 ml-2 ${selectedCafe.isDb ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {selectedCafe.isDb ? 'Verified' : selectedCafe.categories?.[0]?.short_name}
                </span>
              </div>

              {selectedCafe.isDb && (
                <div className="flex items-center gap-1 mt-1">
                  <ShieldCheck size={12} className="text-blue-500" />
                  <span className="text-[10px] text-blue-500 font-bold">SIG Terverifikasi</span>
                </div>
              )}

              <p className="text-sm flex gap-2 mt-3 text-slate-500">
                <MapPin size={16} className="shrink-0 mt-[2px]" />
                {selectedCafe.location?.formatted_address}
              </p>

              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>Distance</span>
                <span>{selectedCafe.distance > 0 ? `${selectedCafe.distance} meter` : '–'}</span>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCafe.latitude},${selectedCafe.longitude}`}
                target="_blank"
                onClick={() => {
                  // 3. 'route': catat klik navigasi hanya untuk cafe DB
                  if (selectedCafe.isDb && selectedCafe.id) {
                    recordInteraction(selectedCafe.id, 'route')
                  }
                }}
                className="mt-4 flex gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl justify-center font-medium transition-all"
              >
                <ExternalLink size={16} />
                Navigasi
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}