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
    // Assuming ties to Users collection; customize based on roles
    create: ({ req: { user } }) => user?.role === 'superadmin' || user?.role === 'admin',
    read: ({ req: { user } }) => {
      if (user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'accounts') {
        return true
      }
      if (user?.role === 'driver') {
        return { id: { equals: user.id } } // Drivers see own data only
      }
      return false
    },
    update: ({ req: { user }, id }) => {
      if (user?.role === 'superadmin') return true
      if (user?.role === 'admin') return false // Read-only for admins
      if (user?.role === 'driver') {
        return { id: { equals: user.id } }
      }
      return false
    },
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
