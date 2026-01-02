import { getPayload } from 'payload'
import config from './payload.config'
import { fileURLToPath } from 'url'
import path from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const verifyBookings = async () => {
  const payload = await getPayload({ config })
  const bookings = await payload.find({
    collection: 'bookings',
    limit: 100,
  })

  console.log('Total Bookings:', bookings.totalDocs)
  bookings.docs.forEach((b) => {
    console.log(`ID: ${b.id}, Time: ${b.pickupDateTime}, Status: ${b.status}`)
  })

  process.exit(0)
}

verifyBookings()
