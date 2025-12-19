import React from 'react'
import './styles.css'

export const metadata = {
  title: 'Kani Taxi - Best Call Taxi in Thoothukudi | 24/7 Cab Service',
  description:
    'Book top-rated call taxi in Thoothukudi & Sawyerpuram. Reliable AC cabs for local, outstation, and airport drops. Affordable rates. Call 9488104888.',
  keywords: [
    'Call Taxi Thoothukudi',
    'Taxi Service Sawyerpuram',
    'Best Cab Service Thoothukudi',
    'Airport Taxi Thoothukudi',
    'Kani Taxi',
    'Outstation Taxi Thoothukudi',
    'Car Rental Thoothukudi',
  ],
  openGraph: {
    title: 'Kani Taxi - Best Call Taxi in Thoothukudi',
    description:
      'Book reliable and affordable call taxi services in Thoothukudi and Sawyerpuram. 24/7 Availability. Call +91 94881 04888.',
    url: 'https://kanitaxi.com', // Assuming this or will be updated
    siteName: 'Kani Taxi',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kani Taxi - Reliable Call Taxi Service',
    description:
      'Book your ride now! Call +91 94881 04888 for the best taxi service in Thoothukudi.',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
