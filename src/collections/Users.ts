import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Collection',
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Superadmin', value: 'superadmin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Accounts', value: 'accounts' },
        { label: 'Driver', value: 'driver' },
      ],
      defaultValue: 'driver', // Default to least privileged
    },
    {
      name: 'driverProfile',
      type: 'relationship',
      relationTo: 'drivers',
      required: false, // Make true if mandatory for drivers
      hasMany: false, // One-to-one link
      admin: {
        condition: (data) => data.role === 'driver',
        position: 'sidebar', // Optional: Place in sidebar for better UI
      },
    },
  ],
  access: {
    // Creation: Only superadmins can create new users
    create: ({ req: { user } }) => user?.role === 'superadmin',

    // Read: Superadmins/admins/accounts full read; drivers only own data
    read: ({ req: { user } }) => {
      if (user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'accounts') {
        return true // Full read access
      }
      if (user?.role === 'driver') {
        return { id: { equals: user.id } } // Only own profile
      }
      return false
    },

    // Update: Superadmins full; admins none; accounts limited (e.g., to payments, but customize further); drivers own only
    update: ({ req: { user }, id: _id }) => {
      if (user?.role === 'superadmin') return true
      if (user?.role === 'admin') return false // Read-only
      if (user?.role === 'accounts') {
        // Limited: Customize to allow updates on payment fields if added; for now, own only
        return { id: { equals: user.id } }
      }
      if (user?.role === 'driver') {
        return { id: { equals: user.id } } // Own profile only
      }
      return false
    },

    // Delete: Only superadmins
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
