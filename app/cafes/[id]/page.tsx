import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, ExternalLink, MapPin, Phone, ShieldCheck, Star, Utensils, Wifi } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import RatingInput from '@/components/RatingInput'

type CafeDetailPageProps = {
  params: Promise<{ id: string }>
}

const getCafe = async (slug: string) => {
  const numericId = Number(slug)

  if (Number.isInteger(numericId)) {
    return prisma.submission.findUnique({
      where: { id: numericId },
      include: { images: true },
    })
  }

  const fsqPlaceId = slug.startsWith('fsq-') ? slug.slice(4) : slug
  return prisma.submission.findUnique({
    where: { fsqPlaceId },
    include: { images: true },
  })
}

const parseMenuItems = (menuDescription?: string | null) => {
  if (!menuDescription) return null

  try {
    const items = JSON.parse(menuDescription)
    return Array.isArray(items) ? items : null
  } catch {
    return null
  }
}

export default async function CafeDetailPage({ params }: CafeDetailPageProps) {
  const { id } = await params
  const cafe = await getCafe(id)

  if (!cafe || cafe.status !== 'Disetujui') notFound()

  const images = cafe.images || []
  const menuItems = parseMenuItems(cafe.menuDescription)
  const facilities = cafe.facilities?.split(',').map((item) => item.trim()).filter(Boolean) || []
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafe.latitude},${cafe.longitude}`)}`
  const rating = typeof cafe.rating === 'number' && !Number.isNaN(cafe.rating)
    ? cafe.rating.toFixed(1)
    : null

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/map" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-100">
            <ArrowLeft size={16} />
            Kembali ke Peta
          </Link>

          <span className={`rounded-full px-3 py-1 text-xs font-bold ${cafe.source === 'foursquare' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
            {cafe.source === 'foursquare' ? 'Foursquare' : 'SIG Terverifikasi'}
          </span>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {images.length > 0 ? (
              <div className="grid gap-2 p-2 sm:grid-cols-2">
                <img src={images[0].url} alt="" className="h-80 w-full rounded-xl object-cover sm:col-span-2" />
                {images.slice(1, 3).map((image) => (
                  <img key={image.id} src={image.url} alt="" className="h-44 w-full rounded-xl object-cover" />
                ))}
              </div>
            ) : (
              <div className="flex h-80 items-center justify-center bg-blue-50 text-6xl text-blue-500">
                ☕
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600">
              <ShieldCheck size={14} />
              Detail Cafe
            </div>
            <h1 className="text-3xl font-black leading-tight text-slate-900">
              {cafe.cafeName}
            </h1>

            {cafe.ambiance && (
              <p className="mt-3 text-sm font-semibold text-slate-500">
                {cafe.ambiance}
              </p>
            )}

            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-yellow-100 bg-yellow-50 px-3 py-2 text-sm font-black text-slate-700">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              {rating ? `${rating} / 5` : 'Belum ada rating'}
            </div>

            <RatingInput
              cafeId={id}
              initialRating={cafe.rating}
              initialRatingCount={cafe.ratingCount}
            />

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p className="flex gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-blue-500" />
                <span>{cafe.address}</span>
              </p>
              <p className="flex gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-blue-500" />
                <span>{cafe.phone || 'Belum ada informasi kontak'}</span>
              </p>
              <p className="flex gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-blue-500" />
                <span>{cafe.openingHours || 'Belum ada informasi jam operasional'}</span>
              </p>
            </div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
            >
              <ExternalLink size={16} />
              Navigasi ke Lokasi
            </a>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
              <Wifi size={14} />
              Fasilitas
            </div>
            {facilities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility) => (
                  <span key={facility} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                    {facility}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Belum ada informasi fasilitas.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
              <Utensils size={14} />
              Menu Unggulan
            </div>
            {menuItems && menuItems.length > 0 ? (
              <div className="space-y-2">
                {menuItems.map((item: { name?: string; price?: string }, index: number) => (
                  <div key={`${item.name || 'menu'}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                    <span className="font-semibold text-slate-700">{item.name || 'Menu'}</span>
                    {item.price && <span className="font-bold text-orange-600">{item.price}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-slate-500">
                {cafe.menuDescription || 'Belum ada informasi menu.'}
              </p>
            )}
          </div>
        </section>

        {cafe.description && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-slate-400">Deskripsi</h2>
            <p className="text-sm leading-relaxed text-slate-600">{cafe.description}</p>
          </section>
        )}
      </div>
    </main>
  )
}
