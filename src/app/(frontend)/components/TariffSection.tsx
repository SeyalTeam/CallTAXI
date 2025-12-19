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
  // Client-side fetching removed in favor of SSR props

  return (
    <Box id="tariff-section" sx={{ py: 4, bgcolor: 'transparent', color: '#0f172a' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            fontWeight="800"
            gutterBottom
            sx={{ color: '#0f172a', fontSize: { xs: '1.75rem', md: '3rem' }, whiteSpace: 'nowrap' }}
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

        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            bgcolor: '#fff',
            borderRadius: 4,
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          <Table sx={{ minWidth: { xs: 0, md: 650 } }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow
                sx={{
                  '& th': {
                    color: '#0f172a',
                    fontWeight: '700',
                    fontSize: { xs: '0.8rem', md: '1rem' },
                    py: { xs: 1.5, md: 3 },
                    px: { xs: 1, md: 2 },
                  },
                }}
              >
                <TableCell>Vehicle Type</TableCell>
                <TableCell align="right">
                  One Way
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      fontSize: { xs: '0.7rem', md: '0.875rem' },
                      fontWeight: 400,
                      color: '#64748b',
                    }}
                  >
                    (per km)
                  </Box>
                </TableCell>
                <TableCell align="right">
                  Round Trip
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      fontSize: { xs: '0.7rem', md: '0.875rem' },
                      fontWeight: 400,
                      color: '#64748b',
                    }}
                  >
                    (per km)
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  Driver Bata
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tariffs.map((row) => {
                const vehicle = row.vehicle
                const vName = typeof vehicle === 'string' ? vehicle : vehicle?.name
                const vIcon =
                  typeof vehicle !== 'string' && typeof vehicle?.icon !== 'string'
                    ? vehicle?.icon
                    : null

                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      '& td': {
                        color: '#334155',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: { xs: '0.85rem', md: '1rem' },
                        py: { xs: 1.5, md: 2.5 },
                        px: { xs: 1, md: 2 },
                      },
                      '&:hover': { bgcolor: '#f8fafc' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 600, color: '#0f172a !important' }}
                    >
                      <Box>
                        {vName}
                        {vIcon && (
                          <Box
                            component="img"
                            src={vIcon.url}
                            alt={vIcon.alt}
                            sx={{
                              display: 'block',
                              width: '40px',
                              height: 'auto',
                              mt: 0.5,
                              objectFit: 'contain',
                            }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">₹{row.oneway?.perKmRate ?? '-'}</TableCell>
                    <TableCell align="right">₹{row.roundtrip?.perKmRate ?? '-'}</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      ₹{row.oneway?.bata ?? '-'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  )
}
