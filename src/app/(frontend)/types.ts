import type { Dayjs } from 'dayjs'

export type FormValues = {
  customerName: string
  customerPhone: string
  tripType: 'oneway' | 'roundtrip' | 'packages'
  vehicle: string
  pickup: string
  drop: string
  pickupDateTime: Dayjs | null
  dropDateTime: Dayjs | null
  couponCode?: string
}

export type TNLocation = {
  name: string
  district: string
  lat: string
  lon: string
}

export type VehicleDoc = {
  id: string
  name: string
}

export type TariffGroup = {
  perKmRate: number
  bata: number
  minDistance?: number
  extras?: string
}

export type TariffDoc = {
  id: string
  vehicle?: VehicleDoc | string
  oneway?: TariffGroup
  roundtrip?: TariffGroup
  packages?: {
    hours: number
    perHourRate: number
    km: number
    bata: number
    extras?: string
  }
  updatedAt?: string
  createdAt?: string
}

export type CouponDoc = {
  id: string
  name: string
  percentage: number
  tariffScope: 'all' | 'oneway' | 'roundtrip' | 'packages'
  vehicleScope: 'all' | 'specific'
  vehicles?: string[] | VehicleDoc[]
  active: boolean
  expiryDate?: string
  startDate?: string
}
