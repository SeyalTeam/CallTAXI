'use client'
import React from 'react'
import { Box, Container, Typography, Paper, Grid } from '@mui/material'

import { TariffDoc } from '../types'

export default function TariffSection({ tariffs }: { tariffs: TariffDoc[] }) {
  return (
    <Box
      id="tariff-section"
      sx={{
        py: { xs: 5, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#F6FAFD',
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
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 3 },
                overflowX: { md: 'auto' },
                pb: { md: 2 },
                // Hide scrollbar but allow scrolling
                '&::-webkit-scrollbar': { display: 'none' },
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE and Edge
                scrollBehavior: 'smooth',
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
                const cardBg = '#dbeceb'

                return (
                  <Box
                    key={row.id}
                    sx={{
                      minWidth: { md: '266px' }, // Reduced by ~5% from 280px
                      flex: { md: '0 0 22.8%' }, // Reduced by 5% from 24% (24 * 0.95 = 22.8)
                      width: { xs: '100%', md: 'auto' },
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
                      {/* --- MOBILE LAYOUT (Grid) - Unchanged --- */}
                      <Box
                        sx={{
                          display: { xs: 'grid', md: 'none' },
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: 2,
                          alignItems: 'center',
                        }}
                      >
                        {/* Row 1, Col 1: Vehicle Name */}
                        <Box sx={{ gridColumn: '1 / 2' }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              fontWeight: 800,
                              color: '#0f172a',
                              fontSize: '1rem',
                              lineHeight: 1.2,
                              display: '-webkit-box',
                              overflow: 'hidden',
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                            }}
                          >
                            {vName}
                          </Typography>
                          {seatCount && (
                            <Typography
                              component="div"
                              sx={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}
                            >
                              {seatCount} seater
                            </Typography>
                          )}
                        </Box>

                        {/* Row 1, Col 2: One Way Label */}
                        <Box sx={{ gridColumn: '2 / 3', textAlign: 'center' }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="#10b981"
                              fontWeight={700}
                              sx={{ fontSize: '0.7rem' }}
                            >
                              ↑ One Way
                            </Typography>
                          </Box>
                        </Box>

                        {/* Row 1, Col 3: Round Trip Label */}
                        <Box sx={{ gridColumn: '3 / 4', textAlign: 'right' }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              bgcolor: 'rgba(16, 185, 129, 0.1)',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="#10b981"
                              fontWeight={700}
                              sx={{ fontSize: '0.7rem' }}
                            >
                              ↓↑ Round
                            </Typography>
                          </Box>
                        </Box>

                        {/* Row 2, Col 1: Icon (Small) */}
                        <Box
                          sx={{
                            gridColumn: '1 / 2',
                            display: 'flex',
                            justifyContent: 'flex-start',
                          }}
                        >
                          {vIcon ? (
                            <Box
                              component="img"
                              src={vIcon.url}
                              alt={vIcon.alt}
                              sx={{
                                width: '90px', // Increased size
                                height: 'auto',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: '90px',
                                height: '45px',
                                bgcolor: '#f1f5f9',
                                borderRadius: 1,
                              }}
                            />
                          )}
                        </Box>

                        {/* Row 2, Col 2: One Way Price */}
                        <Box sx={{ gridColumn: '2 / 3', textAlign: 'center' }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.25rem' }}
                          >
                            ₹{row.oneway?.perKmRate}
                            <Typography
                              component="span"
                              sx={{ fontSize: '0.7em', color: '#64748b', fontWeight: 600 }}
                            >
                              /km
                            </Typography>
                          </Typography>
                        </Box>

                        {/* Row 2, Col 3: Round Trip Price */}
                        <Box sx={{ gridColumn: '3 / 4', textAlign: 'right' }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.25rem' }}
                          >
                            ₹{row.roundtrip?.perKmRate}
                            <Typography
                              component="span"
                              sx={{ fontSize: '0.7em', color: '#64748b', fontWeight: 600 }}
                            >
                              /km
                            </Typography>
                          </Typography>
                        </Box>

                        {/* Row 3: Package Details (Full Width) */}
                        <Box
                          sx={{
                            gridColumn: '1 / -1',
                            mt: 1,
                            p: 1.5,
                            borderRadius: 2, // Rounded corners for button look
                            bgcolor: '#096370', // Updated color
                            textAlign: 'center',
                            color: '#fff',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight="800"
                              color="#ffffff"
                              sx={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}
                            >
                              Package - ₹
                              {(row.packages?.hours || 0) * (row.packages?.perHourRate || 0)}{' '}
                              <Box
                                component="span"
                                sx={{
                                  opacity: 0.9,
                                  fontWeight: 600,
                                  fontSize: '0.8rem',
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
                              sx={{ fontSize: '0.7rem', mt: 0.25, fontWeight: 700 }}
                            >
                              Extra - {row.packages.extras}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* --- DESKTOP LAYOUT (New Card Style) --- */}
                      <Box
                        sx={{
                          display: { xs: 'none', md: 'flex' },
                          flexDirection: 'column',
                          height: '100%',
                          justifyContent: 'space-between',
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
                              bgcolor: 'rgba(255,255,255,0.6)',
                              border: '1px solid rgba(255,255,255,0.8)',
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
                              bgcolor: 'rgba(255,255,255,0.6)',
                              border: '1px solid rgba(255,255,255,0.8)',
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
                            bgcolor: '#096370', // Updated color from #1e293b
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
