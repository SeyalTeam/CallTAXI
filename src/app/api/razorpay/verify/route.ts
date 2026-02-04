import { createHmac } from 'crypto'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Booking } from '@/payload-types'

type BookingCreate = Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>

type VerifyBody = {
  booking?: Partial<BookingCreate>
  payment?: {
    razorpay_order_id?: string
    razorpay_payment_id?: string
    razorpay_signature?: string
    amount?: number
    paymentType?: 'minimum' | 'full'
  }
}

export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as VerifyBody
    const booking = body.booking
    const payment = body.payment

    if (!booking || !payment) {
      return Response.json({ error: 'Missing booking or payment data' }, { status: 400 })
    }

    const isNonEmptyString = (value: unknown) =>
      typeof value === 'string' && value.trim().length > 0

    const isPoint = (value: unknown): value is [number, number] =>
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'

    const tripType = booking.tripType
    const needsDropoff = tripType === 'oneway' || tripType === 'roundtrip'

    if (
      !isNonEmptyString(booking.customerName) ||
      !isNonEmptyString(booking.customerPhone) ||
      !isNonEmptyString(booking.vehicle) ||
      !isNonEmptyString(tripType) ||
      !isPoint(booking.pickupLocation) ||
      !isNonEmptyString(booking.pickupLocationName) ||
      !isNonEmptyString(booking.pickupDateTime)
    ) {
      return Response.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    if (
      needsDropoff &&
      (!isPoint(booking.dropoffLocation) || !isNonEmptyString(booking.dropoffLocationName))
    ) {
      return Response.json({ error: 'Missing drop-off details' }, { status: 400 })
    }

    const orderId = payment.razorpay_order_id
    const paymentId = payment.razorpay_payment_id
    const signature = payment.razorpay_signature
    const amountPaise = payment.amount
    const paymentType = payment.paymentType

    if (!orderId || !paymentId || !signature || !amountPaise) {
      return Response.json({ error: 'Incomplete payment details' }, { status: 400 })
    }

    if (!paymentType) {
      return Response.json({ error: 'Payment type is required' }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return Response.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
    }

    const expectedSignature = createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (expectedSignature !== signature) {
      return Response.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const estimatedFare = Number(booking.estimatedFare ?? 0)
    const discountAmount = Number(booking.discountAmount ?? 0)
    const payable = Math.max(estimatedFare - discountAmount, 0)
    const paidAmount = Number((amountPaise / 100).toFixed(2))
    const minRequired = Math.min(500, payable)

    if (paymentType === 'full' && paidAmount + 0.01 < payable) {
      return Response.json({ error: 'Full payment amount is insufficient' }, { status: 400 })
    }

    if (paymentType === 'minimum' && paidAmount + 0.01 < minRequired) {
      return Response.json({ error: 'Minimum payment amount is insufficient' }, { status: 400 })
    }

    const paymentStatus = paidAmount + 0.01 < payable ? 'partial' : 'paid'

    const payload = await getPayload({
      config: configPromise,
    })

    const bookingData = booking as BookingCreate
    const bookingDoc = await payload.create({
      collection: 'bookings',
      data: {
        ...bookingData,
        status: 'confirmed',
        paymentStatus,
        paymentAmount: paidAmount,
        paymentType,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
      },
    })

    return Response.json({ bookingId: bookingDoc.id })
  } catch (error) {
    console.error('Razorpay verification failed', error)
    return Response.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}
