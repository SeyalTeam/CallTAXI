// Enrich TN locations with district/taluk/panchayat via Nominatim reverse geocode.
// Run: node scripts/enrich_districts.cjs
// Note: This is rate-limited and may take several hours for 20k+ records.
const fs = require('fs')
const path = require('path')

const INPUT_PATH = path.join(__dirname, '..', 'public', 'tamil_nadu_locations.json')
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'tamil_nadu_locations.enriched.json')
const CACHE_PATH = path.join(__dirname, 'district_cache.json')

const WAIT_MS = 1200 // be polite to Nominatim
const SAVE_EVERY = 200

const wait = (ms) => new Promise((res) => setTimeout(res, ms))

function readJsonSafe(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function pickDistrict(addr) {
  return (
    addr.state_district ||
    addr.district ||
    addr.county ||
    addr.city_district ||
    addr.region ||
    undefined
  )
}

function pickTaluk(addr) {
  return addr.subdistrict || addr.taluk || addr.tehsil || addr.block || addr.county || undefined
}

function pickPanchayat(addr) {
  return (
    addr.panchayat ||
    addr.village_panchayat ||
    addr.gram_panchayat ||
    addr.grama_panchayat ||
    undefined
  )
}

async function reverseGeocode(lat, lon, attempt = 0) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', lat)
  url.searchParams.set('lon', lon)
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('zoom', '10')
  url.searchParams.set('countrycodes', 'in')

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'KaniTaxi/1.0 (admin@kanitaxi.com)',
      },
    })
    if (!res.ok) {
      if (res.status === 429 && attempt < 3) {
        await wait(2000 * (attempt + 1))
        return reverseGeocode(lat, lon, attempt + 1)
      }
      throw new Error(`HTTP ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    if (attempt < 2) {
      await wait(1500 * (attempt + 1))
      return reverseGeocode(lat, lon, attempt + 1)
    }
    return { error: String(err) }
  }
}

async function run() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error('Input file not found:', INPUT_PATH)
    process.exit(1)
  }

  const input = readJsonSafe(INPUT_PATH, { meta: {}, places: [] })
  const places = Array.isArray(input.places) ? input.places : []
  const cache = readJsonSafe(CACHE_PATH, {})

  console.log(`Loaded ${places.length} locations.`)

  let updated = 0
  for (let i = 0; i < places.length; i++) {
    const loc = places[i]
    const key = `${loc.lat},${loc.lon}`
    const needsDistrict = !loc.district || loc.district === 'Tamil Nadu'

    if (!needsDistrict) continue

    let geo = cache[key]
    if (!geo) {
      geo = await reverseGeocode(loc.lat, loc.lon)
      cache[key] = geo
      await wait(WAIT_MS)
    }

    const addr = geo && geo.address ? geo.address : {}
    const district = pickDistrict(addr)
    const taluk = pickTaluk(addr)
    const panchayat = pickPanchayat(addr)

    if (district && district !== 'Tamil Nadu') {
      loc.district = district
      updated++
    }
    if (taluk && !loc.taluk) loc.taluk = taluk
    if (panchayat && !loc.panchayat) loc.panchayat = panchayat
    if (!loc.raw_addr) loc.raw_addr = {}
    if (addr && Object.keys(addr).length > 0) loc.raw_addr = { ...loc.raw_addr, ...addr }

    if (i % SAVE_EVERY === 0) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ meta: input.meta, places }, null, 2))
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
      console.log(`Progress: ${i}/${places.length} (updated districts: ${updated})`)
    }
  }

  const out = {
    meta: {
      ...input.meta,
      enrichedAt: new Date().toISOString(),
    },
    places,
  }
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2))
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2))
  console.log(`Done. Updated ${updated} districts.`)
  console.log(`Saved enriched file to ${OUTPUT_PATH}`)
}

run()
