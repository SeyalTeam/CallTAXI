import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import HeroSection from '../../components/HeroSection'
import {
  DROPTAXI_DISTRICT_SLUGS,
  DROPTAXI_ROUTES,
  DROPTAXI_ROUTE_SLUGS,
  VEHICLE_RATES,
  calculateEstimatedFare,
  formatInr,
  getDropTaxiDistrictBySlug,
  getDropTaxiRouteBySlug,
  getRelatedRoutes,
  getRoutesForDistrict,
} from '@/utilities/dropTaxiData'

type PageProps = {
  params: Promise<{ slug: string }>
}

const taxiServiceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TaxiService',
  name: 'Kani Taxi',
  url: 'https://kanitaxi.com',
  telephone: '+919488104888',
  email: 'kanitaxi5555@gmail.com',
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

export function generateStaticParams() {
  return [...DROPTAXI_ROUTE_SLUGS, ...DROPTAXI_DISTRICT_SLUGS].map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const route = getDropTaxiRouteBySlug(slug)
  const district = getDropTaxiDistrictBySlug(slug)

  if (route) {
    const sedanFare = calculateEstimatedFare(route.distanceKm, 14)
    return {
      title: `${route.from} to ${route.to} Drop Taxi | One Way Cab Rs.${formatInr(sedanFare)} | Kani Taxi`,
      description: `Book ${route.from} to ${route.to} drop taxi with Kani Taxi. One way cab, no return charge. AC sedan from Rs.${formatInr(sedanFare)}. 24/7 available. Call +91 94881 04888`,
    }
  }

  if (district) {
    return {
      title: `Drop Taxi in ${district.name} | One Way Cab Booking | Kani Taxi`,
      description: `Book one way drop taxi in ${district.name} with no return charge. 24/7 cab service for Chennai, Madurai, Coimbatore and other Tamil Nadu cities.`,
    }
  }

  return {
    title: 'Drop Taxi Tamil Nadu | Kani Taxi',
  }
}

