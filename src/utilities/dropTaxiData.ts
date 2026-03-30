export type VehicleRate = {
  label: string
  ratePerKm: number
}

export type DropTaxiDistrict = {
  slug: string
  name: string
}

export type DropTaxiRoute = {
  slug: string
  from: string
  to: string
  fromSlug: string
  toSlug: string
  distanceKm: number
  durationHours: number
  landmarks: string[]
}

export const VEHICLE_RATES: VehicleRate[] = [
  { label: 'Sedan', ratePerKm: 14 },
  { label: 'SUV', ratePerKm: 19 },
  { label: 'Innova', ratePerKm: 20 },
  { label: 'Innova Crysta', ratePerKm: 23 },
  { label: 'Tempo Traveller', ratePerKm: 40 },
]

export const DROPTAXI_DISTRICTS: DropTaxiDistrict[] = [
  { slug: 'thoothukudi', name: 'Thoothukudi' },
  { slug: 'tirunelveli', name: 'Tirunelveli' },
  { slug: 'nagercoil', name: 'Nagercoil' },
  { slug: 'tenkasi', name: 'Tenkasi' },
  { slug: 'virudhunagar', name: 'Virudhunagar' },
  { slug: 'kanyakumari', name: 'Kanyakumari' },
  { slug: 'madurai', name: 'Madurai' },
  { slug: 'coimbatore', name: 'Coimbatore' },
  { slug: 'chennai', name: 'Chennai' },
  { slug: 'trichy', name: 'Trichy' },
]

export const DROPTAXI_ROUTES: DropTaxiRoute[] = [
  {
    slug: 'thoothukudi-to-chennai',
    from: 'Thoothukudi',
    to: 'Chennai',
    fromSlug: 'thoothukudi',
    toSlug: 'chennai',
    distanceKm: 610,
    durationHours: 10.5,
    landmarks: ['Tirunelveli', 'Madurai', 'Villupuram'],
  },
  {
    slug: 'thoothukudi-to-madurai',
    from: 'Thoothukudi',
    to: 'Madurai',
    fromSlug: 'thoothukudi',
    toSlug: 'madurai',
    distanceKm: 150,
    durationHours: 3,
    landmarks: ['Ettayapuram', 'Kovilpatti', 'Virudhunagar'],
  },
  {
    slug: 'thoothukudi-to-coimbatore',
    from: 'Thoothukudi',
    to: 'Coimbatore',
    fromSlug: 'thoothukudi',
    toSlug: 'coimbatore',
    distanceKm: 390,
    durationHours: 7.5,
    landmarks: ['Madurai', 'Dindigul', 'Palani'],
  },
  {
    slug: 'thoothukudi-to-trichy',
    from: 'Thoothukudi',
    to: 'Trichy',
    fromSlug: 'thoothukudi',
    toSlug: 'trichy',
    distanceKm: 325,
    durationHours: 6,
    landmarks: ['Kovilpatti', 'Virudhunagar', 'Dindigul'],
  },
  {
    slug: 'thoothukudi-to-tirunelveli',
    from: 'Thoothukudi',
    to: 'Tirunelveli',
    fromSlug: 'thoothukudi',
    toSlug: 'tirunelveli',
    distanceKm: 50,
    durationHours: 1.2,
    landmarks: ['Srivaikuntam', 'Alwarthirunagari', 'Palayamkottai'],
  },
  {
    slug: 'thoothukudi-to-nagercoil',
    from: 'Thoothukudi',
    to: 'Nagercoil',
    fromSlug: 'thoothukudi',
    toSlug: 'nagercoil',
    distanceKm: 145,
    durationHours: 3,
    landmarks: ['Tiruchendur', 'Nanguneri', 'Valliyoor'],
  },
  {
    slug: 'thoothukudi-to-bangalore',
    from: 'Thoothukudi',
    to: 'Bangalore',
    fromSlug: 'thoothukudi',
    toSlug: 'bangalore',
    distanceKm: 640,
    durationHours: 11.5,
    landmarks: ['Madurai', 'Salem', 'Hosur'],
  },
  {
    slug: 'thoothukudi-to-salem',
    from: 'Thoothukudi',
    to: 'Salem',
    fromSlug: 'thoothukudi',
    toSlug: 'salem',
    distanceKm: 475,
    durationHours: 8.5,
    landmarks: ['Madurai', 'Dindigul', 'Namakkal'],
  },
  {
    slug: 'thoothukudi-to-pondicherry',
    from: 'Thoothukudi',
    to: 'Pondicherry',
    fromSlug: 'thoothukudi',
    toSlug: 'pondicherry',
    distanceKm: 560,
    durationHours: 10,
    landmarks: ['Madurai', 'Trichy', 'Villupuram'],
  },
  {
    slug: 'thoothukudi-to-kanyakumari',
    from: 'Thoothukudi',
    to: 'Kanyakumari',
    fromSlug: 'thoothukudi',
    toSlug: 'kanyakumari',
    distanceKm: 140,
    durationHours: 3,
    landmarks: ['Tiruchendur', 'Nagercoil', 'Suchindram'],
  },
  {
    slug: 'chennai-to-thoothukudi',
    from: 'Chennai',
    to: 'Thoothukudi',
    fromSlug: 'chennai',
    toSlug: 'thoothukudi',
    distanceKm: 610,
    durationHours: 10.5,
    landmarks: ['Villupuram', 'Trichy', 'Madurai'],
  },
  {
    slug: 'madurai-to-thoothukudi',
    from: 'Madurai',
    to: 'Thoothukudi',
    fromSlug: 'madurai',
    toSlug: 'thoothukudi',
    distanceKm: 150,
    durationHours: 3,
    landmarks: ['Virudhunagar', 'Kovilpatti', 'Ettayapuram'],
  },
  {
    slug: 'coimbatore-to-thoothukudi',
    from: 'Coimbatore',
    to: 'Thoothukudi',
    fromSlug: 'coimbatore',
    toSlug: 'thoothukudi',
    distanceKm: 390,
    durationHours: 7.5,
    landmarks: ['Palani', 'Dindigul', 'Madurai'],
  },
  {
    slug: 'tirunelveli-to-chennai',
    from: 'Tirunelveli',
    to: 'Chennai',
    fromSlug: 'tirunelveli',
    toSlug: 'chennai',
    distanceKm: 620,
    durationHours: 10.5,
    landmarks: ['Kovilpatti', 'Madurai', 'Villupuram'],
  },
  {
    slug: 'nagercoil-to-madurai',
    from: 'Nagercoil',
    to: 'Madurai',
    fromSlug: 'nagercoil',
    toSlug: 'madurai',
    distanceKm: 245,
    durationHours: 4.5,
    landmarks: ['Valliyoor', 'Tirunelveli', 'Virudhunagar'],
  },
  {
    slug: 'tenkasi-to-chennai',
    from: 'Tenkasi',
    to: 'Chennai',
    fromSlug: 'tenkasi',
    toSlug: 'chennai',
    distanceKm: 650,
    durationHours: 11,
    landmarks: ['Rajapalayam', 'Madurai', 'Trichy'],
  },
  {
    slug: 'virudhunagar-to-chennai',
    from: 'Virudhunagar',
    to: 'Chennai',
    fromSlug: 'virudhunagar',
    toSlug: 'chennai',
    distanceKm: 540,
    durationHours: 9,
    landmarks: ['Madurai', 'Trichy', 'Villupuram'],
  },
  {
    slug: 'ramanathapuram-to-chennai',
    from: 'Ramanathapuram',
    to: 'Chennai',
    fromSlug: 'ramanathapuram',
    toSlug: 'chennai',
    distanceKm: 560,
    durationHours: 9.5,
    landmarks: ['Paramakudi', 'Madurai', 'Trichy'],
  },
  {
    slug: 'kovilpatti-to-madurai',
    from: 'Kovilpatti',
    to: 'Madurai',
    fromSlug: 'kovilpatti',
    toSlug: 'madurai',
    distanceKm: 95,
    durationHours: 2,
    landmarks: ['Sattur', 'Virudhunagar', 'Thirumangalam'],
  },
  {
    slug: 'kanyakumari-to-chennai',
    from: 'Kanyakumari',
    to: 'Chennai',
    fromSlug: 'kanyakumari',
    toSlug: 'chennai',
    distanceKm: 705,
    durationHours: 12,
    landmarks: ['Nagercoil', 'Tirunelveli', 'Madurai'],
  },
]

