import type { CollectionConfig } from 'payload'
import { generatePaymentLink } from '../endpoints/generatePaymentLink'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  endpoints: [
    {
      path: '/:id/payment-link',
      method: 'post',
      handler: generatePaymentLink,
    },
  ],
  defaultSort: '-createdAt',
  admin: {
    group: 'Collection',
    defaultColumns: [
      'customerName',
      'customerPhone',
      'tripType',
      'pickupLocationName',
      'dropoffLocationName',
      'estimatedFare',
      'distanceKm',
      'pickupDateTime',
      'status',
      'paymentStatus',
      'paymentAmount',
    ],
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if ((operation === 'create' || operation === 'update') && data.customerPhone) {
          const existingCustomer = await req.payload.find({
            collection: 'customers',
            where: {
              phone: {
                equals: data.customerPhone,
              },
            },
            limit: 1,
            depth: 0,
          })

          if (existingCustomer.docs.length > 0) {
            data.customer = existingCustomer.docs[0].id
          } else {
            const newCustomer = await req.payload.create({
              collection: 'customers',
              data: {
                name: data.customerName || 'Unknown',
                phone: data.customerPhone,
              },
            })
            data.customer = newCustomer.id
          }
        }
        if (operation === 'create' && !data.bookingCode) {
          let code = ''
          let isUnique = false
          while (!isUnique) {
            code = Math.floor(100000 + Math.random() * 900000).toString()
            const existing = await req.payload.find({
              collection: 'bookings',
              where: {
                bookingCode: {
                  equals: code,
                },
              },
              limit: 0,
            })
            if (existing.docs.length === 0) {
              isUnique = true
            }
          }
          data.bookingCode = code
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const newDriverId = typeof doc.driver === 'object' ? doc.driver?.id : doc.driver
        const oldDriverId = previousDoc
          ? typeof previousDoc.driver === 'object'
            ? previousDoc.driver?.id
            : previousDoc.driver
          : null
        const newVehicleId = typeof doc.vehicle === 'object' ? doc.vehicle?.id : doc.vehicle
        const oldVehicleId = previousDoc
          ? typeof previousDoc.vehicle === 'object'
            ? previousDoc.vehicle?.id
            : previousDoc.vehicle
          : null

        // If a new driver is assigned or the driver has changed
        if (newDriverId && newDriverId !== oldDriverId) {
          await req.payload.update({
            collection: 'drivers',
            id: newDriverId,
            data: {
              status: 'driving',
            } as any,
          })
        }

        // If the old driver was replaced or unassigned, set them back to available
        if (oldDriverId && oldDriverId !== newDriverId) {
          await req.payload.update({
            collection: 'drivers',
            id: oldDriverId,
            data: {
              status: 'available',
            } as any,
          })
        }

        // If a new vehicle is assigned or the vehicle has changed
        if (newVehicleId && newVehicleId !== oldVehicleId) {
          await req.payload.update({
            collection: 'vehicles',
            id: newVehicleId,
            data: {
              status: 'driving',
            } as any,
          })
        }

        // If the old vehicle was replaced or unassigned, set it back to available
        if (oldVehicleId && oldVehicleId !== newVehicleId) {
          await req.payload.update({
            collection: 'vehicles',
            id: oldVehicleId,
            data: {
              status: 'available',
            } as any,
          })
        }

        // Release driver if booking is completed
        if (doc.status === 'completed' && newDriverId) {
          await req.payload.update({
            collection: 'drivers',
            id: newDriverId,
            data: {
              status: 'available',
            } as any,
          })
        }

        // Release vehicle if booking is completed
        if (doc.status === 'completed' && newVehicleId) {
          await req.payload.update({
            collection: 'vehicles',
            id: newVehicleId,
            data: {
              status: 'available',
            } as any,
          })
        }
      },
    ],
  },
  fields: [
    { name: 'customerName', type: 'text', required: true },
    { name: 'customerPhone', type: 'text', required: true },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    { name: 'vehicle', type: 'relationship', relationTo: 'vehicles', required: true },
    {
      name: 'tripType',
      type: 'select',
      options: ['oneway', 'roundtrip', 'packages', 'multilocation'],
      required: true,
    },
    {
      name: 'driver',
      type: 'relationship',
      relationTo: 'drivers',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },

    { name: 'pickupLocation', type: 'point', required: true },
    { name: 'pickupLocationName', type: 'text', required: true },

    { name: 'dropoffLocation', type: 'point', required: false },
    { name: 'dropoffLocationName', type: 'text', required: false },

    // Tour Locations
    {
      name: 'tourLocations',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'point', type: 'point', required: true },
      ],
      admin: {
        condition: (data) => data.tripType === 'multilocation',
      },
    },

    {
      name: 'pickupDateTime',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'dropDateTime',
      type: 'date',
      required: false,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    { name: 'estimatedFare', type: 'number', required: false },
    { name: 'couponCode', type: 'text', required: false },
    { name: 'discountAmount', type: 'number', required: false },
    { name: 'distanceKm', type: 'number', required: false },
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'confirmed', 'cancelled', 'completed'],
      defaultValue: 'pending',
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: ['unpaid', 'partial', 'paid', 'failed'],
      defaultValue: 'unpaid',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentAmount',
      type: 'number',
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentType',
      type: 'select',
      options: ['minimum', 'full'],
      required: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'razorpayOrderId',
      type: 'text',
      required: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'razorpayPaymentId',
      type: 'text',
      required: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'razorpaySignature',
      type: 'text',
      required: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'bookingCode',
      type: 'text',
      unique: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    { name: 'notes', type: 'textarea' },
  ],
  access: { create: () => true, read: () => true, update: () => true, delete: () => true },
}
