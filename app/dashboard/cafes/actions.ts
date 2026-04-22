"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getApprovedCafes() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []
    
    const userId = parseInt((session.user as any).id)
    const role = (session.user as any).role

    if (role === "admin") {
      return await prisma.submission.findMany({
        where: { status: "Disetujui" },
        orderBy: { updatedAt: 'desc' },
        include: { owner: true }
      })
    } else {
      return await prisma.submission.findMany({
        where: { 
          status: "Disetujui",
          ownerId: userId
        },
        orderBy: { updatedAt: 'desc' }
      })
    }
  } catch (error) {
    console.error("Failed to fetch approved cafes:", error)
    return []
  }
}

export async function updateCafeInfo(id: number, data: any) {
  try {
    const { cafeName, capacity, address, latitude, longitude } = data
    
    await prisma.submission.update({
      where: { id },
      data: {
        cafeName,
        capacity: parseInt(capacity),
        address,
        latitude,
        longitude
      }
    })

    revalidatePath("/dashboard/cafes")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
