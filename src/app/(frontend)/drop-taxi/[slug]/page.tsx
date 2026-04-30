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
import RouteIcon from '@mui/icons-material/Route'
import TimerIcon from '@mui/icons-material/Timer'
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi'
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
    const sedanFare = calculateEstimatedFare(route.distanceKm, 14, 400)
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
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 2, md: 3 },
          background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 50%, #e0f2fe 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '40%',
            height: '40%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          {route ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                  opacity: 0.8,
                }}
              >
                <Link
                  href="/"
                  style={{
                    color: '#1e40af',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  Home
                </Link>
                <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>/</Typography>
                <Link
                  href="/drop-taxi"
                  style={{
                    color: '#1e40af',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  Drop Taxi
                </Link>
                <Typography sx={{ color: '#94a3b8', fontWeight: 600 }}>/</Typography>
                <Typography sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
                  {route.from} to {route.to}
                </Typography>
              </Box>

              <Typography
                component="h1"
                variant="h2"
                sx={{
                  fontWeight: 900,
                  color: '#0f172a',
                  fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.5rem', lg: '3.2rem' },
                  mb: 2.5,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                {route.from} to {route.to} <span style={{ color: '#2563eb' }}>Drop Taxi</span>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#475569',
                  maxWidth: '800px',
                  lineHeight: 1.6,
                  fontWeight: 500,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Experience premium one-way travel from {route.from} to {route.to} with Kani Taxi.
                Affordable luxury, zero return charges, and professional service.
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
                  fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.5rem', lg: '3.2rem' },
                  mb: 2,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}
              >
                Drop Taxi in <span style={{ color: '#2563eb' }}>{district?.name}</span>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: '#475569',
                  maxWidth: '800px',
                  lineHeight: 1.6,
                  fontWeight: 500,
                }}
              >
                Book top-rated one way cabs from {district?.name} to anywhere in Tamil Nadu.
                Reliable 24/7 service with transparent pricing.
              </Typography>
            </>
          )}
        </Container>
      </Box>

      <HeroSection
        embedded
        sectionId="drop-taxi-booking"
        headingTag="h2"
        initialPickup={route?.from}
        initialDrop={route?.to}
        initialDistance={route?.distanceKm}
        restrictToTripType="oneway"
      />

      <Container maxWidth="xl" sx={{ pb: { xs: 8, md: 12 }, mt: -4 }}>
        {route ? (
          <Grid container spacing={4}>
            {/* Left Column: Trip Info & Details */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Trip Highlights Cards */}
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 15px 35px -12px rgba(0,0,0,0.05)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
                        borderColor: '#2563eb',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="overline" color="#64748b" fontWeight={800} letterSpacing="0.1em">
                        Total Distance
                      </Typography>
                      <RouteIcon sx={{ color: '#2563eb', opacity: 0.2, fontSize: 32 }} />
                    </Box>
                    <Typography variant="h3" fontWeight={900} color="#2563eb" sx={{ display: 'flex', alignItems: 'baseline' }}>
                      {route.distanceKm} <Box component="span" sx={{ fontSize: '1.25rem', ml: 1, color: '#64748b', fontWeight: 600 }}>km</Box>
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 15px 35px -12px rgba(0,0,0,0.05)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
                        borderColor: '#2563eb',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="overline" color="#64748b" fontWeight={800} letterSpacing="0.1em">
                        Est. Duration
                      </Typography>
                      <TimerIcon sx={{ color: '#2563eb', opacity: 0.2, fontSize: 32 }} />
                    </Box>
                    <Typography variant="h3" fontWeight={900} color="#2563eb" sx={{ display: 'flex', alignItems: 'baseline' }}>
                      {route.durationHours} <Box component="span" sx={{ fontSize: '1.25rem', ml: 1, color: '#64748b', fontWeight: 600 }}>hrs</Box>
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 5,
                      bgcolor: '#2563eb',
                      backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#fff',
                      boxShadow: '0 15px 35px -12px rgba(37, 99, 235, 0.4)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px -15px rgba(37, 99, 235, 0.5)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="overline" color="rgba(255,255,255,0.8)" fontWeight={800} letterSpacing="0.1em">
                        Starts From
                      </Typography>
                      <LocalTaxiIcon sx={{ color: '#fff', opacity: 0.3, fontSize: 32 }} />
                    </Box>
                    <Typography variant="h3" fontWeight={900}>
                      ₹{formatInr(calculateEstimatedFare(route.distanceKm, 14, 400))}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1, opacity: 0.8, fontWeight: 600 }}>
                      *All inclusive estimate
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Fare Table Card */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 6,
                  mb: 4,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#fff',
                }}
              >
                <Typography component="h2" variant="h4" fontWeight={900} color="#0f172a" mb={3}>
                  Transparent Pricing
                </Typography>
                <TableContainer sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, py: 2.5, color: '#475569' }}>Vehicle Type</TableCell>
                        <TableCell sx={{ fontWeight: 800, py: 2.5, color: '#475569' }}>Rate / KM</TableCell>
                        <TableCell sx={{ fontWeight: 800, py: 2.5, color: '#2563eb', textAlign: 'right' }}>Estimated Fare</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {VEHICLE_RATES.slice(0, 4).map((vehicle, idx) => (
                        <TableRow
                          key={vehicle.label}
                          sx={{
                            '&:hover': { bgcolor: '#f1f5f9/30' },
                            bgcolor: idx === 0 ? '#eff6ff' : 'inherit',
                          }}
                        >
                          <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {vehicle.label}
                            {idx === 0 && (
                              <Box component="span" sx={{ ml: 1, px: 1, py: 0.25, bgcolor: '#2563eb', color: '#fff', borderRadius: 1, fontSize: '0.65rem', verticalAlign: 'middle' }}>
                                POPULAR
                              </Box>
                            )}
                          </TableCell>
                          <TableCell color="#475569">₹{vehicle.ratePerKm}/km</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#0f172a', textAlign: 'right' }}>
                            ₹{formatInr(calculateEstimatedFare(route.distanceKm, vehicle.ratePerKm, vehicle.bata))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* About Route Card */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#fff',
                }}
              >
                <Typography component="h2" variant="h4" fontWeight={900} color="#0f172a" mb={2.5}>
                  Why Choose Kani Taxi for this Route?
                </Typography>
                <Box sx={{ color: '#475569', lineHeight: 1.8 }}>
                  <Typography mb={2} variant="body1">
                    Traveling from <strong>{route.from} to {route.to}</strong> by drop taxi is the ultimate choice for comfort and economy. Unlike regular outstation cabs, we don&apos;t charge you for the return journey, saving you up to 40% on your travel costs.
                  </Typography>
                  <Typography mb={2} variant="body1">
                    Our fleet on this route is meticulously maintained and equipped with high-performance AC units to tackle the Tamil Nadu heat. Our drivers are well-versed with the highway patterns and popular rest stops.
                  </Typography>
                  <Box sx={{ mt: 3, p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, borderLeft: '4px solid #2563eb' }}>
                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b" mb={0.5}>
                      Key Stops & Landmarks:
                    </Typography>
                    <Typography variant="body2" color="#64748b">
                      {route.landmarks.join(' • ')}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Right Column: Sidebar / Related */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                <Typography variant="h5" fontWeight={900} color="#0f172a" mb={3}>
                  Other Popular Routes
                </Typography>
                <Grid container spacing={2}>
                  {relatedRoutes.map((related) => (
                    <Grid key={related.slug} size={{ xs: 12 }}>
                      <Link href={'/drop-taxi/' + related.slug} style={{ textDecoration: 'none' }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: 4,
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.3s',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            '&:hover': {
                              borderColor: '#2563eb',
                              bgcolor: '#eff6ff',
                              transform: 'translateX(8px)',
                            },
                          }}
                        >
                          <Box>
                            <Typography fontWeight={700} color="#1e293b" variant="body1">
                              {related.from} to {related.to}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" color="#64748b">
                                {related.distanceKm} km
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
                          </Box>
                          <Typography fontWeight={800} color="#2563eb">
                            ₹{formatInr(calculateEstimatedFare(related.distanceKm, 14, 400))}
                          </Typography>
                        </Paper>
                      </Link>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 6 },
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              bgcolor: '#fff',
            }}
          >
            <Typography component="h2" variant="h4" fontWeight={900} color="#0f172a" mb={4}>
              Available Routes From {district?.name}
            </Typography>
            <Grid container spacing={2.5}>
              {(districtRoutes.length > 0 ? districtRoutes : DROPTAXI_ROUTES.slice(0, 12)).map((item) => (
                <Grid key={item.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Link href={'/drop-taxi/' + item.slug} style={{ textDecoration: 'none' }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.3s',
                        '&:hover': {
                          borderColor: '#2563eb',
                          bgcolor: '#eff6ff',
                          boxShadow: '0 10px 20px -5px rgba(37,99,235,0.1)',
                        },
                      }}
                    >
                      <Typography color="#0f172a" fontWeight={800} fontSize="1.1rem">
                        {item.from} to {item.to}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="#64748b">
                          {item.distanceKm} km
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
                        ₹{formatInr(calculateEstimatedFare(item.distanceKm, 14, 400))}
                      </Typography>
                    </Box>
                    </Paper>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>


      <Footer />
    </main>
  )
}
