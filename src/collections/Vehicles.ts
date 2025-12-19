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
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
  access: {
    create: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    read: () => true, // Public access for read
    update: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
