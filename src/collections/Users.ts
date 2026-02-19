import type { CollectionConfig } from 'payload'

const getRelationshipId = (value: unknown): string | null => {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id

    if (typeof id === 'string' && id.length > 0) {
      return id
    }
  }

  return null
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'Collection',
    useAsTitle: 'email',
  },
  auth: true,
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.role || data.role === 'driver') return data

        return {
          ...data,
          driverProfile: null,
        }
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const nextRole = data?.role ?? originalDoc?.role
        const nextDriverProfile =
          data?.driverProfile === undefined ? originalDoc?.driverProfile : data.driverProfile
        const nextDriverProfileId = getRelationshipId(nextDriverProfile)

        if (nextRole !== 'driver') {
          return {
            ...(data ?? {}),
            driverProfile: null,
          }
        }

        if (!nextDriverProfileId) {
          throw new Error('Please select a driver profile when creating driver access.')
        }

        const existingDriverAccess = await req.payload.find({
          collection: 'users',
          where: {
            and: [
              {
                role: {
                  equals: 'driver',
                },
              },
              {
                driverProfile: {
                  equals: nextDriverProfileId,
                },
              },
              ...(typeof originalDoc?.id === 'string'
                ? [
                    {
                      id: {
                        not_equals: originalDoc.id,
                      },
                    },
                  ]
                : []),
            ],
          },
          depth: 0,
          limit: 1,
        })

        if (existingDriverAccess.totalDocs > 0) {
          throw new Error('Selected driver profile already has driver access.')
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Super Admin', value: 'superadmin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Driver', value: 'driver' },
      ],
      defaultValue: 'driver', // Default to least privileged
    },
    {
      name: 'driverProfile',
      type: 'relationship',
      relationTo: 'drivers',
      required: false,
      hasMany: false, // One-to-one link
      validate: (value, { data, siblingData }) => {
        const roleFromData = (data as { role?: string } | undefined)?.role
        const roleFromSiblingData = (siblingData as { role?: string } | undefined)?.role
        const role = roleFromData ?? roleFromSiblingData
        if (role === 'driver' && !getRelationshipId(value)) {
          return 'Driver profile is required for driver access.'
        }
        return true
      },
      admin: {
        condition: (data) => data.role === 'driver',
        position: 'sidebar',
      },
    },
  ],
  access: {
    // Creation: Only superadmins can create new users
    create: ({ req: { user } }) => user?.role === 'superadmin',

    // Read: Superadmins/admins full read; drivers only own data
    read: ({ req: { user } }) => {
      if (user?.role === 'superadmin' || user?.role === 'admin') {
        return true // Full read access
      }
      if (user?.role === 'driver') {
        return { id: { equals: user.id } } // Only own profile
      }
      return false
    },

    // Update: Superadmins full; admins read-only; drivers own only
    update: ({ req: { user }, id: _id }) => {
      if (user?.role === 'superadmin') return true
      if (user?.role === 'admin') return false // Read-only
      if (user?.role === 'driver') {
        return { id: { equals: user.id } } // Own profile only
      }
      return false
    },

    // Delete: Only superadmins
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
