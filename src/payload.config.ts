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
import { Vehicles } from './collections/Vehicles'
import { Bookings } from './collections/Bookings'
import { Customers } from './collections/Customers'
import { Coupons } from './collections/Coupons'
// import { Logo } from './app/(payload)/components/Logo'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
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
  collections: [Users, Media, Drivers, Tariffs, Vehicles, Bookings, Customers, Coupons],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
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
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
