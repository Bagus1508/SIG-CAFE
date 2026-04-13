"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { Users, UserPlus, Mail, ShieldCheck, MoreVertical, Edit2, Trash } from "lucide-react"
import { useState } from "react"

const initialOwners = [
  { id: 1, nama: "Budi Santoso", email: "budi.owner@sigcafe.id", role: "Owner", lokasi: "Surabaya", status: "Aktif" },
  { id: 2, nama: "Siti Aminah", email: "siti.aminah@sigcafe.id", role: "Owner", lokasi: "Sidoarjo", status: "Aktif" },
  { id: 3, nama: "Andi Wijaya", email: "andi.w@sigcafe.id", role: "Owner", lokasi: "Surabaya", status: "Non-Aktif" },
]

export default function UserManagement() {
  const [owners] = useState(initialOwners)

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen User (Owner)</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola hak akses dan akun pemilik café di seluruh cabang</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-semibold text-sm">
          <UserPlus size={18} /> Tambah Owner Baru
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Owner</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{owners.length}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
              <Users size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-bold">Profil Owner</th>
                <th className="p-4 font-bold">Role</th>
                <th className="p-4 font-bold">Lokasi Cabang</th>
                <th className="p-4 font-bold">Status Akun</th>
                <th className="p-4 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {owners.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center text-slate-600 font-bold">
                        {user.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 leading-none">{user.nama}</p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Mail size={12} /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      <ShieldCheck size={16} className="text-indigo-500" />
                      {user.role}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {user.lokasi}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      user.status === 'Aktif' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.status === 'Aktif' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all shadow-sm border border-transparent hover:border-indigo-100">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shadow-sm border border-transparent hover:border-red-100">
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}