'use client'
import { useState, useEffect } from 'react'
import { MapPin, ExternalLink, Navigation, Home, Star, Train, Plane, Bus, Coffee, Landmark, Hotel, AlertCircle } from 'lucide-react'

export interface MapLocation {
  name: string
  lat: number
  lng: number
  type?: 'hotel' | 'attraction' | 'restaurant' | 'transport' | 'activity' | 'airport' | 'transit' | 'bus'
  description?: string
  distance?: string
  distanceFromAirport?: string
  nearestTransit?: string
  priceHint?: string
  rating?: number
  isMain?: boolean
  badge?: string   // e.g. "Cheapest" | "Closest to attractions" | "Best rated"
}

interface EmbedMapProps {
  locations: MapLocation[]
  height?: number
  title?: string
  showList?: boolean
  splitScreen?: boolean       // default true — side-by-side on desktop
  highlightIdx?: number       // pre-selected location
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: JSX.Element; emoji: string; label: string }> = {
  hotel:      { color: '#c9a84c', bg: 'rgba(201,168,76,0.12)',  border: 'rgba(201,168,76,0.35)',  icon: <Home className="w-3.5 h-3.5"/>,     emoji: '🏠', label: 'Hotel' },
  airport:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', icon: <Plane className="w-3.5 h-3.5"/>,    emoji: '✈️',  label: 'Airport' },
  transit:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.35)',  icon: <Train className="w-3.5 h-3.5"/>,    emoji: '🚇', label: 'Metro/Rail' },
  bus:        { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.35)',  icon: <Bus className="w-3.5 h-3.5"/>,      emoji: '🚌', label: 'Bus' },
  transport:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', icon: <Train className="w-3.5 h-3.5"/>,    emoji: '🚇', label: 'Transit' },
  attraction: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)',  icon: <Landmark className="w-3.5 h-3.5"/>, emoji: '🏛', label: 'Attraction' },
  activity:   { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.35)', icon: <Star className="w-3.5 h-3.5"/>,     emoji: '⭐', label: 'Activity' },
  restaurant: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  icon: <Coffee className="w-3.5 h-3.5"/>,   emoji: '🍜', label: 'Food' },
}
const DEFAULT_CFG = TYPE_CONFIG.attraction

function getConfig(type?: string) {
  return TYPE_CONFIG[type || ''] || DEFAULT_CFG
}

// Build OSM iframe src that fits all locations in bbox or focuses on one
function buildOSMSrc(locations: MapLocation[], focusIdx: number | null): string {
  const valid = locations.filter(l => l.lat && l.lng && l.lat !== 0 && l.lng !== 0)
  if (!valid.length) return ''
  if (focusIdx !== null && valid[focusIdx]) {
    const l = valid[focusIdx]
    const pad = 0.018
    return `https://www.openstreetmap.org/export/embed.html?bbox=${l.lng-pad},${l.lat-pad},${l.lng+pad},${l.lat+pad}&layer=mapnik&marker=${l.lat},${l.lng}`
  }
  const lats = valid.map(l => l.lat), lngs = valid.map(l => l.lng)
  const pad = 0.012
  const bbox = `${Math.min(...lngs)-pad},${Math.min(...lats)-pad},${Math.max(...lngs)+pad},${Math.max(...lats)+pad}`
  const marker = valid[0] ? `&marker=${valid[0].lat},${valid[0].lng}` : ''
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`
}

function buildGoogleUrl(locations: MapLocation[], focusIdx: number | null): string {
  const valid = locations.filter(l => l.lat && l.lng)
  if (!valid.length) return '#'
  if (focusIdx !== null && valid[focusIdx]) {
    const l = valid[focusIdx]
    return `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`
  }
  if (valid.length === 1) return `https://www.google.com/maps/search/?api=1&query=${valid[0].lat},${valid[0].lng}`
  return `https://www.google.com/maps/dir/${valid.map(l => `${l.lat},${l.lng}`).join('/')}`
}

// Group locations by type for the sidebar
function groupByType(locations: MapLocation[]) {
  const groups: Record<string, (MapLocation & { _idx: number })[]> = {}
  locations.forEach((l, i) => {
    const key = l.type || 'attraction'
    if (!groups[key]) groups[key] = []
    groups[key].push({ ...l, _idx: i })
  })
  return groups
}

