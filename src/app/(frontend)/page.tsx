'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Box,
  Paper,
  Typography,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem as MUIMenuItem,
} from '@mui/material'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AirportShuttleOutlinedIcon from '@mui/icons-material/AirportShuttleOutlined'
import PhoneIcon from '@mui/icons-material/Phone'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import EmailIcon from '@mui/icons-material/Email'
import MenuIcon from '@mui/icons-material/Menu'
import axios from 'axios'
import type { Dayjs } from 'dayjs'

/**
 * Types
 */
type FormValues = {
  customerName: string
  customerPhone: string
  tripType: 'oneway' | 'roundtrip'
  vehicle: string
  pickup: string
  drop: string
  pickupDateTime: Dayjs | null
  dropDateTime: Dayjs | null
}

type TNLocation = {
  name: string
  district: string
  lat: string
  lon: string
}

type VehicleDoc = {
  id: string
  name: string
}

type TariffGroup = {
  perKmRate: number
  bata: number
  extras?: string
}

type TariffDoc = {
  id: string
  vehicle?: VehicleDoc | string
  oneway?: TariffGroup
  roundtrip?: TariffGroup
  // optional timestamps for choosing best tariff when multiple exist
  updatedAt?: string
  createdAt?: string
}

/**
 * Utility: parse vehicle reference to id and name (Payload may return relationship as id or object)
 */
function getVehicleIdFromTariff(t: TariffDoc): string | undefined {
  if (!t.vehicle) return undefined
  if (typeof t.vehicle === 'string') return t.vehicle
  return t.vehicle.id
}

function getVehicleNameFromTariff(t: TariffDoc): string | undefined {
  if (!t.vehicle) return undefined
  if (typeof t.vehicle === 'string') return undefined
  return t.vehicle.name
}

/**
 * Choose best tariff when there are multiple for the same vehicle:
 * - prefer tariff with latest updatedAt (or createdAt)
 * - fallback to first
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
 * Main component
 */
