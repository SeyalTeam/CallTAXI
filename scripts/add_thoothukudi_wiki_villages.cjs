// Add missing Thoothukudi villages from Wikipedia list to the dataset.
// Run: node scripts/add_thoothukudi_wiki_villages.cjs
const fs = require('fs')
const path = require('path')

const DATA_PATH = path.join(__dirname, '..', 'public', 'tamil_nadu_locations.json')
const WIKI_PATH = path.join(__dirname, '..', 'data', 'thoothukudi_wiki_villages.json')
const BOUNDARY_PATH = path.join(
  __dirname,
  '..',
  'data',
  'geoBoundaries-IND-ADM2_simplified.geojson',
)

const WAIT_MS = 1100

const wait = (ms) => new Promise((res) => setTimeout(res, ms))

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function normalize(val) {
  return String(val || '')
    .toLowerCase()
    .replace(/,\\s*tamil\\s*nadu/i, '')
    .replace(/[^a-z0-9\\s]/g, '')
    .replace(/\\s+/g, ' ')
    .trim()
}

function normalizeDistrict(val) {
  const v = String(val || '').trim()
  if (!v) return ''
  if (/^thoothukudi$/i.test(v)) return 'Thoothukkudi'
  return v
}

function computeBbox(coords) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const walk = (arr) => {
    if (!Array.isArray(arr)) return
    if (typeof arr[0] === 'number' && typeof arr[1] === 'number') {
      const x = arr[0]
      const y = arr[1]
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
      return
    }
    for (const item of arr) walk(item)
  }
  walk(coords)
  return [minX, minY, maxX, maxY]
}

function pointInRing(point, ring) {
  const x = point[0]
  const y = point[1]
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function pointInPolygon(point, polygon) {
  if (!polygon || polygon.length === 0) return false
  if (!pointInRing(point, polygon[0])) return false
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(point, polygon[i])) return false
  }
  return true
}

function pointInMultiPolygon(point, multiPolygon) {
  for (const polygon of multiPolygon) {
    if (pointInPolygon(point, polygon)) return true
  }
  return false
}

function pointInGeometry(point, geometry) {
  if (!geometry) return false
  if (geometry.type === 'Polygon') return pointInPolygon(point, geometry.coordinates)
  if (geometry.type === 'MultiPolygon') return pointInMultiPolygon(point, geometry.coordinates)
  return false
}

function buildFeatures(geojson) {
  const features = []
  for (const feature of geojson.features || []) {
    const name = feature.properties && feature.properties.shapeName
    if (!name || !feature.geometry) continue
    const bbox = computeBbox(feature.geometry.coordinates)
    features.push({
      name,
      bbox,
      geometry: feature.geometry,
    })
  }
  return features
}

function findDistrict(point, features) {
  for (const f of features) {
    const [minX, minY, maxX, maxY] = f.bbox
    if (point[0] < minX || point[0] > maxX || point[1] < minY || point[1] > maxY) continue
    if (pointInGeometry(point, f.geometry)) return f.name
  }
  return undefined
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

async function geocodeVillage(name, attempt = 0) {
  const clean = name.replace(/,\\s*tamil\\s*nadu/i, '').trim()
  const queries = [
    `${clean}, Thoothukkudi, Tamil Nadu, India`,
    `${clean}, Thoothukudi, Tamil Nadu, India`,
    `${clean}, Tamil Nadu, India`,
  ]

  for (const q of queries) {
    const url = new URL('https://nominatim.openstreetmap.org/search')
    url.searchParams.set('q', q)
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('addressdetails', '1')
    url.searchParams.set('limit', '5')
    url.searchParams.set('countrycodes', 'in')

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'KaniTaxi/1.0 (admin@kanitaxi.com)' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch (err) {
      if (attempt < 2) {
        await wait(1200 * (attempt + 1))
        return geocodeVillage(name, attempt + 1)
      }
      return []
    }
  }
  return []
}

function scoreMatch(item) {
  const addr = item.address || {}
  let score = 0
  const state = String(addr.state || '').toLowerCase()
  if (state.includes('tamil nadu')) score += 2

  const district = String(
    addr.state_district || addr.district || addr.county || addr.city_district || '',
  ).toLowerCase()
  if (district.includes('thoothukudi') || district.includes('thoothukkudi')) score += 3

  return score
}

async function run() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error('Dataset not found:', DATA_PATH)
    process.exit(1)
  }
  if (!fs.existsSync(WIKI_PATH)) {
    console.error('Wikipedia list not found:', WIKI_PATH)
    process.exit(1)
  }
  if (!fs.existsSync(BOUNDARY_PATH)) {
    console.error('Boundary file not found:', BOUNDARY_PATH)
    process.exit(1)
  }

  const data = readJson(DATA_PATH)
  const places = Array.isArray(data.places) ? data.places : []
  const wiki = readJson(WIKI_PATH)
  const boundaries = readJson(BOUNDARY_PATH)
  const features = buildFeatures(boundaries)

  const index = new Map()
  for (const p of places) {
    const key = normalize(p.name)
    if (!index.has(key)) index.set(key, [])
    index.get(key).push(p)
  }

  const added = []
  const unresolved = []

  for (let i = 0; i < wiki.length; i++) {
    const name = wiki[i]
    const key = normalize(name)
    const existing = index.get(key) || []
    const hasThoothukudi = existing.some(
      (e) => String(e.district || '').toLowerCase() === 'thoothukkudi',
    )
    if (hasThoothukudi) continue

    const results = await geocodeVillage(name)
    await wait(WAIT_MS)

    if (!results || results.length === 0) {
      unresolved.push(name)
      continue
    }

    const best = results
      .map((r) => ({ r, score: scoreMatch(r) }))
      .sort((a, b) => b.score - a.score)[0].r

    if (!best || !best.lat || !best.lon) {
      unresolved.push(name)
      continue
    }

    const lat = String(best.lat)
    const lon = String(best.lon)
    const point = [Number(lon), Number(lat)]
    const boundaryDistrict = findDistrict(point, features)
    const addr = best.address || {}
    const addrDistrict = pickDistrict(addr)
    const district = normalizeDistrict(boundaryDistrict || addrDistrict)

    if (!district || !/thoothukkudi/i.test(district)) {
      unresolved.push(name)
      continue
    }

    const entry = {
      district,
      name: name.replace(/,\\s*tamil\\s*nadu/i, '').trim(),
      display_name: best.display_name || `${name}, ${district}, Tamil Nadu, India`,
      lat,
      lon,
      raw_addr: addr,
    }

    const taluk = pickTaluk(addr)
    const panchayat = pickPanchayat(addr)
    if (taluk) entry.taluk = taluk
    if (panchayat) entry.panchayat = panchayat

    places.push(entry)
    if (!index.has(key)) index.set(key, [])
    index.get(key).push(entry)
    added.push(entry.name)
  }

  places.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))

  const out = {
    meta: {
      ...data.meta,
      enrichedAt: new Date().toISOString(),
      wikiList: 'Category:Villages in Thoothukudi district',
    },
    places,
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(out, null, 2))

  console.log(`Added ${added.length} villages.`)
  if (unresolved.length > 0) {
    console.log(`Unresolved (${unresolved.length}): ${unresolved.join(', ')}`)
  }
}

run()
