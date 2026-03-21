import React from 'react'
import { Box, Container, Typography, Grid } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const TOP_KEYWORDS = [
  'Call Taxi Thoothukudi',
  'Tuticorin Cab Booking',
  'Thoothukudi Airport Taxi',
  'Sawyerpuram Call Taxi',
  'Reliable Taxi Tuticorin',
  '24/7 Taxi Thoothukudi',
  'Airport Pickup Tuticorin',
  'Outstation Cabs Thoothukudi',
  'Local Car Rental Tuticorin',
  'Thoothukudi to Tirunelveli Taxi',
]

export default function SEOTagsSection() {
  return (
    <Box
      sx={{
        py: 6,
        bgcolor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        color: '#475569',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            mb: 3,
            textAlign: 'center',
          }}
        >
          Premier Call Taxi Services in Thoothukudi & Tuticorin
        </Typography>

        <Typography
          variant="body1"
          sx={{
            mb: 4,
            lineHeight: 1.8,
            textAlign: 'justify',
            fontSize: '1rem',
          }}
        >
          Kani Taxi is your trusted partner for all transportation needs across{' '}
          <strong>Thoothukudi</strong> and <strong>Sawyerpuram</strong>. Whether you are looking for
          a <strong>call taxi in Thoothukudi</strong> for a local trip, an{' '}
          <strong>airport taxi to Tuticorin Airport</strong>, or an{' '}
          <strong>outstation cab from Thoothukudi</strong> to any destination in South Tamil Nadu,
          we provide the most reliable and affordable services. Our fleet includes well-maintained
          AC cars with professional drivers who ensure a safe and comfortable journey for every
          passenger. As the leading <strong>taxi service in Tuticorin</strong>, we operate 24/7,
          providing <strong>round-the-clock booking</strong> for emergency and planned travels.
        </Typography>

        <Grid container spacing={2}>
          {TOP_KEYWORDS.map((keyword, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#3b82f6',
                    transform: 'translateX(5px)',
                  },
                }}
              >
                <LocationOnIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {keyword}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
            Serving Thoothukudi, Sawyerpuram, Tirunelveli, and surrounding districts with premium
            taxi solutions.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
