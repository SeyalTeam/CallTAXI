import type { CollectionConfig } from 'payload'

export const Tariffs: CollectionConfig = {
  slug: 'tariffs',

  admin: {
    group: 'Collection',
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
          name: 'minDistance',
          type: 'number',
          label: 'Minimum Distance (km)',
          defaultValue: 130,
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
          name: 'minDistance',
          type: 'number',
          label: 'Minimum Distance (km)',
          defaultValue: 250,
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
      name: 'packages',
      label: 'Packages',
      fields: [
        {
          name: 'hours',
          type: 'number',
          required: true,
          label: 'Hours',
        },
        {
          name: 'perHourRate',
          type: 'number',
          required: true,
          label: 'Per Hour Rate',
        },
        {
          name: 'extraKmRate',
          type: 'number',
          required: true,
          label: 'Extra KM Rate',
        },
        {
          name: 'extraHourRate',
          type: 'number',
          required: true,
          label: 'Extra Hour Rate',
        },
        {
          name: 'nightBata',
          type: 'number',
          label: 'Night Bata',
        },
        {
          name: 'km',
          type: 'number',
          required: true,
          label: 'KM',
        },

        {
          name: 'bata',
          type: 'number',
          required: true,
          label: 'Bata',
        },
        {
          name: 'extras',
          type: 'text',
          label: 'Extras',
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
     * ✅ Make Tariffs PUBLIC for Updating
     */
    update: () => true,

    /**
     * 🔒 Only Superadmin can delete
     */
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
