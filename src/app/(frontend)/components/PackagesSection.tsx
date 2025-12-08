'use client'
import React, { useEffect, useState } from 'react'
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
import axios from 'axios'
import { TariffDoc } from '../types'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'

export default function PackagesSection() {
  const [packages, setPackages] = useState<TariffDoc[]>([])

  useEffect(() => {
    async function load() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = await axios.get<{ docs?: any[] }>('/api/tariffs')
        const docs = res.data.docs || []
        const parsed = docs
          .map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (d: any) =>
              ({
                id: d.id,
                vehicle: d.vehicle,
                packages: d.packages,
              }) as TariffDoc,
          )
          .filter((t) => t.packages && t.packages.amount > 0)
        setPackages(parsed)
      } catch (e) {
        console.error(e)
      }
    }
    void load()
  }, [])

  if (packages.length === 0) return null

  return (
    <Box
      id="packages-section"
      sx={{
        py: 8,
        background: 'linear-gradient(to bottom, #f1f0e8 0%, #e0dfd5 100%)',
        color: '#0f172a',
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" fontWeight="800" gutterBottom sx={{ color: '#0f172a' }}>
            Exclusive <span style={{ color: '#d97706' }}>Packages</span>
          </Typography>
          <Typography variant="h6" color="#64748b" maxWidth="600px" mx="auto" fontWeight="400">
            Curated trips at the best prices.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {packages.map((pkg) => {
            const vName = typeof pkg.vehicle === 'string' ? pkg.vehicle : pkg.vehicle?.name
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={pkg.id}>
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
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', py: 3 }}>
                    <LocalOfferIcon sx={{ fontSize: 40, color: '#d97706', mb: 1 }} />
                    <Typography variant="h6" gutterBottom fontWeight="bold" color="#0f172a">
                      {vName}
                    </Typography>
                    <Typography variant="h4" color="#d97706" fontWeight="800" my={1}>
                      ₹{pkg.packages?.amount}
                    </Typography>
                    <Typography color="#64748b" variant="body2">
                      {pkg.packages?.km} KM Package
                    </Typography>
                    {pkg.packages?.extras && (
                      <Typography variant="caption" color="#94a3b8" display="block" mt={1}>
                        {pkg.packages.extras}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        color: '#d97706',
                        borderColor: '#d97706',
                        borderWidth: 2,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        px: 3,
                        py: 0.5,
                        '&:hover': {
                          borderColor: '#b45309',
                          color: '#b45309',
                          bgcolor: '#fff7ed',
                          borderWidth: 2,
                        },
                      }}
                      onClick={() =>
                        document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
                      }
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
