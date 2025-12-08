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
          <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ color: '#FFD700' }}>
            Contact Us
          </Typography>
          <Typography variant="h6" color="grey.400" maxWidth="600px" mx="auto">
            Have questions? Reach out to us anytime.
          </Typography>
        </Box>

        <Grid container spacing={8}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Get in Touch
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={3} mt={4}>
              <PhoneIcon sx={{ color: '#FFD700' }} />
              <Typography>+91 98765 43210</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <EmailIcon sx={{ color: '#FFD700' }} />
              <Typography>booking@kanitaxi.com</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <LocationOnIcon sx={{ color: '#FFD700' }} />
              <Typography>123 Corporate Tower, Business District, Chennai, TN, India.</Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <form>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Name"
                    fullWidth
                    sx={{
                      input: { color: '#fff' },
                      label: { color: 'grey.500' },
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
                    sx={{
                      input: { color: '#fff' },
                      label: { color: 'grey.500' },
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
                    sx={{
                      textarea: { color: '#fff' },
                      label: { color: 'grey.500' },
                      fieldset: { borderColor: '#333' },
                      '&:hover fieldset': { borderColor: '#555' },
                      '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#FFD700' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{
                      bgcolor: '#FFD700',
                      color: '#000',
                      fontWeight: 'bold',
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
