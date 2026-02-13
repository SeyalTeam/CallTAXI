'use client'

import React, { useEffect, useState } from 'react'
import PhoneIcon from '@mui/icons-material/Phone'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import XIcon from '@mui/icons-material/X'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { Box, Container, Typography, Grid, IconButton, SxProps, Theme } from '@mui/material'

const ThreadsIcon = ({ fontSize, sx }: { fontSize?: string; sx?: SxProps<Theme> }) => (
  <Box
    component="img"
    src="https://assets.streamlinehq.com/image/private/w_300,h_300,ar_1/f_auto/v1/icons/phosphor-regular/threads-logo-k5c6gxlwykjcqyoby4n7vs.png/threads-logo-3a9s16wq15a0okikkvwic1r.png?_a=DATAiZAAZAA0"
    alt="Threads"
    sx={{
      width: fontSize === 'small' ? 20 : 24,
      height: fontSize === 'small' ? 20 : 24,
      filter:
        'brightness(0) saturate(100%) invert(20%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(90%)', // Approximate #333333
      '&:hover': {
        filter:
          'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(0%) contrast(100%)', // Approximate #000000
      },
      ...sx,
    }}
  />
)

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
                  {
                    icon: FacebookIcon,
                    label: 'Facebook',
                    url: 'https://www.facebook.com/share/17wi9DV1uV/?mibextid=wwXIfr',
                  },
                  {
                    icon: InstagramIcon,
                    label: 'Instagram',
                    url: 'https://www.instagram.com/kani.taxi?igsh=ejNqdHN5cDBsN2c4&utm_source=qr',
                  },
                  {
                    icon: ThreadsIcon,
                    label: 'Threads',
                    url: 'https://www.threads.com/@kani.taxi?invite=0',
                  },
                  { icon: XIcon, label: 'X', url: 'https://x.com/kanitaxiyia9?s=11' },
                  {
                    icon: YouTubeIcon,
                    label: 'YouTube',
                    url: 'https://youtube.com/@kanitaxi-b1d?si=olzi_vPKHOvLqvG2',
                  },
                ].map((social, idx) => (
                  <IconButton
                    key={idx}
                    component="a"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
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

      {/* Mobile Action Bar - Modern Floating Design V2 (Colored Buttons) */}
      {showSticky && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '92%',
            maxWidth: '430px',
            bgcolor: 'rgba(255, 255, 255, 0.4)', // Glass container
            backdropFilter: 'blur(16px)',
            borderRadius: '100px',
            zIndex: 1000,
            display: { xs: 'flex', md: 'none' },
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            p: 0.75, // Internal padding for the glass container
            gap: 1,
            animation: 'floatIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '@keyframes floatIn': {
              from: { transform: 'translateX(-50%) translateY(100px)', opacity: 0 },
              to: { transform: 'translateX(-50%) translateY(0)', opacity: 1 },
            },
          }}
        >
          <Box
            component="a"
            href="tel:+919488104888"
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.25,
              py: 1.5,
              bgcolor: '#2563eb', // Call Blue
              color: '#ffffff',
              borderRadius: '100px',
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              '&:active': { transform: 'scale(0.96)', bgcolor: '#1d4ed8' },
            }}
          >
            <PhoneIcon sx={{ fontSize: 20, color: '#ffffff' }} />
            <Typography variant="subtitle2" fontWeight="900" sx={{ letterSpacing: 0.8 }}>
              CALL
            </Typography>
          </Box>

          <Box
            component="a"
            href="https://wa.me/919488104888"
            target="_blank"
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.25,
              py: 1.5,
              bgcolor: '#22c55e', // WhatsApp Green
              color: '#ffffff',
              borderRadius: '100px',
              textDecoration: 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              '&:active': { transform: 'scale(0.96)', bgcolor: '#16a34a' },
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 22, color: '#ffffff' }} />
            <Typography variant="subtitle2" fontWeight="900" sx={{ letterSpacing: 0.8 }}>
              WHATSAPP
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}
