export async function fetchCafes(query: string, lat: number, lng: number) {
  const res = await fetch(
    `/api/cafes?query=${query}&lat=${lat}&lng=${lng}`
  )

  return res.json()
}