import React from 'react'
import { Box, Container, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#000', color: '#fff', py: 4, borderTop: '1px solid #333' }}>
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
          <Typography variant="body2">
            © {new Date().getFullYear()} Kani Taxi. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
