import type { CollectionConfig } from 'payload'

export const VehicleImages: CollectionConfig = {
  slug: 'vehicle-images',
  admin: {
    group: 'Collection',
    hidden: true,
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'vehicle-images',
    mimeTypes: ['image/*'],
    resizeOptions: {
      width: 1280,
      fit: 'inside',
      withoutEnlargement: true,
    },
    imageSizes: [
      {
        name: 'card',
        width: 640,
        height: 480,
        position: 'centre',
      },
      {
        name: 'thumbnail',
        width: 320,
        height: 240,
        position: 'centre',
      },
    ],
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
    group: 'Collection',
    hidden: true,
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'vehicle-icons',
    mimeTypes: ['image/*'],
    resizeOptions: {
      width: 200,
      fit: 'inside',
      withoutEnlargement: true,
    },
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
    group: 'Collection',
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
      required: false, // Changed from true
    },
    {
      name: 'icon',
      type: 'upload',
      relationTo: 'vehicle-icons',
      required: false, // Changed from true
    },
  ],
  access: {
    create: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    read: () => true, // Public access for read
    update: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