export const DROPTAXI_ROUTE_SLUGS = DROPTAXI_ROUTES.map((route) => route.slug)
export const DROPTAXI_DISTRICT_SLUGS = DROPTAXI_DISTRICTS.map((district) => district.slug)

export const calculateEstimatedFare = (distanceKm: number, ratePerKm: number): number =>
  Math.round(distanceKm * ratePerKm)

export const formatInr = (amount: number): string =>
  amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })

export const getDropTaxiRouteBySlug = (slug: string): DropTaxiRoute | undefined =>
  DROPTAXI_ROUTES.find((route) => route.slug === slug)

export const getDropTaxiDistrictBySlug = (slug: string): DropTaxiDistrict | undefined =>
  DROPTAXI_DISTRICTS.find((district) => district.slug === slug)

export const getRoutesForDistrict = (districtSlug: string): DropTaxiRoute[] =>
  DROPTAXI_ROUTES.filter(
    (route) => route.fromSlug === districtSlug || route.toSlug === districtSlug,
  )

export const getRelatedRoutes = (slug: string, limit = 4): DropTaxiRoute[] => {
  const route = getDropTaxiRouteBySlug(slug)
  if (!route) return []

  const sameOriginOrDestination = DROPTAXI_ROUTES.filter(
    (candidate) =>
      candidate.slug !== route.slug &&
      (candidate.fromSlug === route.fromSlug || candidate.toSlug === route.toSlug),
  )

  if (sameOriginOrDestination.length >= limit) return sameOriginOrDestination.slice(0, limit)

  const fallback = DROPTAXI_ROUTES.filter(
    (candidate) =>
      candidate.slug !== route.slug && !sameOriginOrDestination.some((picked) => picked.slug === candidate.slug),
  )

  return [...sameOriginOrDestination, ...fallback].slice(0, limit)
}
