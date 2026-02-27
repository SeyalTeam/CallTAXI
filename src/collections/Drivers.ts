import type { CollectionConfig } from 'payload'

export const Drivers: CollectionConfig = {
  slug: 'drivers',
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
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'textarea',
      required: true,
    },
    {
      name: 'experience',
      type: 'number',
      required: true,
      admin: {
        description: 'Years of driving experience',
      },
    },
    {
      name: 'aadharNo',
      type: 'text',
      required: false,
    },
    {
      name: 'panNo',
      type: 'text',
      required: false,
    },
    {
      name: 'license',
      type: 'text',
      required: false,
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: false,
      admin: {
        description: 'Driver photo',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Not Available', value: 'not_available' },
        { label: 'Driving', value: 'driving' },
      ],
      defaultValue: 'available',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
  access: {
    create: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => {
      if (user?.role === 'superadmin' || user?.role === 'admin') return true
      if (user?.role === 'driver') return { id: { equals: user.driverProfile } }
      return false
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'superadmin' || user?.role === 'admin') return true
      if (user?.role === 'driver') return { id: { equals: user.driverProfile } }
      return false
    },
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
