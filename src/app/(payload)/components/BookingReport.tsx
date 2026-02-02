'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Card,
  Menu,
  Grid,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'

interface Booking {
  id: string
  customerName: string
  customerPhone: string
  tripType: string
  pickupDateTime: string
  vehicle?: { name: string } | string
  pickupLocationName: string
  dropoffLocationName?: string
  estimatedFare?: number
  status: string
  driver?: { id: string; name: string } | string
}

interface Driver {
  id: string
  name: string
}

const BookingReport = () => {
  const [data, setData] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const [drivers, setDrivers] = useState<Driver[]>([])

  // Filters
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('all')
  const [tripType, setTripType] = useState('all')

  // Status Update State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  // Driver Update State
  const [driverAnchorEl, setDriverAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedDriverBookingId, setSelectedDriverBookingId] = useState<string | null>(null)

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedBookingId(id)
  }

  const handleDriverClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setDriverAnchorEl(event.currentTarget)
    setSelectedDriverBookingId(id)
  }

  const handleStatusClose = () => {
    setAnchorEl(null)
    setSelectedBookingId(null)
  }

  const handleDriverClose = () => {
    setDriverAnchorEl(null)
    setSelectedDriverBookingId(null)
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedBookingId) return

    // Optimistic update
    setData((prev) =>
      prev.map((b) => (b.id === selectedBookingId ? { ...b, status: newStatus } : b)),
    )
    handleStatusClose()

    try {
      await fetch(`/api/bookings/${selectedBookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch (error) {
      console.error('Failed to update status:', error)
      fetchData() // Revert/sync on error
    }
  }

  const handleDriverUpdate = async (driverId: string, driverName: string) => {
    if (!selectedDriverBookingId) return

    // Optimistic update
    setData((prev) =>
      prev.map((b) =>
        b.id === selectedDriverBookingId ? { ...b, driver: { id: driverId, name: driverName } } : b,
      ),
    )
    handleDriverClose()

    try {
      await fetch(`/api/bookings/${selectedDriverBookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driver: driverId }),
      })
    } catch (error) {
      console.error('Failed to update driver:', error)
      fetchData() // Revert/sync on error
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()

      // Pass single date as startDate; API handles single-day range if only startDate provided
      if (date) queryParams.append('startDate', date)
      if (status !== 'all') queryParams.append('status', status)
      if (tripType !== 'all') queryParams.append('tripType', tripType)

      const url = `/api/get-booking-report?${queryParams.toString()}`

      const [bookingsRes, driversRes] = await Promise.all([
        fetch(url),
        fetch('/api/drivers?limit=100'),
      ])

      const bookingsJson = await bookingsRes.json()
      const driversJson = await driversRes.json()

      if (bookingsJson.docs) {
        setData(bookingsJson.docs)
      }
      if (driversJson.docs) {
        setDrivers(driversJson.docs)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [date, status, tripType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    setDate('')
    setStatus('all')
    setTripType('all')
  }

  const handleExport = () => {
    // Basic CSV export logic
    const headers = [
      'S.NO',
      'Customer Name',
      'Phone',
      'Trip Type',
      'Vehicle',
      'PICKUP DATE',
      'From',
      'To',
      'Amount',
      'Status',
    ]
    const csvContent = [
      headers.join(','),
      ...data.map((row, index) =>
        [
          index + 1,
          `"${row.customerName || ''}"`,
          `"${row.customerPhone || ''}"`,
          row.tripType,
          typeof row.vehicle === 'object' ? `"${row.vehicle?.name || ''}"` : '',
          `"${new Date(row.pickupDateTime).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })}"`,
          `"${row.pickupLocationName || ''}"`,
          `"${row.dropoffLocationName || ''}"`,
          row.estimatedFare || 0,
          row.status,
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `booking_report_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#121212', minHeight: '100vh', color: 'white' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Booking Report
      </Typography>

      {/* Filter Bar */}
      <Card sx={{ p: 2, mb: 3, backgroundColor: '#1e1e1e', color: 'white' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Pickup Date"
            type="date"
            size="small"
            InputLabelProps={{ shrink: true, style: { color: '#aaa' } }}
            InputProps={{ style: { color: 'white', borderColor: '#444' } }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444' },
                '&:hover fieldset': { borderColor: '#666' },
              },
              backgroundColor: '#2c2c2c',
              borderRadius: 1,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: '#aaa' }}>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
              sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: '#aaa' }}>Trip Type</InputLabel>
            <Select
              value={tripType}
              label="Trip Type"
              onChange={(e) => setTripType(e.target.value)}
              sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' } }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="oneway">One Way</MenuItem>
              <MenuItem value="roundtrip">Round Trip</MenuItem>
              <MenuItem value="packages">Packages</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            sx={{
              color: '#aaa',
              borderColor: '#444',
              '&:hover': { borderColor: 'white', color: 'white' },
            }}
          >
            Export
          </Button>

          <IconButton onClick={handleRefresh} sx={{ color: 'white' }}>
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Card>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, backgroundColor: '#1e1e1e', color: 'white', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
              TOTAL BOOKINGS
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {data.length}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, backgroundColor: '#1e1e1e', color: 'white', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
              TOTAL AMOUNT
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              ₹
              {data
                .reduce((acc, curr) => acc + (curr.estimatedFare || 0), 0)
                .toLocaleString('en-IN')}
            </Typography>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ p: 2, backgroundColor: '#1e1e1e', color: 'white', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
              AVG FARE
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              ₹
              {data.length > 0
                ? Math.round(
                    data.reduce((acc, curr) => acc + (curr.estimatedFare || 0), 0) / data.length,
                  ).toLocaleString('en-IN')
                : 0}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Data Table */}
      <TableContainer component={Paper} sx={{ backgroundColor: '#1e1e1e' }}>
        <Table sx={{ minWidth: 650 }} aria-label="booking table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#252525' }}>
              <TableCell
                sx={{
                  color: '#aaa',
                  fontWeight: 'bold',
                  borderRight: '1px solid #333',
                  borderLeft: '1px solid #333',
                }}
              >
                S.NO
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                CUSTOMER NAME
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                PHONE
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                TRIP TYPE
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                VEHICLE
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                PICKUP DATE
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                FROM
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                TO
              </TableCell>
              <TableCell
                sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}
                align="right"
              >
                AMOUNT
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                DRIVER
              </TableCell>
              <TableCell sx={{ color: '#aaa', fontWeight: 'bold', borderRight: '1px solid #333' }}>
                STATUS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  align="center"
                  sx={{
                    color: 'white',
                    py: 3,
                    borderRight: '1px solid #333',
                    borderLeft: '1px solid #333',
                  }}
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={11}
                  align="center"
                  sx={{
                    color: 'white',
                    py: 3,
                    borderRight: '1px solid #333',
                    borderLeft: '1px solid #333',
                  }}
                >
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow
                  key={row.id}
                  sx={{
                    borderColor: '#333',
                    backgroundColor: index % 2 === 0 ? '#121212' : 'inherit',
                    '& td, & th': {
                      fontSize: '0.95rem',
                      fontWeight: 'bold',
                      borderBottom: '1px solid #333',
                    },
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      borderLeft: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Stack>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {row.customerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'grey.500', fontSize: '0.75rem' }}>
                        {new Date(row.pickupDateTime).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    {row.customerPhone}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    {row.tripType}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    {typeof row.vehicle === 'object' ? row.vehicle?.name : '-'}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    {new Date(row.pickupDateTime).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    {row.pickupLocationName}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    {row.dropoffLocationName || '-'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      fontWeight: 'bold',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    {row.estimatedFare ? `₹${row.estimatedFare}` : '-'}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Chip
                      label={
                        typeof row.driver === 'object' && row.driver?.name
                          ? row.driver.name
                          : 'Assign'
                      }
                      size="small"
                      color={row.driver ? 'primary' : 'default'}
                      variant={row.driver ? 'filled' : 'outlined'}
                      onClick={(e) => handleDriverClick(e, row.id)}
                      sx={{
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderColor: '#666',
                        color: row.driver ? 'white' : '#aaa',
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: 'white',
                      borderColor: '#333',
                      borderRight: '1px solid #333',
                      textTransform: 'uppercase',
                    }}
                  >
                    <Chip
                      label={row.status?.toUpperCase()}
                      size="small"
                      color={
                        row.status === 'completed'
                          ? 'info'
                          : row.status === 'confirmed'
                            ? 'success'
                            : row.status === 'cancelled'
                              ? 'error'
                              : 'warning'
                      }
                      variant="filled"
                      onClick={(e) => handleStatusClick(e, row.id)}
                      sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Status Update Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleStatusClose}
        PaperProps={{
          style: {
            backgroundColor: '#2c2c2c',
            color: 'white',
          },
        }}
      >
        <MenuItem onClick={() => handleStatusUpdate('pending')}>Pending</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('confirmed')}>Confirmed</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('cancelled')}>Cancelled</MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('completed')}>Completed</MenuItem>
      </Menu>

      {/* Driver Selection Menu */}
      <Menu
        anchorEl={driverAnchorEl}
        open={Boolean(driverAnchorEl)}
        onClose={handleDriverClose}
        PaperProps={{
          style: {
            backgroundColor: '#2c2c2c',
            color: 'white',
            maxHeight: 300,
          },
        }}
      >
        {drivers.map((driver) => (
          <MenuItem key={driver.id} onClick={() => handleDriverUpdate(driver.id, driver.name)}>
            {driver.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}

export default BookingReport
