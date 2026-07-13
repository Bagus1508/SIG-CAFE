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

function parseOpeningHours(rawHours: string | null | undefined): string {
  if (!rawHours) return "Senin - Minggu, 08:00 - 22:00"
  
  let str = rawHours.trim()
  if (str === "") return "Senin - Minggu, 08:00 - 22:00"

  // Handle "24 Jam"
  if (str.toLowerCase().includes("24 jam") || str.toLowerCase().includes("24jam")) {
    return "Senin - Minggu, 00:00 - 23:59"
  }

  // Replace dots in time to colons: e.g. 08.00 -> 08:00
  str = str.replace(/(\d{2})\.(\d{2})/g, "$1:$2")

  // Check for days mapping
  let days = "Senin - Minggu"
  if (str.toLowerCase().includes("tutup senin")) {
    days = "Selasa - Minggu"
  } else if (str.toLowerCase().includes("senin-minggu") || str.toLowerCase().includes("senin - minggu")) {
    days = "Senin - Minggu"
  } else if (str.toLowerCase().includes("senin-sabtu") || str.toLowerCase().includes("senin - sabtu")) {
    days = "Senin - Sabtu"
  }

  // Extract times matching format HH:MM - HH:MM
  const timeRegex = /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/
  const match = str.match(timeRegex)
  if (match) {
    let openTime = match[1]
    let closeTime = match[2]
    if (openTime === "24:00") openTime = "23:59"
    if (closeTime === "24:00") closeTime = "23:59"
    return `${days}, ${openTime} - ${closeTime}`
  }

  // Fallback
  return `Senin - Minggu, 08:00 - 22:00`
}

export async function importCafes(cafes: any[]) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error("Unauthorized: Silakan login kembali")

    const userId = parseInt((session.user as any).id)
    if (isNaN(userId)) throw new Error("Invalid User ID")

    let successCount = 0
    let skippedCount = 0
    let errorCount = 0

    // Get current total count of submissions for reqNumber generation
    let count = await prisma.submission.count()

    for (const cafe of cafes) {
      try {
        const cafeName = cafe.cafeName?.trim()
        const address = cafe.address?.trim()
        
        if (!cafeName || !address) {
          errorCount++
          continue
        }

        // Check for duplicates in the database (by name and address)
        const duplicate = await prisma.submission.findFirst({
          where: {
            cafeName: { equals: cafeName },
            address: { equals: address }
          }
        })

        if (duplicate) {
          skippedCount++
          continue
        }

        // Generate a unique reqNumber
        let reqNumber = `REQ-${(count + 1).toString().padStart(3, '0')}`
        while (await prisma.submission.findUnique({ where: { reqNumber } })) {
          count++
          reqNumber = `REQ-${(count + 1).toString().padStart(3, '0')}`
        }
        count++ // increment for the next cafe

        // Prepare rating and ratingCount
        const rating = parseFloat(cafe.rating)
        const ratingCount = parseInt(cafe.ratingCount)

        // Parse Kisaran Harga and map to menuDescription
        let menuDescription = "[]"
        if (cafe.priceRange) {
          menuDescription = JSON.stringify([
            { name: "Kisaran Harga", price: cafe.priceRange.trim() }
          ])
        }

        // Insert into Submission
        await prisma.submission.create({
          data: {
            reqNumber,
            cafeName,
            capacity: 50, // default capacity
            address,
            latitude: cafe.latitude ? cafe.latitude.toString().trim() : "",
            longitude: cafe.longitude ? cafe.longitude.toString().trim() : "",
            facilities: cafe.facilities || "",
            phone: cafe.phone || "",
            openingHours: parseOpeningHours(cafe.openingHours),
            rating: isNaN(rating) ? null : rating,
            ratingCount: isNaN(ratingCount) ? 0 : ratingCount,
            ambiance: cafe.ambiance || "",
            menuDescription,
            description: cafe.description || `Cafe di ${cafe.kecamatan || "Surabaya"}`,
            kecamatan: cafe.kecamatan || null,
            kelurahan: cafe.kelurahan || null,
            status: "Disetujui",
            source: "owner",
            ownerId: userId,
            images: {
              create: [
                { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800' }
              ]
            }
          } as any
        })

        successCount++
      } catch (err) {
        console.error("Error importing individual cafe:", err)
        errorCount++
      }
    }

    revalidatePath("/dashboard/cafes")
    return {
      success: true,
      successCount,
      skippedCount,
      errorCount
    }
  } catch (error: any) {
    console.error("Failed to import cafes:", error)
    return { success: false, error: error.message }
  }
}

