import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Driver } from '@/payload-types'

type DriverCreate = Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>

const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

const normalizeOptionalText = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
}

export const POST = async (request: Request) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = (await request.json()) as Partial<DriverCreate>

    const name = normalizeOptionalText(body.name)
    const phone = normalizeOptionalText(body.phone)
    const address = normalizeOptionalText(body.address)
    const experience = Number(body.experience)

    if (!name || !phone || !address || Number.isNaN(experience) || experience < 0) {
      return Response.json(
        {
          error:
            'Missing or invalid required fields: name, phone, address, and non-negative experience',
        },
        {
          status: 400,
          headers: corsHeaders,
        },
      )
    }

    const driverData: DriverCreate = {
      name,
      phone,
      address,
      experience,
      aadharNo: normalizeOptionalText(body.aadharNo),
      panNo: normalizeOptionalText(body.panNo),
      license: normalizeOptionalText(body.license),
      photo: body.photo ?? undefined,
      status: 'available',
    }

    const result = await payload.create({
      collection: 'drivers',
      data: driverData,
    })

    return Response.json(
      {
        success: true,
        driverId: result.id,
        message: 'Driver created successfully',
      },
      {
        status: 201,
        headers: corsHeaders,
      },
    )
  } catch (error) {
    console.error('Driver creation failed:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    )
  }
}
