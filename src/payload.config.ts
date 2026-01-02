import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Drivers } from './collections/Drivers'
import { Tariffs } from './collections/Tariffs'
import { Vehicles, VehicleImages, VehicleIcons } from './collections/Vehicles'
import { Bookings } from './collections/Bookings'
import { BookingReport } from './globals/BookingReport'
import { Customers } from './collections/Customers'
import { Coupons } from './collections/Coupons'
import { SliderImages } from './collections/SliderImages'
import { getBookingReport } from './endpoints/getBookingReport'
import { getCustomerReport } from './endpoints/getCustomerReport'
import { CustomerReport } from './globals/CustomerReport'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  endpoints: [
    {
      path: '/get-booking-report',
      method: 'get',
      handler: getBookingReport,
    },
    {
      path: '/get-customer-report',
      method: 'get',
      handler: getCustomerReport,
    },
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: './app/(payload)/components/Logo.tsx#Logo',
        Icon: './app/(payload)/components/Logo.tsx#Logo',
      },
    },
  },
  collections: [
    Users,
    Media,
    Drivers,
    Tariffs,
    Vehicles,
    Bookings,
    Customers,
    Coupons,
    VehicleImages,
    VehicleIcons,
    SliderImages,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  globals: [BookingReport, CustomerReport],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    vercelBlobStorage({
      collections: {
        media: {
          prefix: 'Call Taxi/Kani Taxi',
        },
        'vehicle-images': {
          prefix: 'Call Taxi/Kani Taxi/Vehicles',
        },
        'vehicle-icons': {
          prefix: 'Call Taxi/Kani Taxi/Icons',
        },
        'slider-images': {
          prefix: 'Call Taxi/Kani Taxi/slider',
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
