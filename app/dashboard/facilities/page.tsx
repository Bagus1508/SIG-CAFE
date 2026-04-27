"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { Wifi, Edit, Trash2, Plus, Search, X, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getFacilities, createFacility, updateFacility, deleteFacility } from "./actions"
import ConfirmModal from "@/components/ConfirmModal"

export default function FacilityManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Confirm Delete State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; facilityId: number | null }>({
    isOpen: false,
    facilityId: null
  })

  // Protect Route
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Form State
  const [formData, setFormData] = useState({
    name: ""
  })

  // Fetch data
  const loadFacilities = async () => {
    setLoading(true)
    const data = await getFacilities()
    setFacilities(data)
    setLoading(false)
  }

  useEffect(() => {
    loadFacilities()
  }, [])

  const filteredFacilities = facilities.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (f?: any) => {
    if (f) {
      setEditingFacility(f)
      setFormData({
        name: f.name
      })
    } else {
      setEditingFacility(null)
      setFormData({ name: "" })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    let res
    if (editingFacility) {
      res = await updateFacility(editingFacility.id, formData)
    } else {
      res = await createFacility(formData)
    }

    if (res.success) {
      await loadFacilities()
      setIsModalOpen(false)
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete.facilityId) return
    
    const res = await deleteFacility(confirmDelete.facilityId)
    if (res.success) {
      await loadFacilities()
      setConfirmDelete({ isOpen: false, facilityId: null })
    } else {
      alert(res.error || "Gagal menghapus fasilitas")
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Fasilitas</h1>
          <p className="text-slate-500 text-sm">Kelola daftar pilihan fasilitas yang dapat dipilih pemilik café</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-purple-500/20 transition-all font-semibold"
        >
          <Plus size={18} /> Tambah Fasilitas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600"><Wifi size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Fasilitas</p>
            <p className="text-xl font-bold text-slate-800">{loading ? "..." : facilities.length}</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center px-4">
          <Search className="text-slate-400 mr-3" size={18} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama fasilitas..."
            className="w-full bg-transparent outline-none text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data Facilities */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-semibold">Nama Fasilitas</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={2} className="p-8 text-center text-slate-400">
                  <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                  Memuat data...
                </td>
              </tr>
            ) : filteredFacilities.length > 0 ? (
              filteredFacilities.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <Wifi size={14} />
                       </div>
                       <span className="font-bold text-slate-700">{f.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(f)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, facilityId: f.id })}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-8 text-center text-slate-400 italic">
                  Tidak ada fasilitas yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                {editingFacility ? "Edit Fasilitas" : "Tambah Fasilitas Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Fasilitas</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: WiFi Cepat"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm text-gray-700 font-bold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
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
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {editingFacility ? "Simpan Perubahan" : "Simpan Fasilitas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Hapus Fasilitas?"
        message="Fasilitas ini akan dihapus dari pilihan yang tersedia untuk pemilik café."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, facilityId: null })}
        confirmText="Ya, Hapus"
        type="danger"
      />
    </DashboardLayout>
  )
}
