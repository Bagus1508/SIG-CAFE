"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect } from "react"

export default function LoginButton() {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Jika statusnya "unauthenticated" (tidak login), langsung panggil fungsi signIn
    if (status === "unauthenticated") {
      signIn()
    }
  }, [status])

  // Tampilkan loading sebentar selagi proses cek session atau redirect
  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (session) {
    return (
      <div className="p-4">
        <p>Halo, {session.user?.email}</p>
        <button 
          onClick={() => signOut()} 
          className="bg-red-500 text-white px-4 py-2 rounded mt-2"
        >
          Logout
        </button>
      </div>
    )
  }

  // Mengembalikan null agar tidak ada tombol yang muncul saat proses redirect
  return null
}