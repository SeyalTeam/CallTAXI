import type { CollectionConfig } from 'payload'

export const VehicleImages: CollectionConfig = {
  slug: 'vehicle-images',
  admin: {
    hidden: true,
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'vehicle-images',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}

export const VehicleIcons: CollectionConfig = {
  slug: 'vehicle-icons',
  admin: {
    hidden: true,
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'vehicle-icons',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}

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
      name: 'seatCount',
      type: 'number',
      label: 'Seat Count',
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
      relationTo: 'vehicle-images',
      required: true,
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'vehicle-icons',
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
