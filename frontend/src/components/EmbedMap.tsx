'use client'
import { useState, useEffect, useRef } from 'react'
import { ExternalLink, Navigation, MapPin, AlertCircle } from 'lucide-react'

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
  badge?: string
  cost?: string
  time?: string
  number?: number   // day order number shown on pin
}

interface EmbedMapProps {
  locations: MapLocation[]
  height?: number
  title?: string
  showList?: boolean
  splitScreen?: boolean
  highlightIdx?: number
}

const TYPE_CONFIG: Record<string, { color: string; bg: string; border: string; emoji: string; label: string; pinColor: string }> = {
  hotel:      { color: '#c9a84c', bg: 'rgba(201,168,76,0.12)',  border: 'rgba(201,168,76,0.35)',  emoji: '🏨', label: 'Hotels',      pinColor: '#c9a84c' },
  airport:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', emoji: '✈️', label: 'Airport',     pinColor: '#a78bfa' },
  transit:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.35)',  emoji: '🚇', label: 'Metro/Rail',  pinColor: '#60a5fa' },
  bus:        { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.35)',  emoji: '🚌', label: 'Bus',         pinColor: '#34d399' },
  transport:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', emoji: '🚍', label: 'Transit',     pinColor: '#a78bfa' },
  attraction: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)',  emoji: '🏛', label: 'Attractions', pinColor: '#3b82f6' },
  activity:   { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.35)', emoji: '⭐', label: 'Activities',  pinColor: '#f472b6' },
  restaurant: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  emoji: '🍜', label: 'Food',        pinColor: '#f59e0b' },
}
const DEFAULT_CFG = TYPE_CONFIG.attraction

function getCfg(type?: string) { return TYPE_CONFIG[type || ''] || DEFAULT_CFG }

function buildGoogleUrl(locs: MapLocation[], idx: number | null): string {
  const valid = locs.filter(l => l.lat && l.lng)
  if (!valid.length) return '#'
  if (idx !== null && valid[idx]) return `https://www.google.com/maps/search/?api=1&query=${valid[idx].lat},${valid[idx].lng}`
  if (valid.length === 1) return `https://www.google.com/maps/search/?api=1&query=${valid[0].lat},${valid[0].lng}`
  return `https://www.google.com/maps/dir/${valid.map(l => `${l.lat},${l.lng}`).join('/')}`
}

