import type { Dayjs } from 'dayjs'

export type FormValues = {
  customerName: string
  customerPhone: string
  tripType: 'oneway' | 'roundtrip' | 'packages' | 'multilocation'
  vehicle: string
  pickup: string
  drop: string
  pickupDateTime: Dayjs | null
  dropDateTime: Dayjs | null
  couponCode?: string
}

export type TNLocation = {
  name: string
  district?: string
  taluk?: string
  panchayat?: string
  village?: string
  lat: string
  lon: string
  raw_addr?: {
    village?: string
    hamlet?: string
    suburb?: string
    town?: string
    city?: string
    panchayat?: string
    subdistrict?: string
    taluk?: string
    tehsil?: string
    block?: string
    state_district?: string
    district?: string
    county?: string
    city_district?: string
    state?: string
    country?: string
    country_code?: string
    postcode?: string
  }
}

export type VehicleDoc = {
  id: string
  name: string
  category?: 'tariff' | 'attachment'
  icon?:
    | {
        url: string
        alt: string
      }
    | string
  seatCount?: number
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
    extraKmRate: number
    extraHourRate: number
    nightBata?: number
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
