'use client'

import { useState, useEffect, useRef } from 'react'
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
import dayjs, { Dayjs } from 'dayjs'

type FormValues = {
  customerName: string
  customerPhone: string
  tripType: 'oneway' | 'roundtrip'
  vehicle: string // vehicle id
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

type Vehicle = {
  id?: string
  _id?: string
  name: string
  slug?: string
  // may include other fields
}

type TariffDoc = {
  id?: string
  _id?: string
  vehicle?: string | { id?: string; _id?: string } // relationship
  oneway?: { perKmRate?: number; bata?: number }
  roundtrip?: { perKmRate?: number; bata?: number }
  // fallback/alternate flat fields possibly present:
  sedanOnewayRate?: number
  suvOnewayRate?: number
  sedanRoundtripRate?: number
  suvRoundtripRate?: number
  bata?: number
}

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
  const selectedVehicleIdFromForm = watch('vehicle')

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleName, setSelectedVehicleName] = useState<string>('')
  const [pickupSuggestions, setPickupSuggestions] = useState<TNLocation[]>([])
  const [dropSuggestions, setDropSuggestions] = useState<TNLocation[]>([])
  const [tnLocations, setTNLocations] = useState<TNLocation[]>([])
  const [pickupCoords, setPickupCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [dropCoords, setDropCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [tariffs, setTariffs] = useState<TariffDoc[]>([])
  const [tariffsByVehicle, setTariffsByVehicle] = useState<Record<string, TariffDoc>>({})
  const [distanceInfo, setDistanceInfo] = useState('')
  const [fare, setFare] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  // only icons for stepper
  const steps = [
    { icon: <DirectionsCarIcon sx={{ color: '#004d40' }} />, label: 'Trip' },
    { icon: <PhoneIcon sx={{ color: '#004d40' }} />, label: 'Customer' },
    { icon: <CheckCircleOutlineIcon sx={{ color: '#004d40' }} />, label: 'Confirm' },
  ]

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const menuItems = [
    { label: 'Booking', id: 'booking-form' },
    { label: 'Tariff', id: 'tariff-section' },
    { label: 'About', id: 'about-section' },
    { label: 'Contact', id: 'contact-section' },
  ]

  const pickupRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  // Load vehicles, tariffs, TN dataset
  useEffect(() => {
    // vehicles
    axios
      .get('/api/vehicles')
      .then((res) => {
        // payload returns docs array; handle multiple shapes
        const docs = res.data?.docs || res.data || []
        // Normalize: map to { id, name }
        const vs: Vehicle[] = docs.map((v: any) => ({
          id: v.id || v._id || v._doc?.id || v._doc?._id,
          _id: v._id || v.id,
          name: v.name || v.title || v.label || 'Unknown',
          slug: v.slug,
        }))
        setVehicles(vs)
      })
      .catch((e) => {
        console.error('vehicles load failed', e)
      })

    // tariffs
    axios
      .get('/api/tariffs')
      .then((res) => {
        const docs = res.data?.docs || res.data || []
        setTariffs(docs)
      })
      .catch((e) => {
        console.error('tariffs load failed', e)
      })

    // TN dataset (static file in public/)
    fetch('/tamil_nadu_locations.json')
      .then((r) => r.json())
      .then((data) => {
        // data.places expected
        const places = data?.places || data || []
        setTNLocations(places)
      })
      .catch((err) => {
        console.warn('TN dataset load failed', err)
      })
  }, [])

  // Build tariffsByVehicle mapping when tariffs change
  useEffect(() => {
    const map: Record<string, TariffDoc> = {}
    tariffs.forEach((t: any) => {
      // t.vehicle could be id string or populated object
      let vid = ''
      if (!t) return
      if (typeof t.vehicle === 'string') vid = t.vehicle
      else if (t.vehicle && (t.vehicle.id || t.vehicle._id))
        vid = (t.vehicle.id || t.vehicle._id) as string
      else if (t.vehicle && typeof t.vehicle === 'object' && (t.vehicle as any).value) {
        // sometimes frontends store {value: id, label: name}
        vid = (t.vehicle as any).value
      }
      if (vid) map[vid] = t
    })
    setTariffsByVehicle(map)
  }, [tariffs])

  // Click outside suggestions to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickupRef.current &&
        !pickupRef.current.contains(event.target as Node) &&
        dropRef.current &&
        !dropRef.current.contains(event.target as Node)
      ) {
        setPickupSuggestions([])
        setDropSuggestions([])
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Recalculate fare when coords, tripType or selected vehicle changes
  useEffect(() => {
    if (pickupCoords && dropCoords && selectedVehicleIdFromForm) {
      // only run if tariff exists
      const tariff = tariffsByVehicle[selectedVehicleIdFromForm]
      if (!tariff) {
        // tariff not found for vehicle — show not available
        setFare(null)
        setDistanceInfo('')
        return
      }
      calculateRouteAndFare()
    } else {
      // clear fare if missing pieces
      setFare(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupCoords, dropCoords, tripType, selectedVehicleIdFromForm, tariffsByVehicle])

  const calculateRouteAndFare = async () => {
    if (!pickupCoords || !dropCoords || !selectedVehicleIdFromForm) return
    setLoading(true)
    try {
      const osrmURL = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropCoords.lon},${dropCoords.lat}?overview=false`
      const { data } = await axios.get(osrmURL)
      const route = data.routes?.[0]
      if (!route) {
        setDistanceInfo('')
        setFare(null)
        return
      }

      let distanceKm = route.distance / 1000
      let durationMin = route.duration / 60

      // Lookup tariff for selected vehicle id
      const tariff = tariffsByVehicle[selectedVehicleIdFromForm]
      if (!tariff) {
        setFare(null)
        setDistanceInfo('')
        return
      }

      // pick perKmRate and bata from nested groups if present
      let perKmRate = 0
      let bata = 0

      if (tariff.oneway || tariff.roundtrip) {
        const group = tripType === 'roundtrip' ? tariff.roundtrip : tariff.oneway
        perKmRate = group?.perKmRate ?? 0
        // prefer group's bata else fallback to root tariff.bata
        bata = group?.bata ?? tariff.bata ?? 0
      } else {
        perKmRate = 0
        bata = tariff.bata ?? 0
      }

      if (tripType === 'roundtrip') {
        distanceKm *= 2
        durationMin *= 2
      }

      const totalFare = distanceKm * perKmRate + bata

      setDistanceInfo(`${distanceKm.toFixed(2)} km • ${Math.round(durationMin)} min`)
      setFare(Number.isFinite(totalFare) ? totalFare.toFixed(2) : null)
    } catch (err) {
      console.error('Fare calculation error:', err)
      setFare(null)
      setDistanceInfo('')
    } finally {
      setLoading(false)
    }
  }

  // Local TN search (fast, offline-ready)
  const handleLocationSearch = (
    text: string,
    setSuggestions: (s: TNLocation[]) => void,
    fieldName: 'pickup' | 'drop',
    setCoords: (coords: { lat: string; lon: string }) => void,
  ) => {
    if (!text.trim()) {
      setSuggestions([])
      return
    }
    const q = text.toLowerCase()
    let results = tnLocations.filter(
      (p) => p.name.toLowerCase().includes(q) || p.district.toLowerCase().includes(q),
    )

    // prefer items that start with query
    results.sort((a, b) => {
      const aa = a.name.toLowerCase().startsWith(q)
      const bb = b.name.toLowerCase().startsWith(q)
      if (aa && !bb) return -1
      if (!aa && bb) return 1
      return a.name.localeCompare(b.name)
    })

    // if there's exactly one match, auto-select it (makes booking faster)
    if (results.length === 1) {
      const s = results[0]
      setValue(fieldName, `${s.name}, ${s.district}`)
      setCoords({ lat: s.lat, lon: s.lon })
      setSuggestions([])
      return
    }

    setSuggestions(results.slice(0, 10))
  }

  const handleBookingSubmit = async (data: FormValues) => {
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
      alert(`✅ Booking Confirmed\nBooking ID: ${res.data.id}`)
      reset()
      setPickupCoords(null)
      setDropCoords(null)
      setActiveStep(0)
      setFare(null)
      setDistanceInfo('')
    } catch (err: any) {
      console.error('Booking error →', err?.response?.data || err?.message || err)
      alert('Failed to create booking.')
    }
  }

  const next = () => setActiveStep((prev) => Math.min(prev + 1, 2))
  const back = () => setActiveStep((prev) => Math.max(prev - 1, 0))

  const handleScrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    handleMenuClose()
  }

  // update selected vehicle name when selectedVehicleIdFromForm or vehicles changes
  useEffect(() => {
    if (!selectedVehicleIdFromForm) {
      setSelectedVehicleName('')
      return
    }
    const v = vehicles.find(
      (x) => x.id === selectedVehicleIdFromForm || x._id === selectedVehicleIdFromForm,
    )
    setSelectedVehicleName(v ? v.name : '')
  }, [selectedVehicleIdFromForm, vehicles])

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
                '&:hover': { backgroundColor: '#ffca28' },
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
          <MenuItem key={menu.id} onClick={() => handleScrollTo(menu.id)} sx={{ fontWeight: 500 }}>
            {menu.label}
          </MenuItem>
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
                maxWidth: 560,
                p: { xs: 3, md: 4 },
                borderRadius: 6,
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                position: 'relative',
              }}
            >
              <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 3 }}>
                BOOK HERE !
              </Typography>

              {/* Stepper — show icons only (hide text labels) */}
              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel
                      icon={step.icon}
                      sx={{
                        '& .MuiStepLabel-label': { display: 'none' }, // hide the textual label
                        '& .MuiSvgIcon-root': {
                          fontSize: 28,
                          color: activeStep >= index ? '#ffd54f' : '#bdbdbd',
                        },
                      }}
                    />
                  </Step>
                ))}
              </Stepper>

              {/* Step 1 */}
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
                          }}
                          onChange={(e) => {
                            field.onChange(e)
                            const v = vehicles.find(
                              (x) => x.id === e.target.value || x._id === e.target.value,
                            )
                            setSelectedVehicleName(v?.name || '')
                          }}
                        >
                          <MenuItem value="">Choose vehicle</MenuItem>
                          {vehicles.map((v) => (
                            <MenuItem key={v.id || v._id || v.name} value={v.id || v._id}>
                              {v.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>

                  {/* Pickup */}
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
                              setPickupCoords,
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
                          maxHeight: 220,
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

                  {/* Drop */}
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
                              setDropCoords,
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
                          maxHeight: 220,
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
                    }}
                    onClick={next}
                  >
                    Continue →
                  </Button>
                </>
              )}

              {/* Step 2 */}
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
                      }}
                      onClick={next}
                    >
                      Continue →
                    </Button>
                  </Box>
                </>
              )}

              {/* Step 3 */}
              {activeStep === 2 && (
                <>
                  <Typography sx={{ mb: 2 }}>Review your booking:</Typography>
                  <Typography>
                    <b>Trip:</b> {tripType}
                  </Typography>
                  <Typography>
                    <b>Vehicle:</b>{' '}
                    {selectedVehicleName ||
                      (selectedVehicleIdFromForm ? selectedVehicleIdFromForm : '—')}
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
                  ) : fare ? (
                    <>
                      <Typography sx={{ mt: 2 }}>
                        <b>Distance:</b> {distanceInfo || '—'}
                      </Typography>
                      <Typography variant="h6" sx={{ mt: 1, color: '#ffd54f' }}>
                        Estimated Fare: ₹{fare}
                      </Typography>
                    </>
                  ) : (
                    <Typography sx={{ mt: 2, color: '#ccc' }}>Fare not available</Typography>
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

      {/* Tariff cards — auto-generated from tariffs + vehicles */}
      <Box
        id="tariff-section"
        sx={{ width: '100%', py: { xs: 6, md: 8 }, px: { xs: 2, md: 10 }, background: '#f7f8fa' }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 5, color: '#004d40' }}>
          🚖 Tariff Plans
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {tariffs.length > 0
            ? tariffs.map((t: TariffDoc, i: number) => {
                // resolve vehicle name
                let vid = ''
                if (typeof t.vehicle === 'string') vid = t.vehicle
                else if (t.vehicle && (t.vehicle as any).id) vid = (t.vehicle as any).id
                else if (t.vehicle && (t.vehicle as any)._id) vid = (t.vehicle as any)._id

                const v = vehicles.find((x) => x.id === vid || x._id === vid)
                const vehicleName = v?.name || 'Vehicle'

                // determine label & rates
                const onewayRate = t.oneway?.perKmRate ?? null
                const onewayBata = t.oneway?.bata ?? t.bata ?? null
                const roundRate = t.roundtrip?.perKmRate ?? null
                const roundBata = t.roundtrip?.bata ?? t.bata ?? null

                // fallback formatting
                const fareLabel = onewayRate ? `₹${onewayRate} / Km` : '—'
                const bataLabel = onewayBata ? `₹${onewayBata}` : '—'

                return (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      background: '#fff',
                      borderRadius: 4,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                      p: 3,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: '#212121' }}>
                      {vehicleName}
                    </Typography>
                    <Typography sx={{ color: '#424242', mt: 0.5 }}>
                      {fareLabel} • Bata {bataLabel}
                    </Typography>
                    <Typography sx={{ color: '#616161', fontSize: 13, mt: 0.5 }}>
                      Toll, Parking & Hills Extra
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        mt: 2,
                        borderRadius: 20,
                        background: '#004d40',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                      onClick={() => {
                        document
                          .getElementById('booking-form')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        setValue('vehicle', vid)
                      }}
                    >
                      Book Now
                    </Button>
                  </Box>
                )
              })
            : // fallback static cards (if tariffs not ready)
              [
                { title: 'Sedan', fare: '₹14 / Km', bata: '₹400', Icon: 'sedan' },
                { title: 'SUV', fare: '₹19 / Km', bata: '₹400', Icon: 'suv' },
                { title: 'Sedan (RT)', fare: '₹13 / Km', bata: '₹400', Icon: 'sedan' },
                { title: 'SUV (RT)', fare: '₹18 / Km', bata: '₹400', Icon: 'suv' },
              ].map((plan, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    borderRadius: 4,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    p: 3,
                  }}
                >
                  {plan.Icon === 'sedan' ? (
                    <DirectionsCarFilledOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
                  ) : (
                    <AirportShuttleOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
                  )}
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {plan.title}
                  </Typography>
                  <Typography sx={{ color: '#424242', mt: 0.5 }}>
                    {plan.fare} • Bata {plan.bata}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2, borderRadius: 20, background: '#004d40', color: '#fff' }}
                    onClick={() =>
                      document
                        .getElementById('booking-form')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  >
                    Book Now
                  </Button>
                </Box>
              ))}
        </Box>
      </Box>

      {/* Rest of the page: Terms / About / Contact unchanged (kept compact) */}
      <Box
        sx={{
          width: '100%',
          py: { xs: 5, md: 7 },
          px: { xs: 3, md: 10 },
          background: '#ffffff',
          borderTop: '1px solid #eee',
        }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1, color: '#004d40' }}>
          Terms & Conditions
        </Typography>
        <Typography align="center" sx={{ color: '#616161', mb: 4, fontSize: 15 }}>
          Please review our key service terms before booking your ride.
        </Typography>
        {/* compact grid of conditions */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 2.5,
            maxWidth: 1100,
            mx: 'auto',
          }}
        >
          {[
            {
              title: 'General',
              text: 'Fares may vary by route and time. Bookings depend on driver availability.',
            },
            {
              title: 'Fare Inclusions',
              text: 'Rates include base fare + driver bata. Toll & parking extra.',
            },
            { title: 'Waiting', text: '10 mins free waiting, then hourly rates apply.' },
            {
              title: 'Cancellation',
              text: 'Free up to 30 mins before pickup. Later cancellations may incur a fee.',
            },
            {
              title: 'Trip Change',
              text: 'Fares adjust automatically for extra stops or distance.',
            },
            { title: 'Safety', text: 'Verified drivers. Seat belts mandatory for all passengers.' },
            {
              title: 'Payment',
              text: 'Accepts UPI, cash & digital payments with instant receipts.',
            },
            {
              title: 'Disclaimer',
              text: 'Rates or service may change due to operational or weather reasons.',
            },
          ].map((item, index) => (
            <Box key={index} sx={{ p: 2.5, borderRadius: 3, background: '#f9fafa' }}>
              <Typography sx={{ fontWeight: 700, color: '#004d40', fontSize: 15, mb: 0.5 }}>
                {index + 1}. {item.title}
              </Typography>
              <Typography sx={{ color: '#616161', fontSize: 13 }}>{item.text}</Typography>
            </Box>
          ))}
        </Box>
        <Typography align="center" sx={{ mt: 5, color: '#9e9e9e', fontSize: 12 }}>
          Last updated on{' '}
          {new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </Typography>
      </Box>

      {/* About & Contact sections (kept brief) */}
      <Box
        id="about-section"
        sx={{
          width: '100%',
          py: { xs: 6, md: 8 },
          px: { xs: 3, md: 10 },
          background: '#f9fafa',
          borderTop: '1px solid #eee',
        }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 2, color: '#004d40' }}>
          About <span style={{ color: '#ffb300' }}>Kani Taxi</span>
        </Typography>
        <Typography
          align="center"
          sx={{ color: '#616161', maxWidth: 800, mx: 'auto', fontSize: 15, lineHeight: 1.7, mb: 5 }}
        >
          At <b>Kani Taxi</b>, we’re redefining everyday travel with comfort, safety, and
          reliability...
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            gap: 3,
            maxWidth: 1000,
            mx: 'auto',
          }}
        >
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 30 }}>🕒</Typography>
            <Typography sx={{ fontWeight: 700, mt: 1, color: '#004d40' }}>
              On-Time Service
            </Typography>
          </Box>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 30 }}>💰</Typography>
            <Typography sx={{ fontWeight: 700, mt: 1, color: '#004d40' }}>
              Transparent Pricing
            </Typography>
          </Box>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: 30 }}>🛡️</Typography>
            <Typography sx={{ fontWeight: 700, mt: 1, color: '#004d40' }}>
              Trusted Drivers
            </Typography>
          </Box>
        </Box>
        <Typography align="center" sx={{ mt: 5, color: '#9e9e9e', fontSize: 13 }}>
          © {new Date().getFullYear()} Kani Taxi — All rights reserved.
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          py: { xs: 6, md: 8 },
          px: { xs: 3, md: 10 },
          background: 'linear-gradient(135deg, #fefefe 0%, #e9f7f5 100%)',
          borderTop: '1px solid #ddd',
        }}
      >
        <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1, color: '#004d40' }}>
          Contact Us
        </Typography>
        <Typography align="center" sx={{ color: '#555', mb: 5, fontSize: 15 }}>
          Reach us easily — choose your preferred way to get in touch with <b>Kani Taxi</b>.
        </Typography>
        <Box
          id="contact-section"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
            gap: 3,
            maxWidth: 1100,
            mx: 'auto',
          }}
        >
          <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
            <PhoneIcon sx={{ fontSize: 38 }} />
            <Typography sx={{ fontWeight: 700, color: '#004d40' }}>Call Us</Typography>
            <Typography>+91 94881 04888</Typography>
            <Button href="tel:+919488104888" variant="contained" sx={{ mt: 2 }}>
              Call Now
            </Button>
          </Paper>
          <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
            <WhatsAppIcon sx={{ fontSize: 38 }} />
            <Typography sx={{ fontWeight: 700, color: '#1b5e20' }}>WhatsApp</Typography>
            <Typography>+91 94881 04888</Typography>
            <Button
              href="https://api.whatsapp.com/send?phone=919488104888"
              target="_blank"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Chat
            </Button>
          </Paper>
          <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 38 }} />
            <Typography sx={{ fontWeight: 700, color: '#e65100' }}>Email Us</Typography>
            <Typography>kanitaxi@gmail.com</Typography>
            <Button href="mailto:kanitaxi@gmail.com" variant="contained" sx={{ mt: 2 }}>
              Send Email
            </Button>
          </Paper>
        </Box>
        <Typography align="center" sx={{ mt: 6, color: '#424242' }}>
          📍 No.10, South Street, Mailappapuram, Pettai, Tirunelveli, Tamil Nadu - 627004
        </Typography>
      </Box>

      <Box
        component="footer"
        sx={{
          width: '100%',
          py: 3,
          px: { xs: 3, md: 8 },
          background: '#002f2b',
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: 14, opacity: 0.85, mb: 0.5 }}>
          Copyright © {new Date().getFullYear()}. <b>Kani TAXI</b> All rights reserved.
        </Typography>
        <Typography sx={{ fontSize: 13, opacity: 0.75 }}>
          Designed & Developed by{' '}
          <Box component="span" sx={{ color: '#ffb300', fontWeight: 600 }}>
            VSeyal
          </Box>
        </Typography>
      </Box>
    </>
  )
}
