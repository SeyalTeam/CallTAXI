'use client'
import React, { useState } from 'react'
import { AppBar, Toolbar, Box, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material'
import DirectionsCarOutlinedIcon from '@mui/icons-material/DirectionsCarOutlined'
import MenuIcon from '@mui/icons-material/Menu'

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

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

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: 'transparent',
          boxShadow: 'none',
          borderBottom: 'none',
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
            <DirectionsCarOutlinedIcon sx={{ color: '#ffffff', fontSize: 35 }} />
            <Typography variant="h5" fontWeight="700" sx={{ color: '#fff', letterSpacing: 0.5 }}>
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
                  color: '#e2e8f0',
                  textTransform: 'none',
                  fontWeight: 500,
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
                '&:hover': { bgcolor: '#FACC15' },
              }}
            >
              Book Now
            </Button>
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}
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
