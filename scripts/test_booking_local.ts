import configPromise from '../src/payload.config'
import { getPayload } from 'payload'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.resolve('/Users/castromurugan/Documents/KaniTaxi/calltaxi/.env')
console.log('Loading .env from:', envPath)
dotenv.config({ path: envPath })

async function testBooking() {
  console.log('Starting booking creation test...')

  if (!process.env.PAYLOAD_SECRET) {
    console.error('PAYLOAD_SECRET is missing from environment. Tests may fail.')
  }

  const payload = await getPayload({ config: configPromise })

  try {
    const testBookingData = {
      customerName: 'Test User',
      customerPhone: '9876543210',
      tripType: 'oneway',
      vehicle: '67990422df563fcd7c519f96', // Use a real ID if possible, but let's see if it fails on validation
      pickupLocation: [80.2707, 13.0827],
      pickupLocationName: 'Chennai Central',
      dropoffLocation: [79.9723, 12.8344],
      dropoffLocationName: 'Kanchipuram',
      pickupDateTime: new Date().toISOString(),
      estimatedFare: 1500,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentAmount: 1500,
      paymentType: 'full',
      razorpayOrderId: 'order_test_123',
      razorpayPaymentId: 'pay_test_456',
      razorpaySignature: 'sig_test_789',
    }

    console.log('Attempting to create booking...')
    const result = await payload.create({
      collection: 'bookings',
      data: testBookingData as any,
    })

    console.log('Booking created successfully! ID:', result.id)
  } catch (error) {
    console.error('Booking creation failed:')
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(error)
    }
  }

  process.exit(0)
}

testBooking()
