import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Ambil token/session dari browser
  const session = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Jika mencoba akses dashboard tapi TIDAK ada session
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    // Tambahkan callback agar setelah login bisa balik ke halaman tadi
    url.searchParams.set("callbackUrl", req.nextUrl.pathname) 
    return NextResponse.redirect(url)
  }

  // Jika ada session, izinkan lanjut
  return NextResponse.next()
}

// Tentukan halaman mana saja yang mau dikunci
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/inventory/:path*", 
    "/cafes/:path*", 
    "/statistics/:path*"
  ],
}