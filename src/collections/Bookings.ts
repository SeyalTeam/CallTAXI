import type { CollectionConfig } from 'payload'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  fields: [
    { name: 'customerName', type: 'text', required: true },
    { name: 'customerPhone', type: 'text', required: true },
    { name: 'vehicle', type: 'relationship', relationTo: 'vehicles', required: true },
    { name: 'tripType', type: 'select', options: ['oneway', 'roundtrip'], required: true },

    { name: 'pickupLocation', type: 'point', required: true },
    { name: 'pickupLocationName', type: 'text', required: true },

    { name: 'dropoffLocation', type: 'point', required: true },
    { name: 'dropoffLocationName', type: 'text', required: true },

    { name: 'pickupDateTime', type: 'date', required: true },
    { name: 'dropDateTime', type: 'date', required: false },
    { name: 'estimatedFare', type: 'number', required: false },
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
