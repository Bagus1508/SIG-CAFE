"use client"

import { useState } from "react"
import { Star } from "lucide-react"

type RatingInputProps = {
  cafeId: string
  initialRating: number | null
  initialRatingCount: number
}

export default function RatingInput({ cafeId, initialRating, initialRatingCount }: RatingInputProps) {
  const [rating, setRating] = useState(initialRating)
  const [ratingCount, setRatingCount] = useState(initialRatingCount)
  const [hovered, setHovered] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const displayRating = rating ? rating.toFixed(1) : "-"

  const submitRating = async (score: number) => {
    if (submitting) return

    setSubmitting(true)
    setMessage("")

    try {
      const res = await fetch(`/api/cafes/${encodeURIComponent(cafeId)}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessage(data.error || "Rating gagal disimpan.")
        return
      }

      setRating(data.rating)
      setRatingCount(data.ratingCount)
      setMessage("Terima kasih, rating kamu tersimpan.")
    } catch {
      setMessage("Rating gagal disimpan.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-yellow-100 bg-yellow-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-yellow-700">Rating User</p>
          <p className="mt-1 text-sm font-bold text-slate-700">
            {displayRating} / 5
            <span className="ml-2 font-medium text-slate-500">({ratingCount} rating)</span>
          </p>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((score) => {
            const active = score <= (hovered || Math.round(rating || 0))

            return (
              <button
                key={score}
                type="button"
                onMouseEnter={() => setHovered(score)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => submitRating(score)}
                disabled={submitting}
                className="rounded-lg p-1 text-yellow-400 transition-transform hover:scale-110 disabled:cursor-wait disabled:opacity-60"
                aria-label={`Beri rating ${score}`}
              >
                <Star size={22} className={active ? "fill-yellow-400" : "fill-transparent"} />
              </button>
            )
          })}
        </div>
      </div>

      {message && <p className="mt-3 text-xs font-semibold text-slate-500">{message}</p>}
    </div>
  )
}
