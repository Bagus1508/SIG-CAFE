"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { BarChart3, TrendingUp, AlertCircle, Coffee, Users, ClipboardCheck, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function StatisticsPage() {
  // Data dummy untuk statistik
  const stats = [
    { label: "Total Pengajuan", value: "128", trend: "+12%", up: true, icon: <ClipboardCheck className="text-blue-600" /> },
    { label: "Cabang Aktif", value: "12", trend: "0%", up: true, icon: <Coffee className="text-orange-600" /> },
    { label: "Total Owner", value: "8", trend: "+2", up: true, icon: <Users className="text-indigo-600" /> },
    { label: "Pengajuan Ditolak", value: "3", trend: "-5%", up: false, icon: <AlertCircle className="text-red-600" /> },
  ]

  const topCafes = [
    { name: "SIG Cafe Pusat", requests: 45, percentage: "85%" },
    { name: "SIG Cafe Surabaya", requests: 38, percentage: "70%" },
    { name: "SIG Cafe Sidoarjo", requests: 22, percentage: "45%" },
  ]

  const data = [40, 65, 30, 80, 55];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Statistik Sistem</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau performa operasional SIG Cafe secara real-time</p>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-xl">{stat.icon}</div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${stat.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ringkasan Aktivitas (Chart Placeholder) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-600" /> Tren Pengajuan Bulanan
            </h2>
            <select className="text-xs bg-slate-50 border-none rounded-lg p-2 outline-none font-medium text-slate-600">
              <option>6 Bulan Terakhir</option>
              <option>1 Tahun Terakhir</option>
            </select>
          </div>
        <div className="h-64 bg-slate-50 rounded-2xl flex items-end justify-around p-4 gap-2">
        {data.map((h, i) => (
            <div
            key={i}
            className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600 cursor-pointer"
            style={{ height: `${h}%` }}
            ></div>
        ))}
        </div>
          <div className="flex justify-around mt-4 text-xs text-slate-400 font-medium uppercase tracking-widest">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span>
          </div>
        </div>

        {/* Top Performing Cafes */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" /> Aktivitas Cabang
          </h2>
          <div className="space-y-6">
            {topCafes.map((cafe, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">{cafe.name}</span>
                  <span className="text-slate-500">{cafe.requests} Req</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: cafe.percentage }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
              💡 <strong>Tips:</strong> SIG Cafe Pusat memiliki frekuensi pengajuan tertinggi bulan ini. Pastikan stok logistik aman.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}