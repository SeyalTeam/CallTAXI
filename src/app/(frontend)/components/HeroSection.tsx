'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Container,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import axios from 'axios'
import { FormValues, TNLocation, VehicleDoc, TariffDoc, CouponDoc } from '../types'

// Define Slider Image Type
interface SliderImage {
  id: string
  url: string
  alt: string
}

/**
 * Utility: parse vehicle reference to id and name
 */
function getVehicleIdFromTariff(t: TariffDoc): string | undefined {
  if (!t.vehicle) return undefined
  if (typeof t.vehicle === 'string') return t.vehicle
  return t.vehicle.id
}

/**
 * Choose best tariff
 */
function chooseBestTariff(tariffs: TariffDoc[]): TariffDoc | undefined {
  if (tariffs.length === 0) return undefined
  const copy = [...tariffs]
  copy.sort((a, b) => {
    const ta = a.updatedAt ?? a.createdAt ?? ''
    const tb = b.updatedAt ?? b.createdAt ?? ''
    if (ta === tb) return 0
    return ta < tb ? 1 : -1 // latest first
  })
  return copy[0]
}

export default function HeroSection() {
  const { handleSubmit, control, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: {
      customerName: '',
      customerPhone: '',
      tripType: 'oneway',
      vehicle: '',
      pickup: '',
      drop: '',
      pickupDateTime: null,
      dropDateTime: null,
    },
  })

  const tripType = watch('tripType')
  const selectedVehicleId = watch('vehicle')
  const pickupDateTime = watch('pickupDateTime')
  const dropDateTime = watch('dropDateTime')

  const [vehicles, setVehicles] = useState<VehicleDoc[]>([])
  const [pickupSuggestions, setPickupSuggestions] = useState<TNLocation[]>([])
  const [dropSuggestions, setDropSuggestions] = useState<TNLocation[]>([])
  const [tnLocations, setTNLocations] = useState<TNLocation[]>([])
  const [pickupCoords, setPickupCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [dropCoords, setDropCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [tariffs, setTariffs] = useState<TariffDoc[]>([])
  const [distanceInfo, setDistanceInfo] = useState<string>('')
  const [fare, setFare] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDoc | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [hasActiveCoupons, setHasActiveCoupons] = useState<boolean>(false)
  const [packageHours, setPackageHours] = useState<number>(1)

  // Slider State
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0)

  // refs for outside click
  const pickupRef = useRef<HTMLDivElement | null>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)

  // Handle Package Selection from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pkgVehicle = params.get('packageVehicle')
    if (pkgVehicle) {
      setValue('tripType', 'packages')
      setValue('vehicle', pkgVehicle)
      // Optional: Clean up URL after selection
      // const url = new URL(window.location.href)
      // url.searchParams.delete('packageVehicle')
      // window.history.replaceState({}, '', url.toString())
    }
  }, [setValue])

  // load data
  useEffect(() => {
    let mounted = true

    async function loadVehicles() {
      try {
        const res = await axios.get<{ docs?: unknown[] }>(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}/api/vehicles?limit=100`,
        )
        const docs = Array.isArray(res.data.docs) ? res.data.docs : []
        const parsed = docs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((d: any) => ({
            id: d.id || d._id,
            name: d.name || d.title || '',
          }))
          .filter((v): v is VehicleDoc => !!v.id)
        if (mounted) setVehicles(parsed)
      } catch (error) {
        console.error('Failed to load vehicles', error)
      }
    }

    async function loadTariffs() {
      try {
        const res = await axios.get<{ docs?: unknown[] }>(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}/api/tariffs?limit=100&sort=-updatedAt`,
        )
        const docs = Array.isArray(res.data.docs) ? res.data.docs : []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parsed = docs.map((d: any) => {
          // simplified parsing for brevity, assuming standard payload structure
          return {
            id: d.id || d._id,
            vehicle: d.vehicle,
            oneway: d.oneway,
            roundtrip: d.roundtrip,
            packages: d.packages,
            updatedAt: d.updatedAt,
            createdAt: d.createdAt,
          } as TariffDoc
        })
        if (mounted) setTariffs(parsed)
      } catch (error) {
        console.error('Failed to load tariffs', error)
      }
    }

    async function loadTN() {
      try {
        const res = await fetch('/tamil_nadu_locations.json')
        if (!res.ok) throw new Error('tn dataset fetch failed')
        const json = (await res.json()) as { places?: TNLocation[] }
        if (mounted && json.places) setTNLocations(json.places)
      } catch (error) {
        console.error('Failed to load TN locations', error)
      }
    }

    async function checkActiveCoupons() {
      try {
        const res = await axios.get<{ totalDocs: number; docs: CouponDoc[] }>(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}/api/coupons?where[active][equals]=true&limit=1`,
        )
        if (mounted && res.data.totalDocs > 0) {
          setHasActiveCoupons(true)
        }
      } catch (error) {
        console.error('Failed to check active coupons', error)
      }
    }

    async function loadSliderImages() {
      try {
        const res = await axios.get<{ docs: any[] }>(
          `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}/api/slider-images?limit=10`,
        )
        const docs = res.data.docs || []
        const images: SliderImage[] = docs
          .filter((d) => d.url)
          .map((d) => ({
            id: d.id,
            url: d.url,
            alt: d.alt || 'Slider Image',
          }))
        if (mounted && images.length > 0) {
          setSliderImages(images)
        }
      } catch (error) {
        console.error('Failed to load slider images', error)
      }
    }

    void loadVehicles()
    void loadTariffs()
    void loadTN()
    void checkActiveCoupons()
    void loadSliderImages()

    return () => {
      mounted = false
    }
  }, [])

  // Slider Interval
  useEffect(() => {
    if (sliderImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % sliderImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [sliderImages.length])

  // hide suggestions
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target as Node))
        setPickupSuggestions([])
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropSuggestions([])
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Calc Logic
  useEffect(() => {
    if (
      (tripType === 'packages' && pickupCoords && tariffs.length > 0) ||
      (pickupCoords && dropCoords && tariffs.length > 0)
    ) {
      void calculateRouteAndFare()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickupCoords,
    dropCoords,
    tripType,
    tariffs,
    selectedVehicleId,
    pickupDateTime,
    dropDateTime,
    packageHours,
  ])

  const handleLocationSearch = (text: string, setSuggestions: (s: TNLocation[]) => void) => {
    const q = text.trim().toLowerCase()
    if (!q) {
      setSuggestions([])
      return
    }
    const matched = tnLocations.filter(
      (p) => p.name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q),
    )
    const results = matched
      .sort((a, b) => {
        const aStarts = a.name.toLowerCase().startsWith(q)
        const bStarts = b.name.toLowerCase().startsWith(q)
        return aStarts === bStarts ? a.name.localeCompare(b.name) : aStarts ? -1 : 1
      })
      .slice(0, 10)

    if (results.length === 1 && results[0].name.toLowerCase() === q) {
      // exact match auto-select could be annoying if typing, so only if user clicked or we enforce it.
      // For now just show suggestions
    }
    setSuggestions(results)
  }

  const selectLocation = (
    loc: TNLocation,
    fieldName: 'pickup' | 'drop',
    setSuggestions: (s: TNLocation[]) => void,
    setCoords: (c: { lat: string; lon: string }) => void,
  ) => {
    setValue(fieldName, `${loc.name}, ${loc.district}`)
    setCoords({ lat: loc.lat, lon: loc.lon })
    setSuggestions([])
  }

  async function calculateRouteAndFare() {
    if (!pickupCoords) return
    if (tripType !== 'packages' && !dropCoords) return

    setLoading(true)
    try {
      let distanceKm = 0
      let durationMin = 0

      if (tripType !== 'packages' && dropCoords) {
        const osrm = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropCoords.lon},${dropCoords.lat}?overview=false`
        const res = await axios.get(osrm)
        const route = res.data.routes?.[0]
        if (route) {
          distanceKm = route.distance / 1000
          durationMin = route.duration / 60
        }
      }

      const matching = tariffs.filter((t) => getVehicleIdFromTariff(t) === selectedVehicleId)
      const chosen = chooseBestTariff(matching.length > 0 ? matching : tariffs)

      if (tripType === 'packages') {
        if (chosen?.packages) {
          const hrs = packageHours
          const rate = chosen.packages.perHourRate || 0
          const amount = rate * hrs
          const allowedKm = hrs * chosen.packages.km
          setDistanceInfo(
            `Package: ${hrs} Hrs / ${allowedKm} km\nExtra: ₹${chosen.packages.extraHourRate}/hr, ₹${chosen.packages.extraKmRate}/km`,
          )
          setFare((amount + chosen.packages.bata).toFixed(2))
        } else {
          setDistanceInfo('')
          setFare(null)
        }
        setLoading(false)
        return
      }

      let days = 1
      if (tripType === 'roundtrip' && pickupDateTime && dropDateTime) {
        const start = pickupDateTime.startOf('day')
        const end = dropDateTime.startOf('day')
        const diff = end.diff(start, 'day') + 1 // inclusive
        days = diff > 0 ? diff : 1
      }

      if (tripType === 'roundtrip') {
        distanceKm *= 2
        durationMin *= 2
      }

      let rate = 0
      let bata = 0
      let minDistance = 130
      const group = tripType === 'roundtrip' ? chosen?.roundtrip : chosen?.oneway

      if (group) {
        rate = group.perKmRate
        bata = group.bata
        if (group.minDistance) minDistance = group.minDistance
      }

      let billDist = distanceKm
      if (distanceKm < minDistance) billDist = minDistance

      let total = billDist * rate + bata

      // Multiply by days for roundtrip
      if (tripType === 'roundtrip') {
        total = total * days
      }

      setDistanceInfo(`${distanceKm.toFixed(2)} km • ${Math.round(durationMin)} min`)
      setFare(Math.round(total).toString())
    } catch (e) {
      console.error(e)
      setFare(null)
    } finally {
      setLoading(false)
    }
  }

  const validateCoupon = async () => {
    if (!couponCodeInput) return

    setLoading(true)
    setCouponError(null)
    setAppliedCoupon(null)
    setDiscountAmount(0)

    try {
      const res = await axios.get<{ docs: CouponDoc[] }>(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}/api/coupons?where[name][equals]=${couponCodeInput}`,
      )
      const coupons = res.data.docs

      if (coupons.length === 0) {
        setCouponError('Invalid coupon code')
        setLoading(false)
        return
      }

      const coupon = coupons[0]

      // 1. Check active
      if (!coupon.active) {
        setCouponError('This coupon is no longer active')
        setLoading(false)
        return
      }

      // 2. Check dates
      const now = new Date()
      if (coupon.startDate && new Date(coupon.startDate) > now) {
        setCouponError('This coupon is not yet valid')
        setLoading(false)
        return
      }
      if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
        setCouponError('This coupon has expired')
        setLoading(false)
        return
      }

      // 3. Check tariff scope
      if (coupon.tariffScope !== 'all' && coupon.tariffScope !== tripType) {
        setCouponError(`This coupon is only valid for ${coupon.tariffScope} trips`)
        setLoading(false)
        return
      }

      // 4. Check vehicle scope
      if (coupon.vehicleScope === 'specific') {
        const vehicleIds = (coupon.vehicles || []).map((v) => (typeof v === 'string' ? v : v.id))
        if (!selectedVehicleId || !vehicleIds.includes(selectedVehicleId)) {
          setCouponError('This coupon is not valid for the selected vehicle')
          setLoading(false)
          return
        }
      }

      // Valid!
      setAppliedCoupon(coupon)
    } catch (error) {
      console.error('Coupon check failed', error)
      setCouponError('Failed to validate coupon')
    } finally {
      setLoading(false)
    }
  }

  const clearCoupon = () => {
    setCouponCodeInput('')
    setAppliedCoupon(null)
    setCouponError(null)
    setDiscountAmount(0)
  }

  // Recalculate discount when fare or coupon changes
  useEffect(() => {
    if (!fare || !appliedCoupon) {
      setDiscountAmount(0)
      return
    }

    const fareNum = Number(fare)
    const discount = (fareNum * appliedCoupon.percentage) / 100
    setDiscountAmount(discount)
  }, [fare, appliedCoupon])

  // Re-validate coupon when trip type or vehicle changes
  useEffect(() => {
    if (appliedCoupon) {
      if (
        (appliedCoupon.tariffScope !== 'all' && appliedCoupon.tariffScope !== tripType) ||
        (appliedCoupon.vehicleScope === 'specific' &&
          selectedVehicleId &&
          !(appliedCoupon.vehicles as any[])?.some(
            (v) => (typeof v === 'string' ? v : v.id) === selectedVehicleId,
          ))
      ) {
        setCouponError('Coupon removed due to booking changes')
        setAppliedCoupon(null)
        setDiscountAmount(0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripType, selectedVehicleId])

  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)

  async function onSubmit(data: FormValues) {
    const payload = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tripType: data.tripType,
      vehicle: data.vehicle,
      pickupLocation: pickupCoords
        ? [Number(pickupCoords.lon), Number(pickupCoords.lat)]
        : undefined,
      dropoffLocation:
        data.tripType !== 'packages' && dropCoords
          ? [Number(dropCoords.lon), Number(dropCoords.lat)]
          : undefined,
      pickupLocationName: data.pickup,
      dropoffLocationName: data.tripType !== 'packages' ? data.drop : undefined,
      pickupDateTime: data.pickupDateTime?.toISOString(),
      dropDateTime: data.tripType === 'roundtrip' ? data.dropDateTime?.toISOString() : undefined,
      estimatedFare: fare ? Number(fare) : undefined,
      couponCode: appliedCoupon?.name,
      discountAmount: discountAmount || undefined,
      status: 'pending',
      notes:
        data.tripType === 'packages'
          ? `${data.pickup} (${packageHours} Hrs Package)`
          : `${data.pickup} to ${data.drop}`,
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}/api/bookings`,
        payload,
      )
      // Success: Show in-form message instead of alert
      setBookingSuccess(res.data.id)
      reset()
      setPickupCoords(null)
      setDropCoords(null)
      setFare(null)
      setDistanceInfo('')
    } catch (_e) {
      alert('Booking failed. Please try again.')
    }
  }

  return (
    <Box
      id="home"
      sx={{
        position: 'relative',
        minHeight: '95vh',
        display: 'flex',
        alignItems: 'flex-start', // Top align to prevent tab jumping
        justifyContent: 'center',
        // Premium corporate light theme background
        background: { xs: 'transparent', md: '#ffffff' },
        color: '#000',
        pt: { xs: '220px', md: '56vh' }, // Desktop pushed further down per 40% request
        overflow: 'visible',
        mb: { xs: '-500px', md: '-220px' }, // Pull next section up
        pb: { xs: '120px', md: '10vh' }, // Restore volume for proper overlap
        zIndex: 2,
      }}
    >
      {/* Background Slider */}
      {sliderImages.length > 0 ? (
        sliderImages.map((img, index) => (
          <Box
            key={img.id}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: { xs: '500px', md: '220px' },
              backgroundImage: `url(${img.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              zIndex: 0,
              opacity: index === currentSlideIndex ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              // Dark overlay for text readability
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            }}
          />
        ))
      ) : (
        // Fallback Static Image
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: { xs: '500px', md: '220px' },
            backgroundImage:
              'url(https://bucghzn379yrpbdu.public.blob.vercel-storage.com/Banner/kanitaxi-hero-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
            // Dark overlay for text readability
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
          }}
        />
      )}

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 1, // Ensure content is above the canvas
        }}
      >
        <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center" justifyContent="center">
          {/* Booking Form Card */}
          <Grid size={{ xs: 12, md: 10 }}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 0,
                bgcolor: 'transparent', // Transparent wrapper
                boxShadow: 'none',
                border: 'none',
                overflow: 'visible',
              }}
            >
              {bookingSuccess ? (
                <Box textAlign="center" py={4} sx={{ bgcolor: 'white', p: 4 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#dcfce7',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <Typography variant="h3">✓</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom color="#0f172a">
                    Booking Confirmed!
                  </Typography>
                  <Typography variant="body1" color="#64748b" paragraph>
                    Thank you for choosing us. Your booking reference is{' '}
                    <strong>{bookingSuccess}</strong>.
                    <br />
                    Our team will contact you shortly.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setBookingSuccess(null)}
                    sx={{
                      mt: 3,
                      bgcolor: '#0f172a',
                      color: '#fff',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: '#334155' },
                    }}
                  >
                    Book Another Ride
                  </Button>
                </Box>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Tab Bar Header */}
                  <Controller
                    name="tripType"
                    control={control}
                    render={({ field }) => (
                      <Box
                        sx={{
                          px: 0,
                          pt: 0,
                          pb: 0,
                          display: 'flex',
                          width: 'fit-content', // Only as wide as tabs
                          gap: 0,
                          overflowX: 'auto',
                          bgcolor: 'transparent',
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                          scrollbarWidth: 'none',
                          '&::-webkit-scrollbar': { display: 'none' },
                        }}
                      >
                        {['oneway', 'roundtrip', 'packages'].map((t) => {
                          const isSelected = field.value === t
                          return (
                            <Box
                              key={t}
                              onClick={() => field.onChange(t)}
                              sx={{
                                px: { xs: 2.5, md: 4 },
                                py: { xs: 1.5, md: 2 },
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                                cursor: 'pointer',
                                bgcolor: isSelected ? '#fbc123' : '#0A1931',
                                color: isSelected ? '#0e172a' : '#ffffff',
                                fontWeight: 600,
                                fontSize: { xs: '0.85rem', md: '0.95rem' },
                                transition: 'all 0.2s',
                                position: 'relative',
                                mb: 0, // No margin bottom, sit flush
                                '&:hover': {
                                  color: isSelected ? '#0e172a' : '#ffffff',
                                  bgcolor: isSelected ? '#f59e0b' : '#1e293b',
                                },
                                ...(isSelected && {
                                  '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 4, // Small overlap strip just in case
                                    bgcolor: '#fbc123',
                                    zIndex: 1,
                                  },
                                }),
                              }}
                            >
                              {t === 'oneway'
                                ? 'One Way'
                                : t === 'roundtrip'
                                  ? 'Round Trip'
                                  : 'Packages'}
                            </Box>
                          )
                        })}
                      </Box>
                    )}
                  />

                  {/* Main Form Content (White Box) */}
                  <Box
                    sx={{
                      bgcolor: '#0e172a',
                      p: { xs: 2, md: 3 },
                      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
                      border: '1px solid #e2e8f0',
                      borderRadius: 3,
                      borderTopLeftRadius: 0, // Connects to the active tab (assuming first tab is active defaults? No, if RoundTrip active, visually it's weird if top-left is sharp. Ideally should be rounded if active tab is not first. But simple folder look usually has sharp corner where tab connects. Let's stick to standard radius for now essentially, maybe 0 if first tab active. For simplicity, keeping standard radius 3 usually looks fine or 0 looks "attached". Let's use 0 because the tab sits on top.)
                      position: 'relative',
                      zIndex: 0, // Behind tabs? No, tabs zIndex 1.
                    }}
                  >
                    <Grid container spacing={1.5} alignItems="flex-start">
                      {/* Pickup Location - First for logical flow */}
                      <Grid
                        size={{
                          xs: 12,
                          md: tripType === 'packages' ? 6 : tripType === 'roundtrip' ? 3 : 4,
                        }}
                        position="relative"
                        ref={pickupRef}
                      >
                        <Controller
                          name="pickup"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              label="Pickup Location"
                              onChange={(e) => {
                                field.onChange(e)
                                handleLocationSearch(e.target.value, setPickupSuggestions)
                              }}
                              sx={{
                                input: {
                                  color: '#0e172a',
                                  fontWeight: 500,
                                  fontSize: '0.9rem',
                                  py: 1, // reduced padding
                                  '&:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px #B3CFE5 inset',
                                    WebkitTextFillColor: '#0e172a',
                                    transition: 'background-color 5000s ease-in-out 0s',
                                  },
                                },
                                label: {
                                  color: '#0e172a',
                                  fontSize: '0.9rem',
                                  '&.MuiInputLabel-shrink': { color: '#94a3b8' },
                                },
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: '#B3CFE5',
                                  '& fieldset': { borderColor: '#e2e8f0' },
                                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#d97706',
                                    borderWidth: 2,
                                  },
                                },
                              }}
                            />
                          )}
                        />
                        {pickupSuggestions.length > 0 && (
                          <Paper
                            sx={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              zIndex: 10,
                              bgcolor: '#1e293b',
                              color: '#fff',
                            }}
                          >
                            {pickupSuggestions.map((s) => (
                              <MenuItem
                                key={s.lat + s.lon}
                                onClick={() =>
                                  selectLocation(s, 'pickup', setPickupSuggestions, setPickupCoords)
                                }
                              >
                                {s.name}, {s.district}
                              </MenuItem>
                            ))}
                          </Paper>
                        )}
                      </Grid>

                      {/* Drop Location - Conditional */}
                      {tripType !== 'packages' && (
                        <Grid
                          size={{ xs: 12, md: tripType === 'roundtrip' ? 3 : 4 }}
                          position="relative"
                          ref={dropRef}
                        >
                          <Controller
                            name="drop"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                size="small"
                                label="Drop Location"
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleLocationSearch(e.target.value, setDropSuggestions)
                                }}
                                sx={{
                                  input: {
                                    color: '#0e172a',
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    py: 1,
                                    '&:-webkit-autofill': {
                                      WebkitBoxShadow: '0 0 0 100px #B3CFE5 inset',
                                      WebkitTextFillColor: '#0e172a',
                                      transition: 'background-color 5000s ease-in-out 0s',
                                    },
                                  },
                                  label: {
                                    color: '#0e172a',
                                    fontSize: '0.9rem',
                                    '&.MuiInputLabel-shrink': { color: '#94a3b8' },
                                  },
                                  '& .MuiOutlinedInput-root': {
                                    bgcolor: '#B3CFE5',
                                    '& fieldset': { borderColor: '#e2e8f0' },
                                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                                    '&.Mui-focused fieldset': {
                                      borderColor: '#d97706',
                                      borderWidth: 2,
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                          {dropSuggestions.length > 0 && (
                            <Paper
                              sx={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 10,
                                bgcolor: '#fff',
                                color: '#000',
                              }}
                            >
                              {dropSuggestions.map((s) => (
                                <MenuItem
                                  key={s.lat + s.lon}
                                  onClick={() =>
                                    selectLocation(s, 'drop', setDropSuggestions, setDropCoords)
                                  }
                                >
                                  {s.name}, {s.district}
                                </MenuItem>
                              ))}
                            </Paper>
                          )}
                        </Grid>
                      )}

                      {/* Pickup Date */}
                      {/* Pickup Date */}
                      <Grid size={{ xs: tripType === 'roundtrip' ? 6 : 12, md: 2 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <Controller
                            name="pickupDateTime"
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                format="DD/MM/YY"
                                label="Pickup Date"
                                value={field.value}
                                onChange={field.onChange}
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    sx: {
                                      bgcolor: '#B3CFE5',
                                      borderRadius: 1,
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: 'transparent',
                                      },
                                      input: {
                                        color: '#0e172a',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        py: 1,
                                      },
                                      label: {
                                        color: '#0e172a',
                                        fontSize: '0.9rem',
                                        '&.MuiInputLabel-shrink': { color: '#94a3b8' },
                                      },

                                      '& .MuiSvgIcon-root': { color: '#0e172a' },
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>

                      {/* Return Date - Conditional */}
                      {tripType === 'roundtrip' && (
                        <Grid size={{ xs: 6, md: 2 }}>
                          <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Controller
                              name="dropDateTime"
                              control={control}
                              render={({ field }) => (
                                <DatePicker
                                  format="DD/MM/YY"
                                  label="Return Date"
                                  value={field.value}
                                  onChange={field.onChange}
                                  slotProps={{
                                    textField: {
                                      size: 'small',
                                      fullWidth: true,
                                      sx: {
                                        bgcolor: '#B3CFE5',
                                        borderRadius: 1,
                                        '& .MuiOutlinedInput-root': {
                                          bgcolor: 'transparent',
                                        },
                                        input: {
                                          color: '#0e172a',
                                          fontWeight: 500,
                                          fontSize: '0.9rem',
                                          py: 1,
                                        },
                                        label: {
                                          color: '#0e172a',
                                          fontSize: '0.9rem',
                                          '&.MuiInputLabel-shrink': { color: '#94a3b8' },
                                        },

                                        '& .MuiSvgIcon-root': { color: '#0e172a' },
                                      },
                                    },
                                  }}
                                />
                              )}
                            />
                          </LocalizationProvider>
                        </Grid>
                      )}

                      {/* Duration - Packages Only */}
                      {tripType === 'packages' && (
                        <Grid size={{ xs: 12, md: 2 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel
                              id="hours-label"
                              sx={{
                                color: '#0e172a',
                                '&.MuiInputLabel-shrink': { color: '#94a3b8' },
                              }}
                            >
                              Duration
                            </InputLabel>
                            <Select
                              labelId="hours-label"
                              label="Duration"
                              value={packageHours}
                              onChange={(e) => setPackageHours(Number(e.target.value))}
                              sx={{
                                bgcolor: '#B3CFE5',
                                color: '#0e172a',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                '.MuiSelect-select': { py: 1 },
                                '.MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#cbd5e1',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#d97706',
                                  borderWidth: 2,
                                },
                                '.MuiSvgIcon-root': { color: '#64748b' },
                              }}
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                                <MenuItem key={h} value={h}>
                                  {h} Hour{h > 1 ? 's' : ''}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      {/* Vehicle Selection - Moved to end of row */}
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Controller
                          name="vehicle"
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small">
                              <InputLabel
                                id="vehicle-label"
                                sx={{
                                  color: '#0e172a',
                                  '&.MuiInputLabel-shrink': { color: '#94a3b8' },
                                }}
                              >
                                Vehicle
                              </InputLabel>
                              <Select
                                labelId="vehicle-label"
                                label="Vehicle"
                                {...field}
                                sx={{
                                  bgcolor: '#B3CFE5',
                                  color: '#0e172a',
                                  fontWeight: 500,
                                  fontSize: '0.9rem',
                                  '.MuiSelect-select': {
                                    py: 1, // reduced padding
                                  },
                                  '.MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#e2e8f0',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#cbd5e1',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#d97706',
                                    borderWidth: 2,
                                  },
                                  '.MuiSvgIcon-root': { color: '#0e172a' },
                                }}
                              >
                                {vehicles.map((v) => (
                                  <MenuItem key={v.id} value={v.id}>
                                    {v.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                          name="customerName"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              label="Your Name"
                              sx={{
                                input: {
                                  color: '#000',
                                  fontWeight: 500,
                                  fontSize: '0.9rem',
                                  py: 1,
                                  '&:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px #B3CFE5 inset',
                                    WebkitTextFillColor: '#000',
                                    transition: 'background-color 5000s ease-in-out 0s',
                                  },
                                },
                                label: {
                                  color: '#0e172a',
                                  fontSize: '0.9rem',
                                  '&.MuiInputLabel-shrink': { color: '#94a3b8' },
                                },
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: '#B3CFE5',
                                  '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                                  '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
                                  '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                          name="customerPhone"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              label="Mobile Number"
                              sx={{
                                input: {
                                  color: '#0e172a',
                                  fontWeight: 500,
                                  fontSize: '0.9rem',
                                  py: 1,
                                  '&:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px #B3CFE5 inset',
                                    WebkitTextFillColor: '#0e172a',
                                    transition: 'background-color 5000s ease-in-out 0s',
                                  },
                                },
                                label: {
                                  color: '#0e172a',
                                  fontSize: '0.9rem',
                                  '&.MuiInputLabel-shrink': { color: '#94a3b8' },
                                },
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: '#B3CFE5',
                                  '& fieldset': { borderColor: '#e2e8f0' },
                                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#d97706',
                                    borderWidth: 2,
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                      {hasActiveCoupons && (
                        <Grid size={{ xs: 12 }}>
                          {/* Coupon Section */}
                          <Box sx={{ mb: 2 }}>
                            <Grid container spacing={1} alignItems="center">
                              <Grid size={{ xs: appliedCoupon ? 12 : 8 }}>
                                {appliedCoupon ? (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      bgcolor: '#dcfce7', // green-100
                                      color: '#166534', // green-800
                                      p: 1.5,
                                      borderRadius: 1,
                                      border: '1px solid #bbf7d0',
                                    }}
                                  >
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        Coupon Applied: {appliedCoupon.name}
                                      </Typography>
                                      <Typography variant="caption">
                                        {appliedCoupon.percentage}% Off applied
                                      </Typography>
                                    </Box>
                                    <Button
                                      size="small"
                                      onClick={clearCoupon}
                                      sx={{ minWidth: 'auto', p: 0.5, color: '#166534' }}
                                    >
                                      ✕
                                    </Button>
                                  </Box>
                                ) : (
                                  <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Coupon Code"
                                    value={couponCodeInput}
                                    onChange={(e) =>
                                      setCouponCodeInput(e.target.value.toUpperCase())
                                    }
                                    error={!!couponError}
                                    helperText={couponError}
                                    sx={{
                                      input: {
                                        color: '#0e172a',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        py: 1,
                                      },
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: '#DAE0E4',
                                      },
                                    }}
                                  />
                                )}
                              </Grid>
                              {!appliedCoupon && (
                                <Grid size={{ xs: 4 }}>
                                  <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={validateCoupon}
                                    disabled={loading || !couponCodeInput}
                                    sx={{
                                      height: 40,
                                      borderColor: '#d97706',
                                      color: '#d97706',
                                      '&:hover': {
                                        borderColor: '#b45309',
                                        bgcolor: '#fff7ed',
                                      },
                                    }}
                                  >
                                    Apply
                                  </Button>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Grid>
                      )}

                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                            mt: 2,
                          }}
                        >
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                              width: { xs: 'auto', md: '25%' },
                              flexShrink: 0,
                              ml: 0,
                              display: 'block',
                              bgcolor: '#fbc024',
                              color: '#000',
                              fontWeight: '600',
                              py: 1,
                              px: { xs: 3, md: 0 },
                              whiteSpace: 'nowrap',
                              textTransform: 'none',
                              fontSize: { xs: '0.85rem', md: '0.9rem' },
                              borderRadius: 2,
                              boxShadow: 'none',
                              '&:hover': {
                                bgcolor: '#f59e0b',
                                boxShadow: 'none',
                              },
                            }}
                          >
                            {loading ? <CircularProgress size={24} /> : 'Book Your Taxi'}
                          </Button>

                          {fare && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexWrap: 'wrap',
                              }}
                            >
                              {discountAmount > 0 ? (
                                <>
                                  <Typography variant="subtitle1" color="#c2410c" fontWeight="bold">
                                    Final: ₹{(Number(fare) - discountAmount).toFixed(2)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="#94a3b8"
                                    sx={{ textDecoration: 'line-through' }}
                                  >
                                    ₹{fare}
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="subtitle1" color="#c2410c" fontWeight="bold">
                                  Estimated Share: ₹{fare}
                                </Typography>
                              )}
                              <Typography variant="body2" color="#64748b">
                                {distanceInfo}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </form>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
