"use server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Public function for landing page
export async function getPublicApprovedCafes() {
  try {
    return await prisma.submission.findMany({
      where: { status: "Disetujui" },
      include: { images: true },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error("Public Fetch Error:", error)
    return []
  }
}

export async function getKeywordMappings() {
  try {
    const data = await prisma.keywordMapping.findMany({
      orderBy: { key: 'asc' }
    })
    // Konversi ke format Record<string, string> agar kompatibel dengan kode lama
    const mapping: Record<string, string> = {}
    data.forEach(item => {
      mapping[item.key] = item.value
    })
    return mapping
  } catch (error) {
    console.error("Public Keyword Fetch Error:", error)
    return {}
  }
}

export async function getDashboardStats() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null

    const role = (session.user as any).role
    const userId = parseInt((session.user as any).id)

    if (role === "admin") {
      const [totalSubmissions, activeCafes, totalOwners, rejectedSubmissions] = await Promise.all([
        prisma.submission.count(),
        prisma.submission.count({ where: { status: "Disetujui" } }),
        prisma.user.count({ where: { role: "owner_cafe" } }),
        prisma.submission.count({ where: { status: "Ditolak" } }),
      ])

      const latestSubmissions = await prisma.submission.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { owner: true }
      })

      return {
        totalSubmissions,
        activeCafes,
        totalOwners,
        rejectedSubmissions,
        latestSubmissions
      }
    } else {
      const myCafes = await prisma.submission.findMany({
        where: { ownerId: userId, status: "Disetujui" },
        select: { id: true, cafeName: true }
      })
      
      const cafeIds = myCafes.map(c => c.id)

      const [clicks, views, routes, searches] = await Promise.all([
        prisma.interaction.count({ where: { cafeId: { in: cafeIds }, type: "click" } }),
        prisma.interaction.count({ where: { cafeId: { in: cafeIds }, type: "view" } }),
        prisma.interaction.count({ where: { cafeId: { in: cafeIds }, type: "route" } }),
        prisma.interaction.count({ where: { cafeId: { in: cafeIds }, type: "search" } }),
      ])

      const popularity = await Promise.all(myCafes.map(async (cafe) => {
        const count = await prisma.interaction.count({ where: { cafeId: cafe.id } })
        return { name: cafe.cafeName, clicks: count }
      }))

      return {
        myActive: myCafes.length,
        myLatest: myCafes,
        analytics: { clicks, views, routes, searches },
        popularity: popularity.sort((a,b) => b.clicks - a.clicks)
      }
    }
  } catch (error) {
    console.error("Dashboard Stats Error:", error)
    return null
  }
}

export async function recordInteraction(cafeId: number, type: 'click' | 'view' | 'route' | 'search') {
  try {
    await prisma.interaction.create({
      data: { cafeId, type }
    })
    return { success: true }
  } catch (error) {
    console.error("Interaction Error:", error)
    return { success: false }
  }
}

export async function getDailyInteractions() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return []

    const userId = parseInt((session.user as any).id)

    const myCafes = await prisma.submission.findMany({
      where: { ownerId: userId, status: "Disetujui" },
      select: { id: true }
    })

    const cafeIds = myCafes.map(c => c.id)
    if (cafeIds.length === 0) return Array(7).fill(0)

    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const count = await prisma.interaction.count({
        where: {
          cafeId: { in: cafeIds },
          createdAt: { gte: date, lt: nextDate }
        }
      })
      days.push({ label: date.toLocaleDateString('id-ID', { weekday: 'short' }), count })
    }

    return days
  } catch (error) {
    console.error("Daily Interactions Error:", error)
    return Array(7).fill({ label: '-', count: 0 })
  }
}
