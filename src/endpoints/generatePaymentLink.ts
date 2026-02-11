import { PayloadHandler } from 'payload'
import Razorpay from 'razorpay'

export const generatePaymentLink: PayloadHandler = async (req): Promise<Response> => {
  const { payload } = req
  
  // Try to get user from req first, then fall back to explicit auth check
  let user = (req as any).user
  if (!user) {
    const authResult = await payload.auth({ headers: req.headers })
    user = authResult.user
  }

  if (!user) {
    return Response.json({ 
      error: 'Unauthorized', 
      debug: { 
        hasReqUser: !!(req as any).user,
        authHeaderPresent: !!req.headers.get('authorization'),
      } 
    }, { status: 401 })
  }

  try {
    if (!req.json) {
       return Response.json({ error: 'Request body is missing' }, { status: 400 })
    }
    const body = await req.json()
    const { bookingId } = body as { bookingId: string }

    if (!bookingId) {
      return Response.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const booking = await payload.findByID({
      collection: 'bookings',
      id: bookingId,
    })

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    const estimatedFare = Number(booking.estimatedFare ?? 0)
    const paidAmount = Number(booking.paymentAmount ?? 0)
    const remainingAmount = Math.max(estimatedFare - paidAmount, 0)

    if (remainingAmount <= 0) {
      return Response.json({ error: 'Booking is already fully paid' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return Response.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // Generate a unique reference id for the payment link
    const referenceId = `pay_${booking.bookingCode || booking.id}_${Date.now()}`

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(remainingAmount * 100), // in paise
      currency: 'INR',
      accept_partial: false,
      description: `Remaining payment for Booking #${booking.bookingCode || booking.id}`,
      customer: {
        name: booking.customerName,
        contact: booking.customerPhone,
      },
      notify: {
        sms: true,
        email: false,
      },
      reminder_enable: true,
      notes: {
        bookingId: booking.id,
        bookingCode: booking.bookingCode || '',
      },
      callback_url: `https://kanitaxi.com/payment-success?bookingId=${booking.id}`,
      callback_method: 'get',
      reference_id: referenceId,
    })

    return Response.json({
      url: paymentLink.short_url,
      amount: remainingAmount,
      message: `Dear ${booking.customerName}, please pay the remaining amount of ₹${remainingAmount} for your KaniTaxi booking #${booking.bookingCode || booking.id} using this link: ${paymentLink.short_url}`
    })
  } catch (error: unknown) {
    console.error('Payment link generation failed', error)
    return Response.json({ error: (error as Error).message || 'Failed to generate payment link' }, { status: 500 })
  }
}
