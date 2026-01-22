'use client'

import React from 'react'
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

export default function PartnerSection() {
  const cardStyle = {
    p: 4,
    borderRadius: 4,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: '#ffffff',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    border: '1px solid #0e172a',
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px -10px rgba(14, 23, 42, 0.15)', // Dark blue slight glow
    },
  }

  const sectionStyle = {
    bgcolor: '#f1f7f7',
    color: '#0f172a',
    pt: { xs: 3, md: 7 },
    pb: { xs: 3, md: 7 },
  }

  const handlePartnerClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('triggerPartnerInquiry'))
    }
  }

  const handleDriverClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('triggerDriverInquiry'))
    }
  }

  return (
    <Box sx={sectionStyle}>
      <Container maxWidth="xl">
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            fontWeight="800"
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              color: '#0f172a',
            }}
          >
            Drive with Kani Taxi
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: '#64748b',
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            Join our network of partners and drivers. Earn more with flexible hours.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Become a Partner Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={cardStyle}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 3,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Icon/Image Section */}
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: '#bae6fe', // Light blue
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <LocalTaxiIcon sx={{ fontSize: 50, color: '#0e172a' }} />
                </Box>

                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      color: '#0f172a',
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                    }}
                  >
                    Attach your Vehicle
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                    Own a car? Attach it with Kani Taxi and start earning attractive returns
                    immediately.
                  </Typography>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handlePartnerClick}
                    sx={{
                      bgcolor: '#0e172a',
                      color: '#fff',
                      borderRadius: 3,
                      px: 4,
                      py: 1.2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#1e293b',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Become a Partner
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Become a Driver Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={0} sx={cardStyle}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: 3,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Icon/Image Section */}
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: '#bae6fe', // Light blue
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <PersonIcon sx={{ fontSize: 50, color: '#0e172a' }} />
                </Box>

                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      mb: 1,
                      color: '#0f172a',
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                    }}
                  >
                    Drive with Us
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', mb: 3 }}>
                    Don&apos;t have a car? No problem. Drive our cars and earn a steady income.
                  </Typography>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleDriverClick}
                    sx={{
                      bgcolor: '#0e172a',
                      color: '#fff',
                      borderRadius: 3,
                      px: 4,
                      py: 1.2,
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: '#1e293b',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Become a Driver
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
