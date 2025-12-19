'use client'
import React from 'react'
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material'

import { TariffDoc } from '../types'

export default function TariffSection({ tariffs }: { tariffs: TariffDoc[] }) {
  return (
    <Box id="tariff-section" sx={{ py: 4, bgcolor: 'transparent', color: '#0f172a' }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            fontWeight="800"
            gutterBottom
            sx={{
              color: '#0f172a',
              fontSize: { xs: '1.75rem', md: '3rem' },
              whiteSpace: 'nowrap',
            }}
          >
            Transparent <span style={{ color: '#d97706' }}>Tariffs</span>
          </Typography>
          <Typography
            variant="h6"
            color="#64748b"
            mx="auto"
            fontWeight="400"
            sx={{
              maxWidth: { xs: '300px', md: '600px' },
              fontSize: { xs: '0.9rem', md: '1.25rem' },
            }}
          >
            No hidden charges. Pay for what you ride.
          </Typography>
        </Box>

        {/* Cards Grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tariffs.map((row) => {
            const vehicle = row.vehicle
            const vName = typeof vehicle === 'string' ? vehicle : vehicle?.name
            const vIcon =
              typeof vehicle !== 'string' && typeof vehicle?.icon !== 'string'
                ? vehicle?.icon
                : null
            const seatCount = typeof vehicle !== 'string' ? vehicle?.seatCount : null

            return (
              <Paper
                key={row.id}
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 4,
                  bgcolor: '#fff',
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow:
                      '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  },
                }}
              >
                {/* Vehicle Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#0f172a',
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                    }}
                  >
                    {vName}
                  </Typography>
                  {seatCount && (
                    <Typography
                      component="span"
                      sx={{
                        color: '#94a3b8',
                        fontSize: { xs: '0.875rem', md: '1rem' },
                        fontWeight: 500,
                      }}
                    >
                      {seatCount} seater
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: { xs: 2, md: 4 },
                  }}
                >
                  {/* Vehicle Image */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: '280px' },
                      minHeight: { xs: '140px', md: '120px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center', // Centered on all screens
                      mb: { xs: 2, md: 0 },
                    }}
                  >
                    {vIcon ? (
                      <Box
                        component="img"
                        src={vIcon.url}
                        alt={vIcon.alt}
                        sx={{
                          width: '100%',
                          height: 'auto',
                          maxWidth: { xs: '320px', md: '100%' }, // Increased mobile max-width
                          maxHeight: { xs: '180px', md: '100%' },
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100px',
                          bgcolor: '#f1f5f9',
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </Box>

                  {/* Pricing Details */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'nowrap', // Force side-by-side on mobile
                      gap: { xs: 2, md: 6 },
                      width: { xs: '100%', md: 'auto' },
                      justifyContent: { xs: 'space-between', md: 'flex-end' },
                    }}
                  >
                    {/* One Way */}
                    <Box sx={{ flex: 1, textAlign: { xs: 'right', md: 'left' } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'flex-end', md: 'flex-start' },
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            fontSize: '0.875rem',
                          }}
                        >
                          ↑
                        </Box>
                        <Typography
                          variant="body2"
                          color="#64748b"
                          fontWeight={500}
                          sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        >
                          One way
                        </Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: '#0f172a',
                          fontSize: { xs: '1.5rem', md: '1.75rem' },
                        }}
                      >
                        ₹{row.oneway?.perKmRate}
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.6em',
                            color: '#0f172a',
                            fontWeight: 700,
                            ml: 0.5,
                          }}
                        >
                          /km
                        </Typography>
                      </Typography>
                    </Box>

                    {/* Round Trip */}
                    <Box sx={{ flex: 1, textAlign: { xs: 'right', md: 'left' } }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'flex-end', md: 'flex-start' },
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 1,
                            bgcolor: 'rgba(16, 185, 129, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            fontSize: '0.875rem',
                          }}
                        >
                          ↓↑
                        </Box>
                        <Typography
                          variant="body2"
                          color="#64748b"
                          fontWeight={500}
                          sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                        >
                          Round Trip
                        </Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 800,
                          color: '#0f172a',
                          fontSize: { xs: '1.5rem', md: '1.75rem' },
                        }}
                      >
                        ₹{row.roundtrip?.perKmRate}
                        <Typography
                          component="span"
                          sx={{
                            fontSize: '0.6em',
                            color: '#0f172a',
                            fontWeight: 700,
                            ml: 0.5,
                          }}
                        >
                          /km
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )
          })}
        </Box>
      </Container>
    </Box>
  )
}
