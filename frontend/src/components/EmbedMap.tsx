'use client'
import { useState } from 'react'
import { MapPin, ExternalLink, Navigation } from 'lucide-react'

interface MapLocation {
  name: string
  lat: number
  lng: number
  type?: 'hotel' | 'attraction' | 'restaurant' | 'transport'
  description?: string
  distance?: string
}

interface EmbedMapProps {
  locations: MapLocation[]
  centerLat?: number
  centerLng?: number
  zoom?: number
  height?: number
  title?: string
}

const TYPE_COLORS: Record<string, string> = {
  hotel:      '#c9a84c',
  attraction: '#3b82f6',
  restaurant: '#f59e0b',
  transport:  '#a78bfa',
}

const TYPE_ICONS: Record<string, string> = {
  hotel:      '🏨',
  attraction: '🏛',
  restaurant: '🍜',
  transport:  '🚇',
}

export default function EmbedMap({ locations, centerLat, centerLng, zoom = 13, height = 380, title }: EmbedMapProps) {
  const [activePin, setActivePin] = useState<number | null>(null)

  if (!locations || locations.length === 0) return null

  // Calculate center from locations if not provided
  const cLat = centerLat ?? locations.reduce((s, l) => s + l.lat, 0) / locations.length
  const cLng = centerLng ?? locations.reduce((s, l) => s + l.lng, 0) / locations.length

  // Build OpenStreetMap embed URL with markers
  // Using OpenStreetMap iframe - free, no API key needed
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${cLng - 0.05},${cLat - 0.04},${cLng + 0.05},${cLat + 0.04}&layer=mapnik&marker=${cLat},${cLng}`

  // Google Maps link for navigation
  const firstLoc = locations[0]
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${firstLoc.lat},${firstLoc.lng}`

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {title && (
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
          </div>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold-light)' }}>
            <Navigation className="w-3 h-3" />Open in Maps
          </a>
        </div>
      )}

      {/* Map iframe */}
      <div className="relative" style={{ height }}>
        <iframe
          src={osmUrl}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title={title || 'Map'}
          loading="lazy"
          allowFullScreen
        />
        {/* Dark overlay to match app theme */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 70%, rgba(6,9,18,0.3) 100%)',
            mixBlendMode: 'multiply',
          }} />
      </div>

      {/* Location pins list */}
      <div className="p-4" style={{ background: 'var(--bg-2)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {locations.map((loc, i) => (
            <button key={i}
              onClick={() => setActivePin(activePin === i ? null : i)}
              className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background: activePin === i ? 'rgba(201,168,76,0.1)' : 'var(--bg-3)',
                border: `1px solid ${activePin === i ? 'rgba(201,168,76,0.3)' : 'var(--border)'}`,
              }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: `${TYPE_COLORS[loc.type || 'attraction']}20` }}>
                {TYPE_ICONS[loc.type || 'attraction']}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{loc.name}</p>
                {loc.distance && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{loc.distance}</p>
                )}
                {activePin === i && loc.description && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{loc.description}</p>
                )}
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex-shrink-0 p-1.5 rounded-lg transition-all"
                style={{ background: 'var(--bg-4)', color: 'var(--text-muted)' }}>
                <ExternalLink className="w-3 h-3" />
              </a>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}