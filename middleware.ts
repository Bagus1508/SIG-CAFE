import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. BIARKAN request ke API Auth lewat (PENTING!)
  // Tanpa ini, proses login akan tersangkut di middleware
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. Ambil token untuk cek status login
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  // 3. PROTEKSI: Jika mau ke dashboard tapi belum login
  if (pathname.startsWith("/dashboard") && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. REDIRECT: Jika sudah login tapi mau akses halaman login lagi
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Pastikan matcher mencakup dashboard dan login
  matcher: ["/dashboard/:path*", "/login", "/api/auth/:path*"],
}