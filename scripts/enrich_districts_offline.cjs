// Offline district enrichment using geoBoundaries ADM2 GeoJSON.
// Run: node scripts/enrich_districts_offline.cjs
const fs = require('fs')
const path = require('path')

const INPUT_PATH = path.join(__dirname, '..', 'public', 'tamil_nadu_locations.json')
const BOUNDARY_PATH = path.join(
  __dirname,
  '..',
  'data',
  'geoBoundaries-IND-ADM2_simplified.geojson',
)
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'tamil_nadu_locations.enriched.json')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
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

function run() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error('Input not found:', INPUT_PATH)
    process.exit(1)
  }
  if (!fs.existsSync(BOUNDARY_PATH)) {
    console.error('Boundary file not found:', BOUNDARY_PATH)
    process.exit(1)
  }

  const input = readJson(INPUT_PATH)
  const places = Array.isArray(input.places) ? input.places : []
  const boundaries = readJson(BOUNDARY_PATH)

  const features = buildFeatures(boundaries)
  console.log(`Loaded ${features.length} district polygons.`)

  let updated = 0
  for (let i = 0; i < places.length; i++) {
    const loc = places[i]
    const lat = Number(loc.lat)
    const lon = Number(loc.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue

    const district = findDistrict([lon, lat], features)
    if (district) {
      if (!loc.district || loc.district === 'Tamil Nadu') {
        loc.district = district
        updated++
      }
      if (!loc.raw_addr) loc.raw_addr = {}
      if (!loc.raw_addr.state_district) loc.raw_addr.state_district = district
    }

    if (i > 0 && i % 2000 === 0) {
      console.log(`Progress: ${i}/${places.length} (updated districts: ${updated})`)
    }
  }

  const out = {
    meta: {
      ...input.meta,
      enrichedAt: new Date().toISOString(),
      source: 'geoBoundaries gbOpen ADM2 (ODbL 1.0)',
    },
    places,
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2))
  console.log(`Done. Updated ${updated} districts.`)
  console.log(`Saved enriched file to ${OUTPUT_PATH}`)
}

run()
