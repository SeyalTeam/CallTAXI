import { PayloadHandler } from 'payload'

export const getBookingReport: PayloadHandler = async (req): Promise<Response> => {
  const { payload, query } = req
  // query is typically a plain object in Payload
  const params = query as Record<string, string>

  try {
    const startDate = params.startDate
    const endDate = params.endDate
    const status = params.status
    const tripType = params.tripType

    const where: any = {}
    const and: any[] = []

    if (startDate) {
      const [y, m, d] = startDate.split('-').map(Number)
      const start = new Date(y, m - 1, d) // Local start of day
      start.setHours(0, 0, 0, 0)
      and.push({
        pickupDateTime: {
          greater_than_equal: start.toISOString(),
        },
      })

      // If no endDate provided, limit to end of startDate
      if (!endDate) {
        const end = new Date(y, m - 1, d)
        end.setHours(23, 59, 59, 999)
        and.push({
          pickupDateTime: {
            less_than_equal: end.toISOString(),
          },
        })
      }
    }

    if (endDate) {
      const [y, m, d] = endDate.split('-').map(Number)
      const end = new Date(y, m - 1, d) // Local start of day
      end.setHours(23, 59, 59, 999) // Local end of day
      and.push({
        pickupDateTime: {
          less_than_equal: end.toISOString(),
        },
      })
    }

    if (status && status !== 'all') {
      where.status = {
        equals: status,
      }
    }

    if (tripType && tripType !== 'all') {
      where.tripType = {
        equals: tripType,
      }
    }

    const customerPhone = params.customerPhone
    if (customerPhone) {
      where.customerPhone = {
        equals: customerPhone,
      }
    }

    if (and.length > 0) {
      where.and = and
    }

    const bookings = await payload.find({
      collection: 'bookings',
      where,
      limit: 100,
      sort: '-createdAt',
      depth: 1,
    })

    return Response.json(bookings)
  } catch (error: unknown) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
