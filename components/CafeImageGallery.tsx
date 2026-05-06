"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"

type CafeGalleryImage = {
  id: number
  url: string
}

type CafeImageGalleryProps = {
  images: CafeGalleryImage[]
  cafeName: string
}

export default function CafeImageGallery({ images, cafeName }: CafeImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasImages = images.length > 0
  const activeImage = images[activeIndex]

  const showPrevious = () => {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1))
  }

  const showNext = () => {
    setActiveIndex((current) => (current === images.length - 1 ? 0 : current + 1))
  }

  if (!hasImages) {
    return (
      <div className="flex h-80 flex-col items-center justify-center gap-3 bg-blue-50 text-blue-500">
        <ImageIcon size={48} />
        <p className="text-sm font-bold text-blue-400">Belum ada foto cafe.</p>
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="relative overflow-hidden rounded-xl bg-slate-100">
        <img
          src={activeImage.url}
          alt={`${cafeName} foto ${activeIndex + 1}`}
          className="h-80 w-full object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition-colors hover:bg-white"
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={showNext}
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition-colors hover:bg-white"
              aria-label="Gambar berikutnya"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-3 right-3 rounded-full bg-slate-900/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              {activeIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === activeIndex ? "border-blue-500 ring-2 ring-blue-100" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`Tampilkan gambar ${index + 1}`}
            >
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
