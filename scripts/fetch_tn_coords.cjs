// scripts/fetch_tn_coords.js
// Run: node scripts/fetch_tn_coords.js
const fs = require('fs')
const path = require('path')
const axios = require('axios').default

// Load the names-only skeleton (or paste your names array directly here)
const TAMIL_NADU_LOCATIONS = require('../data/tamil_nadu_locations_names.cjs')

// Flatten names
const names = []
TAMIL_NADU_LOCATIONS.forEach((d) => {
  d.places.forEach((p) => {
    const clean = p.trim()
    if (clean && !names.includes(clean)) names.push({ district: d.district, name: clean })
  })
})

// helper to sleep
const wait = (ms) => new Promise((res) => setTimeout(res, ms))

const results = []
const errors = []

async function geocode(place, attempt = 0) {
  const q = `${place.name}, ${place.district}, Tamil Nadu, India`
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q, format: 'json', addressdetails: 1, limit: 5, countrycodes: 'in' },
      headers: { 'User-Agent': 'KaniTaxi/1.0 (you@yourdomain.com)' },
      timeout: 15000,
    })
    const data = res.data || []
    // Prefer results whose address.state === 'Tamil Nadu'
    const match =
      data.find((r) => {
        const state = (r.address && (r.address.state || r.address.state_district)) || ''
        return /tamil\s*nadu/i.test(state)
      }) || data[0]

    if (!match) {
      errors.push({ place, reason: 'no-match', raw: data })
      return null
    }
    return {
      district: place.district,
      name: place.name,
      display_name: match.display_name,
      lat: match.lat,
      lon: match.lon,
      raw_addr: match.address,
    }
  } catch (err) {
    if (attempt < 2) {
      await wait(800)
      return geocode(place, attempt + 1)
    }
    errors.push({ place, reason: err.message || 'error', err: err.toString() })
    return null
  }
}

;(async () => {
  console.log(`Starting geocode for ${names.length} places (rate-limited)...`)
  for (let i = 0; i < names.length; i++) {
    const place = names[i]
    // rate-limit: 1 request / 1000ms (polite for Nominatim)
    if (i > 0) await wait(1000)
    try {
      console.log(`Geocoding (${i + 1}/${names.length}): ${place.name}`)
      const geo = await geocode(place)
      if (geo) results.push(geo)
    } catch (err) {
      console.error('Geocode error', err)
    }
  }

  // Dedupe by normalized name+lat/lon (if duplicates)
  const uniq = []
  const seen = new Set()
  results.forEach((r) => {
    const key = `${r.name.toLowerCase()}|${r.lat}|${r.lon}`
    if (!seen.has(key)) {
      seen.add(key)
      uniq.push(r)
    }
  })

  const outPath = path.join(__dirname, '..', 'public', 'tamil_nadu_locations.json')
  fs.writeFileSync(
    outPath,
    JSON.stringify({ meta: { generatedAt: new Date().toISOString() }, places: uniq }, null, 2),
  )
  console.log('Saved', outPath, 'with', uniq.length, 'places')

  const errPath = path.join(__dirname, '..', 'scripts', 'geocode_errors.json')
  fs.writeFileSync(
    errPath,
    JSON.stringify({ errors, timestamp: new Date().toISOString() }, null, 2),
  )
  console.log('Errors saved:', errPath)
})()
