import { s3Storage } from '@payloadcms/storage-s3'
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
import { Contacts } from './collections/Contacts'
import { getBookingReport } from './endpoints/getBookingReport'
import { getCustomerReport } from './endpoints/getCustomerReport'
import { CustomerReport } from './globals/CustomerReport'
import { PaymentSettings } from './globals/PaymentSettings'
import { getUploadedFileURL } from './utilities/storage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const s3Enabled = Boolean(
  process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    (process.env.S3_PUBLIC_URL || process.env.NEXT_PUBLIC_S3_PUBLIC_URL),
)

export default buildConfig({
  onInit: async (payload) => {
    type MongoLikeCollection = {
      dropIndex: (name: string) => Promise<void>
      indexes: () => Promise<Array<{ name?: string }>>
    }

    try {
      const dbConnection = (
        payload.db as unknown as {
          connection?: { collection?: (name: string) => MongoLikeCollection | undefined }
        }
      ).connection
      const usersCollection = dbConnection?.collection?.('users')

      if (!usersCollection) return

      const indexes: Array<{ name?: string }> = await usersCollection.indexes()
      const hasLegacyPhoneIndex = indexes.some((index) => index.name === 'phoneNumber_1')

      if (hasLegacyPhoneIndex) {
        await usersCollection.dropIndex('phoneNumber_1')
        payload.logger.info('Dropped legacy users.phoneNumber_1 index.')
      }
    } catch (error) {
      payload.logger.warn('Could not verify/drop legacy users.phoneNumber_1 index.')
      payload.logger.debug(error)
    }
  },
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
    Contacts,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  globals: [BookingReport, CustomerReport, PaymentSettings],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || '',
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      enabled: s3Enabled,
      collections: {
        media: {
          prefix: 'Call Taxi/Kani Taxi',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => getUploadedFileURL(filename, prefix),
        },
        'vehicle-images': {
          prefix: 'Call Taxi/Kani Taxi/Vehicles',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => getUploadedFileURL(filename, prefix),
        },
        'vehicle-icons': {
          prefix: 'Call Taxi/Kani Taxi/Icons',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => getUploadedFileURL(filename, prefix),
        },
        'slider-images': {
          prefix: 'Call Taxi/Kani Taxi/slider',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => getUploadedFileURL(filename, prefix),
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || 'auto',
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
      },
    }),
  ],
})
