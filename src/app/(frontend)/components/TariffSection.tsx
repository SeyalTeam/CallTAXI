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
    <Box id="tariff-section" sx={{ py: 8, bgcolor: 'transparent', color: '#0f172a' }}>
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
          <Typography variant="h6" color="#64748b" maxWidth="600px" mx="auto" fontWeight="400">
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
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow
                sx={{ '& th': { color: '#0f172a', fontWeight: '700', fontSize: '1rem', py: 3 } }}
              >
                <TableCell>Vehicle Type</TableCell>
                <TableCell align="right">
                  One Way
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
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
                      fontSize: '0.875rem',
                      fontWeight: 400,
                      color: '#64748b',
                    }}
                  >
                    (per km)
                  </Box>
                </TableCell>
                <TableCell align="right">Driver Bata</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tariffs.map((row) => {
                const vName = typeof row.vehicle === 'string' ? row.vehicle : row.vehicle?.name
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      '& td': {
                        color: '#334155',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '1rem',
                        py: 2.5,
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
                      {vName}
                    </TableCell>
                    <TableCell align="right">₹{row.oneway?.perKmRate ?? '-'}</TableCell>
                    <TableCell align="right">₹{row.roundtrip?.perKmRate ?? '-'}</TableCell>
                    <TableCell align="right">₹{row.oneway?.bata ?? '-'}</TableCell>
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
