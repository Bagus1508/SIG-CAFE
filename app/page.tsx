"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Map as MapIcon, Coffee, Search, ShieldCheck, Navigation2, LogIn, LayoutDashboard, Store } from "lucide-react"
import MapComponent from "@/components/MapComponent"
import { getPublicApprovedCafes, getKeywordMappings } from "./dashboard/actions"

export default function LandingPage() {
  const { data: session } = useSession()
  const [dbCafes, setDbCafes] = useState<any[]>([])
  const [keywordMapping, setKeywordMapping] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPublicApprovedCafes(),
      getKeywordMappings()
    ]).then(([cafes, keywords]) => {
      setDbCafes(cafes)
      setKeywordMapping(keywords)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Premium Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[2000] bg-white/70 backdrop-blur-md border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30">
              <MapIcon className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">SIG Cafe</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <a href="#map" className="hover:text-blue-600 transition-colors">Eksplorasi Peta</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Tentang SIG</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Bantuan</a>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-slate-900/10"
              >
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20"
              >
                <LogIn size={18} /> Masuk Akun
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-20 flex flex-col">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100">
            <ShieldCheck size={14} /> Sistem Informasi Geografis Terverifikasi
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
            Temukan Titik <span className="text-blue-600">Café Terbaik</span> di Sekitar Anda.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
            SIG Cafe memudahkan Anda mencari lokasi nongkrong yang strategis dengan data geografis yang akurat dan terverifikasi oleh tim kami.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#map" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-2xl shadow-slate-900/20">
              Mulai Eksplorasi <Navigation2 size={18} className="rotate-45" />
            </a>
            {!session && (
              <Link href="/register" className="bg-white text-blue-600 border-2 border-blue-600 px-10 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2">
                <Store size={18} /> Daftar Sebagai Owner
              </Link>
            )}
            <div className="bg-white px-8 py-4 rounded-2xl border border-slate-200 text-slate-600 font-bold flex items-center gap-2 shadow-sm">
              <Coffee size={18} className="text-orange-500" /> {dbCafes.length}+ Lokasi Terdaftar
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section id="map" className="flex-1 min-h-[700px] p-4 md:p-8 bg-white">
          <div className="w-full h-full max-w-7xl mx-auto">
            {loading ? (
              <div className="w-full h-[600px] bg-slate-50 rounded-[3rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
                <div className="animate-spin text-blue-600 mb-4">
                  <Coffee size={40} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Menyiapkan Peta SIG...</p>
              </div>
            ) : (
              <div className="w-full h-[700px]">
                <MapComponent dbCafes={dbCafes} keywordMapping={keywordMapping} />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <div className="bg-slate-900 p-2 rounded-lg">
              <MapIcon className="text-white" size={20} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">SIG Cafe</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © 2026 SIG Cafe. Developed with Leaflet, OSM, and Foursquare.
          </p>
          <div className="flex gap-6 text-slate-400 text-sm font-bold">
            <a href="#" className="hover:text-blue-600">Privacy</a>
            <a href="#" className="hover:text-blue-600">Terms</a>
            <a href="#" className="hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}