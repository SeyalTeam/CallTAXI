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
      unique: true,
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
        },
        {
          name: 'bata',
          type: 'number',
          required: true,
        },
        {
          name: 'extras',
          type: 'text',
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
        },
        {
          name: 'bata',
          type: 'number',
          required: true,
        },
        {
          name: 'extras',
          type: 'text',
        },
      ],
    },
  ],

  access: {
    /**
     * ✅ Make Tariffs PUBLIC
     */
    read: () => true,

    /**
     * 🔒 Admin Only for Creating
     */
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'superadmin',

    /**
     * 🔒 Admin Only for Updating
     */
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'superadmin',

    /**
     * 🔒 Only Superadmin can delete
     */
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
