import type { CollectionConfig } from 'payload'

export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'number',
      type: 'text',
      required: true,
    },
    {
      name: 'ownerName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastFc',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
  ],
  access: {
    create: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    read: ({ req: { user } }) => {
      if (user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'accounts') {
        return true
      }
      if (user?.role === 'driver') {
        return { id: { equals: user.id } } // Adjust if linking to drivers later
      }
      return false
    },
    update: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
