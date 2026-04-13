"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { Eye, CheckCircle, XCircle, Search, Filter } from "lucide-react"

// Data Dummy Pengajuan
const submissions = [
  { id: "REQ-001", cafe: "SIG Cafe Pusat", owner: "Budi Santoso", date: "2026-04-10", status: "Pending", total: "Rp 5.000.000" },
  { id: "REQ-002", cafe: "SIG Cafe Surabaya", owner: "Siti Aminah", date: "2026-04-11", status: "Disetujui", total: "Rp 12.400.000" },
  { id: "REQ-003", cafe: "SIG Cafe Sidoarjo", owner: "Andi Wijaya", date: "2026-04-12", status: "Ditolak", total: "Rp 2.100.000" },
]

export default function SubmissionList() {
  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daftar Pengajuan Café</h1>
          <p className="text-slate-500">Kelola dan tinjau semua pengajuan lokasi Café dari Owner</p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari ID atau Owner..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {/* Tabel Pengajuan */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="p-4 font-semibold">ID Pengajuan</th>
                <th className="p-4 font-semibold">Nama Café</th>
                <th className="p-4 font-semibold">Owner</th>
                <th className="p-4 font-semibold">Tanggal</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {submissions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4 text-sm font-bold text-blue-600">{item.id}</td>
                  <td className="p-4 text-sm font-medium text-slate-700">{item.cafe}</td>
                  <td className="p-4 text-sm text-slate-600">{item.owner}</td>
                  <td className="p-4 text-sm text-slate-500">{item.date}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Disetujui' ? 'bg-green-100 text-green-600' :
                      item.status === 'Ditolak' ? 'bg-red-100 text-red-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Lihat Detail">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Setujui">
                        <CheckCircle size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Tolak">
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Dummy */}
        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">Menampilkan 3 dari 3 pengajuan</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-50" disabled>Sebelumnya</button>
            <button className="px-3 py-1 bg-white border border-slate-200 rounded text-xs">Selanjutnya</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}