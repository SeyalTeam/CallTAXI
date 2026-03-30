import { MetadataRoute } from 'next'
import { DROPTAXI_DISTRICT_SLUGS, DROPTAXI_ROUTE_SLUGS } from '@/utilities/dropTaxiData'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kanitaxi.com'
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/drop-taxi`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const districtPages: MetadataRoute.Sitemap = DROPTAXI_DISTRICT_SLUGS.map((slug) => ({
    url: `${baseUrl}/drop-taxi/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const routePages: MetadataRoute.Sitemap = DROPTAXI_ROUTE_SLUGS.map((slug) => ({
    url: `${baseUrl}/drop-taxi/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticPages, ...districtPages, ...routePages]
}
