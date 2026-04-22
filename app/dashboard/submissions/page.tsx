"use client"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { Eye, CheckCircle, XCircle, Search, Filter, Plus, Edit, Trash2, X, Loader2, ClipboardList, MapPin, Info } from "lucide-react"
import { getSubmissions, deleteSubmission } from "./actions"
import Link from "next/link"
import ConfirmModal from "@/components/ConfirmModal"

export default function SubmissionList() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  })

  const loadData = async () => {
    setLoading(true)
    const data = await getSubmissions()
    setSubmissions(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredData = submissions.filter(s => 
    s.cafeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.reqNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!confirmDelete.id) return
    
    const res = await deleteSubmission(confirmDelete.id)
    if (res.success) {
      await loadData()
      setConfirmDelete({ isOpen: false, id: null })
    } else {
      alert(res.error || "Gagal menghapus data")
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Pengajuan Café</h1>
          <p className="text-slate-500 text-sm">Kelola dan pantau status pengajuan cabang baru</p>
        </div>
        <Link 
          href="/dashboard/submissions/new"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold"
        >
          <Plus size={18} /> Tambah Pengajuan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><ClipboardList size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pengajuan</p>
            <p className="text-xl font-bold text-slate-800">{loading ? "..." : submissions.length}</p>
          </div>
        </div>
        
        <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center px-4">
          <Search className="text-slate-400 mr-3" size={18} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan kode atau nama café..."
            className="w-full bg-transparent outline-none text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
              <tr>
                <th className="p-4 font-semibold">KODE</th>
                <th className="p-4 font-semibold">CAFÉ & ALAMAT</th>
                <th className="p-4 font-semibold">KAPASITAS</th>
                <th className="p-4 font-semibold">STATUS</th>
                <th className="p-4 font-semibold text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-sm font-bold text-blue-600">{item.reqNumber}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{item.cafeName}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5 mt-0.5">
                          <MapPin size={10} /> {item.address}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 font-medium">
                      {item.capacity} Kursi
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1 ${
                          item.status === 'Disetujui' ? 'bg-green-100 text-green-600' : 
                          item.status === 'Ditolak' ? 'bg-red-100 text-red-600' : 
                          item.status === 'Revisi' ? 'bg-amber-100 text-amber-600' :
                          item.status === 'Dibatalkan' ? 'bg-slate-100 text-slate-500' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                        {item.status === 'Revisi' && item.revisionNote && (
                          <div className="flex items-start gap-1 text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100 max-w-[200px]">
                            <Info size={12} className="shrink-0 mt-0.5" />
                            <span>{item.revisionNote}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Link 
                          href={`/dashboard/submissions/new?id=${item.id}`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => setConfirmDelete({ isOpen: true, id: item.id })}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                    Belum ada data pengajuan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Hapus Data Pengajuan?"
        message="Tindakan ini akan menghapus data pengajuan secara permanen dari sistem."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        confirmText="Ya, Hapus"
        type="danger"
      />
    </DashboardLayout>
  )
}