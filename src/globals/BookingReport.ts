import type { GlobalConfig } from 'payload'

export const BookingReport: GlobalConfig = {
  slug: 'booking-report',
  label: 'Booking Report',
  admin: {
    group: 'Report',
    components: {
      views: {
        edit: {
          default: {
            Component: './app/(payload)/components/BookingReport.tsx#default',
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
