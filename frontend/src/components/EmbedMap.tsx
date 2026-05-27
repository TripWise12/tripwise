'use client'
import { useState, useEffect, useRef } from 'react'
import { MapPin, ExternalLink, Navigation, ZoomIn, ZoomOut } from 'lucide-react'

export interface MapLocation {
  name: string
  lat: number
  lng: number
  type?: 'hotel' | 'attraction' | 'restaurant' | 'transport' | 'activity'
  description?: string
  distance?: string
  isMain?: boolean
}

interface EmbedMapProps {
  locations: MapLocation[]
  height?: number
  title?: string
  showList?: boolean
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  hotel:      { color: '#c9a84c', bg: 'rgba(201,168,76,0.15)',   icon: '🏨', label: 'Hotel' },
  attraction: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',   icon: '🏛',  label: 'Attraction' },
  activity:   { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',   icon: '⭐',  label: 'Activity' },
  restaurant: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',   icon: '🍜',  label: 'Food' },
  transport:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)',  icon: '🚇',  label: 'Transport' },
}

// Build a Google Maps Static API URL with multiple colored markers
function buildStaticMapUrl(locations: MapLocation[], zoom: number, w: number, h: number): string {
  const validLocs = locations.filter(l => l.lat && l.lng)
  if (validLocs.length === 0) return ''

  const center = validLocs[0]
  const scale = 2 // retina

  // Color map for marker types
  const typeColor: Record<string, string> = {
    hotel: '0xc9a84c',
    attraction: '0x3b82f6',
    activity: '0x3b82f6',
    restaurant: '0xf59e0b',
    transport: '0xa78bfa',
  }

  const markers = validLocs.map((loc, i) => {
    const color = typeColor[loc.type || 'attraction'] || '0x3b82f6'
    const label = loc.isMain ? 'H' : String.fromCharCode(65 + i) // A, B, C...
    return `markers=color:${color}%7Clabel:${label}%7C${loc.lat},${loc.lng}`
  }).join('&')

  // Use OpenStreetMap tiles via a free static map service (no key needed)
  // We'll use the staticmap approach with Stamen tiles
  const baseUrl = 'https://staticmap.openstreetmap.de/staticmap.php'
  const markerStr = validLocs.map((loc, i) => 
    `${loc.lat},${loc.lng},ol-marker-gold`
  ).join('|')

  // Actually use a reliable free service
  const mapboxStyled = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/`

  // Best free option: use OpenStreetMap with a modern tile service via Leaflet-style static
  // We'll render our own custom map using a canvas-based approach in the component
  return `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.04},${center.lat - 0.03},${center.lng + 0.04},${center.lat + 0.03}&layer=mapnik`
}

export default function EmbedMap({ locations, height = 380, title, showList = true }: EmbedMapProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const [zoom, setZoom] = useState(14)
  const mapRef = useRef<HTMLDivElement>(null)

  const validLocs = locations.filter(l => l.lat && l.lng && l.lat !== 0 && l.lng !== 0)
  if (validLocs.length === 0) return null

  // Calculate bounding box for all locations
  const lats = validLocs.map(l => l.lat)
  const lngs = validLocs.map(l => l.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)

  // Add padding
  const pad = 0.008
  const bbox = `${minLng - pad},${minLat - pad},${maxLng + pad},${maxLat + pad}`

  // For single location, use marker
  const activeOrFirst = activeIdx !== null ? validLocs[activeIdx] : validLocs[0]

  // Build OSM URL with all marker coordinates as a path
  const markerParam = activeIdx !== null
    ? `&marker=${validLocs[activeIdx].lat},${validLocs[activeIdx].lng}`
    : `&marker=${validLocs[0].lat},${validLocs[0].lng}`

  const osmSrc = validLocs.length === 1
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${minLng-0.02},${minLat-0.02},${maxLng+0.02},${maxLat+0.02}&layer=mapnik&marker=${validLocs[0].lat},${validLocs[0].lng}`
    : activeIdx !== null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${validLocs[activeIdx].lng-0.02},${validLocs[activeIdx].lat-0.015},${validLocs[activeIdx].lng+0.02},${validLocs[activeIdx].lat+0.015}&layer=mapnik&marker=${validLocs[activeIdx].lat},${validLocs[activeIdx].lng}`
      : `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markerParam}`

  // Google Maps link
  const googleMapsUrl = validLocs.length === 1
    ? `https://www.google.com/maps/search/?api=1&query=${validLocs[0].lat},${validLocs[0].lng}`
    : `https://www.google.com/maps/dir/${validLocs.map(l => `${l.lat},${l.lng}`).join('/')}`

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'var(--bg-2)' }}>

      {/* Header */}
      {title && (
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {validLocs.length} location{validLocs.length !== 1 ? 's' : ''}</span>
          </div>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover-lift"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold-light)' }}>
            <Navigation className="w-3 h-3" />
            {validLocs.length > 1 ? 'Full route' : 'Navigate'}
          </a>
        </div>
      )}

      {/* PIN LEGEND — shown above map */}
      <div className="px-4 py-2 flex flex-wrap gap-2"
        style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
        {validLocs.map((loc, i) => {
          const cfg = TYPE_CONFIG[loc.type || 'attraction']
          return (
            <button key={i}
              onClick={() => setActiveIdx(activeIdx === i ? null : i)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeIdx === i ? cfg.bg : 'var(--bg-4)',
                border: `1px solid ${activeIdx === i ? cfg.color : 'var(--border)'}`,
                color: activeIdx === i ? cfg.color : 'var(--text-secondary)',
              }}>
              <span>{cfg.icon}</span>
              <span className="max-w-[120px] truncate">{loc.name}</span>
            </button>
          )
        })}
        {activeIdx !== null && (
          <button onClick={() => setActiveIdx(null)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
            style={{ background: 'var(--bg-4)', color: 'var(--text-muted)' }}>
            Show all
          </button>
        )}
      </div>

      {/* Map iframe */}
      <div className="relative" style={{ height }} ref={mapRef}>
        <iframe
          key={osmSrc} // force reload on src change
          src={osmSrc}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title={title || 'Map'}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
        {/* Subtle dark vignette */}
        <div className="absolute inset-0 pointer-events-none rounded-none"
          style={{
            boxShadow: 'inset 0 0 40px rgba(6,9,18,0.25)',
          }} />
      </div>

      {/* Location cards list */}
      {showList && (
        <div className="p-3" style={{ background: 'var(--bg-2)' }}>
          <div className="space-y-2">
            {validLocs.map((loc, i) => {
              const cfg = TYPE_CONFIG[loc.type || 'attraction']
              const isActive = activeIdx === i
              return (
                <button key={i}
                  onClick={() => setActiveIdx(isActive ? null : i)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover-lift"
                  style={{
                    background: isActive ? cfg.bg : 'var(--bg-3)',
                    border: `1px solid ${isActive ? cfg.color : 'var(--border)'}`,
                  }}>
                  {/* Letter badge */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-xs"
                    style={{
                      background: cfg.bg,
                      color: cfg.color,
                      border: `1px solid ${cfg.color}40`,
                    }}>
                    {loc.isMain ? cfg.icon : String.fromCharCode(65 + i)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {loc.name}
                    </p>
                    {loc.distance && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{loc.distance}</p>
                    )}
                    {isActive && loc.description && (
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{loc.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                      target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ background: 'var(--bg-4)', color: 'var(--text-muted)' }}
                      title="Get directions">
                      <Navigation className="w-3 h-3" />
                    </a>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}