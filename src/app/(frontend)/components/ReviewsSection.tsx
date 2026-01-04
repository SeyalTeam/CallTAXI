'use client'
import React, { useState, useEffect } from 'react'
import { Box, Container, Typography, Paper, Avatar, useTheme, useMediaQuery } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReviewsSection() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const itemsPerPage = isMobile ? 1 : 4
  const totalItems = 12
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const [page, setPage] = useState(0)

  // Reset page when switching views to prevent out of bounds (though slice handles safely usually)
  useEffect(() => {
    setPage(0)
  }, [isMobile])

  const reviews = [
    {
      name: 'Happy Customer',
      text: 'Great service! The drivers are very professional and the cars are always clean and comfortable.',
    },
    {
      name: 'Satisfied Client',
      text: 'Reliable and punctual. I always use Kani Call Taxi for my business trips.',
    },
    {
      name: 'Professional Traveler',
      text: 'Exceptional experience. The booking process was smooth and the ride was very comfortable.',
    },
    {
      name: 'Regular User',
      text: 'Highly recommend! Best taxi service in the city with very competitive rates.',
    },
    {
      name: 'Business Exec',
      text: 'Efficient and professional. The drivers know the city well and are always on time.',
    },
    {
      name: 'Tourist',
      text: 'The best way to get around! Friendly drivers and well-maintained vehicles.',
    },
    {
      name: 'Commuter',
      text: 'Consistent and dependable. Kani Call Taxi is my go-to for daily commuting.',
    },
    { name: 'Family Traveler', text: 'Perfect for families! Spacious cars and very safe driving.' },
    { name: 'Quick Trip', text: 'Fast and easy. The app is great for quick bookings on the go.' },
    {
      name: 'Long Drive',
      text: 'Very comfortable for long journeys. The seats are great and the AC is cold.',
    },
    {
      name: 'Late Night',
      text: 'Safest late-night option. I feel very secure traveling with their verified drivers.',
    },
    {
      name: 'Airport Pick-up',
      text: 'Always on time for airport runs. Never had to wait even once.',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages)
    }, 5000)
    return () => clearInterval(timer)
  }, [totalPages])

  return (
    <Box
      id="reviews-section"
      sx={{
        py: 6,
        background: '#1b1b1b',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="xl">
        <Box textAlign="center" mb={4}>
          <Typography
            variant="h3"
            fontWeight="800"
            gutterBottom
            sx={{
              color: '#ffffff',
              fontSize: { xs: '1.75rem', md: '3rem' },
              fontFamily: 'inherit',
            }}
          >
            Customer Review
          </Typography>
          <Typography
            variant="h6"
            color="#9ca3af"
            mx="auto"
            fontWeight="400"
            sx={{
              maxWidth: { xs: '320px', md: '800px' },
              fontSize: { xs: '0.9rem', md: '1.25rem' },
            }}
          >
            What our clients say about their journey with us.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', minHeight: { xs: '300px', md: '280px' } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6 }}
              style={{
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {reviews.slice(page * itemsPerPage, (page + 1) * itemsPerPage).map((item, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 3,
                    width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(25% - 24px)' },
                    minWidth: { md: '280px' },
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#222222',
                    borderRadius: 4,
                    position: 'relative',
                    transition: 'transform 0.3s ease',
                    height: 'auto',
                    minHeight: '220px',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    },
                  }}
                >
                  {/* Top: Quote Icon and Stars */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <FormatQuoteIcon
                      sx={{
                        fontSize: 40,
                        color: '#fbbf24',
                        transform: 'rotate(180deg)', // Flip for start quotes look if desired
                        opacity: 0.8,
                        ml: -1,
                        mt: -0.5,
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} sx={{ color: '#fbbf24', fontSize: 16 }} />
                      ))}
                    </Box>
                  </Box>

                  {/* Review Text */}
                  <Box sx={{ flexGrow: 1, mb: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#9ca3af',
                        lineHeight: 1.6,
                        fontSize: '0.875rem',
                        fontWeight: 400,
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Box>

                  {/* Reviewer Info with Avatar */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      mt: 'auto',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: '#1b1b1b',
                        border: '2px solid #fbbf24',
                      }}
                    >
                      <PersonOutlineIcon sx={{ color: '#fbbf24', fontSize: 24 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          color: '#ffffff',
                          fontSize: '1rem',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#fbbf24',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        Customer
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </motion.div>
          </AnimatePresence>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1.5,
              mt: { xs: 2, md: 4 },
            }}
          >
            {[...Array(totalPages)].map((_, i) => (
              <Box
                key={i}
                onClick={() => setPage(i)}
                sx={{
                  width: i === page ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: i === page ? '#fbbf24' : '#cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
