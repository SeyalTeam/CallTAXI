'use client'
import React from 'react'
import { Box, Container, Typography, Paper } from '@mui/material'

import { TariffDoc } from '../types'

export default function TariffSection({ tariffs }: { tariffs: TariffDoc[] }) {
  return (
    <Box id="tariff-section" sx={{ py: 4, bgcolor: 'transparent', color: '#0f172a' }}>
      <Container maxWidth="xl">
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
        <Box
          sx={{
            display: { xs: 'flex', md: 'grid' },
            flexDirection: { xs: 'column', md: 'unset' },
            gridTemplateColumns: { md: 'repeat(5, 1fr)' }, // 5 Columns for desktop
            gap: { xs: 2, md: 2 },
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
                  // height: '100%', // Removed to allow aspect ratio to drive
                  aspectRatio: { md: '1 / 1' }, // Strictly Square
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
                    <Box
                      sx={{
                        height: '110px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
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
                            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: 'rgba(255,255,255,0.5)',
                            borderRadius: 2,
                          }}
                        />
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
                </Box>
              </Paper>
            )
          })}
        </Box>
      </Container>
    </Box>
  )
}
