import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'percentage', 'active', 'expiryDate'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Coupon Code',
      required: true,
      unique: true,
      admin: {
        placeholder: 'e.g., WELCOME10',
      },
    },
    {
      name: 'percentage',
      type: 'number',
      label: 'Discount Percentage',
      required: true,
      min: 0,
      max: 100,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'tariffScope',
      type: 'select',
      label: 'Tariff Scope',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'All Tariffs', value: 'all' },
        { label: 'One Way', value: 'oneway' },
        { label: 'Round Trip', value: 'roundtrip' },
        { label: 'Packages', value: 'packages' },
      ],
    },
    {
      name: 'vehicleScope',
      type: 'select',
      label: 'Vehicle Scope',
      required: true,
      defaultValue: 'all',
      options: [
        { label: 'All Vehicles', value: 'all' },
        { label: 'Specific Vehicles', value: 'specific' },
      ],
    },
    {
      name: 'vehicles',
      type: 'relationship',
      relationTo: 'vehicles',
      hasMany: true,
      label: 'Select Vehicles',
      admin: {
        condition: (data) => data?.vehicleScope === 'specific',
      },
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'expiryDate',
      type: 'date',
      label: 'Expiry Date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'usageLimit',
      type: 'number',
      label: 'Usage Limit (Total)',
      admin: {
        description: 'Maximum number of times this coupon can be used (leave empty for unlimited)',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
    },
  ],
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'superadmin',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'superadmin',
    delete: ({ req: { user } }) => user?.role === 'superadmin',
  },
}
