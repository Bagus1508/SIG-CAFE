"use client"
import { signOut, useSession } from "next-auth/react"
import { Home, ListChecks, Store, Users, BarChart3, LogOut, Menu, PlusSquare, CheckSquare, Tag, Wifi, Globe } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(true)

  const role = (session?.user as any)?.role || "user"
  const userName = session?.user?.name || "User"

  const adminMenu = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
    { icon: <CheckSquare size={20} />, label: "Persetujuan Lokasi", href: "/dashboard/approvals" },
    { icon: <ListChecks size={20} />, label: "Daftar Pengajuan", href: "/dashboard/submissions" },
    { icon: <Store size={20} />, label: "Manajemen Cafe", href: "/dashboard/cafes" },
    { icon: <Users size={20} />, label: "Manajemen User", href: "/dashboard/users" },
    { icon: <Tag size={20} />, label: "Manajemen Keyword", href: "/dashboard/keywords" },
    { icon: <Wifi size={20} />, label: "Manajemen Fasilitas", href: "/dashboard/facilities" },
  ]

  const ownerMenu = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard/owners" },
    { icon: <PlusSquare size={20} />, label: "Pengajuan Lokasi", href: "/dashboard/submissions/new" },
    { icon: <ListChecks size={20} />, label: "Status Pengajuan", href: "/dashboard/submissions" },
  ]

  const userMenu = [
    { icon: <Home size={20} />, label: "Dashboard", href: "/dashboard" },
  ]

  const menuItems = role === "admin" ? adminMenu : role === "owner_cafe" ? ownerMenu : userMenu

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1400] lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-[1500] lg:relative lg:z-0
        ${isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"} 
        bg-slate-900 text-white transition-all duration-300 flex flex-col h-full shrink-0 shadow-2xl lg:shadow-none
      `}>
        <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-4 shrink-0 justify-between lg:justify-start">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-2 rounded-lg"><ListChecks size={24} /></div>
            {(isOpen || typeof window !== 'undefined' && window.innerWidth < 1024) && <span className="truncate">SIG CAFE</span>}
          </div>
          {/* Close button only on mobile */}
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href} className="flex items-center gap-4 p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white whitespace-nowrap">
              <div className="shrink-0">{item.icon}</div>
              {(isOpen || typeof window !== 'undefined' && window.innerWidth < 1024) && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-4 p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white whitespace-nowrap"
          >
            <Globe size={20} className="shrink-0" />
            {(isOpen || typeof window !== 'undefined' && window.innerWidth < 1024) && <span>Beranda</span>}
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-4 p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shrink-0"
          >
            <LogOut size={20} className="shrink-0" />
            {(isOpen || typeof window !== 'undefined' && window.innerWidth < 1024) && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-[1000]">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-black p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{role.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm border border-blue-200">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}