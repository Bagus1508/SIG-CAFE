"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getFacilities() {
  try {
    return await (prisma as any).facility.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Failed to fetch facilities:", error)
    return []
  }
}

export async function createFacility(data: { name: string }) {
  try {
    const facility = await (prisma as any).facility.create({
      data: { name: data.name }
    })
    revalidatePath("/dashboard/facilities")
    return { success: true, data: facility }
  } catch (error: any) {
    console.error("Create Facility Error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateFacility(id: number, data: { name: string }) {
  try {
    await (prisma as any).facility.update({
      where: { id },
      data: { name: data.name }
    })
    revalidatePath("/dashboard/facilities")
    return { success: true }
  } catch (error: any) {
    console.error("Update Facility Error:", error)
    return { success: false, error: error.message }
  }
}

export async function deleteFacility(id: number) {
  try {
    await (prisma as any).facility.delete({
      where: { id }
    })
    revalidatePath("/dashboard/facilities")
    return { success: true }
  } catch (error: any) {
    console.error("Delete Facility Error:", error)
    return { success: false, error: error.message }
  }
}
