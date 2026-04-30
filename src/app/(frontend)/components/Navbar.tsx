'use client'

import React, { useState } from 'react'
import { AppBar, Toolbar, Box, Button, IconButton, Menu, MenuItem, Divider } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import { usePathname, useRouter } from 'next/navigation'
import { getPublicAssetURL } from '../../../utilities/storage'

const navbarLogoURL = getPublicAssetURL('Brand/kani-taxi-logo.png')

const topRouteLinks = [
  { label: 'Thoothukudi -> Chennai', href: '/drop-taxi/thoothukudi-to-chennai' },
  { label: 'Thoothukudi -> Madurai', href: '/drop-taxi/thoothukudi-to-madurai' },
  { label: 'Thoothukudi -> Coimbatore', href: '/drop-taxi/thoothukudi-to-coimbatore' },
  { label: 'Thoothukudi -> Bangalore', href: '/drop-taxi/thoothukudi-to-bangalore' },
  { label: 'Thoothukudi -> Tirunelveli', href: '/drop-taxi/thoothukudi-to-tirunelveli' },
]

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [dropTaxiAnchorEl, setDropTaxiAnchorEl] = useState<HTMLElement | null>(null)
  const [scrolled, setScrolled] = useState(false)

  const pathname = usePathname()
  const router = useRouter()

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleDropTaxiMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setDropTaxiAnchorEl(event.currentTarget)
  const handleDropTaxiMenuClose = () => setDropTaxiAnchorEl(null)

  const handleScrollTo = (id: string) => {
    if (pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      router.push(`/#${id}`)
    }
    handleMenuClose()
  }

  const handleNavigate = (href: string) => {
    router.push(href)
    handleMenuClose()
    handleDropTaxiMenuClose()
  }

  const sectionItems = [
    { label: 'About', id: 'about-section' },
    { label: 'Tariff', id: 'tariff-section' },
    { label: 'Packages', id: 'packages-section' },
    { label: 'Contact', id: 'contact-section' },
  ]

  const isHomePage = pathname === '/'
  const effectiveScrolled = scrolled || !isHomePage

  const iconColor = effectiveScrolled ? '#0f172a' : '#ffffff'
  const navItemColor = effectiveScrolled ? '#1e293b' : '#e2e8f0'

  return (
    <>
      <AppBar
        position="fixed"
        elevation={effectiveScrolled ? 4 : 0}
        sx={{
          background: effectiveScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: effectiveScrolled ? 'blur(8px)' : 'none',
          boxShadow: effectiveScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
          borderBottom: 'none',
          transition: 'all 0.3s ease',
          py: effectiveScrolled ? 0.5 : 0,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: { xs: 1.5, md: 2 } }}>
          <Box
            display="flex"
            alignItems="center"
            gap={1.25}
            onClick={() => {
              if (pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              } else {
                router.push('/')
              }
            }}
            sx={{ cursor: 'pointer' }}
          >
            <Box
              component="img"
              src={navbarLogoURL}
              alt="Kani Taxi"
              sx={{
                display: 'block',
                width: { xs: 150, sm: 170, md: 190 },
                height: 'auto',
                transition: 'transform 0.3s ease, filter 0.3s ease',
                filter: effectiveScrolled ? 'none' : 'drop-shadow(0 10px 18px rgba(15, 23, 42, 0.28))',
              }}
            />
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button
              onClick={() => handleScrollTo('home')}
              sx={{
                color: navItemColor,
                textTransform: 'none',
                fontWeight: 600,
                transition: 'color 0.3s',
                '&:hover': { color: '#FFD700' },
              }}
            >
              Booking
            </Button>


            {sectionItems.map((item) => (
              <Button
                key={item.label}
                onClick={() => {
                  if ('href' in item && item.href) {
                    handleNavigate(item.href as string)
                  } else {
                    handleScrollTo(item.id!)
                  }
                }}
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
                boxShadow: effectiveScrolled ? 'none' : '0 4px 14px 0 rgba(0,0,0,0.3)',
                '&:hover': { bgcolor: '#FACC15' },
              }}
            >
              Book Now
            </Button>
          </Box>

          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: iconColor, transition: 'color 0.3s' }}
            onClick={handleMenuClick}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleScrollTo('home')}>Booking</MenuItem>
        {topRouteLinks.map((route) => (
          <MenuItem key={route.href} onClick={() => handleNavigate(route.href)}>
            {route.label}
          </MenuItem>
        ))}
        <Divider />
        {sectionItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              if ('href' in item && item.href) {
                handleNavigate(item.href as string)
              } else {
                handleScrollTo(item.id!)
              }
            }}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

    </>
  )
}
