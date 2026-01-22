'use client'

import React, { useEffect, useState } from 'react'
import PhoneIcon from '@mui/icons-material/Phone'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import XIcon from '@mui/icons-material/X'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { Box, Container, Typography, Grid, IconButton } from '@mui/material'

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
    <Box
      component="footer"
      sx={{ bgcolor: '#ffffff', color: '#000000', borderTop: '1px solid #e5e7eb' }}
    >
      {/* Top Footer Section - Links */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {/* Column 1: Services */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mb: 2.5 }}>
              Our Services
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {[
                'One Way Drop',
                'Round Trip',
                'Airport Transfer',
                'Tour Packages',
                'Wedding Events',
              ].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  fontWeight="500"
                  sx={{
                    cursor: 'pointer',
                    color: '#333333',
                    textDecoration: 'none',
                    '&:hover': { color: '#000000' },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Column 2: Our Cabs */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mb: 2.5 }}>
              Our Cabs
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {['Etios', 'Swift Dzire', 'Innova', 'Innova Crysta', 'Xylo', 'Tempo Traveller'].map(
                (item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    fontWeight="500"
                    sx={{
                      cursor: 'pointer',
                      color: '#333333',
                      textDecoration: 'none',
                      '&:hover': { color: '#000000' },
                    }}
                  >
                    {item}
                  </Typography>
                ),
              )}
            </Box>
          </Grid>

          {/* Column 3: Menu */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mb: 2.5 }}>
              Menu
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {[
                { label: 'Booking', id: 'home' },
                { label: 'About Us', id: 'about-section' },
                { label: 'Tariffs', id: 'tariff-section' },
                { label: 'Packages', id: 'packages-section' },
                { label: 'Contact', id: 'contact-section' },
              ].map((item) => (
                <Typography
                  key={item.label}
                  variant="body2"
                  onClick={() =>
                    document
                      .getElementById(item.id)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  fontWeight="500"
                  sx={{
                    cursor: 'pointer',
                    color: '#333333',
                    textDecoration: 'none',
                    '&:hover': { color: '#000000' },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Column 4: Information */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mb: 2.5 }}>
              Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              {[
                'Cancellation Policy',
                'Method of Payment',
                'Privacy Policy',
                'Terms & Conditions',
              ].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  fontWeight="500"
                  sx={{
                    cursor: 'pointer',
                    color: '#333333',
                    textDecoration: 'none',
                    '&:hover': { color: '#000000' },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Column 5: Download App */}
          <Grid size={{ xs: 6, md: 3 }}>
            <Typography variant="subtitle1" fontWeight="700" gutterBottom sx={{ mb: 2.5 }}>
              Download our Apps
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="App Store"
                sx={{ width: '135px', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
              />
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                sx={{ width: '135px', cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
              />

              {/* Social Media Icons */}
              <Box display="flex" gap={1} mt={1}>
                {[
                  { icon: FacebookIcon, label: 'Facebook' },
                  { icon: InstagramIcon, label: 'Instagram' },
                  { icon: XIcon, label: 'X' },
                  { icon: YouTubeIcon, label: 'YouTube' },
                ].map((social, idx) => (
                  <IconButton
                    key={idx}
                    size="small"
                    sx={{
                      color: '#333333',
                      bgcolor: '#f3f4f6',
                      '&:hover': { bgcolor: '#e5e7eb', color: '#000000' },
                    }}
                  >
                    <social.icon fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Footer Bar */}
      <Box sx={{ bgcolor: '#0f172a', color: '#fff', py: 2 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} Kani Taxi. All rights reserved.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Powered by Seyal
            </Typography>
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
    </Box>
  )
}