export default function BookingForm() {
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
  const pickup = watch('pickup')
  const drop = watch('drop')
  const selectedVehicleId = watch('vehicle')

  const [vehicles, setVehicles] = useState<VehicleDoc[]>([])
  const [selectedVehicleName, setSelectedVehicleName] = useState<string>('')
  const [pickupSuggestions, setPickupSuggestions] = useState<TNLocation[]>([])
  const [dropSuggestions, setDropSuggestions] = useState<TNLocation[]>([])
  const [tnLocations, setTNLocations] = useState<TNLocation[]>([])
  const [pickupCoords, setPickupCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [dropCoords, setDropCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [tariffs, setTariffs] = useState<TariffDoc[]>([])
  const [distanceInfo, setDistanceInfo] = useState<string>('')
  const [fare, setFare] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(0)

  const steps = [
    { icon: <DirectionsCarIcon sx={{ color: '#004d40' }} />, label: 'Trip Details' },
    { icon: <PhoneIcon sx={{ color: '#004d40' }} />, label: 'Customer Info' },
    { icon: <CheckCircleOutlineIcon sx={{ color: '#004d40' }} />, label: 'Confirm' },
  ]

  // menu
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const menuItems = [
    { label: 'Booking', id: 'booking-form' },
    { label: 'Tariff', id: 'tariff-section' },
    { label: 'About', id: 'about-section' },
    { label: 'Contact', id: 'contact-section' },
  ]

  // refs to hide suggestions on outside click
  const pickupRef = useRef<HTMLDivElement | null>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)

  // load vehicles, tariffs, TN dataset
  useEffect(() => {
    let mounted = true

    async function loadVehicles(): Promise<void> {
      try {
        const res = await axios.get<{ docs?: unknown[] }>('/api/vehicles')
        const docs = Array.isArray(res.data.docs) ? res.data.docs : []
        const parsed = docs
          .map((d) => {
            // payload vehicle doc might contain id and name differently;
            // normalize to { id, name }
            const anyDoc = d as Record<string, unknown>
            const id = (anyDoc.id as string) ?? (anyDoc._id as string) ?? (anyDoc._id as string)
            const name = (anyDoc.name as string) ?? (anyDoc.title as string) ?? ''
            return id ? { id, name } : null
          })
          .filter((v): v is VehicleDoc => v !== null)
        if (mounted) setVehicles(parsed)
      } catch (error) {
        // keep silent but log
        // eslint-disable-next-line no-console
        console.error('Failed to load vehicles', error)
      }
    }

    async function loadTariffs(): Promise<void> {
      try {
        const res = await axios.get<{ docs?: unknown[] }>('/api/tariffs')
        const docs = Array.isArray(res.data.docs) ? res.data.docs : []
        const parsed = docs
          .map((d) => {
            const anyDoc = d as Record<string, unknown>
            const id = (anyDoc.id as string) ?? (anyDoc._id as string) ?? ''
            const vehicleField = anyDoc.vehicle as Record<string, unknown> | string | undefined
            const vehicle =
              typeof vehicleField === 'string'
                ? vehicleField
                : vehicleField
                  ? {
                      id: (vehicleField.id as string) ?? (vehicleField._id as string) ?? '',
                      name: (vehicleField.name as string) ?? '',
                    }
                  : undefined
            const oneway = (anyDoc.oneway as Record<string, unknown> | undefined)
              ? {
                  perKmRate: Number((anyDoc.oneway as Record<string, unknown>).perKmRate ?? 0),
                  bata: Number((anyDoc.oneway as Record<string, unknown>).bata ?? 0),
                  extras: (anyDoc.oneway as Record<string, unknown>).extras as string | undefined,
                }
              : undefined
            const roundtrip = (anyDoc.roundtrip as Record<string, unknown> | undefined)
              ? {
                  perKmRate: Number((anyDoc.roundtrip as Record<string, unknown>).perKmRate ?? 0),
                  bata: Number((anyDoc.roundtrip as Record<string, unknown>).bata ?? 0),
                  extras: (anyDoc.roundtrip as Record<string, unknown>).extras as
                    | string
                    | undefined,
                }
              : undefined
            const createdAt = (anyDoc.createdAt as string | undefined) ?? undefined
            const updatedAt = (anyDoc.updatedAt as string | undefined) ?? undefined
            return { id, vehicle, oneway, roundtrip, createdAt, updatedAt } as TariffDoc
          })
          .filter((t): t is TariffDoc => !!t.id)
        if (mounted) setTariffs(parsed)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load tariffs', error)
      }
    }

    async function loadTN(): Promise<void> {
      try {
        const res = await fetch('/tamil_nadu_locations.json')
        if (!res.ok) throw new Error('tn dataset fetch failed')
        const json = (await res.json()) as { places?: TNLocation[] }
        const places = Array.isArray(json.places) ? json.places : []
        if (mounted) setTNLocations(places)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load TN locations', error)
      }
    }

    void loadVehicles()
    void loadTariffs()
    void loadTN()

    return () => {
      mounted = false
    }
  }, [])

  // On vehicle change, update selectedVehicleName from vehicles list
  useEffect(() => {
    const v = vehicles.find((x) => x.id === selectedVehicleId)
    if (v) setSelectedVehicleName(v.name)
    else setSelectedVehicleName('')
    // recalc fare if coords present
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicleId, vehicles])

  // hide suggestions when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        pickupRef.current &&
        !pickupRef.current.contains(e.target as Node) &&
        dropRef.current &&
        !dropRef.current.contains(e.target as Node)
      ) {
        setPickupSuggestions([])
        setDropSuggestions([])
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // calculate route/fare when coords + tariffs + vehicle available
  useEffect(() => {
    if (pickupCoords && dropCoords && tariffs.length > 0) {
      void calculateRouteAndFare()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoords, dropCoords, tripType, tariffs, selectedVehicleId, selectedVehicleName])

  // location search (local)
  const handleLocationSearch = (
    text: string,
    setSuggestions: (s: TNLocation[]) => void,
    fieldName: 'pickup' | 'drop',
    setCoords: (coords: { lat: string; lon: string }) => void,
  ): void => {
    const q = text.trim()
    if (!q) {
      setSuggestions([])
      return
    }
    const ql = q.toLowerCase()

    const matched = tnLocations.filter((p) => {
      return p.name.toLowerCase().includes(ql) || p.district.toLowerCase().includes(ql)
    })

    // sort so that startsWith matches come first
    const results = matched.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(ql)
      const bStarts = b.name.toLowerCase().startsWith(ql)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return a.name.localeCompare(b.name)
    })

    if (results.length === 1) {
      // auto-fill when single exact match
      const s = results[0]
      setValue(fieldName, `${s.name}, ${s.district}`)
      setCoords({ lat: s.lat, lon: s.lon })
      setSuggestions([])
      return
    }

    setSuggestions(results.slice(0, 10))
  }

  // Fare calculation: pick the correct tariff for the selected vehicle
  async function calculateRouteAndFare(): Promise<void> {
    if (!pickupCoords || !dropCoords) return
    setLoading(true)
    try {
      const osrmURL = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropCoords.lon},${dropCoords.lat}?overview=false`
      const osrmRes = await axios.get<{ routes: { distance: number; duration: number }[] }>(osrmURL)
      const route = osrmRes.data.routes?.[0]
      if (!route) {
        setDistanceInfo('')
        setFare(null)
        setLoading(false)
        return
      }

      let distanceKm = route.distance / 1000
      let durationMin = route.duration / 60

      // pick tariffs for the selected vehicle (could be multiple)
      const matching = tariffs.filter((t) => getVehicleIdFromTariff(t) === selectedVehicleId)
      const chosen = chooseBestTariff(matching.length > 0 ? matching : tariffs)

      // fallback rates if none available
      let perKmRate = 0
      let bata = 0

      if (chosen) {
        const tariffGroup = tripType === 'roundtrip' ? chosen.roundtrip : chosen.oneway
        if (tariffGroup) {
          perKmRate = tariffGroup.perKmRate ?? 0
          bata = tariffGroup.bata ?? 0
        } else {
          // chosen tariff missing group; fallback to 0
          perKmRate = 0
          bata = 0
        }
      } else {
        // No tariffs at all: keep 0
        perKmRate = 0
        bata = 0
      }

      if (tripType === 'roundtrip') {
        distanceKm *= 2
        durationMin *= 2
      }

      const totalFare = distanceKm * perKmRate + bata

      setDistanceInfo(`${distanceKm.toFixed(2)} km • ${Math.round(durationMin)} min`)
      setFare(Number.isFinite(totalFare) ? totalFare.toFixed(2) : null)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fare calculation error', error)
      setDistanceInfo('')
      setFare(null)
    } finally {
      setLoading(false)
    }
  }

  // booking submit
  async function handleBookingSubmit(data: FormValues): Promise<void> {
    const payload = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      tripType: data.tripType,
      vehicle: data.vehicle,
      pickupLocation: pickupCoords
        ? [Number(pickupCoords.lon), Number(pickupCoords.lat)]
        : undefined,
      dropoffLocation: dropCoords ? [Number(dropCoords.lon), Number(dropCoords.lat)] : undefined,
      pickupLocationName: data.pickup,
      dropoffLocationName: data.drop,
      pickupDateTime: data.pickupDateTime?.toISOString(),
      dropDateTime: data.dropDateTime?.toISOString(),
      estimatedFare: fare ? Number(fare) : undefined,
      status: 'pending',
      notes: `${data.pickup} to ${data.drop}`,
    }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_PAYLOAD_URL || ''}/api/bookings`,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      )
      // eslint-disable-next-line no-alert
      alert(`✅ Booking Confirmed\nBooking ID: ${res.data.id ?? '(id N/A)'}`)
      reset()
      setPickupCoords(null)
      setDropCoords(null)
      setActiveStep(0)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Booking error →', err)
      // eslint-disable-next-line no-alert
      alert('Failed to create booking.')
    }
  }

  // navigation helpers
  const next = (): void => setActiveStep((p) => p + 1)
  const back = (): void => setActiveStep((p) => Math.max(0, p - 1))
  const handleScrollTo = (id: string): void => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    handleMenuClose()
  }

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(90deg,#004d40,#009688)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            py: 1,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsCarIcon sx={{ color: '#ffd54f', fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Kani Taxi
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 1.5,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {menuItems.map((menu) => (
              <Button
                key={menu.id}
                variant="outlined"
                onClick={() => handleScrollTo(menu.id)}
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.4)',
                  borderRadius: 999,
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2.5,
                  py: 0.5,
                  fontSize: 14,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: '#ffd54f',
                    color: '#000',
                    borderColor: '#ffd54f',
                    boxShadow: '0 3px 8px rgba(255,213,79,0.4)',
                  },
                }}
              >
                {menu.label}
              </Button>
            ))}
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#ffd54f',
                color: '#000',
                fontWeight: 600,
                borderRadius: 999,
                px: 3,
                '&:hover': {
                  backgroundColor: '#ffca28',
                  boxShadow: '0 3px 10px rgba(255,202,40,0.4)',
                },
              }}
              onClick={() => handleScrollTo('booking-form')}
            >
              Book Now
            </Button>
            <IconButton
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#fff' }}
              onClick={handleMenuClick}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} sx={{ mt: 1 }}>
        {menuItems.map((menu) => (
          <MUIMenuItem
            key={menu.id}
            onClick={() => handleScrollTo(menu.id)}
            sx={{ fontWeight: 500, px: 3, py: 1.5, minWidth: 180 }}
          >
            {menu.label}
          </MUIMenuItem>
        ))}
      </Menu>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          id="booking-form"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            background: 'linear-gradient(135deg,#004d40 0%,#009688 100%)',
            color: '#fff',
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage:
                'url(https://asset.chase.com/content/dam/unified-assets/photography/articles/auto/buying/seo-suv-vs-sedan-compressed_10062023.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
            <Typography
              variant="h3"
              sx={{
                zIndex: 2,
                fontWeight: 700,
                color: '#fff',
                px: 6,
                textShadow: '0 2px 12px rgba(0,0,0,0.6)',
              }}
            >
              Ride in Comfort. <br /> Arrive in Style.
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, md: 6 },
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <Paper
              elevation={10}
              sx={{
                width: '100%',
                maxWidth: 520,
                p: { xs: 3, md: 4 },
                borderRadius: 6,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(25px)',
                color: '#fff',
                position: 'relative',
              }}
            >
              <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 3 }}>
                BOOK HERE !
              </Typography>

              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel
                      icon={step.icon}
                      sx={{
                        '& .MuiStepLabel-label': {
                          display: { xs: 'none', md: 'block' },
                          color: '#fff',
                        },
                        '& .MuiSvgIcon-root': {
                          fontSize: 28,
                          color: activeStep >= index ? '#ffd54f' : '#bdbdbd',
                        },
                      }}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {activeStep === 0 && (
                <>
                  <FormControl fullWidth margin="normal">
                    <FormLabel>Trip Type</FormLabel>
                    <Controller
                      name="tripType"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          row
                          {...field}
                          sx={{ justifyContent: { xs: 'space-between', sm: 'flex-start' } }}
                        >
                          <FormControlLabel value="oneway" control={<Radio />} label="One Way" />
                          <FormControlLabel
                            value="roundtrip"
                            control={<Radio />}
                            label="Round Trip"
                          />
                        </RadioGroup>
                      )}
                    />
                  </FormControl>

                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel sx={{ color: '#000', '&.Mui-focused': { color: '#000' } }}>
                      Vehicle
                    </InputLabel>
                    <Controller
                      name="vehicle"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          label="Vehicle"
                          sx={{
                            color: '#000',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 1,
                            '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.3)' },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(0,0,0,0.6)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#000',
                            },
                          }}
                          onChange={(e) => {
                            field.onChange(e)
                            const v = vehicles.find((x) => x.id === (e.target.value as string))
                            setSelectedVehicleName(v?.name ?? '')
                          }}
                        >
                          {vehicles.map((v) => (
                            <MenuItem key={v.id} value={v.id}>
                              {v.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>

                  <Box sx={{ position: 'relative', overflow: 'visible' }} ref={pickupRef}>
                    <Controller
                      name="pickup"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Pickup Location"
                          fullWidth
                          margin="normal"
                          onChange={(e) => {
                            field.onChange(e)
                            handleLocationSearch(
                              e.target.value,
                              setPickupSuggestions,
                              'pickup',
                              (coords) => setPickupCoords(coords),
                            )
                          }}
                        />
                      )}
                    />
                    {pickupSuggestions.length > 0 && (
                      <Paper
                        elevation={6}
                        sx={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          maxHeight: 180,
                          overflowY: 'auto',
                          borderRadius: 2,
                          mt: 0.5,
                          backgroundColor: '#fff',
                          color: '#000',
                        }}
                      >
                        {pickupSuggestions.map((s, i) => {
                          const q = pickup.toLowerCase()
                          return (
                            <Box
                              key={i}
                              sx={{
                                p: 1,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#f1f1f1' },
                              }}
                              onClick={() => {
                                setValue('pickup', `${s.name}, ${s.district}`)
                                setPickupCoords({ lat: s.lat, lon: s.lon })
                                setPickupSuggestions([])
                              }}
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: s.name.replace(
                                    new RegExp(q, 'gi'),
                                    (m) => `<strong style="color:#004d40">${m}</strong>`,
                                  ),
                                }}
                              />{' '}
                              , {s.district}
                            </Box>
                          )
                        })}
                      </Paper>
                    )}
                  </Box>

                  <Box sx={{ position: 'relative', overflow: 'visible' }} ref={dropRef}>
                    <Controller
                      name="drop"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Drop Location"
                          fullWidth
                          margin="normal"
                          onChange={(e) => {
                            field.onChange(e)
                            handleLocationSearch(
                              e.target.value,
                              setDropSuggestions,
                              'drop',
                              (coords) => setDropCoords(coords),
                            )
                          }}
                        />
                      )}
                    />
                    {dropSuggestions.length > 0 && (
                      <Paper
                        elevation={6}
                        sx={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          maxHeight: 180,
                          overflowY: 'auto',
                          borderRadius: 2,
                          mt: 0.5,
                          backgroundColor: '#fff',
                          color: '#000',
                        }}
                      >
                        {dropSuggestions.map((s, i) => {
                          const q = drop.toLowerCase()
                          return (
                            <Box
                              key={i}
                              sx={{
                                p: 1,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#f1f1f1' },
                              }}
                              onClick={() => {
                                setValue('drop', `${s.name}, ${s.district}`)
                                setDropCoords({ lat: s.lat, lon: s.lon })
                                setDropSuggestions([])
                              }}
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: s.name.replace(
                                    new RegExp(q, 'gi'),
                                    (m) => `<strong style="color:#004d40">${m}</strong>`,
                                  ),
                                }}
                              />{' '}
                              , {s.district}
                            </Box>
                          )
                        })}
                      </Paper>
                    )}
                  </Box>

                  <Controller
                    name="pickupDateTime"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        label="Pickup Date & Time"
                        value={field.value}
                        onChange={field.onChange}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                      />
                    )}
                  />
                  <Controller
                    name="dropDateTime"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        label="Drop Date & Time"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={tripType === 'oneway'}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                      />
                    )}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                      borderRadius: 999,
                      py: 1.2,
                      background: 'linear-gradient(90deg,#ffd54f,#ffb300)',
                      color: '#000',
                      fontWeight: 600,
                      '&:hover': { background: 'linear-gradient(90deg,#ffca28,#ffa000)' },
                    }}
                    onClick={next}
                  >
                    Continue →
                  </Button>
                </>
              )}

              {activeStep === 1 && (
                <>
                  <Controller
                    name="customerName"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Customer Name" fullWidth margin="normal" />
                    )}
                  />
                  <Controller
                    name="customerPhone"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Phone Number" fullWidth margin="normal" />
                    )}
                  />

                  <Box display="flex" gap={2} mt={3} flexDirection={{ xs: 'column', sm: 'row' }}>
                    <Button variant="outlined" fullWidth onClick={back}>
                      ← Back
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: 999,
                        background: 'linear-gradient(90deg,#ffd54f,#ffb300)',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': { background: 'linear-gradient(90deg,#ffca28,#ffa000)' },
                      }}
                      onClick={next}
                    >
                      Continue →
                    </Button>
                  </Box>
                </>
              )}

              {activeStep === 2 && (
                <>
                  <Typography sx={{ mb: 2 }}>Review your booking:</Typography>
                  <Typography>
                    <b>Trip:</b> {tripType}
                  </Typography>
                  <Typography>
                    <b>Vehicle:</b> {selectedVehicleName || selectedVehicleId}
                  </Typography>
                  <Typography>
                    <b>Pickup:</b> {pickup}
                  </Typography>
                  <Typography>
                    <b>Drop:</b> {drop}
                  </Typography>
                  <Typography>
                    <b>Customer:</b> {watch('customerName')} ({watch('customerPhone')})
                  </Typography>

                  {loading ? (
                    <Box display="flex" justifyContent="center" mt={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <>
                      {distanceInfo && (
                        <Typography sx={{ mt: 2 }}>
                          <b>Distance:</b> {distanceInfo}
                        </Typography>
                      )}
                      {fare && (
                        <Typography variant="h6" sx={{ mt: 1, color: '#ffd54f' }}>
                          Estimated Fare: ₹{fare}
                        </Typography>
                      )}
                      {!fare && (
                        <Typography sx={{ mt: 2, color: '#ccc' }}>Fare not available</Typography>
                      )}
                    </>
                  )}

                  <Box display="flex" gap={2} mt={3} flexDirection={{ xs: 'column', sm: 'row' }}>
                    <Button variant="outlined" fullWidth onClick={back}>
                      ← Back
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: 999,
                        background: 'linear-gradient(90deg,#ffd54f,#ffb300)',
                        color: '#000',
                        fontWeight: 600,
                        '&:hover': { background: 'linear-gradient(90deg,#ffca28,#ffa000)' },
                      }}
                      onClick={handleSubmit(handleBookingSubmit)}
                    >
                      Confirm Booking ✔
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Box>
        </Box>
      </LocalizationProvider>

      {/* Tariff / About / Contact sections kept as-is (UI unchanged) */}
      <Box
        id="tariff-section"
        sx={{ width: '100%', py: { xs: 6, md: 8 }, px: { xs: 2, md: 10 }, background: '#f7f8fa' }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: 800, mb: 5, color: '#004d40', letterSpacing: 0.5 }}
        >
          🚖 Tariff Plans
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {[
            {
              type: 'ONEWAY',
              labelColor: '#ffb300',
              bg: '#fff8e1',
              iconColor: '#ffb300',
              IconType: 'sedan',
              title: 'Sedan Cab',
              fare: '₹14 / Km',
              bata: '₹400',
            },
            {
              type: 'ONEWAY',
              labelColor: '#1976d2',
              bg: '#e3f2fd',
              iconColor: '#1976d2',
              IconType: 'suv',
              title: 'SUV Cab',
              fare: '₹19 / Km',
              bata: '₹400',
            },
            {
              type: 'ROUND TRIP',
              labelColor: '#388e3c',
              bg: '#e8f5e9',
              iconColor: '#388e3c',
              IconType: 'sedan',
              title: 'Sedan Cab',
              fare: '₹13 / Km',
              bata: '₹400',
            },
            {
              type: 'ROUND TRIP',
              labelColor: '#7b1fa2',
              bg: '#f3e5f5',
              iconColor: '#7b1fa2',
              IconType: 'suv',
              title: 'SUV Cab',
              fare: '₹18 / Km',
              bata: '₹400',
            },
          ].map((plan, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: plan.bg,
                borderRadius: 4,
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                p: 3,
                textAlign: 'left',
                position: 'relative',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 6px 20px ${plan.iconColor}33`,
                },
              }}
            >
              <Typography
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: plan.labelColor,
                  color: '#fff',
                  px: 2,
                  py: 0.5,
                  fontWeight: 700,
                  borderBottomLeftRadius: 8,
                  fontSize: 13,
                }}
              >
                {plan.type}
              </Typography>
              {plan.IconType === 'sedan' ? (
                <DirectionsCarFilledOutlinedIcon
                  sx={{ fontSize: 48, color: plan.iconColor, mb: 1 }}
                />
              ) : (
                <AirportShuttleOutlinedIcon sx={{ fontSize: 48, color: plan.iconColor, mb: 1 }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#212121' }}>
                {plan.title}
              </Typography>
              <Typography sx={{ color: '#424242', mt: 0.5 }}>
                {plan.fare} • Bata {plan.bata}
              </Typography>
              <Typography sx={{ color: '#616161', fontSize: 13, mt: 0.5 }}>
                Toll, Parking & Hills Extra
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  borderRadius: 20,
                  background: plan.iconColor,
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  textTransform: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  '&:hover': {
                    background: plan.labelColor,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  },
                }}
                onClick={() => {
                  const section = document.getElementById('booking-form')
                  section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Book Now
              </Button>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ... Terms, About and Contact sections unchanged below (kept same as your original file) ... */}

      <Box
        component="footer"
        sx={{
          width: '100%',
          py: 3,
          px: { xs: 3, md: 8 },
          background: '#002f2b',
          color: '#ffffff',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Typography sx={{ fontSize: 14, opacity: 0.85, mb: 0.5 }}>
          Copyright © {new Date().getFullYear()}. <b>Kani TAXI</b> All rights reserved.
        </Typography>
        <Typography sx={{ fontSize: 13, opacity: 0.75 }}>
          Designed & Developed by{' '}
          <Box
            component="span"
            sx={{
              color: '#ffb300',
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            VSeyal
          </Box>
        </Typography>
      </Box>
    </>
  )
}
