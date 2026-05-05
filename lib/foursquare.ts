export async function fetchCafes(query: string, lat: number, lng: number, rawQuery?: string) {
  const params = new URLSearchParams({
    query,
    lat: String(lat),
    lng: String(lng),
  })

  if (rawQuery) {
    params.set('rawQuery', rawQuery)
  }

  const res = await fetch(
    `/api/cafes?${params.toString()}`
  )

  return res.json()
}
