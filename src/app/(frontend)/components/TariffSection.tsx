'use client'
import React from 'react'
import { Box, Container, Typography, Paper, Grid } from '@mui/material'

import { TariffDoc } from '../types'

export default function TariffSection({ tariffs }: { tariffs: TariffDoc[] }) {
  const scrollContainerRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    const scrollInterval = setInterval(() => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
      const maxScroll = scrollWidth - clientWidth
      const nextScroll = scrollLeft + clientWidth // Scroll by one view width (approx one card on mobile)

      if (scrollLeft >= maxScroll - 10) {
        // Reset to start if at end
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Scroll to next
        scrollContainer.scrollTo({ left: nextScroll, behavior: 'smooth' })
      }
    }, 3000) // 3 seconds interval

    return () => clearInterval(scrollInterval)
  }, [])

  return (
    <Box
      id="tariff-section"
      sx={{
        pt: { xs: 5, md: 10 },
        pb: 0,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#e0f2fe',
        // backgroundImage removed to avoid yellow tint
        color: '#0f172a',
      }}
    >
      <Container maxWidth="xl">
        <Grid container justifyContent="center">
          <Grid size={{ xs: 12, md: 10 }}>
            {/* Header Section */}
            <Box textAlign="center" mb={{ xs: 3, md: 6 }}>
              <Typography
                variant="h3"
                fontWeight="800"
                gutterBottom
                sx={{
                  color: '#000',
                  fontSize: { xs: '1.75rem', md: '3rem' },
                  whiteSpace: 'nowrap',
                  fontFamily: 'inherit',
                }}
              >
                Transparent Tariffs
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

            {/* Cards Scrollable Container */}
            <Box
              ref={scrollContainerRef}
              sx={{
                display: 'flex',
                gap: 3, // Unified gap
                overflowX: 'auto', // Scroll on all devices
                pb: 2,
                scrollSnapType: 'x mandatory', // Enable snap scrolling
                // Hide scrollbar but allow scrolling
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE and Edge
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch', // Smooth scroll on iOS
              }}
            >
              {tariffs.map((row) => {
                const vehicle = row.vehicle
                const vName = typeof vehicle === 'string' ? vehicle : vehicle?.name
                const vIcon =
                  typeof vehicle !== 'string' && typeof vehicle?.icon !== 'string'
                    ? vehicle?.icon
                    : null
                const seatCount = typeof vehicle !== 'string' ? vehicle?.seatCount : null

                // Common background
                const cardBg = '#ffffff'

                return (
                  <Box
                    key={row.id}
                    sx={{
                      minWidth: { xs: '85vw', md: '266px' }, // Mobile: 85% width to show peek of next card
                      flex: { xs: '0 0 85%', md: '0 0 22.8%' },
                      scrollSnapAlign: 'center', // Snap to center
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2, md: 1.5 },
                        borderRadius: 4,
                        bgcolor: cardBg,
                        boxShadow:
                          '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', // Increased shadow visibility
                        transition: 'transform 0.2s',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow:
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        },
                      }}
                    >
                      {/* --- UNIFIED CARD LAYOUT --- */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          justifyContent: 'space-between',
                          flexGrow: 1,
                        }}
                      >
                        <Box>
                          {/* Vehicle Image - Full Width with Badge */}
                          <Box
                            sx={{
                              height: '130px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mb: 2,
                              mx: { md: -1.5 },
                              mt: { md: -1.5 },
                              width: { md: 'calc(100% + 24px)' },
                              bgcolor: '#ffffff',
                              position: 'relative',
                            }}
                          >
                            {vIcon ? (
                              <Box
                                component="img"
                                src={vIcon.url}
                                alt={vIcon.alt}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <Box sx={{ width: '100%', height: '100%', bgcolor: '#f1f5f9' }} />
                            )}

                            {/* Black Overlay */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.2)',
                                pointerEvents: 'none',
                              }}
                            />
                          </Box>

                          {/* Name & Seat Header */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mb: 0.5,
                              px: 0.5,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="h6"
                                component="h3"
                                sx={{
                                  fontWeight: 800,
                                  color: '#0f172a',
                                  mb: 0.5,
                                  fontSize: '1.1rem',
                                }}
                              >
                                {vName}
                              </Typography>
                              {seatCount && (
                                <Typography
                                  variant="body2"
                                  sx={{ color: '#64748b', fontWeight: 500 }}
                                >
                                  {seatCount} Seater
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        {/* Pricing Grid */}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 2,
                          }}
                        >
                          {/* One Way Block */}
                          <Box
                            sx={{
                              p: 0.75,
                              borderRadius: 2,
                              bgcolor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: '#64748b',
                                fontWeight: 700,
                                mb: 0.5,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                              }}
                            >
                              One Way
                            </Typography>
                            <Typography variant="h6" fontWeight="800" color="#0f172a">
                              ₹{row.oneway?.perKmRate}
                              <Typography
                                component="span"
                                fontSize="0.75rem"
                                color="#64748b"
                                ml={0.5}
                              >
                                /km
                              </Typography>
                            </Typography>
                          </Box>

                          {/* Round Trip Block */}
                          <Box
                            sx={{
                              p: 0.75,
                              borderRadius: 2,
                              bgcolor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                color: '#64748b',
                                fontWeight: 700,
                                mb: 0.5,
                                textTransform: 'uppercase',
                                fontSize: '0.7rem',
                              }}
                            >
                              Round Trip
                            </Typography>
                            <Typography variant="h6" fontWeight="800" color="#0f172a">
                              ₹{row.roundtrip?.perKmRate}
                              <Typography
                                component="span"
                                fontSize="0.75rem"
                                color="#64748b"
                                ml={0.5}
                              >
                                /km
                              </Typography>
                            </Typography>
                          </Box>
                        </Box>

                        {/* Package Block - Separate Row */}
                        <Box
                          sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: '#1c2e4a', // Updated color from #1e293b
                            color: '#fff',
                            textAlign: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'center',
                              columnGap: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight="800"
                              color="#ffffff"
                              sx={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}
                            >
                              Package - ₹
                              {(row.packages?.hours || 0) * (row.packages?.perHourRate || 0)}{' '}
                              <Box
                                component="span"
                                sx={{
                                  opacity: 0.9,
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  color: '#cbd5e1',
                                }}
                              >
                                {row.packages?.hours} Hrs / {row.packages?.km} KM
                              </Box>
                            </Typography>
                          </Box>

                          {row.packages?.extras && row.packages.extras !== '0' && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="#fbbf24"
                              sx={{ fontSize: '0.75rem', mt: 0.25, fontWeight: 700 }}
                            >
                              Extra - {row.packages.extras}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                )
              })}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
