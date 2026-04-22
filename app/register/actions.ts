"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerOwner(formData: any) {
  try {
    const { username, password, name } = formData
    
    if (!username || !password || !name) {
      throw new Error("Semua field wajib diisi")
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) throw new Error("Username sudah terdaftar")

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: "owner_cafe" // Hardcoded for this registration flow
      }
    })

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
