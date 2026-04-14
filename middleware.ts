import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Anda bisa menambahkan logika custom di sini jika perlu
  },
  {
    pages: {
      signIn: "/login", // Jika belum login, tendang ke sini
    },
  }
)

export const config = {
  // Lindungi semua route yang berawalan /dashboard
  matcher: ["/dashboard/:path*"],
}