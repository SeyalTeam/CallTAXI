import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { getPayload } from 'payload'

const checkData = async () => {
  try {
    // Dynamic import to ensure env is loaded first
    const config = (await import('./payload.config')).default
    const payload = await getPayload({ config })

    console.log('--- VEHICLES ---')
    const vehicles = await payload.find({
      collection: 'vehicles',
      limit: 100,
    })
    console.log(`Total Vehicles: ${vehicles.totalDocs}`)
    vehicles.docs.forEach((v) => {
      console.log(`- ID: ${v.id}, Name: ${v.name}, Category: ${v.category}`)
    })

    console.log('\n--- TARIFFS ---')
    const tariffs = await payload.find({
      collection: 'tariffs',
      limit: 100,
      depth: 2,
    })
    console.log(`Total Tariffs: ${tariffs.totalDocs}`)
    tariffs.docs.forEach((t) => {
      const v = typeof t.vehicle === 'object' ? t.vehicle : null
      console.log(
        `- ID: ${t.id}, Vehicle: ${v ? v.name : t.vehicle} (Category: ${v ? v.category : 'N/A'})`,
      )
    })

    process.exit(0)
  } catch (error) {
    console.error('Error checking data:', error)
    process.exit(1)
  }
}

checkData()
