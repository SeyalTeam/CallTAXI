import { PayloadHandler } from 'payload'

export const getCustomerReport: PayloadHandler = async (req): Promise<Response> => {
  const { payload, user } = req

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all confirmed bookings.
    // Optimization: In a large system, we would use a more direct database aggregation.
    // using find with a large limit for now as per project scale.
    const bookings = await payload.find({
      collection: 'bookings',
      limit: 5000,
      where: {
        or: [{ status: { equals: 'confirmed' } }, { status: { equals: 'completed' } }],
      },
      depth: 0,
    })

    const customerStats: Record<
      string,
      { name: string; phone: string; count: number; totalAmount: number }
    > = {}

    for (const booking of bookings.docs) {
      // Use phone as unique key since name usually accompanies it and ID might vary if not linked
      const phone = booking.customerPhone || 'Unknown'
      const name = booking.customerName || 'Unknown'

      const key = phone

      if (!customerStats[key]) {
        customerStats[key] = {
          name,
          phone,
          count: 0,
          totalAmount: 0,
        }
      }

      customerStats[key].count += 1
      customerStats[key].totalAmount += booking.estimatedFare || 0
    }

    const reportData = Object.values(customerStats).sort((a, b) => b.totalAmount - a.totalAmount)

    return Response.json(reportData)
  } catch (error) {
    payload.logger.error(error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
