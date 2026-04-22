"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getKeywords() {
  try {
    return await prisma.keywordMapping.findMany({
      orderBy: { key: 'asc' }
    })
  } catch (error) {
    console.error("Failed to fetch keywords:", error)
    return []
  }
}

export async function createKeyword(data: { key: string; value: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "admin") {
      throw new Error("Unauthorized")
    }

    const keyword = await prisma.keywordMapping.create({
      data: {
        key: data.key.toLowerCase(),
        value: data.value
      }
    })

    revalidatePath("/dashboard/keywords")
    return { success: true, data: keyword }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateKeyword(id: number, data: { key: string; value: string }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "admin") {
      throw new Error("Unauthorized")
    }

    await prisma.keywordMapping.update({
      where: { id },
      data: {
        key: data.key.toLowerCase(),
        value: data.value
      }
    })

    revalidatePath("/dashboard/keywords")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteKeyword(id: number) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== "admin") {
      throw new Error("Unauthorized")
    }

    await prisma.keywordMapping.delete({ where: { id } })
    revalidatePath("/dashboard/keywords")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
