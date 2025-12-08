'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  TextField,
  Button,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import axios from 'axios'
import { FormValues, TNLocation, VehicleDoc, TariffDoc } from '../types'

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

  // refs for outside click
  const pickupRef = useRef<HTMLDivElement | null>(null)
  const dropRef = useRef<HTMLDivElement | null>(null)

  // load data
  useEffect(() => {
    let mounted = true

    async function loadVehicles() {
      try {
        const res = await axios.get<{ docs?: unknown[] }>('/api/vehicles')
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
        const res = await axios.get<{ docs?: unknown[] }>('/api/tariffs')
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

    void loadVehicles()
    void loadTariffs()
    void loadTN()

    return () => {
      mounted = false
    }
  }, [])

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
  }, [pickupCoords, dropCoords, tripType, tariffs, selectedVehicleId])

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
          setDistanceInfo(`Package: ${chosen.packages.km} km`)
          setFare((chosen.packages.amount + chosen.packages.bata).toFixed(2))
        } else {
          setDistanceInfo('')
          setFare(null)
        }
        setLoading(false)
        return
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

      const total = billDist * rate + bata

      setDistanceInfo(`${distanceKm.toFixed(2)} km • ${Math.round(durationMin)} min`)
      setFare(total.toFixed(2))
    } catch (e) {
      console.error(e)
      setFare(null)
    } finally {
      setLoading(false)
    }
  }

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
      status: 'pending',
      notes:
        data.tripType === 'packages'
          ? `${data.pickup} (Package)`
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Premium corporate light theme background
        background: '#ffffff',
        color: '#000',
        pt: 8, // space for navbar
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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

      <Container
        maxWidth="xl"
        sx={{
          position: 'relative',
          zIndex: 1, // Ensure content is above the canvas
        }}
      >
        <Grid container spacing={6} alignItems="center" justifyContent="flex-end">
          {/* Booking Form Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={24}
              sx={{
                p: 5,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.70)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
              }}
            >
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, color: '#0f172a' }}>
                Book Your Ride
              </Typography>

              {bookingSuccess ? (
                <Box textAlign="center" py={4}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#dcfce7', // green-100
                      color: '#16a34a', // green-600
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
                  {/* ... existing form content ... */}
                  <Controller
                    name="tripType"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup
                        row
                        {...field}
                        sx={{ mb: 3, flexWrap: 'nowrap', justifyContent: 'space-between' }}
                      >
                        {['oneway', 'roundtrip', 'packages'].map((t) => (
                          <FormControlLabel
                            key={t}
                            value={t}
                            control={
                              <Radio
                                size="small"
                                sx={{
                                  color: '#94a3b8',
                                  '&.Mui-checked': { color: '#d97706' },
                                }}
                              />
                            }
                            label={
                              <Typography
                                sx={{
                                  color: field.value === t ? '#0f172a' : '#64748b',
                                  fontWeight: field.value === t ? 600 : 400,
                                  textTransform: 'capitalize',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {t === 'oneway'
                                  ? 'One Way'
                                  : t === 'roundtrip'
                                    ? 'Round Trip'
                                    : 'Packages'}
                              </Typography>
                            }
                          />
                        ))}
                      </RadioGroup>
                    )}
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name="vehicle"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth size="small">
                            <InputLabel id="vehicle-label" sx={{ color: '#9ca3af' }}>
                              Select Vehicle
                            </InputLabel>
                            <Select
                              labelId="vehicle-label"
                              label="Select Vehicle"
                              {...field}
                              sx={{
                                bgcolor: '#f8fafc',
                                color: '#0f172a',
                                fontWeight: 500,
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
                                '.MuiSvgIcon-root': { color: '#64748b' },
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

                    <Grid size={{ xs: 12 }} position="relative" ref={pickupRef}>
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
                              input: { color: '#0f172a', fontWeight: 500 },
                              label: { color: '#64748b' },
                              '& .MuiOutlinedInput-root': {
                                bgcolor: '#f8fafc',
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

                    {tripType !== 'packages' && (
                      <Grid size={{ xs: 12 }} position="relative" ref={dropRef}>
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
                                input: { color: '#0f172a', fontWeight: 500 },
                                label: { color: '#64748b' },
                                '& .MuiOutlinedInput-root': {
                                  bgcolor: '#f8fafc',
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

                    <Grid size={{ xs: 12 }}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Controller
                          name="pickupDateTime"
                          control={control}
                          render={({ field }) => (
                            <DateTimePicker
                              label="Pickup Date"
                              value={field.value}
                              onChange={field.onChange}
                              slotProps={{
                                textField: {
                                  size: 'small',
                                  fullWidth: true,
                                  sx: {
                                    input: { color: '#0f172a', fontWeight: 500 },
                                    label: { color: '#64748b' },
                                    '& .MuiOutlinedInput-root': {
                                      bgcolor: '#f8fafc',
                                      '& fieldset': { borderColor: '#e2e8f0' },
                                      '&:hover fieldset': { borderColor: '#cbd5e1' },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#d97706',
                                        borderWidth: 2,
                                      },
                                    },
                                    '& .MuiSvgIcon-root': { color: '#94a3b8' },
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>

                    {tripType === 'roundtrip' && (
                      <Grid size={{ xs: 12 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <Controller
                            name="dropDateTime"
                            control={control}
                            render={({ field }) => (
                              <DateTimePicker
                                label="Return Date"
                                value={field.value}
                                onChange={field.onChange}
                                slotProps={{
                                  textField: {
                                    size: 'small',
                                    fullWidth: true,
                                    sx: {
                                      input: { color: '#0f172a', fontWeight: 500 },
                                      label: { color: '#64748b' },
                                      '& .MuiOutlinedInput-root': {
                                        bgcolor: '#f8fafc',
                                        '& fieldset': { borderColor: '#e2e8f0' },
                                        '&:hover fieldset': { borderColor: '#cbd5e1' },
                                        '&.Mui-focused fieldset': {
                                          borderColor: '#d97706',
                                          borderWidth: 2,
                                        },
                                      },
                                      '& .MuiSvgIcon-root': { color: '#94a3b8' },
                                    },
                                  },
                                }}
                              />
                            )}
                          />
                        </LocalizationProvider>
                      </Grid>
                    )}

                    <Grid size={{ xs: 12 }}>
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
                              input: { color: '#000', fontWeight: 500 },
                              label: { color: 'grey.700' },
                              '& .MuiOutlinedInput-root': {
                                bgcolor: '#f8fafc',
                                '& fieldset': { borderColor: 'rgba(0,0,0,0.1)' },
                                '&:hover fieldset': { borderColor: 'rgba(0,0,0,0.3)' },
                                '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
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
                              input: { color: '#0f172a', fontWeight: 500 },
                              label: { color: '#64748b' },
                              '& .MuiOutlinedInput-root': {
                                bgcolor: '#f8fafc',
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

                    {fare && (
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: '#fff7ed', // orange/50
                            borderRadius: 2,
                            border: '1px solid #fed7aa', // orange/200
                          }}
                        >
                          <Typography variant="subtitle1" color="#c2410c" fontWeight="bold">
                            Estimated Share: ₹{fare}
                          </Typography>
                          <Typography variant="body2" color="#9ca3af">
                            {distanceInfo}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    <Grid size={{ xs: 12 }}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{
                          bgcolor: 'linear-gradient(to right, #f59e0b, #d97706)',
                          color: '#fff',
                          fontWeight: '800',
                          py: 2,
                          textTransform: 'none',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                          '&:hover': {
                            bgcolor: '#b45309',
                            boxShadow: '0 6px 16px rgba(217, 119, 6, 0.4)',
                          },
                        }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Book Now'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
