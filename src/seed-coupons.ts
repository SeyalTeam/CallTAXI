import 'dotenv/config'
import config from './payload.config'
import { getPayload } from 'payload'

const seed = async () => {
  console.log('Starting seed...')
  const payload = await getPayload({ config })

  // Fetch some vehicles to use for specific vehicle coupons
  const vehicles = await payload.find({ collection: 'vehicles', limit: 3 })
  const vehicleIds = vehicles.docs.map((v) => v.id)

  const coupons = [
    {
      name: 'WELCOME50',
      percentage: 50,
      tariffScope: 'all',
      vehicleScope: 'all',
      active: true,
      usageLimit: 100,
    },
    {
      name: 'SUMMER25',
      percentage: 25,
      tariffScope: 'packages',
      vehicleScope: 'all',
      active: true,
    },
    {
      name: 'LONGDRIVE15',
      percentage: 15,
      tariffScope: 'roundtrip',
      vehicleScope: 'all',
      active: true,
      expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    },
    {
      name: 'CITYZOOM10',
      percentage: 10,
      tariffScope: 'oneway',
      vehicleScope: 'all',
      active: true,
    },
  ]

  // Add a specific vehicle coupon if we have vehicles
  if (vehicleIds.length > 0) {
    coupons.push({
      name: 'PREMIUMRIDE20',
      percentage: 20,
      tariffScope: 'all',
      vehicleScope: 'specific',
      vehicles: vehicleIds,
      active: true,
    })
  }

  for (const coupon of coupons) {
    try {
      const existing = await payload.find({
        collection: 'coupons',
        where: {
          name: {
            equals: coupon.name,
          },
        },
      })

      if (existing.totalDocs === 0) {
        await payload.create({
          collection: 'coupons',
          data: coupon as any,
        })
        console.log(`Created coupon: ${coupon.name}`)
      } else {
        console.log(`Coupon already exists: ${coupon.name}`)
      }
    } catch (e) {
      console.error(`Failed to create coupon ${coupon.name}:`, e)
    }
  }

  console.log('Seed complete.')
  process.exit(0)
}

seed()
