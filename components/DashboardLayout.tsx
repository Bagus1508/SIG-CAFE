"use client"
import { signOut, useSession } from "next-auth/react"
import { Home, ListChecks, Store, Users, BarChart3, LogOut, Menu, PlusSquare, CheckSquare, Tag, Wifi } from "lucide-react"
import { useState } from "react"

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${isOpen ? "w-64" : "w-20"} bg-slate-900 text-white transition-all duration-300 flex flex-col h-full shrink-0`}>
        <div className="p-6 text-xl font-bold border-b border-slate-800 flex items-center gap-4 shrink-0">
          <div className="bg-blue-500 p-2 rounded-lg"><ListChecks size={24} /></div>
          {isOpen && <span className="truncate">SIG CAFE</span>}
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => (
            <a key={index} href={item.href} className="flex items-center gap-4 p-3 hover:bg-slate-800 rounded-lg transition-colors text-slate-300 hover:text-white whitespace-nowrap">
              <div className="shrink-0">{item.icon}</div>
              {isOpen && <span>{item.label}</span>}
            </a>
          ))}
        </nav>

        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="m-4 flex items-center gap-4 p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all shrink-0"
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span>Keluar</span>}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-black">
            <Menu />
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{role.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm border border-blue-200">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}