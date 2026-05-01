import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  const role = token?.role as string | undefined;

  // 1. PROTEKSI: Jika belum login
  if (pathname.startsWith("/dashboard") && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. ROLE-BASED ACCESS CONTROL (RBAC)
  // Halaman khusus Admin
  const adminOnlyPaths = ["/dashboard/users", "/dashboard/cafes", "/dashboard/approvals", "/dashboard/statistics"];
  if (adminOnlyPaths.some(path => pathname.startsWith(path)) && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Halaman khusus Owner
  if (pathname.startsWith("/dashboard/owners") && role !== "owner_cafe") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. REDIRECT: Owner yang akses /dashboard langsung ke /dashboard/owners
  if (pathname === "/dashboard" && role === "owner_cafe") {
    return NextResponse.redirect(new URL("/dashboard/owners", req.url));
  }

  // 4. REDIRECT: Jika sudah login tapi mau ke /login
  if (pathname === "/login" && token) {
    return NextResponse.next(); // Biarkan login page handle (usually redirects to /dashboard)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}