import React from 'react'
import { Box, Container, Grid, Typography, Paper } from '@mui/material'

import AccessTimeIcon from '@mui/icons-material/AccessTime'
import DirectionsCarBaseIcon from '@mui/icons-material/DirectionsCar'
import PersonIcon from '@mui/icons-material/Person'
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic'

export default function AboutSection() {
  return (
    <Box
      id="about-section"
      sx={{
        py: 8,
        background: 'linear-gradient(to bottom, #ffffff 0%, #f1f0e8 100%)',
        color: '#0f172a',
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight="800" gutterBottom sx={{ color: '#0f172a', mb: 2 }}>
            Why Choose <span style={{ color: '#d97706' }}>Us?</span>
          </Typography>
          <Typography variant="h6" color="#64748b" maxWidth="800px" mx="auto" fontWeight="400">
            We provide reliable, safe, and luxurious transportation for all your travel needs.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            {
              icon: <AccessTimeIcon sx={{ fontSize: 48, color: '#d97706' }} />,
              title: 'On Time',
              desc: 'Punctuality is our promise. We value your time above all else.',
            },
            {
              icon: <DirectionsCarBaseIcon sx={{ fontSize: 48, color: '#d97706' }} />,
              title: 'Luxury Fleet',
              desc: 'Travel in comfort with our wide range of premium vehicles.',
            },
            {
              icon: <PersonIcon sx={{ fontSize: 48, color: '#d97706' }} />,
              title: 'Expert Drivers',
              desc: 'Verified, experienced drivers emphasizing safety.', // shortened for better fit
            },
            {
              icon: <HeadsetMicIcon sx={{ fontSize: 48, color: '#d97706' }} />,
              title: '24/7 Support',
              desc: 'Our specialists are always available to assist you.',
            },
          ].map((item, index) => (
            <Grid key={index} size={{ xs: 12, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  textAlign: 'left',
                  bgcolor: '#f3f3f3',
                  borderRadius: 4,
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    borderColor: '#fed7aa',
                  },
                }}
              >
                <Box sx={{ flexShrink: 0 }}>{item.icon}</Box>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="#0f172a"
                    lineHeight={1.2}
                    mb={0.5}
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="#64748b" lineHeight={1.4}>
                    {item.desc}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
