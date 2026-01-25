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
  ],
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
