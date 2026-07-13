"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { Coffee, MapPin, Edit, Plus, Store, Search, Loader2, Trash2, FileSpreadsheet } from "lucide-react"
import { useState, useEffect } from "react"
import { getApprovedCafes } from "./actions"
import { deleteSubmission } from "../submissions/actions"
import Link from "next/link"
import ConfirmModal from "@/components/ConfirmModal"
import ImportModal from "@/components/ImportModal"

export default function CafeManagement() {
  const [cafes, setCafes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  })
  const [isImportOpen, setIsImportOpen] = useState(false)

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
    c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.reqNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async () => {
    if (!confirmDelete.id) return
    
    const res = await deleteSubmission(confirmDelete.id)
    if (res.success) {
      await loadData()
      setConfirmDelete({ isOpen: false, id: null })
    } else {
      alert(res.error || "Gagal menghapus data café")
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Data Café</h1>
          <p className="text-slate-500 text-sm">Kelola informasi seluruh cabang café (Foursquare, Admin, & Owner)</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-semibold cursor-pointer"
          >
            <FileSpreadsheet size={18} /> Import Excel / CSV
          </button>
          <Link 
            href="/dashboard/submissions/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold"
          >
            <Plus size={18} /> Tambah Cabang Baru
          </Link>
        </div>
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
            placeholder="Cari café berdasarkan kode, nama atau lokasi..."
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
                <th className="p-4 font-semibold">Kode</th>
                <th className="p-4 font-semibold">Nama Cabang</th>
                <th className="p-4 font-semibold">Alamat</th>
                <th className="p-4 font-semibold">Kapasitas</th>
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
                    <td className="p-4 text-sm font-bold text-blue-600">{cafe.reqNumber}</td>
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
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-1">
                        <Link 
                          href={`/dashboard/submissions/new?id=${cafe.id}&from=cafes`}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => setConfirmDelete({ isOpen: true, id: cafe.id })}
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
                    Belum ada café yang disetujui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Hapus Data Café?"
        message="Tindakan ini akan menghapus data cabang café secara permanen dari sistem."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        confirmText="Ya, Hapus"
        type="danger"
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={loadData}
      />
    </DashboardLayout>
  )
}