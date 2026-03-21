import React from 'react'
import './styles.css'

export const metadata = {
  title: 'Kani Taxi | #1 Call Taxi in Thoothukudi | 24/7 Cab booking Tuticorin',
  description:
    'Book the best call taxi in Thoothukudi, Sawyerpuram & Tuticorin. Affordable AC cabs for Airport drops, outstation trips, and local rentals. Reliable, safe, and professional drivers. Call 9488104888.',
  keywords: [
    'Call Taxi Thoothukudi',
    'Taxi Service Sawyerpuram',
    'Best Cab Service Thoothukudi',
    'Airport Taxi Thoothukudi',
    'Kani Taxi',
    'Outstation Taxi Thoothukudi',
    'Car Rental Thoothukudi',
    'Tuticorin Cabs',
    'Thoothukudi Call Taxi Number',
    'Local Taxi booking Thoothukudi',
    'Sawyerpuram to Thoothukudi Taxi',
    'Airport Drop Tuticorin',
    'Cheap Cabs Thoothukudi',
    '24 Hours Taxi Service Thoothukudi',
  ],
  openGraph: {
    title: 'Kani Taxi - Best Call Taxi in Thoothukudi',
    description:
      'Looking for a reliable taxi in Thoothukudi? Book Kani Taxi for safe and affordable rides. 24/7 Availability. Call +91 94881 04888.',
    url: 'https://kanitaxi.com',
    siteName: 'Kani Taxi',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kani Taxi - Reliable Call Taxi Service in Thoothukudi',
    description:
      'Book your ride now! Call +91 94881 04888 for the best taxi service in Thoothukudi and Sawyerpuram.',
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
