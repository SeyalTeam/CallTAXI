'use client'

import React, { useEffect, useState } from 'react'
import PhoneIcon from '@mui/icons-material/Phone'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { Box, Container, Typography } from '@mui/material'

export default function Footer() {
  const [showSticky, setShowSticky] = useState(false)

  useEffect(() => {
    // Observe #home to toggle sticky footer
    const targetEl = document.getElementById('home')
    if (!targetEl) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide when Hero is visible. Show when scrolled past Hero (till footer).
        setShowSticky(!entry.isIntersecting)
      },
      { threshold: 0 },
    )

    observer.observe(targetEl)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Box
        sx={{
          bgcolor: '#000',
          color: '#fff',
          py: 4,
          borderTop: '1px solid #333',
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Typography variant="h6" color="#FFD700" fontWeight="bold">
              Kani Taxi
            </Typography>
            <Typography variant="body2">© {new Date().getFullYear()} Kani Taxi.</Typography>
          </Box>
        </Container>
      </Box>

      {/* Mobile Action Bar - Conditional Sticky */}
      {showSticky && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: '#d97706',
            zIndex: 1000,
            display: { xs: 'flex', md: 'none' },
            boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
            animation: 'slideUp 0.3s ease-out',
            '@keyframes slideUp': {
              from: { transform: 'translateY(100%)' },
              to: { transform: 'translateY(0)' },
            },
          }}
        >
          <Box
            component="a"
            href="tel:+919488104888"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 1.5,
              color: '#fff',
              textDecoration: 'none',
              borderRight: '1px solid rgba(255, 255, 255, 0.3)',
              '&:active': { bgcolor: '#b45309' },
            }}
          >
            <PhoneIcon sx={{ mb: 0.5 }} />
            <Typography variant="subtitle2" fontWeight="bold">
              Call Now
            </Typography>
          </Box>
          <Box
            component="a"
            href="https://wa.me/919488104888"
            target="_blank"
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 1.5,
              color: '#fff',
              textDecoration: 'none',
              '&:active': { bgcolor: '#b45309' },
            }}
          >
            <WhatsAppIcon sx={{ mb: 0.5 }} />
            <Typography variant="subtitle2" fontWeight="bold">
              Let&apos;s Connect
            </Typography>
          </Box>
        </Box>
      )}
    </>
  )
}
