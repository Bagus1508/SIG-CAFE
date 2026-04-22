"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { Tag, Edit, Trash2, Plus, Search, X, Loader2, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getKeywords, createKeyword, updateKeyword, deleteKeyword } from "./actions"
import ConfirmModal from "@/components/ConfirmModal"

export default function KeywordManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [keywords, setKeywords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingKeyword, setEditingKeyword] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Confirm Delete State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; keywordId: number | null }>({
    isOpen: false,
    keywordId: null
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
    key: "",
    value: ""
  })

  // Fetch data
  const loadKeywords = async () => {
    setLoading(true)
    const data = await getKeywords()
    setKeywords(data)
    setLoading(false)
  }

  useEffect(() => {
    loadKeywords()
  }, [])

  const filteredKeywords = keywords.filter(k =>
    k.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (kw?: any) => {
    if (kw) {
      setEditingKeyword(kw)
      setFormData({
        key: kw.key,
        value: kw.value
      })
    } else {
      setEditingKeyword(null)
      setFormData({ key: "", value: "" })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    let res
    if (editingKeyword) {
      res = await updateKeyword(editingKeyword.id, formData)
    } else {
      res = await createKeyword(formData)
    }

    if (res.success) {
      await loadKeywords()
      setIsModalOpen(false)
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete.keywordId) return
    
    const res = await deleteKeyword(confirmDelete.keywordId)
    if (res.success) {
      await loadKeywords()
      setConfirmDelete({ isOpen: false, keywordId: null })
    } else {
      alert(res.error || "Gagal menghapus keyword")
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Keyword</h1>
          <p className="text-slate-500 text-sm">Kelola pemetaan kata kunci pencarian ke API Foursquare</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold"
        >
          <Plus size={18} /> Tambah Keyword
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><Tag size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pemetaan</p>
            <p className="text-xl font-bold text-slate-800">{loading ? "..." : keywords.length}</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center px-4">
          <Search className="text-slate-400 mr-3" size={18} />
          <input
            type="text"
            placeholder="Cari berdasarkan keyword atau hasil pemetaan..."
            className="w-full bg-transparent outline-none text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data Keywords */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-semibold">Input User (Key)</th>
              <th className="p-4 font-semibold text-center"><ArrowRight size={14} className="mx-auto" /></th>
              <th className="p-4 font-semibold">Pencarian API (Value)</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400">
                  <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                  Memuat data...
                </td>
              </tr>
            ) : filteredKeywords.length > 0 ? (
              filteredKeywords.map((kw) => (
                <tr key={kw.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg text-sm">
                      {kw.key}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <ArrowRight size={16} className="mx-auto text-slate-300" />
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-blue-600 italic">
                      "{kw.value}"
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(kw)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, keywordId: kw.id })}
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
                <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                  Tidak ada keyword yang ditemukan.
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
                {editingKeyword ? "Edit Pemetaan" : "Tambah Pemetaan Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Input Kata Kunci (Key)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: cozy"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-700 font-bold"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Ini adalah kata kunci yang diketik user atau ada pada tombol pilihan.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hasil Pemetaan (Value)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: coffee lounge"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-blue-600 font-medium italic"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                />
                <p className="text-[10px] text-slate-400 mt-1.5">Ini adalah query yang akan dikirim ke API Foursquare untuk hasil yang lebih akurat.</p>
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
                  {editingKeyword ? "Simpan Perubahan" : "Simpan Pemetaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Hapus Pemetaan?"
        message="Kata kunci ini tidak akan bisa digunakan lagi untuk pencarian Foursquare otomatis."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, keywordId: null })}
        confirmText="Ya, Hapus"
        type="danger"
      />
    </DashboardLayout>
  )
}