// Leaflet interactive map rendered via HTML string in iframe
function buildLeafletHTML(locations: MapLocation[], activeIdx: number | null): string {
  const valid = locations.filter(l => l.lat && l.lng && l.lat !== 0 && l.lng !== 0)
  if (!valid.length) return ''

  const centerLat = valid.reduce((s, l) => s + l.lat, 0) / valid.length
  const centerLng = valid.reduce((s, l) => s + l.lng, 0) / valid.length

  const markersJS = valid.map((loc, i) => {
    const cfg = getCfg(loc.type)
    const isActive = activeIdx === i
    const label = loc.number ? String(loc.number) : cfg.emoji
    const pinBg = cfg.pinColor
    const size = isActive ? 42 : 36
    const borderWidth = isActive ? 3 : 2
    const popupCost = loc.priceHint ? `<div style="color:#c9a84c;font-weight:700;font-size:13px;margin-top:2px">${loc.priceHint}</div>` : ''
    const popupTime = loc.time ? `<div style="color:#888;font-size:11px">${loc.time}</div>` : ''
    const popupDist = loc.distance ? `<div style="color:#888;font-size:11px">📍 ${loc.distance}</div>` : ''
    const popupTransit = loc.nearestTransit ? `<div style="color:#60a5fa;font-size:11px">🚇 ${loc.nearestTransit}</div>` : ''
    const popupBadge = loc.badge ? `<div style="background:rgba(201,168,76,0.2);color:#c9a84c;font-size:10px;padding:2px 6px;border-radius:4px;display:inline-block;font-weight:700;margin-top:3px">${loc.badge}</div>` : ''

    return `
      var icon${i} = L.divIcon({
        html: '<div style="background:${pinBg};color:white;width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:${borderWidth}px solid rgba(255,255,255,0.9);box-shadow:0 3px 12px rgba(0,0,0,0.4);font-size:${loc.number ? 13 : 16}px;font-weight:700"><span style="transform:rotate(45deg)">${label}</span></div>',
        className:'',
        iconSize:[${size},${size}],
        iconAnchor:[${size/2},${size}],
        popupAnchor:[0,-${size}]
      });
      var m${i} = L.marker([${loc.lat},${loc.lng}],{icon:icon${i}}).addTo(map);
      m${i}.bindPopup('<div style="min-width:160px;max-width:220px;font-family:sans-serif">' +
        '<div style="font-weight:700;font-size:14px;color:#1a1a2e;line-height:1.3">${loc.name.replace(/'/g, "\\'")}</div>' +
        '${popupTime}${popupCost}${popupDist}${popupTransit}${popupBadge}' +
        (${JSON.stringify(loc.description || '')} ? '<div style="color:#555;font-size:12px;margin-top:4px">${(loc.description || '').replace(/'/g, "\\'")}</div>' : '') +
        '</div>',{maxWidth:240,className:'tw-popup'});
      ${isActive ? `m${i}.openPopup();` : ''}
    `
  }).join('\n')

  // Auto-fit bounds
  const boundsJS = `
    var bounds = L.latLngBounds([${valid.map(l => `[${l.lat},${l.lng}]`).join(',')}]);
    map.fitBounds(bounds, {padding:[32,32]});
  `

  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"/>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;background:#0a0f1e}
  .leaflet-popup-content-wrapper{background:#1a2035;border:1px solid rgba(255,255,255,0.12);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5);color:#e8e6f0;padding:0}
  .leaflet-popup-content{margin:12px 14px;color:#e8e6f0}
  .leaflet-popup-tip{background:#1a2035}
  .leaflet-popup-close-button{color:#888!important;top:8px!important;right:10px!important;font-size:18px!important}
  .leaflet-tile-container img{filter:brightness(0.85) saturate(1.1)}
  .leaflet-control-zoom a{background:#1a2035!important;color:#e8e6f0!important;border-color:rgba(255,255,255,0.12)!important}
  .leaflet-control-attribution{background:rgba(15,20,40,0.75)!important;color:#666!important;font-size:9px!important}
  .leaflet-control-attribution a{color:#888!important}
</style>
</head><body>
<div id="map"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script>
  var map = L.map('map',{center:[${centerLat},${centerLng}],zoom:13,zoomControl:true,attributionControl:true});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
    attribution:'&copy; <a href="https://carto.com">CARTO</a>',
    subdomains:'abcd',maxZoom:19
  }).addTo(map);
  ${markersJS}
  ${valid.length > 1 ? boundsJS : `map.setView([${valid[0].lat},${valid[0].lng}],15);`}
  // Route polyline for itinerary (attraction/activity/restaurant types in order)
  var routePts = [${valid.filter(l=>['attraction','activity','restaurant'].includes(l.type||'')).map(l=>`[${l.lat},${l.lng}]`).join(',')}];
  if(routePts.length>1){
    L.polyline(routePts,{color:'rgba(201,168,76,0.6)',weight:2.5,dashArray:'6,6'}).addTo(map);
  }
</script>
</body></html>`
}

export default function EmbedMap({ locations, height = 420, title, showList = true, splitScreen = true, highlightIdx }: EmbedMapProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(highlightIdx ?? null)
  const [htmlSrc, setHtmlSrc] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const valid = locations.filter(l => l.lat && l.lng && l.lat !== 0 && l.lng !== 0)

  useEffect(() => {
    const html = buildLeafletHTML(valid, activeIdx)
    if (html) setHtmlSrc('data:text/html;charset=utf-8,' + encodeURIComponent(html))
  }, [activeIdx, JSON.stringify(valid)])

  if (!valid.length) return null

  // Group by type for sidebar
  const typeOrder = ['hotel','airport','transit','bus','transport','attraction','activity','restaurant']
  const groups: Record<string, (MapLocation & {_idx:number})[]> = {}
  valid.forEach((l,i) => {
    const k = l.type || 'attraction'
    if (!groups[k]) groups[k] = []
    groups[k].push({...l, _idx: i})
  })
  const sortedKeys = Object.keys(groups).sort((a,b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
  const googleUrl = buildGoogleUrl(valid, activeIdx)
  const focused = activeIdx !== null ? valid[activeIdx] : null

  return (
    <div className="rounded-2xl overflow-hidden" style={{border:'1px solid rgba(201,168,76,0.2)',background:'var(--bg-2)'}}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3"
        style={{background:'var(--bg-3)',borderBottom:'1px solid var(--border)'}}>
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 flex-shrink-0" style={{color:'var(--gold)'}}/>
          <span className="text-sm font-semibold truncate" style={{color:'var(--text-primary)'}}>{title||'Map'}</span>
          <span className="text-xs flex-shrink-0" style={{color:'var(--text-muted)'}}>· {valid.length} location{valid.length!==1?'s':''}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeIdx!==null&&(
            <button onClick={()=>setActiveIdx(null)}
              className="text-xs px-2.5 py-1 rounded-lg"
              style={{background:'var(--bg-4)',color:'var(--text-muted)',border:'1px solid var(--border)'}}>
              Show all
            </button>
          )}
          <a href={googleUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
            style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.2)',color:'var(--gold-light)'}}>
            <Navigation className="w-3 h-3"/>
            {focused?'Directions':'Open in Maps'}
          </a>
        </div>
      </div>

      {/* SPLIT BODY */}
      <div className={splitScreen?'flex flex-col md:flex-row':'flex flex-col'} style={{minHeight:height}}>

        {/* MAP — 60% */}
        <div className="relative" style={{flex:splitScreen?'0 0 60%':'1',minHeight:height,maxWidth:splitScreen?'60%':'100%'}}>
          {htmlSrc ? (
            <iframe
              ref={iframeRef}
              src={htmlSrc}
              style={{width:'100%',height:height,border:'none',display:'block'}}
              title={title||'Map'}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center" style={{height,background:'var(--bg-3)'}}>
              <AlertCircle className="w-6 h-6" style={{color:'var(--text-muted)'}}/>
            </div>
          )}
        </div>

        {/* SIDEBAR — 40% */}
        {showList&&(
          <div className="overflow-y-auto" style={{
            flex:splitScreen?'0 0 40%':'1',
            maxHeight:height,
            borderLeft:splitScreen?'1px solid var(--border)':'none',
            borderTop:splitScreen?'none':'1px solid var(--border)',
            background:'var(--bg-2)',
          }}>
            {sortedKeys.map(typeKey=>{
              const cfg = getCfg(typeKey)
              const items = groups[typeKey]
              return (
                <div key={typeKey}>
                  <div className="sticky top-0 z-10 px-3 py-2 flex items-center gap-2"
                    style={{background:'var(--bg-3)',borderBottom:'1px solid var(--border)'}}>
                    <span className="text-sm">{cfg.emoji}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{color:cfg.color}}>
                      {cfg.label} ({items.length})
                    </span>
                  </div>
                  <div className="p-2 space-y-1">
                    {items.map(loc=>{
                      const isActive = activeIdx===loc._idx
                      return (
                        <button key={loc._idx} onClick={()=>setActiveIdx(isActive?null:loc._idx)}
                          className="w-full text-left p-3 rounded-xl transition-all"
                          style={{
                            background:isActive?cfg.bg:'transparent',
                            border:`1px solid ${isActive?cfg.border:'transparent'}`,
                          }}>
                          <div className="flex items-start gap-2.5">
                            {/* Numbered/emoji pin chip */}
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm"
                              style={{background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}`}}>
                              {loc.number||cfg.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-semibold leading-tight" style={{color:'var(--text-primary)'}}>{loc.name}</p>
                                {loc.badge&&(
                                  <span className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                                    style={{background:'rgba(201,168,76,0.15)',color:'#c9a84c',fontSize:'9px'}}>
                                    {loc.badge}
                                  </span>
                                )}
                              </div>
                              {loc.time&&<p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>🕐 {loc.time}</p>}
                              {loc.priceHint&&<p className="text-xs font-semibold" style={{color:'#c9a84c'}}>{loc.priceHint}</p>}
                              {loc.distance&&<p className="text-xs" style={{color:'var(--text-muted)'}}>📍 {loc.distance}</p>}
                              {loc.distanceFromAirport&&<p className="text-xs" style={{color:'var(--text-muted)'}}>✈ {loc.distanceFromAirport} from airport</p>}
                              {loc.nearestTransit&&<p className="text-xs" style={{color:'#60a5fa'}}>🚇 {loc.nearestTransit}</p>}
                              {isActive&&loc.description&&<p className="text-xs mt-1 leading-relaxed" style={{color:'var(--text-secondary)'}}>{loc.description}</p>}
                            </div>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                              target="_blank" rel="noopener noreferrer"
                              onClick={e=>e.stopPropagation()}
                              className="p-1.5 rounded-lg flex-shrink-0 opacity-50 hover:opacity-100"
                              style={{background:'var(--bg-4)',color:'var(--text-muted)'}}>
                              <Navigation className="w-3 h-3"/>
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
