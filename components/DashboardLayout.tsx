"use client"
import { signOut } from "next-auth/react"
import { Home, ListChecks, Store, Users, BarChart3, LogOut, Menu } from "lucide-react" // npm install lucide-react
import { useState } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <BarChart3 size={20} />, label: "Statistik Sistem", href: "/dashboard/statistics" },
    { icon: <ListChecks size={20} />, label: "Daftar Pengajuan", href: "/dashboard/submissions" },
    { icon: <Store size={20} />, label: "Manajemen Cafe", href: "/dashboard/cafes" },
    { icon: <Users size={20} />, label: "Manajemen User", href: "/dashboard/users" },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className={`${isOpen ? "w-64" : "w-20"} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-4">
          <div className="bg-blue-500 p-2 rounded-lg"><ListChecks size={24} /></div>
          {isOpen && <span>SIG CAFE</span>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {menuItems.map((item, index) => (
            <a key={index} href={item.href} className="flex items-center gap-4 p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white">
              {item.icon}
              {isOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <button 
        onClick={() => signOut({ callbackUrl: "/login" })} // Tambahkan ini
        className="m-4 flex items-center gap-4 p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
        >
        <LogOut size={20} />
        {isOpen && <span>Keluar</span>}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-black">
            <Menu />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Admin SIG</span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">A</div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}