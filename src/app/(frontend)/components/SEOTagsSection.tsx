import React from 'react'
import { Box, Container, Typography, Grid } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const TOP_KEYWORDS = [
  'Drop Taxi Tamil Nadu',
  'One Way Drop Taxi',
  'Drop Taxi Thoothukudi to Chennai',
  'Thoothukudi to Madurai Drop Taxi',
  'Thoothukudi to Coimbatore Cab',
  'No Return Charge Taxi Tamil Nadu',
  'Outstation Drop Taxi Tuticorin',
  '24/7 Drop Taxi Booking',
  'Tamil Nadu One Way Cab',
  'Call Taxi Thoothukudi',
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
          Trusted Drop Taxi Services Across Tamil Nadu
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
          Kani Taxi provides reliable <strong>drop taxi</strong> and <strong>call taxi</strong>{' '}
          services from <strong>Thoothukudi</strong>, <strong>Tuticorin</strong>, and nearby cities
          to destinations across Tamil Nadu. Whether you need a <strong>one way cab</strong> for
          Chennai, Madurai, Coimbatore, Tirunelveli, or Nagercoil, we offer affordable fares with{' '}
          <strong>no return charge</strong>. Our AC cabs and verified drivers are available 24/7 for
          local rides, airport transfers, and outstation trips.
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
            Serving Thoothukudi and all major Tamil Nadu locations with reliable one way cabs.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
