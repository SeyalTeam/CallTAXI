'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

interface CustomerStat {
  name: string
  phone: string
  count: number
  totalAmount: number
}

interface Booking {
  id: string
  pickupDateTime: string
  pickupLocationName: string
  dropoffLocationName: string
  estimatedFare: number
  status: string
  tripType: string
}

const CustomerReport: React.FC = () => {
  const [data, setData] = useState<CustomerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone: string } | null>(
    null,
  )
  const [customerBookings, setCustomerBookings] = useState<Booking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setSelectedCustomer(null)
    setCustomerBookings([])
    try {
      const res = await fetch('/api/get-customer-report')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        console.error('Failed to fetch customer report')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerBookings = async (phone: string, name: string) => {
    // If the same customer is clicked, deselect (toggle off)
    if (selectedCustomer?.phone === phone) {
      setSelectedCustomer(null)
      setCustomerBookings([])
      return
    }

    setSelectedCustomer({ name, phone })
    setBookingsLoading(true)
    try {
      const res = await fetch(`/api/get-booking-report?customerPhone=${phone}`)
      if (res.ok) {
        const json = await res.json()
        // Sort by date new to old
        const sorted = json.docs.sort(
          (a: { pickupDateTime: string }, b: { pickupDateTime: string }) =>
            new Date(b.pickupDateTime).getTime() - new Date(a.pickupDateTime).getTime(),
        )
        setCustomerBookings(sorted)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBookingsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Box sx={{ p: 4, bgcolor: '#101010', minHeight: '100vh', color: '#fff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Customer Report
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          sx={{ color: '#fff', borderColor: '#333', '&:hover': { borderColor: '#555' } }}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress sx={{ color: '#fff' }} />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {/* Left Side: Customer List */}
          <TableContainer
            component={Paper}
            sx={{ bgcolor: '#1a1a1a', borderRadius: 2, width: '50%', maxHeight: '80vh' }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#222', borderBottom: '1px solid #333' }}>
                  <TableCell
                    sx={{
                      color: '#aaa',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      bgcolor: '#222',
                      borderRight: '1px solid #333',
                      borderLeft: '1px solid #333',
                      borderBottom: '1px solid #333',
                    }}
                  >
                    S.NO
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#aaa',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      bgcolor: '#222',
                      borderRight: '1px solid #333',
                      borderBottom: '1px solid #333',
                    }}
                  >
                    CUSTOMER NAME
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#aaa',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      bgcolor: '#222',
                      borderRight: '1px solid #333',
                      borderBottom: '1px solid #333',
                    }}
                  >
                    PHONE
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#aaa',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      bgcolor: '#222',
                      borderRight: '1px solid #333',
                      borderBottom: '1px solid #333',
                    }}
                  >
                    TRIP COUNT
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#aaa',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      bgcolor: '#222',
                      borderRight: '1px solid #333',
                      borderBottom: '1px solid #333',
                    }}
                  >
                    TOTAL AMOUNT
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.length > 0 ? (
                  data.map((row, index) => (
                    <TableRow
                      key={row.phone}
                      onClick={() => fetchCustomerBookings(row.phone, row.name)}
                      sx={{
                        backgroundColor:
                          selectedCustomer?.phone === row.phone
                            ? '#333'
                            : index % 2 === 0
                              ? '#121212'
                              : 'inherit',
                        borderBottom: '1px solid #333',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#2a2a2a',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          color: '#fff',
                          textAlign: 'left',
                          borderRight: '1px solid #333',
                          borderLeft: '1px solid #333',
                        }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#fff',
                          textAlign: 'left',
                          borderRight: '1px solid #333',
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {row.name.toUpperCase()}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#fff',
                          textAlign: 'left',
                          borderRight: '1px solid #333',
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {row.phone}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#fff',
                          textAlign: 'left',
                          borderRight: '1px solid #333',
                        }}
                      >
                        {row.count}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#fff',
                          textAlign: 'left',
                          borderRight: '1px solid #333',
                        }}
                      >
                        ₹{row.totalAmount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', color: '#666', py: 4 }}>
                      No data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Right Side: Detail View */}
          {selectedCustomer && (
            <Box sx={{ width: '50%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Bookings for {selectedCustomer.name.toUpperCase()}
              </Typography>
              {bookingsLoading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                  <CircularProgress sx={{ color: '#fff' }} />
                </Box>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{ bgcolor: '#1a1a1a', borderRadius: 2, maxHeight: '80vh' }}
                >
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#222', borderBottom: '1px solid #333' }}>
                        {['S.NO', 'DATE', 'TRIP TYPE', 'PICKUP', 'DROPOFF', 'AMOUNT', 'STATUS'].map(
                          (head) => (
                            <TableCell
                              key={head}
                              sx={{
                                color: '#aaa',
                                fontWeight: 'bold',
                                textAlign: 'left',
                                bgcolor: '#222',
                                borderRight: '1px solid #333',
                                borderBottom: '1px solid #333',
                                borderLeft: head === 'S.NO' ? '1px solid #333' : 'none',
                              }}
                            >
                              {head}
                            </TableCell>
                          ),
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerBookings.length > 0 ? (
                        customerBookings.map((booking, index) => (
                          <TableRow
                            key={booking.id}
                            sx={{
                              backgroundColor: index % 2 === 0 ? '#121212' : 'inherit',
                              borderBottom: '1px solid #333',
                            }}
                          >
                            <TableCell
                              sx={{
                                color: '#fff',
                                borderRight: '1px solid #333',
                                borderLeft: '1px solid #333',
                              }}
                            >
                              {index + 1}
                            </TableCell>
                            <TableCell sx={{ color: '#fff', borderRight: '1px solid #333' }}>
                              {new Date(booking.pickupDateTime).toLocaleDateString()}
                            </TableCell>
                            <TableCell sx={{ color: '#fff', borderRight: '1px solid #333' }}>
                              {booking.tripType}
                            </TableCell>
                            <TableCell sx={{ color: '#fff', borderRight: '1px solid #333' }}>
                              {booking.pickupLocationName}
                            </TableCell>
                            <TableCell sx={{ color: '#fff', borderRight: '1px solid #333' }}>
                              {booking.dropoffLocationName || '-'}
                            </TableCell>
                            <TableCell sx={{ color: '#fff', borderRight: '1px solid #333' }}>
                              {booking.estimatedFare
                                ? `₹${booking.estimatedFare.toLocaleString('en-IN')}`
                                : '-'}
                            </TableCell>
                            <TableCell sx={{ color: '#fff', borderRight: '1px solid #333' }}>
                              {booking.status}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ textAlign: 'center', color: '#666', py: 4 }}>
                            No bookings found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

export default CustomerReport
