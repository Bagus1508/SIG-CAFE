"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return []
  }
}

export async function createUser(formData: any) {
  try {
    const { username, password, name, role } = formData
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing) throw new Error("Username sudah terdaftar")

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role
      }
    })

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateUser(id: number, formData: any) {
  try {
    const { username, password, name, role } = formData
    
    const data: any = { username, name, role }
    
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({
      where: { id },
      data
    })

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteUser(id: number) {
  try {
    await prisma.user.delete({ where: { id } })
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
