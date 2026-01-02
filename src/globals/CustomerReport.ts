import type { GlobalConfig } from 'payload'

export const CustomerReport: GlobalConfig = {
  slug: 'customer-report',
  label: 'Customer Report',
  admin: {
    group: 'Report',
    components: {
      views: {
        edit: {
          default: {
            Component: './app/(payload)/components/CustomerReport.tsx#default',
          },
        },
      },
    },
  },
  fields: [],
  access: {
    read: () => true,
  },
}
