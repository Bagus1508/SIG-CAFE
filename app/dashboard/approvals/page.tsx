"use client"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/DashboardLayout"
import { CheckCircle, XCircle, Loader2, MapPin, ClipboardCheck, Info, Store } from "lucide-react"
import { getPendingSubmissions, updateSubmissionStatus } from "./actions"
import ConfirmModal from "@/components/ConfirmModal"

export default function ApprovalPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [revisionNote, setRevisionNote] = useState("")
  const [confirmAction, setConfirmAction] = useState<{ isOpen: boolean; id: number | null; status: "Disetujui" | "Ditolak" | "Revisi" | null }>({
    isOpen: false,
    id: null,
    status: null
  })

  const loadData = async () => {
    setLoading(true)
    const data = await getPendingSubmissions()
    setSubmissions(data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAction = async () => {
    const { id, status } = confirmAction
    if (!id || !status) return

    if (status === "Revisi" && !revisionNote.trim()) {
      alert("Harap masukkan catatan revisi.")
      return
    }

    setConfirmAction({ ...confirmAction, isOpen: false })
    setProcessingId(id)
    const res = await updateSubmissionStatus(id, status, status === "Revisi" ? revisionNote : undefined)
    if (res.success) {
      await loadData()
      setRevisionNote("")
    } else {
      alert(res.error || "Terjadi kesalahan saat memproses data.")
    }
    setProcessingId(null)
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CheckCircle className="text-blue-600" />
          Persetujuan Pengajuan Lokasi
        </h1>
        <p className="text-slate-500 text-sm mt-1">Evaluasi dan berikan keputusan pada pengajuan café baru dari owner.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-slate-400 font-medium">Memuat pengajuan pending...</p>
        </div>
      ) : submissions.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {submissions.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:border-blue-200 transition-all">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Info Utama */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100">
                      {item.reqNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      Diajukan pada: {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Store className="text-slate-400" size={20} />
                      {item.cafeName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                      <MapPin size={16} className="text-slate-300" />
                      <span className="text-sm">{item.address}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kapasitas</p>
                      <p className="text-sm font-bold text-slate-700">{item.capacity} Kursi</p>
                    </div>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Koordinat</p>
                      <p className="text-sm font-mono text-slate-700">{item.latitude}, {item.longitude}</p>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex flex-row md:flex-col gap-3 min-w-[200px]">
                  <button
                    disabled={processingId === item.id}
                    onClick={() => setConfirmAction({ isOpen: true, id: item.id, status: "Disetujui" })}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {processingId === item.id ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                    Setujui
                  </button>
                  <button
                    disabled={processingId === item.id}
                    onClick={() => setConfirmAction({ isOpen: true, id: item.id, status: "Ditolak" })}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold py-3 px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Tolak
                  </button>
                  <button
                    disabled={processingId === item.id}
                    onClick={() => setConfirmAction({ isOpen: true, id: item.id, status: "Revisi" })}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 font-bold py-3 px-6 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Info size={18} />
                    Revisi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
            <ClipboardCheck size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Tidak ada pengajuan pending</h3>
          <p className="text-slate-500 mt-2">Semua pengajuan lokasi sudah diproses. Kerja bagus!</p>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmAction.isOpen}
        title={
          confirmAction.status === 'Disetujui' ? "Setujui Pengajuan?" : 
          confirmAction.status === 'Ditolak' ? "Tolak Pengajuan?" : 
          "Minta Revisi?"
        }
        message={
          confirmAction.status === 'Disetujui' ? "Apakah Anda yakin ingin MENYETUJUI pengajuan café ini? Lokasi akan langsung muncul di peta publik." : 
          confirmAction.status === 'Ditolak' ? "Apakah Anda yakin ingin MENOLAK pengajuan café ini? Owner akan melihat status ditolak di dashboard mereka." :
          "Berikan catatan kepada owner mengenai bagian mana yang perlu diperbaiki atau dilengkapi."
        }
        onConfirm={handleAction}
        onCancel={() => {
          setConfirmAction({ isOpen: false, id: null, status: null })
          setRevisionNote("")
        }}
        confirmText={
          confirmAction.status === 'Disetujui' ? "Ya, Setujui" : 
          confirmAction.status === 'Ditolak' ? "Ya, Tolak" : 
          "Kirim Revisi"
        }
        type={
          confirmAction.status === 'Disetujui' ? 'info' : 
          confirmAction.status === 'Ditolak' ? 'danger' : 
          'warning'
        }
      >
        {confirmAction.status === 'Revisi' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan Revisi</label>
            <textarea
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all text-sm text-slate-700 min-h-[120px]"
              placeholder="Contoh: Foto kurang jelas, harap unggah foto suasana interior café..."
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
            />
          </div>
        )}
      </ConfirmModal>
    </DashboardLayout>
  )
}
