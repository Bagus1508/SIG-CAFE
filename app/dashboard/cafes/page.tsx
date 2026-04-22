"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { Coffee, MapPin, Edit, Plus, Store, Search, X, Loader2, Navigation } from "lucide-react"
import { useState, useEffect } from "react"
import { getApprovedCafes, updateCafeInfo } from "./actions"
import Link from "next/link"

export default function CafeManagement() {
  const [cafes, setCafes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCafe, setEditingCafe] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    cafeName: "",
    capacity: "",
    address: "",
    latitude: "",
    longitude: "",
  })

  const loadData = async () => {
    setLoading(true)
    const data = await getApprovedCafes()
    setCafes(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredCafes = cafes.filter(c => 
    c.cafeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (cafe: any) => {
    setEditingCafe(cafe)
    setFormData({
      cafeName: cafe.cafeName,
      capacity: cafe.capacity.toString(),
      address: cafe.address,
      latitude: cafe.latitude,
      longitude: cafe.longitude,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await updateCafeInfo(editingCafe.id, formData)
    if (res.success) {
      await loadData()
      setIsModalOpen(false)
    } else {
      alert(res.error || "Gagal memperbarui data café")
    }
    setSubmitting(false)
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Data Café</h1>
          <p className="text-slate-500 text-sm">Kelola informasi cabang café Anda yang sudah aktif</p>
        </div>
        <Link 
          href="/dashboard/submissions/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold"
        >
          <Plus size={18} /> Tambah Cabang Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Store size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Cabang Aktif</p>
            <p className="text-xl font-bold text-slate-800">{loading ? "..." : cafes.length}</p>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center px-4">
          <Search className="text-slate-400 mr-3" size={18} />
          <input 
            type="text" 
            placeholder="Cari café berdasarkan nama atau lokasi..."
            className="w-full bg-transparent outline-none text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data Cafe */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-semibold">Nama Cabang</th>
                <th className="p-4 font-semibold">Alamat</th>
                <th className="p-4 font-semibold">Kapasitas</th>
                <th className="p-4 font-semibold">Koordinat</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Memuat data café...
                  </td>
                </tr>
              ) : filteredCafes.length > 0 ? (
                filteredCafes.map((cafe) => (
                  <tr key={cafe.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Coffee size={16} /></div>
                        <span className="font-bold text-slate-700">{cafe.cafeName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-300" /> {cafe.address}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">{cafe.capacity} Kursi</td>
                    <td className="p-4 text-xs font-mono text-slate-400 italic">
                      {cafe.latitude}, {cafe.longitude}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenModal(cafe)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                    Belum ada café yang disetujui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Edit Cafe */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Perbarui Informasi Café</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Cabang</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-700"
                    value={formData.cafeName}
                    onChange={(e) => setFormData({...formData, cafeName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kapasitas Kursi</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-700"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alamat Lengkap</label>
                <textarea
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-700"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Navigation size={10} /> Latitude
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-mono text-gray-700"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Navigation size={10} /> Longitude
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-mono text-gray-700"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}