'use client'

// EmbedMap.tsx — Premium interactive map for TripWise
// Uses Leaflet with CartoDB Voyager tile (light, colorful, no dark bg)
// Features: numbered markers, animated popups, route polyline, split-screen list, type icons

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Train, Hotel, Coffee, Plane, Star } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MapLocation {
  name: string
  lat: number
  lng: number
  type?: 'hotel' | 'restaurant' | 'activity' | 'transport' | 'transit' | 'airport' | 'attraction' | 'custom'
  description?: string
  distance?: string
  distanceFromAirport?: string
  nearestTransit?: string
  priceHint?: string
  rating?: number
  badge?: string
  isMain?: boolean
}

interface Props {
  locations: MapLocation[]
  title?: string
  height?: number
  showList?: boolean
  splitScreen?: boolean
  showRoute?: boolean
}

// ─── Marker colors by type ────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { color: string; border: string; emoji: string }> = {
  hotel: { color: '#7c3aed', border: '#6d28d9', emoji: '🏨' },
  restaurant: { color: '#d97706', border: '#b45309', emoji: '🍽️' },
  activity: { color: '#0369a1', border: '#075985', emoji: '🎯' },
  transport: { color: '#7c3aed', border: '#6d28d9', emoji: '🚌' },
  transit: { color: '#0891b2', border: '#0e7490', emoji: '🚇' },
  airport: { color: '#1d4ed8', border: '#1e40af', emoji: '✈️' },
  attraction: { color: '#0369a1', border: '#075985', emoji: '📍' },
  custom: { color: '#c9a84c', border: '#a07832', emoji: '📌' },
}

const DEFAULT_CONFIG = { color: '#c9a84c', border: '#a07832', emoji: '📍' }

