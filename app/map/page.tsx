"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import MapComponent from "@/components/MapComponent"
import { getPublicApprovedCafes, getKeywordMappings } from "../dashboard/actions"
import Link from "next/link"
import { ChevronLeft, Coffee } from "lucide-react"

export default function FullMapPage() {
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

  if (loading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin text-blue-600 mb-4">
          <Coffee size={48} />
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Menyiapkan Peta Penuh SIG...</p>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden">
      {/* Back Button Overlay */}
      <div className="fixed top-6 left-6 z-[6000]">
        <Link 
          href="/"
          className="group bg-white/90 backdrop-blur-md border border-slate-200 pl-4 pr-6 py-3 rounded-2xl shadow-2xl hover:bg-white transition-all text-slate-700 flex items-center gap-3 font-bold text-sm"
        >
          <div className="bg-slate-100 group-hover:bg-blue-50 p-1.5 rounded-lg transition-colors">
            <ChevronLeft size={18} className="group-hover:text-blue-600 transition-colors" />
          </div>
          Kembali ke Beranda
        </Link>
      </div>

      <div className="flex-1 w-full h-full">
        <MapComponent dbCafes={dbCafes} keywordMapping={keywordMapping} />
      </div>
    </div>
  )
}