export default async function DropTaxiSlugPage({ params }: PageProps) {
  const { slug } = await params
  const route = getDropTaxiRouteBySlug(slug)
  const district = getDropTaxiDistrictBySlug(slug)

  if (!route && !district) {
    notFound()
  }

  const relatedRoutes = route ? getRelatedRoutes(route.slug, 4) : []
  const districtRoutes = district
    ? getRoutesForDistrict(district.slug)
    : route
      ? getRoutesForDistrict(route.fromSlug)
      : []

  const breadcrumbJsonLd = route
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kanitaxi.com' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Drop Taxi',
            item: 'https://kanitaxi.com/drop-taxi',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${route.from} to ${route.to}`,
            item: `https://kanitaxi.com/drop-taxi/${route.slug}`,
          },
        ],
      }
    : null

  return (
    <main style={{ backgroundColor: '#e0f2fe', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(taxiServiceJsonLd) }}
      />
      {breadcrumbJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      ) : null}

      <Navbar />

      <Box sx={{ pt: { xs: 14, md: 18 }, pb: { xs: 5, md: 7 } }}>
        <Container maxWidth="xl">
          {route ? (
            <>
              <Typography color="#64748b" sx={{ mb: 1.5, fontWeight: 600 }}>
                <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>
                  Home
                </Link>{' '}
                /{' '}
                <Link href="/drop-taxi" style={{ color: '#64748b', textDecoration: 'none' }}>
                  Drop Taxi
                </Link>{' '}
                / {route.from} to {route.to}
              </Typography>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#0f172a',
                  fontSize: { xs: '1.8rem', md: '2.8rem' },
                  mb: 1.5,
                }}
              >
                {route.from} to {route.to} Drop Taxi
              </Typography>
              <Typography color="#334155" sx={{ maxWidth: '900px', lineHeight: 1.7 }}>
                Book one way cabs from {route.from} to {route.to} with no return charge. Kani Taxi
                offers reliable 24/7 service with professional drivers and transparent pricing.
              </Typography>
            </>
          ) : (
            <>
              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#0f172a',
                  fontSize: { xs: '1.8rem', md: '2.8rem' },
                  mb: 1.5,
                }}
              >
                Drop Taxi in {district?.name}
              </Typography>
              <Typography color="#334155" sx={{ maxWidth: '900px', lineHeight: 1.7 }}>
                Need a one way cab from {district?.name}? Kani Taxi provides drop taxi service to
                major destinations across Tamil Nadu with flexible pickup timings and no return
                charge.
              </Typography>
            </>
          )}
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: { xs: 3, md: 6 } }}>
        {route ? (
          <>
            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
              <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
                Trip Info
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: '#cbd5e1' }}>
                    <Typography variant="body2" color="#64748b">
                      Distance
                    </Typography>
                    <Typography fontWeight={800} color="#0f172a">
                      {route.distanceKm} km (approx)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: '#cbd5e1' }}>
                    <Typography variant="body2" color="#64748b">
                      Duration
                    </Typography>
                    <Typography fontWeight={800} color="#0f172a">
                      {route.durationHours} hours
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: '#cbd5e1' }}>
                    <Typography variant="body2" color="#64748b">
                      Starting Fare
                    </Typography>
                    <Typography fontWeight={800} color="#0f172a">
                      Rs.{formatInr(calculateEstimatedFare(route.distanceKm, 14))} (Sedan)
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
              <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
                Fare Table
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ borderColor: '#cbd5e1' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Vehicle</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Per KM</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Estimated Fare</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {VEHICLE_RATES.slice(0, 4).map((vehicle) => (
                      <TableRow key={vehicle.label}>
                        <TableCell>{vehicle.label}</TableCell>
                        <TableCell>Rs.{vehicle.ratePerKm}/km</TableCell>
                        <TableCell>
                          Rs.{formatInr(calculateEstimatedFare(route.distanceKm, vehicle.ratePerKm))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
              <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={1.5}>
                About This Route
              </Typography>
              <Typography color="#334155" lineHeight={1.8} mb={1.5}>
                Traveling from {route.from} to {route.to} by drop taxi is one of the most
                convenient and affordable options for families, business travelers, and airport
                transfers.
              </Typography>
              <Typography color="#334155" lineHeight={1.8} mb={1.5}>
                Kani Taxi provides 24/7 drop taxi service on this route with professional drivers,
                clean AC cabs, and transparent pricing with no hidden charges.
              </Typography>
              <Typography color="#334155" lineHeight={1.8}>
                Popular stops en route include {route.landmarks.join(', ')}.
              </Typography>
            </Paper>

            <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
              <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
                Related Routes
              </Typography>
              <Grid container spacing={1.5}>
                {relatedRoutes.map((related) => (
                  <Grid key={related.slug} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Link href={'/drop-taxi/' + related.slug} style={{ textDecoration: 'none' }}>
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
                          {related.from} to {related.to}
                        </Typography>
                        <Typography variant="body2" color="#64748b" mt={0.5}>
                          Sedan from Rs.
                          {formatInr(calculateEstimatedFare(related.distanceKm, 14))}
                        </Typography>
                      </Paper>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </>
        ) : (
          <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 4, mb: 4 }}>
            <Typography component="h2" variant="h4" fontWeight={800} color="#0f172a" mb={2}>
              Available Routes From {district?.name}
            </Typography>
            <Grid container spacing={1.5}>
              {(districtRoutes.length > 0 ? districtRoutes : DROPTAXI_ROUTES.slice(0, 12)).map((item) => (
                <Grid key={item.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Link href={'/drop-taxi/' + item.slug} style={{ textDecoration: 'none' }}>
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
                        {item.from} to {item.to}
                      </Typography>
                      <Typography variant="body2" color="#64748b" mt={0.5}>
                        {item.distanceKm} km | Sedan from Rs.
                        {formatInr(calculateEstimatedFare(item.distanceKm, 14))}
                      </Typography>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>

      <HeroSection embedded sectionId="drop-taxi-booking" headingTag="h2" />
      <Footer />
    </main>
  )
}
