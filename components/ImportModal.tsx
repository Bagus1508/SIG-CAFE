"use client"
import React, { useState, useEffect, useRef } from "react"
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2, X, RefreshCw } from "lucide-react"
import { importCafes } from "@/app/dashboard/cafes/actions"

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ParsedCafe {
  cafeName: string | null
  address: string | null
  kecamatan: string | null
  kelurahan: string | null
  phone: string | null
  openingHours: string | null
  ambiance: string | null
  facilities: string | null
  rating: number
  ratingCount: number
  priceRange: string | null
  latitude: string | null
  longitude: string | null
  description: string | null
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedCafe[]>([])
  const [loading, setLoading] = useState(false)
  const [xlsxLoaded, setXlsxLoaded] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<{
    state: "idle" | "importing" | "success" | "error"
    successCount?: number
    skippedCount?: number
    errorCount?: number
    error?: string
  }>({ state: "idle" })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Dynamically load SheetJS (XLSX) library on demand
  useEffect(() => {
    if (!isOpen) return
    if ((window as any).XLSX) {
      setXlsxLoaded(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"
    script.async = true
    script.onload = () => setXlsxLoaded(true)
    script.onerror = () => setErrorMsg("Gagal memuat parser Excel. Periksa koneksi internet Anda.")
    document.head.appendChild(script)
  }, [isOpen])

  if (!isOpen) return null

  // Helper function to map columns using fuzzy matching
  const mapRowData = (row: any): ParsedCafe => {
    const keys = Object.keys(row)
    const findVal = (patterns: string[]) => {
      const key = keys.find(k => {
        const normalizedK = k.toLowerCase().replace(/[^a-z0-9]/g, "")
        return patterns.some(p => normalizedK.includes(p.replace(/[^a-z0-9]/g, "")))
      })
      return key ? row[key] : null
    }

    return {
      cafeName: findVal(["namacafe", "nama", "cafename", "cabang"]),
      address: findVal(["alamatlengkap", "alamat", "address", "lokasi"]),
      kecamatan: findVal(["kecamatan", "kec"]),
      kelurahan: findVal(["kelurahan", "kel"]),
      phone: findVal(["nomortelepon", "telepon", "phone", "telp", "notelp", "contact"]),
      openingHours: findVal(["jamoperasional", "jam", "openinghours", "operasional"]),
      ambiance: findVal(["suasana", "ambiance", "vibe"]),
      facilities: findVal(["fasilitas", "facilities"]),
      rating: parseFloat(findVal(["rating"]) || "0") || 0,
      ratingCount: parseInt(findVal(["jumlahreview", "reviewcount", "review", "reviews"]) || "0") || 0,
      priceRange: findVal(["kisaranharga", "harga", "pricerange", "kisaran"]),
      latitude: findVal(["latitude", "lat"])?.toString(),
      longitude: findVal(["longitude", "lng", "lon", "long"])?.toString(),
      description: findVal(["deskripsisingkatcafe", "deskripsisingkat", "deskripsi", "description"])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    if (!xlsxLoaded) {
      setErrorMsg("Mohon tunggu, parser Excel sedang dimuat...")
      return
    }

    setErrorMsg(null)
    setFile(file)
    setLoading(true)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const XLSX = (window as any).XLSX
        if (!XLSX) throw new Error("XLSX library not loaded")

        const workbook = XLSX.read(data, { type: "binary" })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)

        if (json.length === 0) {
          throw new Error("File Excel kosong atau format tidak sesuai")
        }

        const mapped = json.map((row: any) => mapRowData(row))
        setParsedData(mapped)
        setImportStatus({ state: "idle" })
      } catch (err: any) {
        setErrorMsg(err.message || "Gagal memproses file. Pastikan format Excel/CSV benar.")
        setFile(null)
        setParsedData([])
      } finally {
        setLoading(false)
      }
    }

    reader.onerror = () => {
      setErrorMsg("Gagal membaca file.")
      setFile(null)
      setParsedData([])
      setLoading(false)
    }

    reader.readAsBinaryString(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleStartImport = async () => {
    if (parsedData.length === 0) return

    setImportStatus({ state: "importing" })
    try {
      const validCafes = parsedData.filter(c => c.cafeName && c.address)
      const res = await importCafes(validCafes)
      if (res.success) {
        setImportStatus({
          state: "success",
          successCount: res.successCount,
          skippedCount: res.skippedCount,
          errorCount: res.errorCount
        })
      } else {
        setImportStatus({
          state: "error",
          error: res.error || "Gagal mengimpor data"
        })
      }
    } catch (err: any) {
      setImportStatus({
        state: "error",
        error: err.message || "Terjadi kesalahan sistem saat proses import"
      })
    }
  }

  const resetAll = () => {
    setFile(null)
    setParsedData([])
    setErrorMsg(null)
    setImportStatus({ state: "idle" })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const isDataValid = parsedData.length > 0 && parsedData.some(c => c.cafeName && c.address)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-600 animate-pulse" size={24} />
              Import Data Cafe dari Excel / CSV
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Unggah file spreadsheet untuk menambahkan cabang secara massal dengan status disetujui.
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={importStatus.state === "importing"}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Load Library Status */}
          {!xlsxLoaded && !errorMsg && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
              <p className="text-sm font-medium">Memuat pustaka parsing Excel...</p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-4 rounded-2xl flex items-start gap-3 border border-red-100 mb-6">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-bold">Terjadi Kesalahan</p>
                <p className="text-xs mt-0.5">{errorMsg}</p>
                <button 
                  onClick={resetAll} 
                  className="text-xs text-red-600 underline font-bold mt-2 hover:text-red-800"
                >
                  Coba file lain
                </button>
              </div>
            </div>
          )}

          {xlsxLoaded && !file && !errorMsg && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
                isDragOver 
                  ? "border-blue-500 bg-blue-50/50 scale-[0.98]" 
                  : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/50"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xlsx,.xls,.csv" 
                className="hidden" 
              />
              <div className="bg-emerald-50 p-5 rounded-3xl text-emerald-600 mb-4 shadow-inner">
                <UploadCloud size={36} />
              </div>
              <p className="font-bold text-slate-800 text-base">Tarik & lepas file spreadsheet di sini</p>
              <p className="text-slate-400 text-xs mt-1">atau klik untuk menelusuri folder Anda</p>
              <div className="flex gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="bg-slate-100 px-2 py-1 rounded">XLSX</span>
                <span className="bg-slate-100 px-2 py-1 rounded">XLS</span>
                <span className="bg-slate-100 px-2 py-1 rounded">CSV</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="animate-spin text-emerald-600 mb-3" size={36} />
              <p className="text-sm font-bold">Membaca data spreadsheet...</p>
            </div>
          )}

          {/* Import Status State screens */}
          {importStatus.state === "importing" && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <div className="relative mb-6">
                <Loader2 className="animate-spin text-blue-600" size={56} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="text-blue-500 animate-pulse" size={20} />
                </div>
              </div>
              <h4 className="text-lg font-bold text-slate-800">Sedang Mengimpor Data...</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
                Mohon jangan menutup jendela ini. Sistem sedang menyimpan data ke database.
              </p>
            </div>
          )}

          {importStatus.state === "success" && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-700">
              <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-4">
                <CheckCircle2 size={48} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Proses Import Selesai!</h4>
              
              <div className="grid grid-cols-3 gap-6 my-6 w-full max-w-md bg-slate-50 p-5 rounded-2xl border border-slate-100 text-center">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Sukses</p>
                  <p className="text-2xl font-black text-emerald-600">{importStatus.successCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Duplikat</p>
                  <p className="text-2xl font-black text-amber-500">{importStatus.skippedCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gagal</p>
                  <p className="text-2xl font-black text-red-500">{importStatus.errorCount}</p>
                </div>
              </div>

              <p className="text-sm text-slate-500 text-center max-w-md leading-relaxed">
                Data baru telah berhasil ditambahkan dengan status <strong>Disetujui</strong> dan dapat langsung diakses di dashboard maupun peta.
              </p>
            </div>
          )}

          {importStatus.state === "error" && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-700">
              <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4">
                <AlertTriangle size={48} />
              </div>
              <h4 className="text-xl font-bold text-slate-800">Gagal Mengimpor Data</h4>
              <p className="text-sm text-red-500 mt-2 text-center max-w-md bg-red-50 p-3 rounded-xl border border-red-100">
                {importStatus.error}
              </p>
              <button 
                onClick={() => setImportStatus({ state: "idle" })}
                className="mt-6 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
              >
                Kembali ke Pratinjau
              </button>
            </div>
          )}

          {/* Data Preview Grid */}
          {file && parsedData.length > 0 && importStatus.state === "idle" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-500 font-medium">
                  File: <strong className="text-slate-800">{file.name}</strong> ({parsedData.length} baris terdeteksi)
                </span>
                <button 
                  onClick={resetAll}
                  className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-bold transition-all"
                >
                  Ganti File
                </button>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-inner max-h-[350px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                    <tr>
                      <th className="p-3 font-semibold w-12 text-center">No</th>
                      <th className="p-3 font-semibold">Nama Cafe</th>
                      <th className="p-3 font-semibold">Alamat Lengkap</th>
                      <th className="p-3 font-semibold">Kecamatan</th>
                      <th className="p-3 font-semibold text-center">Kordinat</th>
                      <th className="p-3 font-semibold">Fasilitas / Suasana</th>
                      <th className="p-3 font-semibold text-center">Validitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {parsedData.map((cafe, idx) => {
                      const hasName = !!cafe.cafeName
                      const hasAddress = !!cafe.address
                      const hasCoords = !!cafe.latitude && !!cafe.longitude
                      const isValid = hasName && hasAddress

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-700">{cafe.cafeName || <span className="text-red-400 italic">Tanpa Nama</span>}</td>
                          <td className="p-3 text-slate-500 max-w-[200px] truncate" title={cafe.address || ""}>{cafe.address || <span className="text-red-400 italic">Tanpa Alamat</span>}</td>
                          <td className="p-3 text-slate-500">{cafe.kecamatan || "-"}</td>
                          <td className="p-3 text-center">
                            {hasCoords ? (
                              <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono text-[10px]">
                                {parseFloat(cafe.latitude || "0").toFixed(4)}, {parseFloat(cafe.longitude || "0").toFixed(4)}
                              </span>
                            ) : (
                              <span className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center justify-center gap-1">
                                <AlertTriangle size={10} /> Kosong
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-500 max-w-[150px] truncate">
                            <span className="font-semibold">{cafe.ambiance || "-"}</span>
                            {cafe.facilities && <span className="text-[10px] block text-slate-400 truncate">{cafe.facilities}</span>}
                          </td>
                          <td className="p-3 text-center">
                            {isValid ? (
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Valid</span>
                            ) : (
                              <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-bold">Error</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {!isDataValid && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-100">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>Tidak ada data yang valid (Nama Cafe & Alamat Lengkap wajib diisi). Periksa format kolom file Anda.</span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          {importStatus.state === "success" ? (
            <button 
              onClick={() => {
                onSuccess()
                onClose()
                resetAll()
              }}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              Selesai & Muat Ulang Data
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={importStatus.state === "importing"}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              {file && parsedData.length > 0 && importStatus.state === "idle" && (
                <button
                  onClick={handleStartImport}
                  disabled={!isDataValid}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2 active:scale-95"
                >
                  <CheckCircle2 size={16} /> Mulai Import ({parsedData.filter(c => c.cafeName && c.address).length} Cafe)
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
