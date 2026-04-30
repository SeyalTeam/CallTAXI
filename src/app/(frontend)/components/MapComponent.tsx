'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface RouteData {
  name: string
  points: [number, number][]
  color: string
}

interface MapComponentProps {
  routes: RouteData[]
  center: [number, number]
  zoom: number
}

function RecenterMap({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function MapComponent({ routes, center, zoom }: MapComponentProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={center} zoom={zoom} />
      {routes.map((route, idx) => (
        <React.Fragment key={idx}>
          <Polyline positions={route.points} color={route.color} weight={4} opacity={0.7}>
            <Popup>{route.name}</Popup>
          </Polyline>
          {/* Markers for start and end of each segment if needed */}
          <Marker position={route.points[0]}>
            <Popup>Start: {route.name.split(' → ')[0]}</Popup>
          </Marker>
          <Marker position={route.points[route.points.length - 1]}>
            <Popup>End: {route.name.split(' → ')[1]}</Popup>
          </Marker>
        </React.Fragment>
      ))}
    </MapContainer>
  )
}
