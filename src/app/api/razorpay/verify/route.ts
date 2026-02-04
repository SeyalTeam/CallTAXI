import { createHmac } from 'crypto'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

type VerifyBody = {
  booking?: Record<string, unknown>
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

    const bookingDoc = await payload.create({
      collection: 'bookings',
      data: {
        ...booking,
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
