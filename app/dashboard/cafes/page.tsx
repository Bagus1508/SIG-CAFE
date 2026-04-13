"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { Coffee, MapPin, Edit, Trash2, Plus, Store } from "lucide-react"
import { useState } from "react"

// Data Dummy Lokasi Cafe
const initialCafes = [
  { id: 1, nama: "SIG Cafe Pusat", alamat: "Jl. Ahmad Yani No. 10, Surabaya", kapasitas: 50, status: "Aktif" },
  { id: 2, nama: "SIG Cafe Sidoarjo", alamat: "Jl. Gajah Mada No. 5, Sidoarjo", kapasitas: 30, status: "Aktif" },
  { id: 3, nama: "SIG Cafe Merr", alamat: "Jl. Ir. Soekarno, Surabaya", kapasitas: 45, status: "Renovasi" },
]

export default function CafeManagement() {
  const [cafes] = useState(initialCafes)

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Data Café</h1>
          <p className="text-slate-500 text-sm">Kelola lokasi dan informasi cabang café Anda</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold">
          <Plus size={18} /> Tambah Cabang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card Ringkasan Cabang */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><Store size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Cabang</p>
            <p className="text-xl font-bold text-slate-800">{cafes.length}</p>
          </div>
        </div>
      </div>

      {/* Tabel Data Cafe */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-semibold">Nama Cabang</th>
              <th className="p-4 font-semibold">Alamat</th>
              <th className="p-4 font-semibold">Kapasitas</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {cafes.map((cafe) => (
              <tr key={cafe.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><Coffee size={16} /></div>
                    <span className="font-bold text-slate-700">{cafe.nama}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} /> {cafe.alamat}
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600 font-medium">{cafe.kapasitas} Kursi</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    cafe.status === 'Aktif' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {cafe.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}