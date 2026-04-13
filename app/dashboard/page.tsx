import DashboardLayout from "@/components/DashboardLayout"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card Statistik */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Penjualan</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">Rp 12.500.000</h3>
          <span className="text-xs text-green-500 font-medium">+12% dari kemarin</span>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Stok Inventaris</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">45 Item</h3>
          <span className="text-xs text-red-500 font-medium">5 Perlu restock</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Pesanan Aktif</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">12</h3>
          <span className="text-xs text-blue-500 font-medium">Sedang diproses</span>
        </div>
      </div>

      {/* Tabel Data Dummy */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Transaksi Terbaru</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="p-4 font-medium">Menu</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Harga</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-sm text-gray-700 font-medium">Espresso Coffee</td>
              <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs">Selesai</span></td>
              <td className="p-4 text-sm text-gray-600 font-medium">Rp 25.000</td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="p-4 text-sm text-gray-700 font-medium">Croissant Almond</td>
              <td className="p-4"><span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs">Proses</span></td>
              <td className="p-4 text-sm text-gray-600 font-medium">Rp 32.000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}