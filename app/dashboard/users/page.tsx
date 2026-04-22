"use client"
import DashboardLayout from "@/components/DashboardLayout"
import { User, UserPlus, Edit, Trash2, Plus, Shield, Search, X, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getUsers, createUser, updateUser, deleteUser } from "./actions"
import ConfirmModal from "@/components/ConfirmModal"

export default function UserManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Protect Route
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    role: "user",
    password: ""
  })

  // Confirm Delete State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; userId: number | null }>({
    isOpen: false,
    userId: null
  })

  // Fetch data
  const loadUsers = async () => {
    setLoading(true)
    const data = await getUsers()
    setUsers(data)
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (user?: any) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        name: user.name,
        role: user.role,
        password: ""
      })
    } else {
      setEditingUser(null)
      setFormData({ username: "", name: "", role: "user", password: "" })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    let res
    if (editingUser) {
      res = await updateUser(editingUser.id, formData)
    } else {
      res = await createUser(formData)
    }

    if (res.success) {
      await loadUsers()
      setIsModalOpen(false)
    } else {
      alert(res.error || "Terjadi kesalahan")
    }
    setSubmitting(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete.userId) return
    
    const res = await deleteUser(confirmDelete.userId)
    if (res.success) {
      await loadUsers()
      setConfirmDelete({ isOpen: false, userId: null })
    } else {
      alert(res.error || "Gagal menghapus akun")
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Akun</h1>
          <p className="text-slate-500 text-sm">Kelola hak akses dan data pengguna sistem</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all font-semibold"
        >
          <Plus size={18} /> Tambah Akun
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-xl text-blue-600"><User size={24} /></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Akun</p>
            <p className="text-xl font-bold text-slate-800">{loading ? "..." : users.length}</p>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center px-4">
          <Search className="text-slate-400 mr-3" size={18} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau username..."
            className="w-full bg-transparent outline-none text-sm text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data Users */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
            <tr>
              <th className="p-4 font-semibold">Pengguna</th>
              <th className="p-4 font-semibold">Username</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Terdaftar</th>
              <th className="p-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                  Memuat data...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    @{user.username}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center w-fit gap-1 ${user.role === 'admin' ? 'bg-amber-100 text-amber-600' :
                      user.role === 'owner_cafe' ? 'bg-indigo-100 text-indigo-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                      <Shield size={10} /> {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ isOpen: true, userId: user.id })}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                  Tidak ada akun yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                {editingUser ? "Edit Akun" : "Tambah Akun Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-600"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="username"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-600"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm appearance-none text-gray-600"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="owner_cafe">Owner Cafe</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {editingUser ? "Password (Kosongkan jika tidak diubah)" : "Password"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm text-gray-600"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {editingUser ? "Simpan Perubahan" : "Simpan Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Hapus Akun?"
        message="Tindakan ini tidak dapat dibatalkan. Pengguna tidak akan bisa login lagi ke sistem."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, userId: null })}
        confirmText="Ya, Hapus Akun"
        type="danger"
      />
    </DashboardLayout>
  )
}