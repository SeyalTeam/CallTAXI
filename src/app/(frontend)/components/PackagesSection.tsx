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
            sx={{ color: '#0f172a', fontSize: { xs: '1.75rem', md: '3rem' } }}
          >
            Exclusive <span style={{ color: '#d97706' }}>Packages</span>
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
              <Grid size={{ xs: 6, md: 3 }} key={pkg.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#fff',
                    borderRadius: 4,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      borderColor: '#fed7aa',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      textAlign: 'center',
                      py: { xs: 1.5, md: 3 },
                      px: { xs: 1, md: 2 },
                    }}
                  >
                    <LocalOfferIcon
                      sx={{
                        fontSize: { xs: 32, md: 40 },
                        color: '#d97706',
                        mb: { xs: 0.5, md: 1 },
                      }}
                    />
                    <Typography
                      variant="h6"
                      gutterBottom
                      fontWeight="bold"
                      color="#0f172a"
                      sx={{
                        fontSize: { xs: '0.9rem', md: '1.25rem' },
                        mb: { xs: 0.5, md: '0.35em' },
                      }}
                    >
                      {vName}
                    </Typography>
                    <Typography
                      variant="h4"
                      color="#d97706"
                      fontWeight="800"
                      my={1}
                      sx={{ fontSize: { xs: '1.25rem', md: '2.125rem' }, my: { xs: 0.5, md: 1 } }}
                    >
                      ₹{calculatedAmount}
                    </Typography>
                    <Typography
                      color="#64748b"
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      {pkg.packages?.hours} Hrs / {pkg.packages?.km} KM Package
                    </Typography>
                    {pkg.packages?.extras && (
                      <Typography
                        variant="caption"
                        color="#94a3b8"
                        display="block"
                        mt={0.5}
                        sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                      >
                        {pkg.packages.extras}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: { xs: 1.5, md: 3 }, px: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: '#d97706',
                        borderColor: '#d97706',
                        borderWidth: 2,
                        textTransform: 'none',
                        fontSize: { xs: '0.7rem', md: '0.9rem' },
                        fontWeight: 600,
                        px: { xs: 1, md: 3 },
                        py: { xs: 0.25, md: 0.5 },
                        width: '100%',
                        '&:hover': {
                          borderColor: '#b45309',
                          color: '#b45309',
                          bgcolor: '#fff7ed',
                          borderWidth: 2,
                        },
                      }}
                      onClick={() => {
                        const targetId =
                          typeof pkg.vehicle === 'string' ? pkg.vehicle : pkg.vehicle?.id
                        if (targetId) {
                          const url = new URL(window.location.href)
                          url.searchParams.set('packageVehicle', targetId)
                          window.history.pushState({}, '', url.toString())
                        }
                        document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                    >
                      Book This Package
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Container>
    </Box>
  )
}
