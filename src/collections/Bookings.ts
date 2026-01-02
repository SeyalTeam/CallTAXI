import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
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
      'status',
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
        return data
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
      options: ['oneway', 'roundtrip', 'packages'],
      required: true,
    },

    { name: 'pickupLocation', type: 'point', required: true },
    { name: 'pickupLocationName', type: 'text', required: true },

    { name: 'dropoffLocation', type: 'point', required: false },
    { name: 'dropoffLocationName', type: 'text', required: false },

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
    {
      name: 'status',
      type: 'select',
      options: ['pending', 'confirmed', 'cancelled'],
      defaultValue: 'pending',
    },
    { name: 'notes', type: 'textarea' },
  ],
  access: { create: () => true, read: () => true, update: () => true, delete: () => true },
}
