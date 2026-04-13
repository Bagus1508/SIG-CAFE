// middleware.ts
export { default } from "next-auth/middleware"

export const config = { 
  // Semua halaman di dalam dashboard akan diproteksi
  matcher: ["/dashboard/:path*", "/inventory/:path*", "/menu/:path*"], 
}