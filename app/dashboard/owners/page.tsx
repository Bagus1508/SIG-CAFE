"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { 
  MousePointerClick, 
  MapPin, 
  Users, 
  TrendingUp, 
  Search,
  ArrowUpRight,
  Navigation
} from "lucide-react"

export default function OwnerDashboard() {
  // Statistik Fokus Pengunjung & Klik
  const stats = [
    { 
      label: "Total Klik Lokasi", 
      value: "1,284", 
      trend: "+15.2%", 
      icon: <MousePointerClick size={20} className="text-blue-600" />,
      color: "bg-blue-50"
    },
    { 
      label: "Dilihat di Peta", 
      value: "3,502", 
      trend: "+8.4%", 
      icon: <MapPin size={20} className="text-emerald-600" />,
      color: "bg-emerald-50"
    },
    { 
      label: "Permintaan Rute", 
      value: "450", 
      trend: "+12.1%", 
      icon: <Navigation size={20} className="text-orange-600" />,
      color: "bg-orange-50"
    },
    { 
      label: "Pencarian Kata Kunci", 
      value: "892", 
      trend: "-2.4%", 
      icon: <Search size={20} className="text-indigo-600" />,
      color: "bg-indigo-50"
    },
  ]

  const topLocations = [
    { name: "SIG Cafe Pusat", clicks: 542, conversion: "12%" },
    { name: "SIG Cafe Surabaya", clicks: 421, conversion: "10%" },
    { name: "SIG Cafe Sidoarjo", clicks: 321, conversion: "7%" },
  ]

  const data = [40, 65, 30, 80, 55];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Analitik Pengunjung Peta 📍</h1>
        <p className="text-slate-500 text-sm mt-1">Pantau seberapa sering lokasi café Anda diklik dan dicari oleh pengguna.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 ${stat.color} rounded-xl`}>{stat.icon}</div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Grafik Tren Klik (Simple CSS Bar) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" /> Tren Klik Mingguan
            </h2>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 px-2">
            {data.map((h, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:brightness-110" 
                  style={{ height: `${h}%` }}
                ></div>
                <span className="text-[10px] text-slate-400 mt-2 font-bold uppercase">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lokasi Paling Populer */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-6">Titik Terpopuler</h2>
          <div className="space-y-6">
            {topLocations.map((loc, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex justify-between text-sm mb-2 font-semibold">
                  <span className="text-slate-700">{loc.name}</span>
                  <span className="text-blue-600">{loc.clicks} Klik</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all" 
                    style={{ width: `${(loc.clicks / 600) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500 leading-relaxed text-center italic">
              Data di atas dihitung berdasarkan interaksi User pada Marker Peta di halaman depan.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}