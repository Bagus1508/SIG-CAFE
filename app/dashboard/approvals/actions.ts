"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getPendingSubmissions() {
  try {
    return await prisma.submission.findMany({
      where: { status: "Pending" },
      orderBy: { createdAt: 'asc' }
    })
  } catch (error) {
    console.error("Failed to fetch pending submissions:", error)
    return []
  }
}

export async function updateSubmissionStatus(id: number, status: "Disetujui" | "Ditolak" | "Revisi", note?: string) {
  try {
    await prisma.submission.update({
      where: { id },
      data: { 
        status,
        revisionNote: status === "Revisi" ? note : null
      }
    })

    revalidatePath("/dashboard/approvals")
    revalidatePath("/dashboard/submissions")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
