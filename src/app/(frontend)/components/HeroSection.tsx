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
  Popper,
  Stepper,
  StepConnector,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import LocationOnIcon from '@mui/icons-material/LocationOn'

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

/**
 * Helper to calculate distance
 */
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180)
}

/**
 * Helper to highlight matching text
 */
const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <>{text}</>
  // Since we filter by startsWith, we only highlight the beginning
  if (text.toLowerCase().startsWith(highlight.toLowerCase())) {
    const matchLength = highlight.length
    const matchedPart = text.slice(0, matchLength)
    const restPart = text.slice(matchLength)
    return (
      <span style={{ fontWeight: 400 }}>
        <b style={{ fontWeight: 700, color: '#0f172a' }}>{matchedPart}</b>
        {restPart}
      </span>
    )
  }
  return <>{text}</>
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
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null)
  const [fare, setFare] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [_isCalculating, setIsCalculating] = useState<boolean>(false)
  const [tourLocations, setTourLocations] = useState<TNLocation[]>([])

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
      const target = e.target as Node
      // Check Pickup
      const pickupPaper = document.getElementById('pickup-suggestions-paper')
      const isPickupClick =
        (pickupRef.current && pickupRef.current.contains(target)) ||
        (pickupPaper && pickupPaper.contains(target))

      if (!isPickupClick) setPickupSuggestions([])

      // Check Drop
      const dropPaper = document.getElementById('drop-suggestions-paper')
      const isDropClick =
        (dropRef.current && dropRef.current.contains(target)) ||
        (dropPaper && dropPaper.contains(target))

      if (!isDropClick) setDropSuggestions([])
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Calc Logic
  useEffect(() => {
    if (
      (tripType === 'packages' && pickupCoords && tariffs.length > 0) ||
      (pickupCoords && dropCoords && tariffs.length > 0) ||
      (tripType === 'multilocation' && tourLocations.length >= 2 && tariffs.length > 0)
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
    tourLocations, // Added tourLocations dependency
  ])

  const handleLocationSearch = (text: string, setSuggestions: (s: TNLocation[]) => void) => {
    const q = text.trim().toLowerCase()
    if (!q) {
      setSuggestions([])
      return
    }
    const matched = tnLocations.filter((p) => p.name.toLowerCase().startsWith(q))
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
    const val = loc.name === loc.district ? loc.name : `${loc.name}, ${loc.district}`

    // Multi-Location Logic
    if (tripType === 'multilocation' && fieldName === 'pickup') {
      setTourLocations((prev) => [...prev, loc])
      setValue('pickup', '')
      setSuggestions([])
      handleLocationSearch('', setPickupSuggestions)

      // If it's the first location, set it as the pickup coords
      if (tourLocations.length === 0) {
        setPickupCoords({ lat: loc.lat, lon: loc.lon })
      }
      return
    }

    setValue(fieldName, val)
    setCoords({ lat: loc.lat, lon: loc.lon })
    setSuggestions([])
  }

  const removeTourLocation = (index: number) => {
    setTourLocations((prev) => prev.filter((_, i) => i !== index))
  }

  async function calculateRouteAndFare() {
    if (!pickupCoords) return
    if (tripType !== 'packages' && tripType !== 'multilocation' && !dropCoords) return

    // For Tour: Need at least one stop (pickup + 1 stop) or just rely on manual calc?
    // Let's assume Tour needs at least 2 points (using tourLocations) to calc distance
    if (tripType === 'multilocation' && tourLocations.length < 2) return

    setIsCalculating(true)
    try {
      let distanceKm = 0
      let durationMin = 0

      if (tripType !== 'packages' && tripType !== 'multilocation' && dropCoords) {
        // Standard Oneway/Roundtrip
        const osrm = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropCoords.lon},${dropCoords.lat}?overview=false`
        const res = await axios.get(osrm)
        const route = res.data.routes?.[0]
        if (route) {
          distanceKm = route.distance / 1000
          durationMin = route.duration / 60
        }
      } else if (tripType === 'multilocation' && tourLocations.length >= 2) {
        // Multi-Location Distance Calc: Sum of segments
        // P1 -> P2 -> P3 ...
        let totalDist = 0
        let totalDur = 0

        // Loop through locations pair by pair
        for (let i = 0; i < tourLocations.length - 1; i++) {
          const start = tourLocations[i]
          const end = tourLocations[i + 1]
          const osrm = `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`
          try {
            const res = await axios.get(osrm)
            const route = res.data.routes?.[0]
            if (route) {
              totalDist += route.distance
              totalDur += route.duration
            }
          } catch (e) {
            console.error('Segment calc failed', e)
          }
        }

        distanceKm = totalDist / 1000
        durationMin = totalDur / 60
      }

      const matching = tariffs.filter((t) => getVehicleIdFromTariff(t) === selectedVehicleId)

      // FIX: Only calculate tariff if a vehicle is selected
      if (!selectedVehicleId) {
        if (distanceKm > 0) {
          setDistanceInfo(`${distanceKm.toFixed(2)} km • ${Math.round(durationMin)} min`)
          setCalculatedDistance(distanceKm)
        } else {
          setDistanceInfo('')
          setCalculatedDistance(null)
        }
        setFare(null)
        setIsCalculating(false)
        return
      }

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
          setCalculatedDistance(allowedKm)
          setFare((amount + chosen.packages.bata).toFixed(2))
        } else {
          setDistanceInfo('')
          setCalculatedDistance(null)
          setFare(null)
        }
        setIsCalculating(false)
        return
      }

      let days = 1
      if (
        (tripType === 'roundtrip' || tripType === 'multilocation') &&
        pickupDateTime &&
        dropDateTime
      ) {
        const start = pickupDateTime.startOf('day')
        const end = dropDateTime.startOf('day')
        const diff = end.diff(start, 'day') + 1 // inclusive
        days = diff > 0 ? diff : 1
      }

      let rate = 0
      let bata = 0
      let minDistance = 130

      // Determine Tariff Group
      // Force 'roundtrip' group for multilocation to ensure "like round trip" pricing
      const useRoundTripLogic = tripType === 'roundtrip' || tripType === 'multilocation'
      const group = useRoundTripLogic ? chosen?.roundtrip : chosen?.oneway

      if (group) {
        rate = group.perKmRate
        bata = group.bata
        if (group.minDistance) minDistance = group.minDistance
      }

      // Distance Adjustment for Round Trip Logic
      // Round Trip: A->B implies A->B->A (Doubled)
      // Tour: A->B->C implies A->B->C->A (Doubled) if we want "Round Trip" pricing behavior
      if (useRoundTripLogic) {
        distanceKm *= 2
        durationMin *= 2
      }

      // Check Minimum Distance Rule
      let billDist = distanceKm
      if (distanceKm < minDistance) billDist = minDistance

      // Calculate Total Fare
      // Current Logic (from existing codebase): (Dist * Rate + Bata) * Days
      // This logic produces the "High Price" (~20k) the user expects for Round Trip.
      // We explicitly apply it to Tour as well.
      let total = billDist * rate + bata

      if (useRoundTripLogic) {
        // Ensure days is at least 1
        const billingDays = days > 0 ? days : 1
        total = total * billingDays
      }

      setDistanceInfo(`${distanceKm.toFixed(2)} km • ${Math.round(durationMin)} min`)
      setCalculatedDistance(distanceKm)
      setFare(Math.round(total).toString())
    } catch (e) {
      console.error(e)
      setFare(null)
      setCalculatedDistance(null)
    } finally {
      setIsCalculating(false)
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
        data.tripType !== 'packages' && data.tripType !== 'multilocation' && dropCoords
          ? [Number(dropCoords.lon), Number(dropCoords.lat)]
          : undefined,
      pickupLocationName: data.pickup,
      dropoffLocationName:
        data.tripType !== 'packages' && data.tripType !== 'multilocation' ? data.drop : undefined,
      pickupDateTime: data.pickupDateTime?.toISOString(),
      dropDateTime:
        data.tripType === 'roundtrip' || data.tripType === 'multilocation'
          ? data.dropDateTime?.toISOString()
          : undefined,
      estimatedFare: fare ? Number(fare) : undefined,
      distanceKm: calculatedDistance || undefined,
      couponCode: appliedCoupon?.name,
      discountAmount: discountAmount || undefined,
      status: 'pending',
      // Map tour locations if applicable
      tourLocations:
        data.tripType === 'multilocation'
          ? tourLocations.map((l) => ({
              name: l.name,
              point: [Number(l.lon), Number(l.lat)],
            }))
          : undefined,
      notes:
        data.tripType === 'packages'
          ? `${data.pickup} (${packageHours} Hrs Package)`
          : data.tripType === 'multilocation'
            ? `Tour: ${tourLocations.map((l) => l.name).join(' -> ')} ${
                distanceInfo ? `(Distance: ${distanceInfo})` : ''
              }`
            : `${data.pickup} to ${data.drop}`,
    }

    // Validation for Tour
    if (data.tripType === 'multilocation' && tourLocations.length === 0) {
      alert('Please add at least one location for your tour.')
      return
    }
    // Override pickup for Tour logic if needed
    if (data.tripType === 'multilocation' && tourLocations.length > 0) {
      payload.pickupLocationName = tourLocations[0].name
      payload.pickupLocation = [Number(tourLocations[0].lon), Number(tourLocations[0].lat)]
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
      setCalculatedDistance(null)

      // Clear Coupon State
      setCouponCodeInput('')
      setAppliedCoupon(null)
      setCouponError(null)
      setDiscountAmount(0)
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
        background: { xs: 'transparent', md: '#f1f7f7' },
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
                          px: { xs: 1, md: 0 }, // Removed md padding to align with left edge completely? Or keep standard? Usually md:2 or 3 is good. Let's keep md:0 to align with input edge if inputs have padding, OR md:0 if the parent container has padding. The parent container has padding. So px:0 might be best for left alignment.
                          // The User's screenshot shows the cards centered. If I want left align, I should match the input field's start.
                          // The input fields are inside a Box with p: {xs: 2, md: 3}.
                          // The tab container is *above* that.
                          // If I want visual alignment, I might need px: {xs: 1, md: 0} and justifyContent: 'flex-start'.
                          py: 2,
                          display: 'flex',
                          width: '100%',
                          gap: { xs: 1, md: 2 },
                          overflowX: 'auto',
                          bgcolor: 'transparent',
                          scrollbarWidth: 'none',
                          '&::-webkit-scrollbar': { display: 'none' },
                          justifyContent: { xs: 'space-between', md: 'flex-start' }, // Left align on desktop
                        }}
                      >
                        {[
                          {
                            id: 'oneway',
                            label: 'One Way',
                            img: '/assets/tabs/tab_icon_oneway_taxi_1768130636829.png',
                          },
                          {
                            id: 'roundtrip',
                            label: 'Round Trip',
                            img: '/assets/tabs/tab_icon_roundtrip_luggage_1768130650587.png',
                          },
                          {
                            id: 'packages',
                            label: 'Packages',
                            img: '/assets/tabs/tab_icon_packages_clock_1768130665696.png',
                          },
                          {
                            id: 'multilocation',
                            label: 'Tour',
                            img: '/assets/tabs/tab_icon_tour_map_1768130689319.png',
                          },
                        ].map((item) => {
                          const isSelected = field.value === item.id
                          return (
                            <Box
                              key={item.id}
                              onClick={() => {
                                // Reset state on tab switch to avoid confusion
                                field.onChange(item.id)
                                setValue('pickup', '')
                                setValue('drop', '')
                                setValue('vehicle', '')
                                setPickupCoords(null)
                                setDropCoords(null)
                                setFare(null)
                                setDistanceInfo('')
                                // If switching away from Tour, clear tour locations?
                                // Or if switching TO Tour, clear them?
                                // User said: "choosed tour location its reflecting in othere tab"
                                // This implies Tour locations might be affecting other tabs or vice versa.
                                // Best to clear Tour locations when switching OUT of Tour.
                                if (
                                  field.value === 'multilocation' &&
                                  item.id !== 'multilocation'
                                ) {
                                  setTourLocations([])
                                }
                                // Also clear if switching INTO Tour to start fresh?
                                // User might want to keep if they accidentally switched?
                                // Let's clear to be safe and avoid "reflection" issues.
                                if (item.id === 'multilocation') {
                                  setTourLocations([])
                                }
                              }}
                              sx={{
                                width: { xs: '23%', md: '80px' }, // Reduced further (~96 -> 80)
                                minWidth: 0,
                                height: { xs: 75, md: 80 },
                                p: { xs: 0.5, md: 0.75 },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderRadius: 3,
                                cursor: 'pointer',
                                bgcolor: isSelected ? '#fff9db' : '#fff',
                                border: isSelected ? '2px solid #fbc024' : '1px solid #cbd5e1',
                                boxShadow: isSelected
                                  ? '0 4px 12px rgba(251, 193, 36, 0.3)'
                                  : '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                '&:hover': {
                                  borderColor: '#fbc024',
                                  transform: 'translateY(-2px)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '100%',
                                  overflow: 'hidden',
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.img}
                                  alt={item.label}
                                  style={{
                                    maxWidth: '90%',
                                    maxHeight: '90%',
                                    objectFit: 'contain',
                                    display: 'block',
                                  }}
                                />
                              </Box>

                              <Typography
                                variant="body2"
                                sx={{
                                  color: '#0f172a',
                                  fontWeight: isSelected ? 700 : 500,
                                  fontSize: { xs: '0.65rem', md: '0.75rem' }, // Reduced font size
                                  letterSpacing: 0.1,
                                  textAlign: 'center',
                                  lineHeight: 1.1,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  width: '100%',
                                }}
                              >
                                {item.label}
                              </Typography>
                            </Box>
                          )
                        })}
                      </Box>
                    )}
                  />

                  {/* Main Form Content (White Box) */}
                  <Box
                    sx={{
                      bgcolor: '#1C2E4A',
                      p: { xs: 2, md: 3 },
                      boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)',
                      // border: '1px solid #e2e8f0', // Removed as per request
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
                          md: tripType === 'multilocation' ? 6 : 3, // 6 for Tour, 3 for others
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
                              autoComplete="off"
                              label={
                                tripType === 'multilocation' && tourLocations.length > 0
                                  ? 'Next Location'
                                  : 'Pickup Location'
                              }
                              onChange={(e) => {
                                field.onChange(e)
                                handleLocationSearch(e.target.value, setPickupSuggestions)
                              }}
                              sx={{
                                input: {
                                  color: 'rgba(14, 23, 42, 0.7)',
                                  fontWeight: 500,
                                  fontSize: '0.9rem',
                                  py: 1, // reduced padding
                                  '&:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px #dae0e4 inset',
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
                                  bgcolor: '#dae0e4',
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
                          <Popper
                            open={pickupSuggestions.length > 0}
                            anchorEl={pickupRef.current}
                            placement="bottom-start"
                            style={{ zIndex: 1300, width: pickupRef.current?.clientWidth }}
                          >
                            <Paper
                              id="pickup-suggestions-paper"
                              sx={{
                                bgcolor: '#fff',
                                color: '#0e172a',
                              }}
                            >
                              {pickupSuggestions.map((s, i) => (
                                <MenuItem
                                  key={s.lat + s.lon}
                                  onClick={() =>
                                    selectLocation(
                                      s,
                                      'pickup',
                                      setPickupSuggestions,
                                      setPickupCoords,
                                    )
                                  }
                                  sx={{
                                    borderBottom:
                                      i === pickupSuggestions.length - 1
                                        ? 'none'
                                        : '1px solid #cbd5e1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    whiteSpace: 'nowrap',
                                    py: 1.5,
                                    overflow: 'hidden',
                                  }}
                                >
                                  <LocationOnIcon
                                    sx={{
                                      color: '#94a3b8',
                                      mr: 2,
                                      fontSize: '1.2rem',
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                      variant="body2"
                                      color="#334155"
                                      sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      <HighlightedText text={s.name} highlight={watch('pickup')} />
                                      <span
                                        style={{
                                          color: '#64748b',
                                          fontSize: '0.85em',
                                          marginLeft: '6px',
                                        }}
                                      >
                                        {s.name !== s.district
                                          ? `${s.district}, Tamil Nadu`
                                          : 'Tamil Nadu'}
                                      </span>
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Paper>
                          </Popper>
                        )}
                      </Grid>

                      {/* Drop Location - Conditional */}
                      {tripType !== 'packages' && tripType !== 'multilocation' && (
                        <Grid
                          size={{
                            xs: 12,
                            md: 3, // Standardized to 3 matching Pickup
                          }}
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
                                autoComplete="off"
                                label="Drop Location"
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleLocationSearch(e.target.value, setDropSuggestions)
                                }}
                                sx={{
                                  input: {
                                    color: 'rgba(14, 23, 42, 0.7)',
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    py: 1,
                                    '&:-webkit-autofill': {
                                      WebkitBoxShadow: '0 0 0 100px #dae0e4 inset',
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
                                    bgcolor: '#dae0e4',
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
                            <Popper
                              open={dropSuggestions.length > 0}
                              anchorEl={dropRef.current}
                              placement="bottom-start"
                              style={{ zIndex: 1300, width: dropRef.current?.clientWidth }}
                            >
                              <Paper
                                id="drop-suggestions-paper"
                                sx={{
                                  bgcolor: '#fff',
                                  color: '#0e172a',
                                }}
                              >
                                {dropSuggestions.map((s, i) => (
                                  <MenuItem
                                    key={s.lat + s.lon}
                                    onClick={() =>
                                      selectLocation(s, 'drop', setDropSuggestions, setDropCoords)
                                    }
                                    sx={{
                                      borderBottom:
                                        i === dropSuggestions.length - 1
                                          ? 'none'
                                          : '1px solid #cbd5e1',
                                      display: 'flex',
                                      alignItems: 'center',
                                      whiteSpace: 'nowrap',
                                      py: 1.5,
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <LocationOnIcon
                                      sx={{
                                        color: '#94a3b8',
                                        mr: 2,
                                        fontSize: '1.2rem',
                                        flexShrink: 0,
                                      }}
                                    />
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                      <Typography
                                        variant="body2"
                                        color="#334155"
                                        sx={{
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        <HighlightedText text={s.name} highlight={watch('drop')} />
                                        <span
                                          style={{
                                            color: '#64748b',
                                            fontSize: '0.85em',
                                            marginLeft: '6px',
                                          }}
                                        >
                                          {s.name !== s.district
                                            ? `${s.district}, Tamil Nadu`
                                            : 'Tamil Nadu'}
                                        </span>
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Paper>
                            </Popper>
                          )}
                        </Grid>
                      )}

                      {/* Pickup Date */}
                      {/* Pickup Date */}
                      {/* Pickup Date */}
                      <Grid
                        size={{
                          xs: tripType === 'roundtrip' || tripType === 'multilocation' ? 6 : 12,
                          md: tripType === 'roundtrip' || tripType === 'multilocation' ? 2 : 3, // 3 for OneWay/Pack, 2 for RoundTrip/Tour
                        }}
                      >
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
                                      bgcolor: '#dae0e4',
                                      borderRadius: 1,
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: 'transparent',
                                      },
                                      input: {
                                        color: 'rgba(14, 23, 42, 0.7)',
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
                      {(tripType === 'roundtrip' || tripType === 'multilocation') && (
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
                                        bgcolor: '#dae0e4',
                                        borderRadius: 1,
                                        '& .MuiOutlinedInput-root': {
                                          bgcolor: 'transparent',
                                        },
                                        input: {
                                          color: 'rgba(14, 23, 42, 0.7)',
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
                        <Grid size={{ xs: 12, md: 3 }}>
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
                                bgcolor: '#dae0e4',
                                color: 'rgba(14, 23, 42, 0.7)',
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

                      {/* Vehicle Selection - Moved to end of row for others, integrated for multilocation */}
                      <Grid
                        size={{
                          xs: 12,
                          md: tripType === 'roundtrip' || tripType === 'multilocation' ? 2 : 3,
                        }}
                      >
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
                                  bgcolor: '#dae0e4',
                                  color: 'rgba(14, 23, 42, 0.7)',
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

                      <Grid size={{ xs: 12, md: tripType === 'multilocation' ? 3 : 3 }}>
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
                                  color: 'rgba(0, 0, 0, 0.7)',
                                  fontWeight: 500,
                                  fontSize: '0.9rem',
                                  py: 1,
                                  '&:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px #dae0e4 inset',
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
                                  bgcolor: '#dae0e4',
                                  '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                                  '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
                                  '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: tripType === 'multilocation' ? 3 : 3 }}>
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
                                  color: 'rgba(14, 23, 42, 0.7)',
                                  fontWeight: 500,
                                  fontSize: '0.9rem',
                                  py: 1,
                                  '&:-webkit-autofill': {
                                    WebkitBoxShadow: '0 0 0 100px #dae0e4 inset',
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
                                  bgcolor: '#dae0e4',
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

                      {hasActiveCoupons && tripType === 'multilocation' && (
                        <Grid size={{ xs: 12, md: 3 }}>
                          {/* Coupon Section (Multilocation Only) */}
                          <Box>
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
                                        color: 'rgba(14, 23, 42, 0.7)',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        py: 1,
                                      },
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: '#dae0e4',
                                      },
                                    }}
                                  />
                                )}
                              </Grid>
                              {!appliedCoupon && (
                                <Grid size={{ xs: 4 }}>
                                  <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={validateCoupon}
                                    disabled={loading || !couponCodeInput}
                                    sx={{
                                      height: 40,
                                      bgcolor: '#fbc123',
                                      color: '#000000',
                                      fontWeight: 600,
                                      '&:hover': {
                                        bgcolor: '#f59e0b',
                                      },
                                      '&.Mui-disabled': {
                                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                                        color: 'rgba(255, 255, 255, 0.3)',
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

                      {tripType === 'multilocation' && (
                        <>
                          <Grid size={{ xs: 12, md: 2 }} sx={{ alignSelf: 'center' }}>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={loading}
                              sx={{
                                width: { xs: 'auto', md: '100%' },
                                px: { xs: 4, md: 0 },
                                bgcolor: '#fbc024',
                                color: '#000',
                                fontWeight: '600',
                                py: 1,
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
                          </Grid>
                          {/* Fare Info Display for Tour */}
                          <Grid size={{ xs: 12, md: 4 }} sx={{ alignSelf: 'center' }}>
                            {fare && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'baseline', // Changed to baseline for better text alignment
                                  height: '100%',
                                  gap: 1, // Reduced gap slightly
                                  pl: { md: 2 },
                                }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  color="#fff"
                                  fontWeight="bold"
                                  sx={{ lineHeight: 1.2 }}
                                >
                                  <span style={{ color: '#fbc024', fontSize: '1.25em' }}>
                                    ₹{fare}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '0.9em',
                                      color: '#94a3b8',
                                      fontWeight: 400,
                                      marginLeft: '8px',
                                    }}
                                  >
                                    {distanceInfo}
                                  </span>
                                </Typography>
                              </Box>
                            )}
                          </Grid>
                        </>
                      )}

                      {hasActiveCoupons && tripType !== 'multilocation' && (
                        <Grid size={{ xs: 12, md: 3 }}>
                          {/* Coupon Section (Other Types) */}
                          <Box>
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
                                        color: 'rgba(14, 23, 42, 0.7)',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        py: 1,
                                      },
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: '#dae0e4',
                                      },
                                    }}
                                  />
                                )}
                              </Grid>
                              {!appliedCoupon && (
                                <Grid size={{ xs: 4 }}>
                                  <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={validateCoupon}
                                    disabled={loading || !couponCodeInput}
                                    sx={{
                                      height: 40,
                                      bgcolor: '#fbc123',
                                      color: '#000000',
                                      fontWeight: 600,
                                      '&:hover': {
                                        bgcolor: '#f59e0b',
                                      },
                                      '&.Mui-disabled': {
                                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                                        color: 'rgba(255, 255, 255, 0.3)',
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

                      <Grid
                        size={{ xs: 12 }}
                        sx={{ display: tripType === 'multilocation' ? 'none' : 'block' }}
                      >
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

                          {fare && selectedVehicleId && (
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
                                  <Typography variant="subtitle1" color="#fff" fontWeight="bold">
                                    Final:{' '}
                                    <span style={{ color: '#fbc024' }}>
                                      ₹{(Number(fare) - discountAmount).toFixed(2)}
                                    </span>
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
                                <Typography variant="subtitle1" color="#fff" fontWeight="bold">
                                  Estimated Share: <span style={{ color: '#fbc024' }}>₹{fare}</span>
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

                    {/* Stepper for Tour Locations */}
                    {tripType === 'multilocation' && tourLocations.length > 0 && (
                      <Box
                        sx={{
                          width: '100%',
                          mt: 3,
                          px: 1,
                          overflowX: 'auto',
                          scrollbarWidth: 'none', // Firefox
                          '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
                        }}
                      >
                        <Stepper
                          alternativeLabel
                          activeStep={tourLocations.length}
                          connector={<StepConnector sx={{ display: 'none' }} />} // Hide default connector to use custom logic or styled one? Actually, we need to CUSTOMIZE the connector.
                          // Wait, to put text ON the connector, we can use the `StepConnector` with a custom component or styled.
                          // Easier approach: Just render the connector normally but use CSS to add content? Content from where?
                          // Better approach: Use a custom connector component that takes the distance as a prop?
                          // Stepper `connector` prop applies to ALL. We need individual distances.
                          // Limitation: `connector` prop is generic.
                          // Alternative: Render the line manually between steps?
                          // Let's try to override the StepConnector for each step? No, it's one prop.
                          // Workaround: We can render the distance label as part of the StepLabel or absolute position it?
                          // Actually, we can use the `Step` children or `StepLabel` to render a line to the right?
                          // Let's try this: Render a straight horizontal Box between items manually instead of MUI Stepper?
                          // Or stick to MUI Stepper and overlay the distance?
                          // Let's manually map and render items to have full control.
                        />
                        {/* Manual Stepper Implementation for Custom Connector Content */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            minWidth: 'min-content',
                          }}
                        >
                          {tourLocations.map((loc, index) => {
                            const nextLoc = tourLocations[index + 1]
                            let distStr = ''
                            let timeStr = ''
                            if (nextLoc) {
                              const d = getDistanceFromLatLonInKm(
                                Number(loc.lat),
                                Number(loc.lon),
                                Number(nextLoc.lat),
                                Number(nextLoc.lon),
                              )
                              // Estimate time: assume 50 km/h avg speed
                              const speed = 50
                              const hours = d / speed
                              const h = Math.floor(hours)
                              const m = Math.round((hours - h) * 60)
                              timeStr = h > 0 ? `${h} hr ${m > 0 ? `${m} min` : ''}` : `${m} min`

                              distStr = `${d.toFixed(0)} km`
                            }

                            return (
                              <React.Fragment key={index}>
                                {/* Step Item */}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: { xs: 80, md: 100 },
                                    zIndex: 1,
                                  }}
                                >
                                  <Box
                                    onClick={() => removeTourLocation(index)}
                                    sx={{
                                      bgcolor: '#fbc123',
                                      borderRadius: '50%',
                                      width: 32,
                                      height: 32,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#000',
                                      cursor: 'pointer',
                                      '&:hover': { bgcolor: '#f59e0b' },
                                      mb: 1,
                                    }}
                                  >
                                    <LocationOnIcon sx={{ fontSize: '1.2rem' }} />
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: '#fff',
                                      fontWeight: 500,
                                      textAlign: 'center',
                                      maxWidth: 100,
                                    }}
                                  >
                                    {loc.name}
                                  </Typography>
                                </Box>

                                {/* Connector with Distance (if not last) */}
                                {index < tourLocations.length - 1 && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: { xs: 100, md: 130 }, // Fixed width for equal spacing
                                      width: { xs: 100, md: 130 }, // Enforce fixed width
                                      mt: 1.5,
                                      mx: -1,
                                      zIndex: 0,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: '#94a3b8',
                                        mb: 0.2,
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                      }}
                                    >
                                      {distStr}
                                    </Typography>
                                    <Box
                                      sx={{ width: '100%', height: '1px', bgcolor: '#475569' }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{ color: '#64748b', mt: 0.2, fontSize: '0.7rem' }}
                                    >
                                      {timeStr}
                                    </Typography>
                                  </Box>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </Box>
                      </Box>
                    )}
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
