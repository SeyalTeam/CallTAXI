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
        pt: { xs: '480px', md: '220px' },
        pb: 8,
        bgcolor: '#f1f7f7',
        color: '#0f172a',
      }}
    >
      <Container maxWidth="xl">
        <Grid container justifyContent="center">
          <Grid size={{ xs: 12, md: 10 }}>
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h3"
                fontWeight="800"
                gutterBottom
                sx={{
                  color: '#000',
                  mb: 2,
                  fontSize: { xs: '1.75rem', md: '3rem' },
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                Why Choose Us?
              </Typography>
              <Typography
                variant="h6"
                color="#64748b"
                mx="auto"
                fontWeight="400"
                sx={{
                  maxWidth: { xs: '320px', md: '800px' },
                  fontSize: { xs: '0.9rem', md: '1.25rem' },
                }}
              >
                We provide reliable, safe, and luxurious transportation for all your travel needs.
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {[
                {
                  icon: <AccessTimeIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#000' }} />,
                  title: 'On Time',
                  desc: 'Punctuality is our promise. We value your time above all else.',
                },
                {
                  icon: (
                    <DirectionsCarBaseIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#000' }} />
                  ),
                  title: 'Luxury Fleet',
                  desc: 'Travel in comfort with our wide range of premium vehicles.',
                },
                {
                  icon: <PersonIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#000' }} />,
                  title: 'Expert Drivers',
                  desc: 'Verified, experienced drivers emphasizing safety.',
                },
                {
                  icon: <HeadsetMicIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#000' }} />,
                  title: '24/7 Support',
                  desc: 'Our specialists are always available to assist you.',
                },
              ].map((item, index) => (
                <Grid key={index} size={{ xs: 6, md: 3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, md: 3 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#0e172a', // Navy Code
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease',
                      textAlign: { xs: 'center', md: 'left' }, // Center on mobile
                      alignItems: { xs: 'center', md: 'normal' }, // Center flex items
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    {/* Header: Icon -> Arrow -> Number */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: { xs: 'center', md: 'space-between' },
                        mb: { xs: 1.5, md: 3 },
                        width: '100%', // Ensure full width for flex justification
                      }}
                    >
                      {/* Icon Circle */}
                      <Box
                        sx={{
                          width: { xs: 45, md: 60 }, // Smaller on mobile
                          height: { xs: 45, md: 60 },
                          borderRadius: '50%',
                          bgcolor: '#fbbf24', // Amber/Yellow
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 0 4px rgba(251, 191, 36, 0.2)', // Outer glow ring
                          zIndex: 2,
                        }}
                      >
                        {item.icon}
                      </Box>

                      {/* Arrow Line */}
                      <Box
                        sx={{
                          flexGrow: 1,
                          height: '2px',
                          bgcolor: 'rgba(255,255,255,0.3)', // increased visibility
                          mx: 2,
                          display: { xs: 'none', md: 'block' }, // Hide on mobile
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '6px solid rgba(255,255,255,0.3)', // increased visibility
                            borderTop: '4px solid transparent',
                            borderBottom: '4px solid transparent',
                          },
                        }}
                      />

                      {/* Number */}
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 900,
                          color: 'transparent',
                          WebkitTextStroke: '1px #cbd5e1', // Light grey for better visibility
                          opacity: 0.8, // Increased opacity
                          fontFamily: 'monospace',
                          zIndex: 1,
                          display: { xs: 'none', md: 'block' }, // Hide on mobile
                        }}
                      >
                        0{index + 1}
                      </Typography>
                    </Box>

                    {/* Content */}
                    <Box sx={{ mt: 'auto', width: '100%' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          color: '#fbbf24', // Match icon circle
                          mb: { xs: 0, md: 1.5 },
                          fontSize: { xs: '1rem', md: '1.25rem' }, // Smaller title on mobile
                          lineHeight: 1.2,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#9ca3af', // Light grey text
                          lineHeight: 1.6,
                          display: { xs: 'none', md: 'block' }, // Hide description on mobile
                        }}
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
