import React from 'react'
import { Box } from '@mui/material'
import { getPayload } from 'payload'
import config from '../../payload.config'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import TariffSection from './components/TariffSection'
import PackagesSection from './components/PackagesSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import { TariffDoc } from './types'

export default async function Page() {
  const payload = await getPayload({ config })
  const tariffsRes = await payload.find({
    collection: 'tariffs',
    limit: 100,
    depth: 1,
  })

  // Normalize data for client components
  const tariffs = tariffsRes.docs.map((doc) => {
    return {
      id: doc.id,
      vehicle: doc.vehicle,
      oneway: doc.oneway,
      roundtrip: doc.roundtrip,
      packages: doc.packages,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } as TariffDoc
  })

  return (
    <main style={{ backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <AboutSection />

      {/* Unified Background for Tariffs & Packages */}
      <Box
        sx={{
          position: 'relative',
          backgroundImage:
            'url(https://bucghzn379yrpbdu.public.blob.vercel-storage.com/Banner/kanitaxi-location.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', // Parallax effect
        }}
      >
        {/* White overlay for readability */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(to bottom, #f4f3eb 0%, rgba(244, 243, 235, 0.96) 15%, rgba(244, 243, 235, 0.96) 100%)',
            bgcolor: 'transparent', // fallback
            zIndex: 0,
          }}
        />

        <Box position="relative" zIndex={1}>
          <TariffSection tariffs={tariffs} />
          <PackagesSection tariffs={tariffs} />
        </Box>
      </Box>

      <ContactSection />
      <Footer />
    </main>
  )
}
