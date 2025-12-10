import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      unique: true, // Ensuring unique customers by phone
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'bookings',
      type: 'join',
      collection: 'bookings',
      on: 'customer',
    },
  ],
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },
}
