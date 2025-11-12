'use client'

import { useState, useEffect } from 'react'
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
} from '@mui/material'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined'
import AirportShuttleOutlinedIcon from '@mui/icons-material/AirportShuttleOutlined'
import PhoneIcon from '@mui/icons-material/Phone'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import EmailIcon from '@mui/icons-material/Email'

import axios from 'axios'
import dayjs, { Dayjs } from 'dayjs'

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

type Location = {
  lat: string
  lon: string
  display_name: string
  short_name?: string
  address?: any
}

const SOUTH_INDIAN_STATES = [
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Kerala',
  'Tamil Nadu',
  'Puducherry',
]

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

  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string }>>([])
  const [selectedVehicleName, setSelectedVehicleName] = useState<string>('')
  const [pickupSuggestions, setPickupSuggestions] = useState<Location[]>([])
  const [dropSuggestions, setDropSuggestions] = useState<Location[]>([])
  const [pickupCoords, setPickupCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [dropCoords, setDropCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [tariffs, setTariffs] = useState<any>(null)
  const [distanceInfo, setDistanceInfo] = useState('')
  const [fare, setFare] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const steps = ['Trip Details', 'Customer Info', 'Review & Confirm']

  useEffect(() => {
    axios.get('/api/vehicles').then((res) => setVehicles(res.data.docs || []))
    axios.get('/api/tariffs').then((res) => setTariffs(res.data.docs?.[0] || null))
  }, [])

  let searchTimeout: NodeJS.Timeout
  const fetchLocationSuggestions = async (
    query: string,
    setSuggestions: (s: Location[]) => void,
  ) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    if (!query.trim()) return setSuggestions([])

    searchTimeout = setTimeout(async () => {
      try {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: query, format: 'json', limit: 8, countrycodes: 'in', addressdetails: 1 },
          headers: { 'User-Agent': 'CallTaxiApp/1.0' },
        })
        const results = res.data
          .filter((item: any) => SOUTH_INDIAN_STATES.includes(item.address?.state || ''))
          .map((item: any) => ({
            ...item,
            short_name:
              item.address?.city_district ||
              item.address?.town ||
              item.address?.city ||
              item.address?.village ||
              item.display_name.split(',')[0].trim(),
          }))
        setSuggestions(results)
      } catch (err) {
        console.error('Nominatim error:', err)
      }
    }, 300)
  }

  useEffect(() => {
    if (pickupCoords && dropCoords && tariffs) calculateRouteAndFare()
  }, [pickupCoords, dropCoords, tripType])

  const calculateRouteAndFare = async () => {
    if (!pickupCoords || !dropCoords || !tariffs) return
    setLoading(true)
    try {
      const osrmURL = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lon},${pickupCoords.lat};${dropCoords.lon},${dropCoords.lat}?overview=false`
      const { data } = await axios.get(osrmURL)
      const route = data.routes[0]
      let distanceKm = route.distance / 1000
      let durationMin = route.duration / 60
      const tariffGroup = tripType === 'roundtrip' ? tariffs.roundtrip : tariffs.oneway
      if (tripType === 'roundtrip') {
        distanceKm *= 2
        durationMin *= 2
      }
      const totalFare = distanceKm * tariffGroup.perKmRate + tariffGroup.bata
      setDistanceInfo(`${distanceKm.toFixed(2)} km • ${Math.round(durationMin)} min`)
      setFare(totalFare.toFixed(2))
    } catch (err) {
      console.error('OSRM error:', err)
    } finally {
      setLoading(false)
    }
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
    } catch (err: any) {
      console.error('Booking error →', err.response?.data || err.message)
      alert('Failed to create booking.')
    }
  }

  const next = () => setActiveStep((prev) => prev + 1)
  const back = () => setActiveStep((prev) => prev - 1)

  return (
    <>
      {/* ✅ Compact Common Header */}
      {/* ✅ Compact Common Header with Menu */}
      {/* ✅ Modern Chip Menu Header */}
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
          {/* 🚖 Brand / Logo */}
          <Box display="flex" alignItems="center" gap={1}>
            <DirectionsCarIcon sx={{ color: '#ffd54f', fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
                cursor: 'pointer',
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Kani Taxi
            </Typography>
          </Box>

          {/* 🌈 Chip Menu Navigation */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {[
              { label: 'Booking', id: 'booking-form' },
              { label: 'Tariff', id: 'tariff-section' },
              { label: 'About', id: 'about-section' },
              { label: 'Contact', id: 'contact-section' },
            ].map((menu) => (
              <Button
                key={menu.id}
                variant="outlined"
                onClick={() =>
                  document
                    .getElementById(menu.id)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
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

          {/* 💛 Book Now CTA */}
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
            onClick={() => {
              const formSection = document.getElementById('booking-form')
              formSection?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Book Now
          </Button>
        </Toolbar>
      </AppBar>

      {/* ---------- Booking Section ---------- */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box
          id="booking-form"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg,#004d40 0%,#009688 100%)',
            color: '#fff',
          }}
        >
          {/* Left side image */}
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage:
                'url(https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80)',
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

          {/* Right form */}
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
            {/* 🧾 Your booking form remains here (unchanged) */}
            <Paper
              elevation={10}
              sx={{
                width: '100%',
                maxWidth: 520,
                p: 4,
                borderRadius: 6,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(25px)',
                color: '#fff',
                position: 'relative',
              }}
            >
              <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 3 }}>
                🚖 Kani Taxi Elite Booking
              </Typography>

              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ color: '#fff' }}>{label}</StepLabel>
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
                        <RadioGroup row {...field}>
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
                    <InputLabel
                      sx={{
                        color: '#000',
                        '&.Mui-focused': { color: '#000' },
                      }}
                    >
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
                            const v = vehicles.find((x) => x.id === e.target.value)
                            setSelectedVehicleName(v?.name || '')
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

                  {/* ---------- Pickup Field ---------- */}
                  <Box sx={{ position: 'relative' }}>
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
                            fetchLocationSuggestions(e.target.value, setPickupSuggestions)
                          }}
                        />
                      )}
                    />
                    {pickupSuggestions.length > 0 && (
                      <Paper
                        elevation={6}
                        sx={{
                          position: 'absolute',
                          top: '100%',
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
                        {pickupSuggestions.map((s, i) => (
                          <Box
                            key={i}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#f1f1f1' },
                            }}
                            onClick={() => {
                              setValue('pickup', s.short_name!)
                              setPickupCoords({ lat: s.lat, lon: s.lon })
                              setPickupSuggestions([])
                            }}
                          >
                            {s.short_name}
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Box>

                  {/* ---------- Drop Field ---------- */}
                  <Box sx={{ position: 'relative' }}>
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
                            fetchLocationSuggestions(e.target.value, setDropSuggestions)
                          }}
                        />
                      )}
                    />
                    {dropSuggestions.length > 0 && (
                      <Paper
                        elevation={6}
                        sx={{
                          position: 'absolute',
                          top: '100%',
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
                        {dropSuggestions.map((s, i) => (
                          <Box
                            key={i}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#f1f1f1' },
                            }}
                            onClick={() => {
                              setValue('drop', s.short_name!)
                              setDropCoords({ lat: s.lat, lon: s.lon })
                              setDropSuggestions([])
                            }}
                          >
                            {s.short_name}
                          </Box>
                        ))}
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
                  <Box display="flex" gap={2} mt={3}>
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

              {/* Step 3 */}
              {activeStep === 2 && (
                <>
                  <Typography sx={{ mb: 2 }}>Review your booking:</Typography>
                  <Typography>
                    <b>Trip:</b> {tripType}
                  </Typography>
                  <Typography>
                    <b>Vehicle:</b> {selectedVehicleName || watch('vehicle')}
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
                    </>
                  )}

                  <Box display="flex" gap={2} mt={3}>
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
      {/* ---------- TARIFF PLAN SECTION (4-CARD COUPON STYLE WITH ICONS & BOOK NOW) ---------- */}
      <Box
        id="tariff-section"
        sx={{
          width: '100%',
          py: { xs: 6, md: 8 },
          px: { xs: 2, md: 10 },
          background: '#f7f8fa',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          sx={{
            fontWeight: 800,
            mb: 5,
            color: '#004d40',
            letterSpacing: 0.5,
          }}
        >
          🚖 Tariff Plans
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              lg: '1fr 1fr 1fr 1fr',
            },
            gap: 3,
          }}
        >
          {[
            {
              type: 'ONEWAY',
              labelColor: '#ffb300',
              bg: '#fff8e1',
              iconColor: '#ffb300',
              Icon: 'sedan',
              title: 'Sedan Cab',
              fare: '₹14 / Km',
              bata: '₹400',
            },
            {
              type: 'ONEWAY',
              labelColor: '#1976d2',
              bg: '#e3f2fd',
              iconColor: '#1976d2',
              Icon: 'suv',
              title: 'SUV Cab',
              fare: '₹19 / Km',
              bata: '₹400',
            },
            {
              type: 'ROUND TRIP',
              labelColor: '#388e3c',
              bg: '#e8f5e9',
              iconColor: '#388e3c',
              Icon: 'sedan',
              title: 'Sedan Cab',
              fare: '₹13 / Km',
              bata: '₹400',
            },
            {
              type: 'ROUND TRIP',
              labelColor: '#7b1fa2',
              bg: '#f3e5f5',
              iconColor: '#7b1fa2',
              Icon: 'suv',
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
              {/* Tag */}
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

              {/* Icon */}
              {plan.Icon === 'sedan' ? (
                <DirectionsCarFilledOutlinedIcon
                  sx={{ fontSize: 48, color: plan.iconColor, mb: 1 }}
                />
              ) : (
                <AirportShuttleOutlinedIcon sx={{ fontSize: 48, color: plan.iconColor, mb: 1 }} />
              )}

              {/* Text */}
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#212121' }}>
                {plan.title}
              </Typography>
              <Typography sx={{ color: '#424242', mt: 0.5 }}>
                {plan.fare} • Bata {plan.bata}
              </Typography>
              <Typography sx={{ color: '#616161', fontSize: 13, mt: 0.5 }}>
                Toll, Parking & Hills Extra
              </Typography>

              {/* Book Now Button */}
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
        {/* ---------- TERMS & CONDITIONS (Compact Grid Design) ---------- */}
        <Box
          sx={{
            width: '100%',
            py: { xs: 5, md: 7 },
            px: { xs: 3, md: 10 },
            background: '#ffffff',
            borderTop: '1px solid #eee',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 800,
              mb: 1,
              color: '#004d40',
            }}
          >
            Terms & Conditions
          </Typography>

          <Typography
            align="center"
            sx={{
              color: '#616161',
              mb: 4,
              fontSize: 15,
            }}
          >
            Please review our key service terms before booking your ride.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr 1fr',
              },
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
              {
                title: 'Waiting',
                text: '10 mins free waiting, then hourly rates apply.',
              },
              {
                title: 'Cancellation',
                text: 'Free up to 30 mins before pickup. Later cancellations may incur a fee.',
              },
              {
                title: 'Trip Change',
                text: 'Fares adjust automatically for extra stops or distance.',
              },
              {
                title: 'Safety',
                text: 'Verified drivers. Seat belts mandatory for all passengers.',
              },
              {
                title: 'Payment',
                text: 'Accepts UPI, cash & digital payments with instant receipts.',
              },
              {
                title: 'Disclaimer',
                text: 'Rates or service may change due to operational or weather reasons.',
              },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  background: '#f9fafa',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: '#004d40',
                    fontSize: 15,
                    mb: 0.5,
                  }}
                >
                  {index + 1}. {item.title}
                </Typography>
                <Typography sx={{ color: '#616161', fontSize: 13, lineHeight: 1.5 }}>
                  {item.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography
            align="center"
            sx={{
              mt: 5,
              color: '#9e9e9e',
              fontSize: 12,
            }}
          >
            Last updated on{' '}
            {new Date().toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Typography>
        </Box>
        {/* ---------- ABOUT US SECTION (Kani Taxi) ---------- */}
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
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 800,
              mb: 2,
              color: '#004d40',
            }}
          >
            About <span style={{ color: '#ffb300' }}>Kani Taxi</span>
          </Typography>

          <Typography
            align="center"
            sx={{
              color: '#616161',
              maxWidth: 800,
              mx: 'auto',
              fontSize: 15,
              lineHeight: 1.7,
              mb: 5,
            }}
          >
            At <b>Kani Taxi</b>, we’re redefining everyday travel with comfort, safety, and
            reliability. Whether it’s a short city ride or an outstation trip, our verified drivers
            and well-maintained vehicles ensure every journey is smooth, affordable, and on time.
            Founded with a passion for customer-first service, Kani Taxi operates across South
            India, connecting people and places seamlessly.
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
            {[
              {
                icon: '🕒',
                title: 'On-Time Service',
                text: 'Punctual pickups and reliable drop-offs for stress-free travel.',
              },
              {
                icon: '💰',
                title: 'Transparent Pricing',
                text: 'No hidden charges — just fair fares and honest service.',
              },
              {
                icon: '🛡️',
                title: 'Trusted Drivers',
                text: 'Every driver is verified, trained, and customer-focused.',
              },
            ].map((feature, i) => (
              <Box
                key={i}
                sx={{
                  background: '#fff',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                  textAlign: 'center',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Typography sx={{ fontSize: 30 }}>{feature.icon}</Typography>
                <Typography
                  sx={{
                    fontWeight: 700,
                    mt: 1,
                    color: '#004d40',
                    fontSize: 16,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  sx={{
                    color: '#616161',
                    fontSize: 14,
                    mt: 0.5,
                    lineHeight: 1.5,
                  }}
                >
                  {feature.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Typography
            align="center"
            sx={{
              mt: 5,
              color: '#9e9e9e',
              fontSize: 13,
            }}
          >
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
          <Typography
            variant="h4"
            align="center"
            sx={{
              fontWeight: 800,
              mb: 1,
              color: '#004d40',
            }}
          >
            Contact Us
          </Typography>

          <Typography
            align="center"
            sx={{
              color: '#555',
              mb: 5,
              fontSize: 15,
            }}
          >
            Reach us easily — choose your preferred way to get in touch with <b>Kani Taxi</b>.
          </Typography>

          {/* Contact Cards */}
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
            {/* --- Call Card --- */}
            <Paper
              elevation={4}
              sx={{
                background: '#ffffff',
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
                border: '1px solid #e0f2f1',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '20%',
                  background: '#004d40',
                  mx: 'auto',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PhoneIcon sx={{ color: '#fff', fontSize: 38 }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#004d40', mb: 0.5 }}>
                Call Us
              </Typography>
              <Typography sx={{ color: '#424242', mb: 2 }}>+91 96009 07550</Typography>
              <Button
                href="tel:+919600907550"
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg,#004d40,#009688)',
                  textTransform: 'none',
                  color: '#fff',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { opacity: 0.9 },
                }}
              >
                Call Now
              </Button>
            </Paper>

            {/* --- WhatsApp Card --- */}
            <Paper
              elevation={4}
              sx={{
                background: '#ffffff',
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
                border: '1px solid #d9f7e8',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '20%',
                  background: '#25D366',
                  mx: 'auto',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WhatsAppIcon sx={{ color: '#fff', fontSize: 38 }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1b5e20', mb: 0.5 }}>
                WhatsApp
              </Typography>
              <Typography sx={{ color: '#424242', mb: 2 }}>+91 96009 07550</Typography>
              <Button
                href="https://api.whatsapp.com/send?phone=919600907550&text=Hello%20Kani%20Taxi"
                target="_blank"
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg,#25D366,#128C7E)',
                  textTransform: 'none',
                  color: '#fff',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { opacity: 0.9 },
                }}
              >
                Chat on WhatsApp
              </Button>
            </Paper>

            {/* --- Email Card --- */}
            <Paper
              elevation={4}
              sx={{
                background: '#ffffff',
                borderRadius: 4,
                p: 4,
                textAlign: 'center',
                border: '1px solid #fff0c2',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: '20%',
                  background: '#ffb300',
                  mx: 'auto',
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EmailIcon sx={{ color: '#fff', fontSize: 38 }} />
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#e65100', mb: 0.5 }}>
                Email Us
              </Typography>
              <Typography sx={{ color: '#424242', mb: 2 }}>kanitaxi@gmail.com</Typography>
              <Button
                href="mailto:kanitaxi@gmail.com"
                variant="contained"
                sx={{
                  background: 'linear-gradient(90deg,#ffb300,#ff8f00)',
                  textTransform: 'none',
                  color: '#fff',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': { opacity: 0.9 },
                }}
              >
                Send Email
              </Button>
            </Paper>
          </Box>

          {/* Address */}
          <Typography
            align="center"
            sx={{
              mt: 6,
              color: '#424242',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            📍 No.10, South Street, Mailappapuram, Pettai, Tirunelveli, Tamil Nadu - 627004
          </Typography>
        </Box>
      </Box>
      {/* ---------- FOOTER SECTION (Kani Taxi - Compact Clean Version) ---------- */}
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
        <Typography
          sx={{
            fontSize: 14,
            opacity: 0.85,
            mb: 0.5,
          }}
        >
          Copyright © 2025. <b>Kani TAXI</b> All rights reserved.
        </Typography>

        <Typography
          sx={{
            fontSize: 13,
            opacity: 0.75,
          }}
        >
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
