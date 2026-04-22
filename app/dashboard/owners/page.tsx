"use client"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import {
  MousePointerClick,
  MapPin,
  TrendingUp,
  Search,
  ArrowUpRight,
  Navigation,
  Loader2,
  Store,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react"
import { getDashboardStats, getDailyInteractions } from "../actions"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function OwnerDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<any>(null)
  const [chartData, setChartData] = useState<{ label: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadData = async () => {
    setLoading(true)
    const [data, daily] = await Promise.all([
      getDashboardStats(),
      getDailyInteractions()
    ])
    setStats(data)
    setChartData(daily as any[])
    setLastRefresh(new Date())
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    // Auto refresh setiap 30 detik
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fmt = (val: number) => val?.toLocaleString('id-ID') ?? '0'

  const maxChart = Math.max(...chartData.map(d => d.count), 1)

  const analyticCards = [
    {
      label: "Total Klik Lokasi",
      value: fmt(stats?.analytics?.clicks ?? 0),
      icon: <MousePointerClick size={20} className="text-blue-600" />,
      color: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Dilihat di Peta",
      value: fmt(stats?.analytics?.views ?? 0),
      icon: <MapPin size={20} className="text-emerald-600" />,
      color: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      label: "Permintaan Rute",
      value: fmt(stats?.analytics?.routes ?? 0),
      icon: <Navigation size={20} className="text-orange-600" />,
      color: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      label: "Pencarian Kata Kunci",
      value: fmt(stats?.analytics?.searches ?? 0),
      icon: <Search size={20} className="text-indigo-600" />,
      color: "bg-indigo-50",
      textColor: "text-indigo-600"
    },
  ]

  const totalInteractions = (stats?.analytics?.clicks ?? 0) +
    (stats?.analytics?.views ?? 0) +
    (stats?.analytics?.routes ?? 0) +
    (stats?.analytics?.searches ?? 0)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Halo, {session?.user?.name || "Owner"} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {totalInteractions > 0
              ? `Total ${fmt(totalInteractions)} interaksi tercatat dari pengunjung peta Anda.`
              : "Pantau seberapa sering lokasi café Anda diklik dan dicari oleh pengguna."}
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-400 font-medium">Menghubungkan ke basis data real-time...</p>
        </div>
      ) : (
        <>
          {/* Analytic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {analyticCards.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 ${stat.color} rounded-xl`}>{stat.icon}</div>
                  <span className={`text-xs font-bold ${stat.textColor} opacity-60`}>real-time</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Tren Mingguan - Data Riil */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-600" /> Tren Interaksi Mingguan
                </h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Live</span>
                </div>
              </div>

              {chartData.length > 0 && chartData.some(d => d.count > 0) ? (
                <div className="h-52 flex items-end justify-between gap-2 px-2">
                  {chartData.map((day, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <span className="text-[10px] text-blue-600 font-bold mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {day.count}
                      </span>
                      <div
                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-xl transition-all duration-700 cursor-pointer"
                        style={{ height: `${Math.max((day.count / maxChart) * 100, 4)}%` }}
                      />
                      <span className="text-[10px] text-slate-400 mt-2 font-bold capitalize">{day.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-52 flex flex-col items-center justify-center text-slate-300">
                  <TrendingUp size={48} className="mb-3 opacity-30" />
                  <p className="text-sm font-bold">Belum ada interaksi minggu ini.</p>
                  <p className="text-xs mt-1 text-slate-400">Data akan muncul setelah pengunjung mengklik lokasi Anda di peta.</p>
                </div>
              )}
            </div>

            {/* Titik Terpopuler - Data Riil */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
              <h2 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                Titik Terpopuler
                <ArrowUpRight size={18} className="text-blue-600" />
              </h2>

              <div className="space-y-5 flex-1">
                {stats?.popularity?.length > 0 ? (
                  stats.popularity.map((loc: any, i: number) => (
                    <div key={i} className="flex flex-col">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-bold text-slate-700 truncate mr-2">{loc.name}</span>
                        <span className="text-blue-600 font-bold shrink-0">{loc.clicks} Klik</span>
                      </div>
                      <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                          style={{
                            width: `${stats.popularity[0].clicks > 0 ? (loc.clicks / stats.popularity[0].clicks) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-10 text-slate-300">
                    <MapPin size={36} className="mb-3 opacity-30" />
                    <p className="text-xs font-bold text-center">Belum ada data popularitas.</p>
                    <p className="text-[10px] text-slate-400 text-center mt-1">
                      Akan muncul otomatis saat pengunjung klik café Anda.
                    </p>
                  </div>
                )}
              </div>

              {/* Daftar Café Aktif */}
              {stats?.myLatest?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Café Saya</p>
                  <div className="space-y-2">
                    {stats.myLatest.map((cafe: any) => (
                      <div key={cafe.id} className="flex items-center gap-2 text-sm">
                        <ShieldCheck size={14} className="text-blue-500 shrink-0" />
                        <span className="text-slate-600 font-medium truncate">{cafe.cafeName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <Store size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Daftarkan Titik Baru</h3>
                <p className="text-blue-100 text-sm opacity-80">
                  Perluas jaringan café Anda dan pantau analitik lokasinya secara real-time.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/submissions/new"
              className="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all flex items-center gap-2 text-sm uppercase tracking-wider shrink-0"
            >
              Buat Pengajuan <ChevronRight size={18} />
            </Link>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}