// ─── Component ────────────────────────────────────────────────────────────────
export default function EmbedMap({
  locations,
  title,
  height = 380,
  showList = false,
  splitScreen = false,
  showRoute = false,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapObj = useRef<any>(null)
  const [active, setActive] = useState<number | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const markersRef = useRef<any[]>([])

  const valid = locations.filter(l => l.lat && l.lng && !isNaN(l.lat) && !isNaN(l.lng))

  useEffect(() => {
    if (!mapRef.current || mapObj.current || valid.length === 0) return

    // Dynamically import Leaflet (avoids SSR issues)
    const init = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css' as any)

      const avgLat = valid.reduce((s, l) => s + l.lat, 0) / valid.length
      const avgLng = valid.reduce((s, l) => s + l.lng, 0) / valid.length

      const map = L.map(mapRef.current!, {
        center: [avgLat, avgLng],
        zoom: valid.length === 1 ? 14 : 13,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      })

      mapObj.current = map

      // ── Tile layer: CartoDB Voyager — light, colorful, modern ──
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map)

      // ── Draw route polyline if requested or > 1 activity location ──
      const routePoints = valid.filter(l => l.type !== 'hotel' && l.type !== 'transit' && l.type !== 'airport')
      if ((showRoute || routePoints.length > 1) && routePoints.length >= 2) {
        L.polyline(
          routePoints.map(l => [l.lat, l.lng]),
          {
            color: '#c9a84c',
            weight: 2.5,
            opacity: 0.65,
            dashArray: '6 4',
          }
        ).addTo(map)
      }

      // ── Markers ──
      const markerList: any[] = []

      valid.forEach((loc, i) => {
        const cfg = TYPE_CONFIG[loc.type || 'custom'] || DEFAULT_CONFIG
        const isMain = loc.isMain

        // Custom numbered div icon
        const iconHtml = `
          <div style="
            position: relative;
            width: ${isMain ? 36 : 30}px;
            height: ${isMain ? 36 : 30}px;
            background: ${cfg.color};
            border: 2.5px solid ${isMain ? '#fff' : cfg.border};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.28);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          ">
            <span style="
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              transform: rotate(45deg);
              color: #fff;
              font-size: ${isMain ? 13 : 11}px;
              font-weight: 700;
              font-family: system-ui, sans-serif;
              line-height: 1;
            ">${i + 1}</span>
          </div>
        `

        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [isMain ? 36 : 30, isMain ? 36 : 30],
          iconAnchor: [isMain ? 18 : 15, isMain ? 36 : 30],
          popupAnchor: [0, -(isMain ? 38 : 32)],
        })

        const marker = L.marker([loc.lat, loc.lng], { icon })

        // ── Popup content — light bg, dark text, premium styled ──
        const popupHtml = `
          <div style="
            font-family: system-ui, -apple-system, sans-serif;
            min-width: 180px;
            max-width: 240px;
            padding: 0;
          ">
            ${loc.badge ? `
              <div style="
                display: inline-block;
                background: rgba(201,168,76,0.15);
                color: #7a5c1e;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.05em;
                padding: 2px 8px;
                border-radius: 999px;
                margin-bottom: 6px;
                border: 1px solid rgba(201,168,76,0.3);
              ">${loc.badge}</div>
            ` : ''}
            <div style="display:flex; align-items:flex-start; gap:8px; margin-bottom:6px;">
              <div style="
                width: 26px; height: 26px; border-radius: 8px; flex-shrink:0;
                background: ${cfg.color}18;
                border: 1px solid ${cfg.color}30;
                display:flex; align-items:center; justify-content:center;
                font-size: 13px;
              ">${cfg.emoji}</div>
              <div style="flex:1; min-width:0;">
                <p style="
                  margin:0; font-size:13px; font-weight:700;
                  color: #1a1a2e;
                  line-height:1.3;
                  white-space: nowrap; overflow:hidden; text-overflow:ellipsis;
                ">${loc.name}</p>
                ${loc.type ? `<p style="margin:2px 0 0; font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.05em;">${loc.type}</p>` : ''}
              </div>
            </div>
            ${loc.description ? `
              <p style="margin: 4px 0; font-size: 12px; color: #4b5563; line-height: 1.5;">
                ${loc.description.slice(0, 100)}${loc.description.length > 100 ? '…' : ''}
              </p>
            ` : ''}
            ${loc.priceHint ? `
              <p style="margin:4px 0 0; font-size:12px; font-weight:700; color: ${cfg.color};">
                ${loc.priceHint}
              </p>
            ` : ''}
            ${loc.rating ? `
              <p style="margin:4px 0 0; font-size:11px; color: #c9a84c;">
                ${'★'.repeat(Math.round(loc.rating / 2))} ${loc.rating}/10
              </p>
            ` : ''}
            ${loc.distance ? `
              <p style="margin:4px 0 0; font-size:11px; color:#6b7280;">
                📍 ${loc.distance}
              </p>
            ` : ''}
            ${loc.nearestTransit ? `
              <p style="margin:4px 0 0; font-size:11px; color:#0891b2;">
                🚇 ${loc.nearestTransit}
              </p>
            ` : ''}
          </div>
        `

        marker.bindPopup(popupHtml, {
          maxWidth: 260,
          className: 'tripwise-popup',
        })

        marker.on('mouseover', () => {
          marker.openPopup()
          setActive(i)
        })
        marker.on('mouseout', () => {
          marker.closePopup()
          setActive(null)
        })
        marker.on('click', () => {
          marker.openPopup()
          setActive(i)
        })

        marker.addTo(map)
        markerList.push(marker)
      })

      markersRef.current = markerList

      // Fit all markers in view
      if (valid.length > 1) {
        const bounds = L.latLngBounds(valid.map(l => [l.lat, l.lng]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
      }

      setMapReady(true)
    }

    init().catch(console.error)

    return () => {
      if (mapObj.current) {
        mapObj.current.remove()
        mapObj.current = null
        setMapReady(false)
      }
    }
  }, [])   // eslint-disable-line react-hooks/exhaustive-deps

  // Pan to marker when list item hovered
  const handleListHover = (i: number) => {
    setActive(i)
    const marker = markersRef.current[i]
    if (marker && mapObj.current) {
      mapObj.current.panTo(marker.getLatLng(), { animate: true, duration: 0.4 })
      marker.openPopup()
    }
  }

  const handleListLeave = (i: number) => {
    setActive(null)
    markersRef.current[i]?.closePopup()
  }

  if (valid.length === 0) return null

  const mapHeight = splitScreen && showList ? height : height
  const listWidth = splitScreen ? 240 : '100%'

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--bg-2)' }}
    >
      {/* Title bar */}
      {title && (
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-3)' }}
        >
          <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            {title}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {valid.length} location{valid.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Map + optional sidebar */}
      <div style={{ display: 'flex', height: mapHeight }}>

        {/* Map container */}
        <div ref={mapRef} style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 0 }} />

        {/* Sidebar list */}
        {showList && (
          <div
            style={{
              width: listWidth,
              flexShrink: 0,
              overflowY: 'auto',
              borderLeft: '1px solid var(--border)',
              background: 'var(--bg-2)',
            }}
          >
            {valid.map((loc, i) => {
              const cfg = TYPE_CONFIG[loc.type || 'custom'] || DEFAULT_CONFIG
              const isActive = active === i
              return (
                <div
                  key={i}
                  onMouseEnter={() => handleListHover(i)}
                  onMouseLeave={() => handleListLeave(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    background: isActive ? `${cfg.color}10` : 'transparent',
                    transition: 'background 0.15s ease',
                    borderLeft: isActive ? `3px solid ${cfg.color}` : '3px solid transparent',
                  }}
                >
                  {/* Number badge */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: cfg.color,
                    color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                    fontFamily: 'system-ui, sans-serif',
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0, fontSize: 12, fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {loc.name}
                    </p>
                    {loc.description && (
                      <p style={{
                        margin: '2px 0 0', fontSize: 11,
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {loc.description}
                      </p>
                    )}
                    {loc.priceHint && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: cfg.color, fontWeight: 600 }}>
                        {loc.priceHint}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Popup CSS override — injected once */}
      <style>{`
        .tripwise-popup .leaflet-popup-content-wrapper {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08);
          border: 1px solid rgba(0,0,0,0.07);
          padding: 12px 14px;
        }
        .tripwise-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.5;
        }
        .tripwise-popup .leaflet-popup-tip {
          background: #ffffff;
          box-shadow: none;
        }
        .tripwise-popup .leaflet-popup-close-button {
          color: #6b7280 !important;
          font-size: 18px !important;
          top: 6px !important;
          right: 8px !important;
        }
        .tripwise-popup .leaflet-popup-close-button:hover {
          color: #1a1a2e !important;
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.75) !important;
          backdrop-filter: blur(4px);
        }
        .leaflet-control-zoom a {
          background: #fff !important;
          color: #1a1a2e !important;
          border-color: rgba(0,0,0,0.12) !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #f3f4f6 !important;
        }
      `}</style>
    </div>
  )
}