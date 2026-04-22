"use client"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { BarChart3, TrendingUp, AlertCircle, Coffee, Users, ClipboardCheck, ArrowUpRight, ArrowDownRight, Loader2, MapPin } from "lucide-react"
import { getDashboardStats } from "./actions"
import { useSession } from "next-auth/react"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    const data = await getDashboardStats()
    setStats(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const statCards = [
    { label: "Total Pengajuan", value: stats?.totalSubmissions || 0, icon: <ClipboardCheck className="text-blue-600" />, color: "bg-blue-50" },
    { label: "Cabang Aktif", value: stats?.activeCafes || 0, icon: <Coffee className="text-orange-600" />, color: "bg-orange-50" },
    { label: "Total Owner", value: stats?.totalOwners || 0, icon: <Users className="text-indigo-600" />, color: "bg-indigo-50" },
    { label: "Pengajuan Ditolak", value: stats?.rejectedSubmissions || 0, icon: <AlertCircle className="text-red-600" />, color: "bg-red-50" },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang, {session?.user?.name || "User"}</h1>
        <p className="text-slate-500 text-sm mt-1">Berikut adalah ringkasan performa operasional SIG Cafe hari ini.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-400 font-medium">Menyiapkan dashboard Anda...</p>
        </div>
      ) : (
        <>
          {/* Grid Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                  <div className="bg-slate-50 text-[10px] font-bold px-2 py-1 rounded-lg text-slate-400 uppercase tracking-wider">Real-time</div>
                </div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Aktivitas Terbaru */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-600" /> Pengajuan Terbaru
                </h2>
              </div>
              <div className="space-y-4">
                {stats?.latestSubmissions?.length > 0 ? (
                  stats.latestSubmissions.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-xl shadow-sm text-blue-600 font-bold text-xs">{sub.reqNumber}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{sub.cafeName}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin size={10} /> {sub.address}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        sub.status === 'Disetujui' ? 'bg-green-100 text-green-600' : 
                        sub.status === 'Ditolak' ? 'bg-red-100 text-red-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-400 py-10">Belum ada pengajuan masuk.</p>
                )}
              </div>
            </div>

            {/* Insight Ringkas */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" /> Ringkasan Sistem
              </h2>
              <div className="space-y-6">
                <div className="p-5 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <p className="text-xs text-indigo-700 font-medium leading-relaxed">
                    Sistem SIG Cafe saat ini memiliki <strong>{stats?.activeCafes} cabang aktif</strong> yang tersebar. 
                    Monitor terus setiap pengajuan lokasi baru untuk ekspansi bisnis yang lebih baik.
                  </p>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Konversi Pengajuan</span>
                    <span className="font-bold text-slate-800">
                      {stats?.totalSubmissions > 0 ? Math.round((stats.activeCafes / stats.totalSubmissions) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${stats?.totalSubmissions > 0 ? (stats.activeCafes / stats.totalSubmissions) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}