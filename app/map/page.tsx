"use client"

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { Search, Navigation, MapPin, ExternalLink } from 'lucide-react'
import { getKeywordMappings } from '../dashboard/actions'
import { fetchCafes } from '@/lib/foursquare'

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

export default function Page() {
  const southSurabaya: [number, number] = [-7.3365, 112.7378]
  const [mapCenter, setMapCenter] = useState<[number, number]>(southSurabaya)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [cafes, setCafes] = useState<any[]>([])
  const [selectedCafe, setSelectedCafe] = useState<any>(null)
  const [query, setQuery] = useState("")
  const [userIcon, setUserIcon] = useState<any>(null)
  const [cafeIcon, setCafeIcon] = useState<any>(null)
  const [keywordMapping, setKeywordMapping] = useState<Record<string, string>>({})

  useEffect(() => {
    getKeywordMappings().then(setKeywordMapping)
    
    import('leaflet').then(L => {
      setUserIcon(new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }))

      setCafeIcon(new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
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

  const handleSearch = async () => {
    const mapped = keywordMapping[query.toLowerCase()] || query || "coffee shop"

    const surabayaSouthCenters = [
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

    let allResults: any[] = []

    for (const center of surabayaSouthCenters) {
      const data = await fetchCafes(mapped, center[0], center[1])

      const filtered = (data.results || []).filter((place: any) =>
        place.categories?.some((cat: any) =>
          cat.name.toLowerCase().includes('coffee') ||
          cat.name.toLowerCase().includes('cafe')
        )
      )

      allResults.push(...filtered)
    }

    // Hapus duplikat berdasarkan fsq_place_id
    const unique = Array.from(
      new Map(allResults.map(item => [item.fsq_place_id, item])).values()
    )

    // Sort terdekat
    unique.sort((a: any, b: any) => a.distance - b.distance)

    setCafes(unique)

    if (unique.length > 0) {
      setSelectedCafe(unique[0])
      setMapCenter([
        unique[0].latitude,
        unique[0].longitude
      ])
    }
  }

  const keywordOptions = Object.keys(keywordMapping).slice(0, 8)

  return (
    <div className="h-screen overflow-hidden bg-slate-100 lg:grid lg:grid-cols-12 gap-4 p-3 lg:p-4 flex flex-col">

      {/* Sidebar */}
    <div className="lg:col-span-4 bg-white rounded-3xl shadow-xl p-4 flex flex-col h-[40vh] lg:h-full overflow-hidden">

        <h1 className="text-xl font-bold text-slate-700 mb-4">
          Café Recommendation ☕
        </h1>

        <div className="mb-4">

          <div className="flex gap-2 mb-3">
            <button
              onClick={detectLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl"
            >
              <Navigation size={18} />
            </button>

            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl flex items-center gap-2"
            >
              <Search size={18} />
              Cari
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {keywordOptions.map((item) => (
              <button
                key={item}
                onClick={() => setQuery(item)}
                className={`px-3 py-2 rounded-full text-sm transition-all ${
                  query === item
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {cafes.map((cafe) => (
            <div
              key={cafe.fsq_place_id}
              onClick={() => {
                setSelectedCafe(cafe)
                setMapCenter([cafe.latitude, cafe.longitude])
              }}
              className="p-3 rounded-2xl border hover:bg-slate-50 cursor-pointer transition-all shadow-sm"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                  ☕
                </div>

                <div className="flex-1">
                  <h2 className="font-semibold text-sm text-slate-700">
                    {cafe.name}
                  </h2>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {cafe.location?.formatted_address}
                  </p>

                  <div className="mt-2 flex justify-between">
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                      {cafe.categories?.[0]?.short_name || 'Cafe'}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {cafe.distance} m
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

        {/* Floating Detail Card */}
        {selectedCafe && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 sm:bottom-auto sm:w-80 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">

            <div className="h-24 bg-blue-600 flex items-center justify-center text-white text-4xl">
              ☕
            </div>

            <div className="p-4">

              <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg text-slate-700 leading-tight">
                  {selectedCafe.name}
                </h2>

                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {selectedCafe.categories?.[0]?.short_name}
                </span>
              </div>

              <p className="text-sm flex gap-2 mt-3 text-slate-500">
                <MapPin size={16} className="shrink-0 mt-[2px]" />
                {selectedCafe.location?.formatted_address}
              </p>

              <div className="mt-3 flex justify-between text-xs text-slate-400">
                <span>Distance</span>
                <span>{selectedCafe.distance} meter</span>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCafe.latitude},${selectedCafe.longitude}`}
                target="_blank"
                className="mt-4 flex gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl justify-center font-medium"
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