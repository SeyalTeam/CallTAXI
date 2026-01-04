'use client'
import React from 'react'
import { Box, Container, Typography, Paper } from '@mui/material'

import { TariffDoc } from '../types'

export default function TariffSection({ tariffs }: { tariffs: TariffDoc[] }) {
  return (
    <Box
      id="tariff-section"
      sx={{
        py: { xs: 5, md: 10 },
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f8fafc', // Slightly cooler white/slate base
        // Premium soft gradient background without dots
        backgroundImage: `
          radial-gradient(circle at 0% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 60%),
          radial-gradient(circle at 100% 100%, rgba(15, 23, 42, 0.08) 0%, transparent 60%)
        `,
        backgroundSize: '100% 100%',
        backgroundPosition: '0 0',
        color: '#0f172a',
      }}
    >
      <Container maxWidth="xl">
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
            width: 'fit-content',
            maxWidth: '100%',
            mx: 'auto', // Centers the container if width < 100%
            gap: 2,
            overflowX: { md: 'auto' },
            pb: { md: 2 },
            scrollBehavior: 'smooth',
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#cbd5e1', borderRadius: 3 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          }}
        >
          {tariffs.map((row, index) => {
            const vehicle = row.vehicle
            const vName = typeof vehicle === 'string' ? vehicle : vehicle?.name
            const vIcon =
              typeof vehicle !== 'string' && typeof vehicle?.icon !== 'string'
                ? vehicle?.icon
                : null
            const seatCount = typeof vehicle !== 'string' ? vehicle?.seatCount : null

            // Pastel backgrounds for desktop cards (Blue, Green, Purple/Pink style)
            const bgColors = ['#eff6ff', '#f0fdf4', '#fdf4ff']
            const cardBg = bgColors[index % bgColors.length]

            return (
              <Paper
                key={row.id}
                elevation={0}
                sx={{
                  p: { xs: 2, md: 1.5 }, // Changed from md:3 to md:1.5
                  borderRadius: 4,
                  bgcolor: { xs: '#fff', md: cardBg }, // White on mobile, pastel on desktop
                  boxShadow:
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transition: 'transform 0.2s',
                  minHeight: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden', // Clip corners for full-width image
                  minWidth: { md: '240px' }, // Fix width for scrolling
                  flexShrink: { md: 0 }, // Prevent shrinking
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
                  <Box sx={{ gridColumn: '1 / 2', display: 'flex', justifyContent: 'flex-start' }}>
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
                        sx={{ width: '90px', height: '45px', bgcolor: '#f1f5f9', borderRadius: 1 }}
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
                      p: 1,
                      borderRadius: 2,
                      bgcolor: '#0e172a',
                      textAlign: 'center',
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
                        color="#fbbf24"
                        sx={{ fontSize: '0.9rem' }}
                      >
                        Package - ₹{(row.packages?.hours || 0) * (row.packages?.perHourRate || 0)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="#BBC863"
                        fontWeight="600"
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {row.packages?.hours} Hrs / {row.packages?.km} KM
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
                    {/* Vehicle Image - Centered & Prominent */}
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
                            objectFit: 'contain',
                            p: 2,
                          }}
                        />
                      ) : (
                        <Box sx={{ width: '100%', height: '100%', bgcolor: '#f1f5f9' }} />
                      )}
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
                          sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5, fontSize: '1.1rem' }}
                        >
                          {vName}
                        </Typography>
                        {seatCount && (
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
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
                        <Typography component="span" fontSize="0.75rem" color="#64748b" ml={0.5}>
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
                        <Typography component="span" fontSize="0.75rem" color="#64748b" ml={0.5}>
                          /km
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>

                  {/* Package Block - Separate Row */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 1,
                      borderRadius: 2,
                      bgcolor: '#0e172a',
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
                        color="#fbbf24"
                        sx={{ fontSize: '0.95rem' }}
                      >
                        Package - ₹{(row.packages?.hours || 0) * (row.packages?.perHourRate || 0)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="#BBC863"
                        fontWeight="600"
                        sx={{ fontSize: '0.85rem' }}
                      >
                        {row.packages?.hours} Hrs / {row.packages?.km} KM
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
            )
          })}
        </Box>
      </Container>
    </Box>
  )
}
