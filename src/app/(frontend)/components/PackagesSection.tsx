'use client'
import React from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
} from '@mui/material'

import { TariffDoc } from '../types'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

export default function PackagesSection({ tariffs }: { tariffs: TariffDoc[] }) {
  // Filter packages from the passed prop
  const packages = tariffs.filter((t) => t.packages && t.packages.perHourRate > 0)

  if (packages.length === 0) return null

  return (
    <Box
      id="packages-section"
      sx={{
        py: 4,
        background: 'transparent',
        color: '#0f172a',
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            fontWeight="800"
            gutterBottom
            sx={{ color: '#000', fontSize: { xs: '1.75rem', md: '3rem' }, fontFamily: 'inherit' }}
          >
            Exclusive Packages
          </Typography>
          <Typography
            variant="h6"
            color="#64748b"
            maxWidth="600px"
            mx="auto"
            fontWeight="400"
            sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }}
          >
            Curated trips at the best prices.
          </Typography>
        </Box>

        <Grid container spacing={2} justifyContent="center">
          {packages.map((pkg) => {
            const vName = typeof pkg.vehicle === 'string' ? pkg.vehicle : pkg.vehicle?.name
            const calculatedAmount = (pkg.packages?.hours || 0) * (pkg.packages?.perHourRate || 0)

            return (
              <Grid size={{ xs: 12, md: 4 }} key={pkg.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: 'auto', // Compact height
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#fff',
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      borderColor: '#fed7aa',
                    },
                  }}
                  onClick={() => {
                    const targetId = typeof pkg.vehicle === 'string' ? pkg.vehicle : pkg.vehicle?.id
                    if (targetId) {
                      const url = new URL(window.location.href)
                      url.searchParams.set('packageVehicle', targetId)
                      window.history.pushState({}, '', url.toString())
                    }
                    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  <CardContent
                    sx={{
                      textAlign: 'center',
                      py: 3, // Reduced padding
                      px: 2,
                    }}
                  >
                    <LocalOfferIcon
                      sx={{
                        fontSize: 32,
                        color: '#d97706',
                        mb: 1.5,
                      }}
                    />

                    {/* Compact Single Line Header: Name + Price */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography variant="h6" fontWeight="800" color="#0f172a">
                        {vName}
                      </Typography>
                      <Typography variant="h5" fontWeight="800" color="#d97706">
                        - ₹{calculatedAmount}
                      </Typography>
                    </Box>

                    {/* Details Stacked */}
                    <Typography
                      color="#64748b"
                      variant="body2"
                      fontWeight="500"
                      sx={{ fontSize: '0.9rem', mb: 0.5 }}
                    >
                      {pkg.packages?.hours} Hrs / {pkg.packages?.km} KM Package
                    </Typography>

                    <Typography
                      variant="caption"
                      color="#94a3b8"
                      display="block"
                      sx={{ fontSize: '0.8rem' }}
                    >
                      {pkg.packages?.extras || '0'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Container>
    </Box>
  )
}
