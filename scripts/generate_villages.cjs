const fs = require('fs')
const path = require('path')
const axios = require('axios').default

const OVERPASS_URL = 'http://overpass-api.de/api/interpreter'

// Tamil Nadu relation ID in OSM is 96905
// We add 3600000000 to get the area ID
const QUERY = `
[out:json][timeout:180];
area(id:3600096905)->.searchArea;
(
  node["place"~"city|town|village|hamlet|suburb|locality"](area.searchArea);
);
out body;
`

async function generateVillages() {
  console.log(
    `[${new Date().toISOString()}] Fetching data from Overpass API (this may take a minute)...`,
  )
  try {
    const response = await axios.get(OVERPASS_URL, {
      params: { data: QUERY },
      timeout: 200000,
    })
    const data = response.data

    const nodes = data.elements || []
    console.log(`[${new Date().toISOString()}] Received ${nodes.length} locations. Processing...`)

    const places = []
    for (const node of nodes) {
      const tags = node.tags || {}
      const name = tags.name
      if (!name) continue

      // Try to find district/county info
      const district =
        tags['addr:district'] ||
        tags['is_in:county'] ||
        tags['is_in:district'] ||
        tags.county ||
        'Tamil Nadu'

      const taluk =
        tags['addr:subdistrict'] ||
        tags['is_in:subdistrict'] ||
        tags['is_in:tehsil'] ||
        tags['is_in:taluk'] ||
        tags.subdistrict ||
        tags.tehsil ||
        tags.taluk ||
        tags.block ||
        tags.sub_district

      const panchayat =
        tags.panchayat ||
        tags['addr:panchayat'] ||
        tags.village_panchayat ||
        tags.grampanchayat ||
        tags.grama_panchayat ||
        tags.panchayat_name

      const place = {
        district: district,
        taluk: taluk,
        panchayat: panchayat,
        name: name,
        display_name: `${name}, ${taluk ? taluk + ', ' : ''}${district}, Tamil Nadu, India`,
        lat: String(node.lat),
        lon: String(node.lon),
        raw_addr: {
          village: name,
          state_district: district,
          subdistrict: taluk,
          panchayat: panchayat,
          state: 'Tamil Nadu',
          country: 'India',
          country_code: 'in',
        },
      }
      if (tags['addr:postcode']) {
        place.raw_addr.postcode = tags['addr:postcode']
      }
      places.push(place)
    }

    // Sort by name
    places.sort((a, b) => a.name.localeCompare(b.name))

    const outputData = {
      meta: {
        generatedAt: new Date().toISOString(),
        count: places.length,
      },
      places: places,
    }

    const outPath = path.join(process.cwd(), 'public', 'tamil_nadu_locations.json')
    fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2))

    console.log(
      `[${new Date().toISOString()}] Successfully saved ${places.length} villages to ${outPath}`,
    )
  } catch (error) {
    console.error('Error in generateVillages:', error.message)
    if (error.response) {
      console.error('Data:', error.response.data)
    }
  }
}

generateVillages()
