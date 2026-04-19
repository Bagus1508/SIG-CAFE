"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { useState } from "react"
import { 
  MapPin, 
  Store, 
  Image as ImageIcon, 
  Send, 
  ArrowLeft,
  Info,
  Navigation
} from "lucide-react"
import Link from "next/link"

export default function NewSubmissionPage() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulasi pengiriman data
    setTimeout(() => {
      setLoading(false)
      alert("Pengajuan berhasil dikirim!")
    }, 2000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/submissions" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Form Pengajuan Café</h1>
              <p className="text-slate-500 text-sm">Lengkapi data untuk mendaftarkan titik lokasi café baru.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Umum */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <Store size={20} />
              <h2 className="font-bold text-slate-800">Informasi Café</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Café</label>
                <input 
                  required
                  type="text" 
                  placeholder="Contoh: SIG Cafe Merr"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kapasitas Kursi</label>
                <input 
                  required
                  type="number" 
                  placeholder="Jumlah kursi"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Jl. Ahmad Yani No. 10, Surabaya..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Koordinat SIG (Penting!) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-emerald-600">
              <Navigation size={20} />
              <h2 className="font-bold text-slate-800">Titik Koordinat (GIS)</h2>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3 mb-6">
              <Info className="text-emerald-600 shrink-0" size={20} />
              <p className="text-xs text-emerald-700 leading-relaxed">
                Pastikan koordinat sesuai dengan titik di Google Maps untuk akurasi pemetaan sistem SIG Cafe.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Latitude</label>
                <input 
                  required
                  type="text" 
                  placeholder="-7.123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Longitude</label>
                <input 
                  required
                  type="text" 
                  placeholder="112.123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Upload Foto */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-orange-600">
              <ImageIcon size={20} />
              <h2 className="font-bold text-slate-800">Dokumentasi Lokasi</h2>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-orange-400 transition-colors cursor-pointer group">
              <div className="p-4 bg-orange-50 rounded-full text-orange-500 group-hover:scale-110 transition-transform mb-4">
                <ImageIcon size={32} />
              </div>
              <p className="text-sm font-bold text-slate-700">Klik atau seret foto café di sini</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
              <input type="file" className="hidden" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pb-12">
            <button 
              type="button" 
              className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Simpan Draft
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              {loading ? "Mengirim..." : (
                <>
                  Kirim Pengajuan <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}