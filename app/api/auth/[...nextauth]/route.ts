import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

async function handler(req: NextRequest, context: any) {
  // In Next.js 15+, params is a promise
  return await NextAuth(req, context, authOptions)
}

export { handler as GET, handler as POST }