'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
} from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: '600px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f1f5f9',
        borderRadius: '12px',
      }}
    >
      <CircularProgress />
    </Box>
  ),
})

const LOCATIONS = {
  Tiruchendur: { lat: 8.4841, lon: 78.1189 },
  Rameswaram: { lat: 9.2876, lon: 79.3129 },
  Kanyakumari: { lat: 8.0883, lon: 77.5385 },
  'Nava Tirupathi': { lat: 8.6044, lon: 77.9351 },
  'Nellaiappar Temple': { lat: 8.7284, lon: 77.6891 },
  Tirunelveli: { lat: 8.7139, lon: 77.7567 },
  Madurai: { lat: 9.9252, lon: 78.1198 },
}

const ROUTES = [
  { from: 'Tiruchendur', to: 'Rameswaram', color: '#ef4444' },
  { from: 'Tiruchendur', to: 'Kanyakumari', color: '#3b82f6' },
  { from: 'Tiruchendur', to: 'Nava Tirupathi', color: '#10b981' },
  { from: 'Tiruchendur', to: 'Nellaiappar Temple', color: '#f59e0b' },
  { from: 'Tiruchendur', to: 'Tirunelveli', color: '#8b5cf6' },
  { from: 'Tiruchendur', to: 'Madurai', color: '#ec4899' },
]

export default function RouteMapPage() {
  const [routePaths, setRoutePaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRoutes() {
      const paths = []
      for (const route of ROUTES) {
        const start = LOCATIONS[route.from as keyof typeof LOCATIONS]
        const end = LOCATIONS[route.to as keyof typeof LOCATIONS]
        try {
          const res = await axios.get(
            `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`,
          )
          const geometry = res.data.routes[0].geometry
          const points = geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
          paths.push({
            name: `${route.from} → ${route.to}`,
            points,
            color: route.color,
          })
        } catch (error) {
          console.error(`Failed to fetch route for ${route.from} to ${route.to}`, error)
          // Fallback to straight line if OSRM fails
          paths.push({
            name: `${route.from} → ${route.to}`,
            points: [
              [start.lat, start.lon],
              [end.lat, end.lon],
            ],
            color: route.color,
          })
        }
      }
      setRoutePaths(paths)
      setLoading(false)
    }
    void fetchRoutes()
  }, [])

  return (
    <main style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 6, mt: 8 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            textAlign: 'center',
            mb: 1,
          }}
        >
          Kani Taxi Route Map
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: '#64748b',
            textAlign: 'center',
            mb: 6,
            maxWidth: '800px',
            mx: 'auto',
          }}
        >
          Explore our most popular travel routes starting from the holy town of Tiruchendur.
          We provide seamless connectivity to major spiritual and tourist destinations.
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                height: '100%',
                bgcolor: '#ffffff',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#0f172a' }}>
                Available Routes
              </Typography>
              <List sx={{ width: '100%' }}>
                {ROUTES.map((route, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      mb: 2,
                      borderRadius: '12px',
                      bgcolor: `${route.color}10`,
                      border: `1px solid ${route.color}30`,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateX(8px)',
                        bgcolor: `${route.color}20`,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LocationOnIcon sx={{ color: route.color }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${route.from} to ${route.to}`}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        color: '#1e293b',
                      }}
                      secondary="Standard & Premium Cabs Available"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                height: '600px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                position: 'relative',
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <MapComponent routes={routePaths} center={[8.9, 78.1]} zoom={8} />
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </main>
  )
}
