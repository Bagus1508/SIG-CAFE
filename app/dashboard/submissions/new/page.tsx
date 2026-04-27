"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { useState, useEffect } from "react"
import {
  MapPin,
  Store,
  Image as ImageIcon,
  Send,
  ArrowLeft,
  Info,
  Navigation,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Trash2,
  Wifi,
  Check,
  Phone,
  Clock,
  Sparkles,
  Utensils,
  BookOpen,
  Plus,
  Trash
} from "lucide-react"
import Link from "next/link"
import { createSubmission, updateSubmission, cancelSubmission, getSubmissionById } from "../actions"
import { getPublicFacilities } from "@/app/dashboard/actions"
import { useRouter, useSearchParams } from "next/navigation"
import ConfirmModal from "@/components/ConfirmModal"

export default function NewSubmissionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")

  const [loading, setLoading] = useState(false)
  const [successState, setSuccessState] = useState<"created" | "updated" | "cancelled" | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const [formData, setFormData] = useState({
    cafeName: "",
    capacity: "",
    address: "",
    latitude: "",
    longitude: "",
    images: [] as string[],
    facilities: "",
    phone: "",
    openTime: "08:00",
    closeTime: "22:00",
    ambiance: "",
    menuItems: [] as { name: string, price: string }[],
    description: ""
  })
  const [availableFacilities, setAvailableFacilities] = useState<any[]>([])

  // Load data if editing
  useEffect(() => {
    if (editId) {
      setLoading(true)
      getSubmissionById(parseInt(editId)).then(data => {
        if (data) {
          setFormData({
            cafeName: data.cafeName,
            capacity: data.capacity.toString(),
            address: data.address,
            latitude: data.latitude,
            longitude: data.longitude,
            images: data.images.map((img: any) => img.url),
            facilities: (data as any).facilities || "",
            phone: (data as any).phone || "",
            openTime: ((data as any).openingHours || "08:00 - 22:00").split(" - ")[0] || "08:00",
            closeTime: ((data as any).openingHours || "08:00 - 22:00").split(" - ")[1] || "22:00",
            ambiance: (data as any).ambiance || "",
            menuItems: JSON.parse((data as any).menuDescription || "[]"),
            description: (data as any).description || ""
          })
        }
        setLoading(false)
      })
    }
  }, [editId])

  useEffect(() => {
    getPublicFacilities().then(data => {
      setAvailableFacilities(data)
    })
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // Kompresi gambar menggunakan canvas
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Limit max size 800px
          const MAX_SIZE = 800
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Convert to base64 dengan kualitas 0.7
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)

          setFormData(prev => ({
            ...prev,
            images: [...prev.images, compressedBase64]
          }))
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const toggleFacility = (facility: string) => {
    setFormData(prev => ({ ...prev, facilities: updated.join(", ") }))
  }

  const addMenuItem = () => {
    setFormData(prev => ({
      ...prev,
      menuItems: [...prev.menuItems, { name: "", price: "" }]
    }))
  }

  const updateMenuItem = (index: number, field: 'name' | 'price', value: string) => {
    const updated = [...formData.menuItems]
    updated[index][field] = value
    setFormData(prev => ({ ...prev, menuItems: updated }))
  }

  const removeMenuItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      openingHours: `${formData.openTime} - ${formData.closeTime}`,
      menuDescription: JSON.stringify(formData.menuItems)
    }

    if (editId) {
      // If status is Revisi, when updating we reset status to Pending
      const finalPayload = { ...payload, status: "Pending" }
      res = await updateSubmission(parseInt(editId), finalPayload)
      if (res.success) setSuccessState("updated")
    } else {
      res = await createSubmission(payload)
      if (res.success) setSuccessState("created")
    }

    if (!res.success) {
      alert(res.error || "Gagal memproses pengajuan")
    }
    setLoading(false)
  }

  const handleCancel = async () => {
    if (!editId) return
    setIsConfirmOpen(false)
    setLoading(true)
    const res = await cancelSubmission(parseInt(editId))
    if (res.success) {
      setSuccessState("cancelled")
    } else {
      alert(res.error || "Gagal membatalkan pengajuan")
    }
    setLoading(false)
  }

  if (successState) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
          <div className={`p-6 rounded-full mb-6 ${successState === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
            }`}>
            {successState === 'cancelled' ? <XCircle size={64} /> : <CheckCircle2 size={64} />}
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {successState === 'created' ? "Pengajuan Terkirim!" :
              successState === 'updated' ? "Data Diperbarui!" :
                "Pengajuan Dibatalkan"}
          </h2>
          <p className="text-slate-500 max-w-md mb-8">
            {successState === 'created' ? "Terima kasih! Pengajuan Anda sedang diproses oleh tim admin." :
              successState === 'updated' ? "Perubahan data pengajuan Anda telah berhasil disimpan ke sistem." :
                "Status pengajuan ini telah resmi diubah menjadi Dibatalkan."}
          </p>
          <div className="flex gap-4">
            <Link href="/dashboard/submissions" className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">
              Kembali ke Daftar
            </Link>
            {successState !== 'cancelled' && (
              <button onClick={() => setSuccessState(null)} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                Buat Pengajuan Lagi
              </button>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/submissions" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {editId ? "Edit Pengajuan Café" : "Form Pengajuan Café"}
              </h1>
              <p className="text-slate-500 text-sm">Lengkapi data untuk mendaftarkan titik lokasi café baru.</p>
            </div>
          </div>

          {editId && (
            <button
              onClick={() => setIsConfirmOpen(true)}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition-all"
            >
              <Trash2 size={18} /> Batalkan Pengajuan
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Umum */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <Store size={20} />
              <h2 className="font-bold text-slate-800">Informasi Café</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Nama Café</label>
                <input
                  required
                  type="text"
                  placeholder="Contoh: SIG Cafe Merr"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-700"
                  value={formData.cafeName}
                  onChange={(e) => setFormData({ ...formData, cafeName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Kapasitas Kursi</label>
                <input
                  required
                  type="number"
                  placeholder="Jumlah kursi"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-700"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-slate-700">Alamat Lengkap</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jl. Ahmad Yani No. 10, Surabaya..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-gray-700"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Detail & Suasana */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8 text-orange-600">
              <div className="p-2 bg-orange-50 rounded-xl">
                <Sparkles size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Detail & Suasana</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">No. Telepon / WhatsApp</label>
                <div className="relative group">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-700 font-medium"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Jam Operasional</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-700 font-medium"
                      value={formData.openTime}
                      onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                    />
                  </div>
                  <span className="text-slate-400 font-bold">s/d</span>
                  <div className="relative flex-1">
                    <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-700 font-medium"
                      value={formData.closeTime}
                      onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Suasana Café</label>
                <input
                  type="text"
                  placeholder="Contoh: Industrial, Minimalist, Cozy"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-700 font-medium"
                  value={formData.ambiance}
                  onChange={(e) => setFormData({ ...formData, ambiance: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tentang Café</label>
                <input
                  type="text"
                  placeholder="Singkat mengenai cafe Anda..."
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-700 font-medium"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Utensils size={18} className="text-orange-500" /> Menu Unggulan
                  </label>
                  <button
                    type="button"
                    onClick={addMenuItem}
                    className="text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg font-bold hover:bg-orange-100 transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Tambah Menu
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.menuItems.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                      <p className="text-sm text-slate-400 font-medium">Belum ada menu yang ditambahkan.</p>
                    </div>
                  ) : (
                    formData.menuItems.map((item, index) => (
                      <div key={index} className="flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <input
                          type="text"
                          placeholder="Nama Menu"
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none transition-all text-sm"
                          value={item.name}
                          onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Harga (Rp)"
                          className="w-32 px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none transition-all text-sm"
                          value={item.price}
                          onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeMenuItem(index)}
                          className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fasilitas */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-purple-600">
              <Wifi size={20} />
              <h2 className="font-bold text-slate-800">Fasilitas Café</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {availableFacilities.map((f) => {
                const facility = f.name
                const isSelected = formData.facilities.split(", ").includes(facility)
                return (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => toggleFacility(facility)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isSelected
                        ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold'
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                  >
                    <span className="text-sm">{facility}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Koordinat SIG */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-emerald-600">
              <Navigation size={20} />
              <h2 className="font-bold text-slate-800">Titik Koordinat (GIS)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Latitude</label>
                <input
                  required
                  type="text"
                  placeholder="-7.123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-gray-700"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Longitude</label>
                <input
                  required
                  type="text"
                  placeholder="112.123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-mono text-gray-700"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Foto Café */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-orange-500">
              <ImageIcon size={20} />
              <h2 className="font-bold text-slate-800">Foto Café (Multi Upload)</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                    <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-orange-300 hover:bg-orange-50/30 cursor-pointer transition-all group">
                  <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                    <ImageIcon size={24} className="text-slate-400 group-hover:text-orange-600" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tambah Foto</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Tip: Anda dapat mengunggah banyak foto sekaligus untuk memperlihatkan suasana café Anda.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pb-12">
            <Link
              href="/dashboard/submissions"
              className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                }`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {editId ? "Simpan Perubahan" : "Kirim Pengajuan"} <Send size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Batalkan Pengajuan?"
        message="Data pengajuan ini akan resmi dibatalkan dan tidak akan diproses lebih lanjut oleh admin."
        onConfirm={handleCancel}
        onCancel={() => setIsConfirmOpen(false)}
        confirmText="Ya, Batalkan"
        type="danger"
      />
    </DashboardLayout>
  )
}