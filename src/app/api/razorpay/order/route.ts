export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as {
      amount?: number
      currency?: string
      receipt?: string
    }

    const amount = body.amount
    if (!amount || typeof amount !== 'number' || amount < 1) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return Response.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
    }

    const { default: Razorpay } = await import('razorpay')
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: body.currency || 'INR',
      receipt: body.receipt || `booking_${Date.now()}`,
    })

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    })
  } catch (error) {
    console.error('Razorpay order creation failed', error)
    return Response.json({ error: 'Failed to create Razorpay order' }, { status: 500 })
  }
}
