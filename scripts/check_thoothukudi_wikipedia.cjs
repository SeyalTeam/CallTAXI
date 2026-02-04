// Compare Wikipedia "Villages in Thoothukudi district" list to local dataset.
// Run: node scripts/check_thoothukudi_wikipedia.cjs
const fs = require('fs')
const path = require('path')

const DATA_PATH = path.join(__dirname, '..', 'public', 'tamil_nadu_locations.json')
const WIKI_PATH = path.join(__dirname, '..', 'data', 'thoothukudi_wiki_villages.json')

function normalize(val) {
  return String(val || '')
    .toLowerCase()
    .replace(/,\\s*tamil\\s*nadu/i, '')
    .replace(/[^a-z0-9\\s]/g, '')
    .replace(/\\s+/g, ' ')
    .trim()
}

function run() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error('Dataset not found:', DATA_PATH)
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  const WIKI_VILLAGES = JSON.parse(fs.readFileSync(WIKI_PATH, 'utf8'))
  const places = Array.isArray(data.places) ? data.places : []

  const index = new Map()
  for (const p of places) {
    const key = normalize(p.name)
    if (!key) continue
    if (!index.has(key)) index.set(key, [])
    index.get(key).push(p)
  }

  const found = []
  const missing = []
  const wrongDistrict = []

  for (const name of WIKI_VILLAGES) {
    const key = normalize(name)
    const hits = index.get(key)
    if (!hits || hits.length === 0) {
      missing.push(name)
      continue
    }
    found.push(name)
    const notThoothukudi = hits.filter(
      (h) => String(h.district || '').toLowerCase() !== 'thoothukkudi',
    )
    if (notThoothukudi.length > 0) {
      wrongDistrict.push({
        name,
        districts: [...new Set(notThoothukudi.map((h) => h.district || 'UNKNOWN'))],
      })
    }
  }

  console.log(`Total Wikipedia villages: ${WIKI_VILLAGES.length}`)
  console.log(`Found in dataset: ${found.length}`)
  console.log(`Missing from dataset: ${missing.length}`)
  if (missing.length) {
    console.log('Missing list:')
    console.log(missing.join(', '))
  }
  if (wrongDistrict.length) {
    console.log('Found but assigned to other districts:')
    for (const item of wrongDistrict) {
      console.log(`- ${item.name}: ${item.districts.join(', ')}`)
    }
  }
}

run()
