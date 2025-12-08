'use client'

import React from 'react'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import TariffSection from './components/TariffSection'
import PackagesSection from './components/PackagesSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'

export default function Page() {
  return (
    <main style={{ backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <TariffSection />
      <PackagesSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
