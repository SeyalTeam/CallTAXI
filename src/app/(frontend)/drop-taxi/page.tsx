import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Box, Container, Grid, Paper, Typography } from '@mui/material'
import { getPayload } from 'payload'
import config from '../../../payload.config'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TariffSection from '../components/TariffSection'
import HeroSection from '../components/HeroSection'
import { TariffDoc } from '../types'
import {
  DROPTAXI_DISTRICTS,
  DROPTAXI_ROUTES,
  VEHICLE_RATES,
  calculateEstimatedFare,
  formatInr,
} from '@/utilities/dropTaxiData'
import { getPublicAssetURL } from '../../../utilities/storage'

export const metadata: Metadata = {
  title: '#1 Drop Taxi Service in Tamil Nadu | Kani Taxi',
  description:
    "Tamil Nadu's most affordable drop taxi. Book one way cabs from any city - no return charge. Sedan, Innova, SUV available 24/7. Call +91 94881 04888",
}

export const dynamic = 'force-dynamic'

const locationImageURL = getPublicAssetURL('Banner/kanitaxi-location.png', 'location.png')

const faqItems = [
  {
    q: 'What is a drop taxi?',
    a: 'A drop taxi is a one-way cab service where you only pay for the distance traveled. No return charge.',
  },
  {
    q: 'Do you cover all Tamil Nadu districts?',
    a: 'Yes. We operate from Thoothukudi to all major Tamil Nadu cities including Chennai, Madurai, Coimbatore, Trichy, Salem, and more.',
  },
  {
    q: 'What vehicles are available for drop taxi?',
    a: 'Sedan (Rs.14/km), SUV (Rs.19/km), Innova (Rs.20/km), Innova Crysta (Rs.23/km), Tempo Traveller (Rs.40/km).',
  },
  {
    q: 'Is 24/7 booking available?',
    a: 'Yes. Call or WhatsApp +91 94881 04888 anytime.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: 'Kani Taxi',
  url: 'https://kanitaxi.com',
  telephone: '+919488104888',
  email: 'kanitaxi5555@gmail.com',
  image: locationImageURL,
  description:
    'Drop taxi and call taxi service across Tamil Nadu. One way cabs from Thoothukudi to all Tamil Nadu cities.',
  areaServed: 'Tamil Nadu',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Thoothukudi',
    addressRegion: 'Tamil Nadu',
    addressCountry: 'IN',
  },
  openingHours: 'Mo-Su 00:00-23:59',
  sameAs: ['https://www.threads.com/@kani.taxi'],
}

export default async function DropTaxiHubPage() {
  const payload = await getPayload({ config })
  const tariffsRes = await payload.find({
    collection: 'tariffs',
    limit: 100,
    sort: '-updatedAt',
    depth: 2,
  })

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

      <Box sx={{ pt: { xs: 14, md: 18 }, pb: { xs: 5, md: 7 } }}>
        <Container maxWidth="xl">
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              textAlign: 'center',
              fontSize: { xs: '1.8rem', md: '3rem' },
              mb: 2,
            }}
          >
            Drop Taxi Tamil Nadu - One Way Cab Booking
          </Typography>
          <Typography
            sx={{
              color: '#334155',
              textAlign: 'center',
              maxWidth: '900px',
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.12rem' },
              lineHeight: 1.7,
            }}
          >
            Book one way drop taxis from Thoothukudi and across Tamil Nadu with no return charge.
            Get transparent fares, professional drivers, and 24/7 booking support.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: { xs: 4, md: 7 } }}>
        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
          <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={1.5}>
            What Is Drop Taxi?
          </Typography>
          <Typography color="#334155" lineHeight={1.8}>
            Drop taxi is a one-way cab service where you pay only for your travel distance. It is
            ideal for outstation travel when you do not need the cab to return with you.
          </Typography>
        </Paper>

        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
          <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
            Why Choose Kani Taxi For Drop Taxi?
          </Typography>
          <Grid container spacing={2}>
            {[
              'No return charge billing for one-way travel',
              '24/7 booking support through call and WhatsApp',
              'Clean AC cabs with experienced drivers',
              'Live fare transparency by vehicle type',
            ].map((item) => (
              <Grid key={item} size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    borderColor: '#cbd5e1',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                >
                  {item}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
          <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
            Vehicle Options And Approx Starting Fares
          </Typography>
          <Grid container spacing={2}>
            {VEHICLE_RATES.map((vehicle) => (
              <Grid key={vehicle.label} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2.5, borderColor: '#cbd5e1', height: '100%' }}
                >
                  <Typography fontWeight={800} color="#0f172a" mb={0.5}>
                    {vehicle.label}
                  </Typography>
                  <Typography color="#334155" fontWeight={600}>
                    Rs.{vehicle.ratePerKm}/km
                  </Typography>
                  <Typography color="#64748b" variant="body2" mt={1}>
                    Thoothukudi to Chennai starts around Rs.
                    {formatInr(calculateEstimatedFare(610, vehicle.ratePerKm, vehicle.bata))}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      <TariffSection tariffs={tariffs} />

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
          <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
            District Drop Taxi Pages
          </Typography>
          <Grid container spacing={1.5}>
            {DROPTAXI_DISTRICTS.map((district) => (
              <Grid key={district.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                <Link
                  href={'/drop-taxi/' + district.slug}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      borderColor: '#cbd5e1',
                      '&:hover': { borderColor: '#2563eb' },
                    }}
                  >
                    <Typography color="#0f172a" fontWeight={700}>
                      Drop Taxi in {district.name}
                    </Typography>
                  </Paper>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
          <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
            Available Drop Taxi Routes
          </Typography>
          <Grid container spacing={1.5}>
            {DROPTAXI_ROUTES.map((route) => (
              <Grid key={route.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                <Link
                  href={'/drop-taxi/' + route.slug}
                  style={{
                    textDecoration: 'none',
                    display: 'block',
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      borderColor: '#cbd5e1',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: '#2563eb',
                      },
                    }}
                  >
                    <Typography color="#0f172a" fontWeight={700}>
                      {route.from} to {route.to}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="#64748b">
                          {route.distanceKm} km
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            bgcolor: '#eff6ff',
                            color: '#2563eb',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontWeight: 700,
                            fontSize: '0.65rem',
                          }}
                        >
                          ONE WAY
                        </Typography>
                      </Box>
                      <Typography fontWeight={800} color="#2563eb">
                        ₹{formatInr(calculateEstimatedFare(route.distanceKm, 14, 300))}
                      </Typography>
                    </Box>
                  </Paper>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4 }}>
          <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={2}>
            {faqItems.map((item) => (
              <Grid key={item.q} size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.25, borderRadius: 2.5, borderColor: '#cbd5e1' }}
                >
                  <Typography fontWeight={800} color="#0f172a" mb={0.75}>
                    {item.q}
                  </Typography>
                  <Typography color="#334155" lineHeight={1.7}>
                    {item.a}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      <HeroSection
        embedded
        sectionId="drop-taxi-booking"
        headingTag="h2"
        restrictToTripType="oneway"
      />
      <Footer />
    </main>
  )
}
