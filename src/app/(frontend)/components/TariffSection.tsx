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
                {/* --- MOBILE LAYOUT (Grid) --- */}
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
                      sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem', lineHeight: 1.2 }}
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
                          width: '60px', // Reduced size as requested
                          height: 'auto',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{ width: '60px', height: '30px', bgcolor: '#f1f5f9', borderRadius: 1 }}
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

                {/* --- DESKTOP LAYOUT (Existing Flex) --- */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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
                        fontSize: { md: '1.5rem' },
                      }}
                    >
                      {vName}
                    </Typography>
                    {seatCount && (
                      <Typography
                        component="span"
                        sx={{
                          color: '#94a3b8',
                          fontSize: { md: '1rem' },
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
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 4,
                    }}
                  >
                    {/* Vehicle Image */}
                    <Box
                      sx={{
                        width: '280px',
                        height: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
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
                        gap: 6,
                        justifyContent: 'flex-end',
                      }}
                    >
                      {/* One Way */}
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
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
                          <Typography variant="body2" color="#64748b" fontWeight={500}>
                            One way
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: '#0f172a',
                            fontSize: '1.75rem',
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
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
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
                          <Typography variant="body2" color="#64748b" fontWeight={500}>
                            Round Trip
                          </Typography>
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            color: '#0f172a',
                            fontSize: '1.75rem',
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
                </Box>
              </Paper>
            )
          })}
        </Box>
      </Container>
    </Box>
  )
}
