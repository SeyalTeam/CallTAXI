'use client'
import React, { useState } from 'react'
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import MenuIcon from '@mui/icons-material/Menu'

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll detection
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleScrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    handleMenuClose()
  }

  const menuItems = [
    { label: 'Booking', id: 'home' },
    { label: 'About', id: 'about-section' },
    { label: 'Tariff', id: 'tariff-section' },
    { label: 'Packages', id: 'packages-section' },
    { label: 'Contact', id: 'contact-section' },
  ]

  // Dynamic values based on transparency
  // const textColor = scrolled ? '#0f172a' : '#ffffff' // This variable was unused and has been commented out.
  const iconColor = scrolled ? '#0f172a' : '#ffffff'
  const logoColor = scrolled ? '#0f172a' : '#ffffff'
  const navItemColor = scrolled ? '#475569' : '#e2e8f0'

  return (
    <>
      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          background: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
          boxShadow: scrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
          borderBottom: 'none',
          transition: 'all 0.3s ease',
          py: scrolled ? 0.5 : 0, // shrink slightly on scroll
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 1.5, md: 2 } }}>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            sx={{ cursor: 'pointer' }}
          >
            <DirectionsCarOutlinedIcon
              sx={{ color: iconColor, fontSize: 35, transition: 'color 0.3s' }}
            />
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{ color: logoColor, letterSpacing: 0.5, transition: 'color 0.3s' }}
            >
              KANI TAXI
            </Typography>
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                sx={{
                  color: navItemColor,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'color 0.3s',
                  '&:hover': { color: '#FFD700' },
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="contained"
              onClick={() => handleScrollTo('home')}
              sx={{
                bgcolor: '#FFD700',
                color: '#000',
                fontWeight: 'bold',
                ml: 2,
                boxShadow: scrolled ? 'none' : '0 4px 14px 0 rgba(0,0,0,0.3)',
                '&:hover': { bgcolor: '#FACC15' },
              }}
            >
              Book Now
            </Button>
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: iconColor, transition: 'color 0.3s' }}
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu Dropdown */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {menuItems.map((item) => (
          <MenuItem key={item.id} onClick={() => handleScrollTo(item.id)}>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
