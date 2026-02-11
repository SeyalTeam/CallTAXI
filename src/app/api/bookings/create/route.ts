import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Booking } from '@/payload-types'

type BookingCreate = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>

export const POST = async (request: Request) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = (await request.json()) as Partial<BookingCreate>

    if (!body.customerName || !body.customerPhone || !body.vehicle || !body.tripType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const bookingData = {
      ...body,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentAmount: 0,
    }

    const result = await payload.create({
      collection: 'bookings',
      data: bookingData as unknown as Booking,
    })

    return Response.json({
      bookingId: result.id,
      bookingCode: (result as any).bookingCode,
    })
  } catch (error) {
    console.error('Booking creation failed:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    )
  }
}
