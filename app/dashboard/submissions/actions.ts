"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getSubmissionById(id: number) {
  try {
    return await prisma.submission.findUnique({
      where: { id },
      include: { images: true }
    })
  } catch (error) {
    console.error("Failed to fetch submission:", error)
    return null
  }
}

export async function getSubmissions() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []
    
    const role = (session.user as any).role
    const userId = parseInt((session.user as any).id)

    if (role === "admin") {
      return await prisma.submission.findMany({
        orderBy: { createdAt: 'desc' },
        include: { owner: true, images: true }
      })
    } else {
      return await prisma.submission.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' },
        include: { images: true }
      })
    }
  } catch (error) {
    console.error("Failed to fetch submissions:", error)
    return []
  }
}

export async function createSubmission(data: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error("Unauthorized: Silakan login kembali")
    
    const userId = parseInt((session.user as any).id)
    if (isNaN(userId)) throw new Error("Invalid User ID")

    const { 
      cafeName, capacity, address, latitude, longitude, images, facilities,
      phone, openingHours, ambiance, menuDescription, description 
    } = data
    
    const count = await prisma.submission.count()
    const reqNumber = `REQ-${(count + 1).toString().padStart(3, '0')}`

    const submission = await prisma.submission.create({
      data: {
        reqNumber,
        cafeName,
        capacity: parseInt(capacity),
        address,
        latitude,
        longitude,
        facilities,
        phone,
        openingHours,
        ambiance,
        menuDescription,
        description,
        status: "Pending",
        ownerId: userId,
        images: {
          create: (images || []).map((url: string) => ({ url }))
        }
      } as any
    })

    revalidatePath("/dashboard/submissions")
    return { success: true, data: submission }
  } catch (error: any) {
    console.error("Create Submission Error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateSubmission(id: number, data: any) {
  try {
    const { 
      cafeName, capacity, address, latitude, longitude, status, images, facilities,
      phone, openingHours, ambiance, menuDescription, description 
    } = data
    
    await prisma.submission.update({
      where: { id },
      data: {
        cafeName,
        capacity: parseInt(capacity),
        address,
        latitude,
        longitude,
        facilities,
        phone,
        openingHours,
        ambiance,
        menuDescription,
        description,
        status,
        images: {
          deleteMany: {},
          create: (images || []).map((url: string) => ({ url }))
        }
      } as any
    })

    revalidatePath("/dashboard/submissions")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function cancelSubmission(id: number) {
  try {
    await prisma.submission.update({
      where: { id },
      data: { status: "Dibatalkan" }
    })

    revalidatePath("/dashboard/submissions")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteSubmission(id: number) {
  try {
    await prisma.submission.delete({ where: { id } })
    revalidatePath("/dashboard/submissions")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
