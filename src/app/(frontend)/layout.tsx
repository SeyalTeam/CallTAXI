import React from 'react'
import './styles.css'

export const metadata = {
  title: 'Kani Taxi | #1 Drop Taxi & Call Taxi in Tamil Nadu | Thoothukudi | 24/7 Booking',
  description:
    'Book affordable drop taxi across Tamil Nadu. One way cab from Thoothukudi, Tuticorin to Chennai, Madurai, Coimbatore & all Tamil Nadu cities. 24/7 service, AC cabs, no return charge.',
  keywords: [
    'drop taxi Tamil Nadu',
    'one way drop taxi',
    'call taxi Thoothukudi',
    'outstation cab Tamil Nadu',
    'taxi Tuticorin',
    'drop taxi booking',
  ],
  openGraph: {
    title: 'Kani Taxi - Drop Taxi & Call Taxi in Tamil Nadu',
    description:
      'Book one way drop taxi across Tamil Nadu with no return charge. 24/7 service from Thoothukudi and Tuticorin.',
    url: 'https://kanitaxi.com',
    siteName: 'Kani Taxi',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kani Taxi - One Way Drop Taxi in Tamil Nadu',
    description:
      'Affordable one way cabs from Thoothukudi and Tuticorin to all major Tamil Nadu cities.',
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
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
