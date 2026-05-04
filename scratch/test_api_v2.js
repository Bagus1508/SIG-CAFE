const fs = require('fs')

async function test() {
  const query = process.argv[2] || ""
  const url = `http://localhost:3000/api/cafes?query=${encodeURIComponent(query)}&lat=-7.2575&lng=112.7521`
  console.log(`Testing URL: ${url}`)
  
  const res = await fetch(url)
  const data = await res.json()
  
  fs.writeFileSync('scratch/api_dump.json', JSON.stringify(data, null, 2))
  console.log(`Results: ${data.results?.length || 0}`)
  if (data.results && data.results.length > 0) {
    const sources = data.results.reduce((acc, c) => {
      acc[c.source] = (acc[c.source] || 0) + 1
      return acc
    }, {})
    console.log('Sources found:', sources)
  }
}

test().catch(console.error)
