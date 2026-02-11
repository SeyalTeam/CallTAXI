'use client'

import React from 'react'
import { Box, Button, Container, Grid, TextField, Typography } from '@mui/material'
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

export default function ContactSection() {
  const [inquiryType, setInquiryType] = React.useState<'default' | 'partner' | 'driver'>('default')
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    message: '',
  })

  React.useEffect(() => {
    const handlePartnerInquiry = () => {
      setInquiryType('partner')
      const element = document.getElementById('contact-section')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const handleDriverInquiry = () => {
      setInquiryType('driver')
      const element = document.getElementById('contact-section')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }

    const triggerPartner = () => handlePartnerInquiry()
    const triggerDriver = () => handleDriverInquiry()

    window.addEventListener('triggerPartnerInquiry', triggerPartner)
    window.addEventListener('triggerDriverInquiry', triggerDriver)

    return () => {
      window.removeEventListener('triggerPartnerInquiry', triggerPartner)
      window.removeEventListener('triggerDriverInquiry', triggerDriver)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...formData,
      inquiryType: inquiryType === 'default' ? 'customer' : inquiryType,
    }
    console.log('Sending payload:', payload)

    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        alert('Message sent successfully!')
        setFormData({ name: '', phone: '', message: '' })
        setInquiryType('default')
      } else {
        const errorData = await res.json()
        console.error('Server error:', errorData)

        let errorMessage = 'Failed to send message.'
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorMessage +=
            ' ' + errorData.errors.map((err: { message: string }) => err.message).join(', ')
        } else if (errorData.message) {
          errorMessage += ' ' + errorData.message
        }

        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('An error occurred. Please try again.')
    }
  }

  const getHeading = () => {
    switch (inquiryType) {
      case 'partner':
        return 'Partner with Kani Taxi'
      case 'driver':
        return 'Drive for Kani Taxi'
      default:
        return 'Get in touch with us'
    }
  }

  const getDescription = () => {
    switch (inquiryType) {
      case 'partner':
        return 'Join our network! Fill in your details below to attach your vehicle and start earning with us.'
      case 'driver':
        return 'Join our team! Fill in your details below to become a driver and earn a steady income.'
      default:
        return 'Do you have a question? A complaint? Or need any help to choose the right vehicle from Kani Taxi? We are here to help you.'
    }
  }

  return (
    <Box id="contact-section" sx={{ py: { xs: 6, md: 10 }, bgcolor: '#e0f2fe' }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            bgcolor: '#0e172a', // Deep dark blue as requested
            color: '#fff',
            borderRadius: { xs: 4, md: 8 },
            p: { xs: 4, md: 5 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Grid container spacing={6} alignItems="center">
            {/* Left Side: Contact Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ maxWidth: '500px' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 1, // Reduced margin
                    fontSize: { xs: '1.5rem', md: '2.2rem' }, // Reduced font size to fit one line
                    whiteSpace: 'nowrap', // Force one line
                    color: inquiryType !== 'default' ? '#fbbf24' : 'inherit',
                  }}
                >
                  {getHeading()}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#bae6fe',
                    mb: 2, // Reduced margin
                    fontSize: '0.9rem', // Slightly smaller text
                    lineHeight: 1.5,
                  }}
                >
                  {getDescription()}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                    mt: 3,
                    alignItems: 'center',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HeadsetMicIcon fontSize="small" sx={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ opacity: 0.7, lineHeight: 1 }}
                      >
                        Hotline
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        +91 94881 04888
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <MailOutlineIcon fontSize="small" sx={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ opacity: 0.7, lineHeight: 1 }}
                      >
                        Email
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        kanitaxi5555@gmail.com
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Right Side: Form */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2, // Reduced gap
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      size="small" // Small size input
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          '& fieldset': { border: 'none' },
                          '&:hover fieldset': { border: 'none' },
                          '&.Mui-focused fieldset': { border: '1px solid rgba(255,255,255,0.3)' },
                        },
                        input: {
                          '&::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      size="small" // Small size input
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          '& fieldset': { border: 'none' },
                          '&:hover fieldset': { border: 'none' },
                          '&.Mui-focused fieldset': { border: '1px solid rgba(255,255,255,0.3)' },
                        },
                        input: {
                          '&::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      name="message"
                      placeholder="Message"
                      value={formData.message}
                      onChange={handleChange}
                      multiline
                      rows={2} // Reduced rows
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          '& fieldset': { border: 'none' },
                          '&:hover fieldset': { border: 'none' },
                          '&.Mui-focused fieldset': { border: '1px solid rgba(255,255,255,0.3)' },
                        },
                        textarea: {
                          '&::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: '#bae6fd', // Light blue/cyan pop
                    color: '#0f172a',
                    borderRadius: 3,
                    py: 1, // Reduced padding
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.9rem', // Slightly smaller font
                    alignSelf: 'flex-start',
                    boxShadow: 'none',
                    px: 4, // Reduced horizontal padding
                    '&:hover': {
                      bgcolor: '#7dd3fc',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Submit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}
