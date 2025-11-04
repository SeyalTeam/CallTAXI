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
} from '@mui/material'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
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

type Location = { lat: string; lon: string; display_name: string }

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
  const [vehicles, setVehicles] = useState<Array<{ id: string; name: string }>>([])
  const [pickupSuggestions, setPickupSuggestions] = useState<Location[]>([])
  const [dropSuggestions, setDropSuggestions] = useState<Location[]>([])
  const [distanceInfo, setDistanceInfo] = useState('')
  const [fare, setFare] = useState<string | null>(null)
  const [tariffs, setTariffs] = useState<any>(null)

  const [pickupCoords, setPickupCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [dropCoords, setDropCoords] = useState<{ lat: string; lon: string } | null>(null)
  const [pickupLocationName, setPickupLocationName] = useState<string>('')
  const [dropoffLocationName, setDropoffLocationName] = useState<string>('')

  /* ------------------------------------------------------------------ */
  /*  Load vehicles & tariffs                                           */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    axios.get('/api/vehicles').then((res) => setVehicles(res.data.docs || []))
    axios.get('/api/tariffs').then((res) => setTariffs(res.data.docs?.[0] || null))
  }, [])

  /* ------------------------------------------------------------------ */
  /*  Nominatim autocomplete – INDIA ONLY + DEBOUNCE                     */
  /* ------------------------------------------------------------------ */
  let searchTimeout: NodeJS.Timeout

  const fetchLocationSuggestions = async (
    query: string,
    setSuggestions: (s: Location[]) => void,
  ) => {
    if (searchTimeout) clearTimeout(searchTimeout)

    if (!query.trim()) {
      setSuggestions([])
      return
    }

    searchTimeout = setTimeout(async () => {
      try {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: query,
            format: 'json',
            limit: 5,
            countrycodes: 'in', // ← India only
            addressdetails: 1, // ← Better labels
            'accept-language': 'en', // ← English
          },
          headers: { 'User-Agent': 'CallTaxiApp/1.0' },
        })
        setSuggestions(res.data || [])
      } catch (err) {
        console.error('Nominatim error:', err)
        setSuggestions([])
      }
    }, 300)
  }

  /* ------------------------------------------------------------------ */
  /*  OSRM route + fare calculation                                    */
  /* ------------------------------------------------------------------ */
  const calculateRouteAndFare = async () => {
    if (!pickupCoords || !dropCoords || !tariffs) return

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

    setDistanceInfo(
      `Estimated (${tripType === 'roundtrip' ? 'Round Trip' : 'One Way'}): ${distanceKm.toFixed(
        2,
      )} km, ${Math.round(durationMin)} min`,
    )
    setFare(totalFare.toFixed(2))
  }

  /* ------------------------------------------------------------------ */
  /*  BOOK NOW → Save + Clear                                           */
  /* ------------------------------------------------------------------ */
  const handleBookingSubmit = async (data: FormValues) => {
    const payload = {
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      vehicle: data.vehicle,
      tripType: data.tripType,

      pickupLocation: pickupCoords
        ? [Number(pickupCoords.lon), Number(pickupCoords.lat)]
        : undefined,
      dropoffLocation: dropCoords ? [Number(dropCoords.lon), Number(dropCoords.lat)] : undefined,

      pickupLocationName: pickupLocationName || data.pickup,
      dropoffLocationName: dropoffLocationName || data.drop,

      pickupDateTime: data.pickupDateTime?.toISOString(),
      dropDateTime: data.dropDateTime?.toISOString(),
      estimatedFare: fare ? Number(fare) : undefined,
      status: 'pending',
      notes: `${data.pickup} to ${data.drop}`,
    }

    try {
      const res = await axios.post('/api/bookings', payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      console.log('Booking saved →', res.data)
      alert(`Booking created! ID: ${res.data.id}`)

      reset()
      setPickupCoords(null)
      setDropCoords(null)
      setPickupLocationName('')
      setDropoffLocationName('')
      setDistanceInfo('')
      setFare(null)
    } catch (err: any) {
      console.error('Booking error →', err.response?.data || err.message)
      alert('Failed to create booking.')
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form
        onSubmit={handleSubmit(handleBookingSubmit)}
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '24px',
          backgroundColor: '#f5f5f5',
          borderRadius: 8,
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          color: '#000',
        }}
      >
        {/* ---------- Trip type ---------- */}
        <FormControl fullWidth margin="normal">
          <FormLabel sx={{ color: '#000', fontWeight: 'bold' }}>Trip Type</FormLabel>
          <Controller
            name="tripType"
            control={control}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="oneway" control={<Radio />} label="One Way" />
                <FormControlLabel value="roundtrip" control={<Radio />} label="Round Trip" />
              </RadioGroup>
            )}
          />
        </FormControl>

        {/* ---------- Vehicle ---------- */}
        <FormControl fullWidth margin="normal">
          <InputLabel sx={{ color: '#000' }}>Vehicle</InputLabel>
          <Controller
            name="vehicle"
            control={control}
            render={({ field }) => (
              <Select {...field} label="Vehicle">
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>

        {/* ---------- Pickup ---------- */}
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
              InputLabelProps={{ style: { color: '#000' } }}
              inputProps={{ style: { color: '#000' } }}
            />
          )}
        />
        {pickupSuggestions.map((s, i) => (
          <div
            key={i}
            style={{ cursor: 'pointer', color: '#1976d2', padding: '4px 0' }}
            onClick={() => {
              setValue('pickup', s.display_name)
              setPickupCoords({ lat: s.lat, lon: s.lon })
              setPickupLocationName(s.display_name)
              setPickupSuggestions([])
            }}
          >
            {s.display_name}
          </div>
        ))}

        {/* ---------- Drop ---------- */}
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
              InputLabelProps={{ style: { color: '#000' } }}
              inputProps={{ style: { color: '#000' } }}
            />
          )}
        />
        {dropSuggestions.map((s, i) => (
          <div
            key={i}
            style={{ cursor: 'pointer', color: '#1976d2', padding: '4px 0' }}
            onClick={() => {
              setValue('drop', s.display_name)
              setDropCoords({ lat: s.lat, lon: s.lon })
              setDropoffLocationName(s.display_name)
              setDropSuggestions([])
            }}
          >
            {s.display_name}
          </div>
        ))}

        {/* ---------- Pickup Date & Time ---------- */}
        <Controller
          name="pickupDateTime"
          control={control}
          rules={{ required: 'Pickup date & time is required' }}
          render={({ field, fieldState: { error } }) => (
            <DateTimePicker
              label="Pickup Date & Time"
              value={field.value}
              onChange={(newValue) => field.onChange(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  error: !!error,
                  helperText: error?.message,
                  InputLabelProps: { style: { color: '#000' } },
                  inputProps: { style: { color: '#000' } },
                },
              }}
            />
          )}
        />

        {/* ---------- Drop Date & Time ---------- */}
        <Controller
          name="dropDateTime"
          control={control}
          rules={{
            required:
              tripType === 'roundtrip' ? 'Drop date & time is required for round trip' : false,
          }}
          render={({ field, fieldState: { error } }) => (
            <DateTimePicker
              label="Drop Date & Time"
              value={field.value}
              onChange={(newValue) => field.onChange(newValue)}
              disabled={tripType === 'oneway'}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  error: !!error,
                  helperText: error?.message,
                  InputLabelProps: { style: { color: '#000' } },
                  inputProps: { style: { color: '#000' } },
                },
              }}
            />
          )}
        />

        {/* ---------- Customer Name (Separate Row) ---------- */}
        <Controller
          name="customerName"
          control={control}
          rules={{ required: 'Name is required' }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label="Customer Name"
              fullWidth
              margin="normal"
              error={!!error}
              helperText={error?.message}
              InputLabelProps={{ style: { color: '#000' } }}
              inputProps={{ style: { color: '#000' } }}
            />
          )}
        />

        {/* ---------- Phone Number (Separate Row) ---------- */}
        <Controller
          name="customerPhone"
          control={control}
          rules={{
            required: 'Phone is required',
            pattern: { value: /^\d{10}$/, message: '10 digits only' },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              label="Phone Number"
              fullWidth
              margin="normal"
              error={!!error}
              helperText={error?.message}
              InputLabelProps={{ style: { color: '#000' } }}
              inputProps={{ style: { color: '#000' } }}
            />
          )}
        />

        {/* ---------- Calculate ---------- */}
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          style={{ marginTop: 16 }}
          onClick={calculateRouteAndFare}
        >
          Calculate Estimate
        </Button>

        {/* ---------- Distance & Fare ---------- */}
        {distanceInfo && (
          <p style={{ marginTop: 12, fontSize: '1rem', fontWeight: 500, color: '#000' }}>
            {distanceInfo}
          </p>
        )}
        {fare && (
          <p style={{ marginTop: 8, fontSize: '1.2rem', fontWeight: 'bold', color: '#000' }}>
            Fare: ₹ {fare}
          </p>
        )}

        {/* ---------- Book Now ---------- */}
        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          style={{ marginTop: 16 }}
        >
          Book Now
        </Button>
      </form>
    </LocalizationProvider>
  )
}
