import React from 'react'
import { Box } from '@mui/material'
import { getPayload } from 'payload'
import config from '../../payload.config'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import TariffSection from './components/TariffSection'
import ReviewsSection from './components/ReviewsSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import PartnerSection from './components/PartnerSection'
import SEOTagsSection from './components/SEOTagsSection'
import { TariffDoc } from './types'
import { getPublicAssetURL } from '../../utilities/storage'

export const dynamic = 'force-dynamic'
const locationImageURL = getPublicAssetURL('Banner/kanitaxi-location.png', 'location.png')

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: 'Kani Taxi',
  alternateName: 'Kani Call Taxi',
  image: locationImageURL,
  telephone: '+919488104888',
  email: 'kanitaxi5555@gmail.com',
  url: 'https://kanitaxi.com',
  logo: locationImageURL,
  description:
    'Drop taxi and call taxi service across Tamil Nadu. One way cabs from Thoothukudi to all Tamil Nadu cities.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '33 Chetti street subramaniyapuram sawyerpuram',
    addressLocality: 'Thoothukudi',
    addressRegion: 'Tamil Nadu',
    postalCode: '628251',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 8.7642,
    longitude: 78.1348,
  },
  hasMap: 'https://www.google.com/maps/place/Thoothukudi,+Tamil+Nadu/',
  areaServed: 'Tamil Nadu',
  priceRange: '₹₹',
  openingHours: 'Mo-Su 00:00-23:59',
  sameAs: ['https://www.threads.com/@kani.taxi'],
}

export default async function Page() {
  const payload = await getPayload({ config })
  const tariffsRes = await payload.find({
    collection: 'tariffs',
    limit: 100,
    sort: '-updatedAt',
    depth: 2,
  })

  // Normalize data for client components
  const tariffs = tariffsRes.docs
    .filter((doc) => {
      const vehicle = doc.vehicle
      if (typeof vehicle === 'object' && vehicle !== null) {
        return vehicle.category === 'tariff'
      }
      return false
    })
    .map((doc) => {
      return {
        id: doc.id,
        vehicle: doc.vehicle,
        oneway: doc.oneway,
        roundtrip: doc.roundtrip,
        packages: doc.packages,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      } as TariffDoc
    })

  return (
    <main style={{ backgroundColor: '#e0f2fe', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <HeroSection />
      <AboutSection />

      {/* Unified Background for Tariffs & Packages */}
      <Box
        sx={{
          position: 'relative',
          backgroundImage: `url(${locationImageURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', // Parallax effect
        }}
      >
        {/* White overlay for readability */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(to bottom, #e0f2fe 0%, rgba(224, 242, 254, 0.98) 15%, rgba(224, 242, 254, 0.98) 100%)',
            bgcolor: 'transparent', // fallback
            zIndex: 0,
          }}
        />

        <Box position="relative" zIndex={1}>
          <TariffSection tariffs={tariffs} />
        </Box>
      </Box>

      <ReviewsSection />

      <PartnerSection />

      <SEOTagsSection />

      <ContactSection />
      <Footer />
    </main>
  )
}
