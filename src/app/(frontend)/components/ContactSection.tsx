import React from 'react'
import { Box, Container, Grid, Typography, Button, TextField } from '@mui/material'
import PhoneIcon from '@mui/icons-material/Phone'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'

export default function ContactSection() {
  return (
    <Box id="contact-section" sx={{ py: 10, bgcolor: '#000', color: '#fff' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h3"
            fontWeight="bold"
            gutterBottom
            sx={{ color: '#FFD700', fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Contact Us
          </Typography>
          <Typography variant="h6" color="grey.400" maxWidth="600px" mx="auto">
            Have questions? Reach out to us anytime.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
            >
              Get in Touch
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2} mt={2}>
              <PhoneIcon sx={{ color: '#FFD700', fontSize: '1.25rem' }} />
              <Typography sx={{ fontSize: '0.9rem' }}>+91 97155 55828</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <EmailIcon sx={{ color: '#FFD700', fontSize: '1.25rem' }} />
              <Typography sx={{ fontSize: '0.9rem' }}>booking@kanitaxi.com</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <LocationOnIcon sx={{ color: '#FFD700', fontSize: '1.25rem' }} />
              <Typography sx={{ fontSize: '0.9rem' }}>
                123 Corporate Tower, Business District, Chennai, TN, India.
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <form>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Name"
                    fullWidth
                    size="small"
                    sx={{
                      input: { color: '#fff', fontSize: '0.9rem', py: 1 },
                      label: { color: 'grey.500', fontSize: '0.9rem' },
                      fieldset: { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#555' },
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Email"
                    fullWidth
                    size="small"
                    sx={{
                      input: { color: '#fff', fontSize: '0.9rem', py: 1 },
                      label: { color: 'grey.500', fontSize: '0.9rem' },
                      fieldset: { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#555' },
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Message"
                    multiline
                    rows={4}
                    fullWidth
                    size="small"
                    sx={{
                      textarea: { color: '#fff', fontSize: '0.9rem' },
                      label: { color: 'grey.500', fontSize: '0.9rem' },
                      fieldset: { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#555' },
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    size="medium"
                    fullWidth
                    sx={{
                      bgcolor: '#FFD700',
                      color: '#000',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      py: 1,
                      '&:hover': { bgcolor: '#FACC15' },
                    }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