export default function EmbedMap({ locations, height = 420, title, showList = true, splitScreen = true, highlightIdx }: EmbedMapProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(highlightIdx ?? null)
  const [mapKey, setMapKey] = useState(0)
  const [osmSrc, setOsmSrc] = useState('')

  const valid = locations.filter(l => l.lat && l.lng && l.lat !== 0 && l.lng !== 0)

  useEffect(() => {
    const src = buildOSMSrc(valid, activeIdx)
    setOsmSrc(src)
    setMapKey(k => k + 1)
  }, [activeIdx, locations.length])

  if (!valid.length) return null

  const groups = groupByType(valid)
  const googleUrl = buildGoogleUrl(valid, activeIdx)
  const focused = activeIdx !== null ? valid[activeIdx] : null

  const typeOrder = ['hotel', 'airport', 'transit', 'bus', 'transport', 'attraction', 'activity', 'restaurant']
  const sortedGroupKeys = Object.keys(groups).sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))

  const mapHeight = splitScreen ? height : height

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,168,76,0.2)', background: 'var(--bg-2)' }}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3"
        style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gold)' }} />
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {title || 'Map'}
          </span>
          <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            · {valid.length} pin{valid.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeIdx !== null && (
            <button onClick={() => setActiveIdx(null)}
              className="text-xs px-2.5 py-1 rounded-lg transition-all"
              style={{ background: 'var(--bg-4)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              Show all
            </button>
          )}
          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold-light)' }}>
            <Navigation className="w-3 h-3" />
            {focused ? 'Directions' : 'Open map'}
          </a>
        </div>
      </div>

      {/* SPLIT SCREEN BODY */}
      <div className={splitScreen ? 'flex flex-col md:flex-row' : 'flex flex-col'} style={{ minHeight: mapHeight }}>

        {/* LEFT: Map iframe — takes 60% on desktop */}
        <div className="relative" style={{ flex: splitScreen ? '0 0 60%' : '1', minHeight: mapHeight, maxWidth: splitScreen ? '60%' : '100%' }}>
          {osmSrc ? (
            <iframe
              key={mapKey}
              src={osmSrc}
              style={{ width: '100%', height: mapHeight, border: 'none', display: 'block' }}
              title={title || 'Map'}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full" style={{ height: mapHeight, background: 'var(--bg-3)' }}>
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No location data available</p>
              </div>
            </div>
          )}
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(6,9,18,0.2)' }} />
          {/* Active location overlay badge */}
          {focused && (
            <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
              <div className="rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: 'rgba(6,9,18,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-base">{getConfig(focused.type).emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'white' }}>{focused.name}</p>
                  {focused.description && <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>{focused.description}</p>}
                </div>
                {focused.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                    style={{ background: 'rgba(201,168,76,0.25)', color: '#c9a84c' }}>{focused.badge}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Sidebar — 40% on desktop, scrollable */}
        {showList && (
          <div className="overflow-y-auto" style={{
            flex: splitScreen ? '0 0 40%' : '1',
            maxHeight: mapHeight,
            borderLeft: splitScreen ? '1px solid var(--border)' : 'none',
            borderTop: splitScreen ? 'none' : '1px solid var(--border)',
            background: 'var(--bg-2)',
          }}>
            {sortedGroupKeys.map(typeKey => {
              const cfg = getConfig(typeKey)
              const items = groups[typeKey]
              return (
                <div key={typeKey}>
                  {/* Type group header */}
                  <div className="sticky top-0 z-10 px-3 py-2 flex items-center gap-2"
                    style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                      {cfg.label}s ({items.length})
                    </span>
                  </div>
                  {/* Items */}
                  <div className="p-2 space-y-1">
                    {items.map((loc) => {
                      const isActive = activeIdx === loc._idx
                      return (
                        <button key={loc._idx}
                          onClick={() => setActiveIdx(isActive ? null : loc._idx)}
                          className="w-full text-left p-3 rounded-xl transition-all"
                          style={{
                            background: isActive ? cfg.bg : 'transparent',
                            border: `1px solid ${isActive ? cfg.border : 'transparent'}`,
                          }}>
                          <div className="flex items-start gap-2.5">
                            {/* Icon badge */}
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                              {cfg.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{loc.name}</p>
                                {loc.badge && (
                                  <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                                    style={{ background: 'rgba(201,168,76,0.15)', color: '#c9a84c', fontSize: '10px' }}>
                                    {loc.badge}
                                  </span>
                                )}
                              </div>
                              {loc.distance && (
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{loc.distance}</p>
                              )}
                              {loc.distanceFromAirport && (
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  <span style={{ color: '#a78bfa' }}>✈ </span>{loc.distanceFromAirport} from airport
                                </p>
                              )}
                              {loc.nearestTransit && (
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  <span style={{ color: '#60a5fa' }}>🚇 </span>{loc.nearestTransit}
                                </p>
                              )}
                              {loc.priceHint && (
                                <p className="text-xs font-medium mt-0.5" style={{ color: '#c9a84c' }}>{loc.priceHint}</p>
                              )}
                              {loc.rating && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Star className="w-2.5 h-2.5" style={{ color: '#f59e0b' }} />
                                  <span className="text-xs" style={{ color: '#f59e0b' }}>{loc.rating}</span>
                                </div>
                              )}
                              {isActive && loc.description && (
                                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{loc.description}</p>
                              )}
                            </div>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                              target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="p-1.5 rounded-lg flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
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
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
