import type { CollectionConfig } from 'payload'

export const Tariffs: CollectionConfig = {
  slug: 'tariffs',
  admin: {
    useAsTitle: 'vehicle',
  },
  fields: [
    {
      name: 'vehicle',
      type: 'relationship',
      relationTo: 'vehicles',
      required: true,
      unique: true, // Ensure one tariff document per vehicle
    },
    {
      type: 'group',
      name: 'oneway',
      label: 'One Way Trip',
      fields: [
        {
          name: 'perKmRate',
          type: 'number',
          required: true,
          admin: {
            description: 'Rate per kilometer for One Way',
          },
        },
        {
          name: 'bata',
          type: 'number',
          required: true,
          admin: {
            description: 'Bata amount for One Way',
          },
        },
        {
          name: 'extras',
          type: 'text',
          required: false,
          admin: {
            description: 'Additional notes like "Toll Parking hills Extra" for One Way',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'roundtrip',
      label: 'Round Trip',
      fields: [
        {
          name: 'perKmRate',
          type: 'number',
          required: true,
          admin: {
            description: 'Rate per kilometer for Round Trip',
          },
        },
        {
          name: 'bata',
          type: 'number',
          required: true,
          admin: {
            description: 'Bata amount for Round Trip',
          },
        },
        {
          name: 'extras',
          type: 'text',
          required: false,
          admin: {
            description: 'Additional notes like "Toll Parking hills Extra" for Round Trip',
          },
        },
      ],
    },
  ],
  access: {
    create: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    read: ({ req: { user } }) => {
      if (
        user?.role === 'superadmin' ||
        user?.role === 'admin' ||
        user?.role === 'accounts' ||
        user?.role === 'driver'
      ) {
        return true
      }
      return false
    },
    update: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
