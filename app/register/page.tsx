"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Store, User, Lock, ArrowRight, CheckCircle2, Loader2, MapPin } from "lucide-react"
import { registerOwner } from "./actions"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await registerOwner(formData)
    
    if (res.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } else {
      setError(res.error || "Gagal mendaftar")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Pendaftaran Berhasil!</h1>
          <p className="text-slate-500 leading-relaxed mb-8">
            Akun Owner Anda telah terdaftar. Silakan login untuk mulai mendaftarkan café Anda di peta SIG.
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
            <Loader2 className="animate-spin" size={18} />
            Mengarahkan ke halaman login...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 text-white max-w-lg">
          <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-3xl flex items-center justify-center mb-8 border border-white/30">
            <MapPin size={32} />
          </div>
          <h2 className="text-5xl font-black mb-6 leading-tight tracking-tight">
            Digitalkan Café Anda di <span className="text-blue-200">SIG Cafe.</span>
          </h2>
          <p className="text-xl text-blue-100 leading-relaxed mb-10">
            Bergabunglah dengan ratusan pemilik café lainnya dan permudah pelanggan menemukan lokasi Anda melalui sistem informasi geografis kami.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-2 rounded-xl mt-1"><CheckCircle2 size={18} /></div>
              <div>
                <h4 className="font-bold text-white">Visualisasi Peta</h4>
                <p className="text-sm text-blue-100">Muncul di peta publik dengan marker terverifikasi.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-2 rounded-xl mt-1"><CheckCircle2 size={18} /></div>
              <div>
                <h4 className="font-bold text-white">Analitik Interaksi</h4>
                <p className="text-sm text-blue-100">Pantau berapa banyak orang yang melihat dan mencari café Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-12 font-bold text-sm">
            <ArrowRight size={18} className="rotate-180" /> Kembali ke Beranda
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Daftar Owner</h1>
            <p className="text-slate-500 font-medium">Buat akun untuk mengelola data café Anda.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-bold flex items-center gap-3">
              <div className="bg-red-100 p-1 rounded-lg">
                <ArrowRight size={14} className="rotate-45" />
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: Ahmad Subardjo"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Store size={20} />
                </div>
                <input 
                  type="text" 
                  required
                  placeholder="username_owner"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Daftar Sekarang <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 font-medium">
            Sudah punya akun? <Link href="/login" className="text-blue-600 font-bold hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
