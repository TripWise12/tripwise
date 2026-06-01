'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  Plane, MapPin, Cloud, Shield, CreditCard, Smartphone, Plug, History,
  Check, ChevronRight, ChevronDown, ChevronUp, Clock,
  Package, Bookmark, Phone, Edit3, Share2, Utensils, Car,
  Hotel, ArrowRight, X, Loader2, RefreshCw, Plus, Info,
  Zap, Star, AlertTriangle, Sun, CloudRain, Wind,
  Calendar, Music, Flag, Download, ExternalLink, Lightbulb,
  Train, Bus, Landmark, Coffee, Home, Navigation
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import EmbedMap from '@/components/EmbedMap'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const TABS = ['Overview','Itinerary','Transport','Hotels','Packing','Budget','Group']

function HotelsTab({tripData,itinerary}:{tripData:Record<string,unknown>,itinerary:any}) {
  const [hotels,setHotels] = useState<Record<string,unknown>|null>(null)
  const [loading,setLoading] = useState(false)
  const [filter,setFilter] = useState<'all'|'budget'|'mid-range'|'luxury'>('all')
  const [sortBy,setSortBy] = useState<'price'|'rating'>('rating')

  async function searchHotels() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/hotels`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          destination: (tripData.destination||itinerary?.destination||''),
          check_in: tripData.start_date,
          check_out: tripData.end_date,
          adults: tripData.group_size||2,
          stay_type: tripData.stay_type||'any',
          budget_per_night_usd: Math.round(Number(tripData.budget_usd||2000)/7/2),
        })})
      if(res.ok) setHotels(await res.json())
    } catch(e){console.error(e)} finally{setLoading(false)}
  }

  const allResults = ((hotels?.results as any[])||[])
  const filtered = allResults
    .filter(h=>filter==='all'||h.category===filter)
    .sort((a:any,b:any)=>sortBy==='price'?(a.price_per_night_usd-b.price_per_night_usd):(b.rating-a.rating))

  const areaGuide = (hotels?.area_guide as any[])||[]
  const platforms = (hotels?.comparison_platforms as any[])||[]

  return (
    <div className="space-y-4">
      {!hotels&&!loading&&(
        <div className="space-y-4">
          {/* Show destination map even before searching */}
          {(() => {
            const dest = (tripData.destination || itinerary?.destination || '') as string
            // Default coordinates for common cities
            const cityCoords: Record<string,{lat:number,lng:number}> = {
              'tokyo': {lat:35.6762,lng:139.6503},
              'singapore': {lat:1.3521,lng:103.8198},
              'bangkok': {lat:13.7563,lng:100.5018},
              'bali': {lat:-8.4095,lng:115.1889},
              'paris': {lat:48.8566,lng:2.3522},
              'london': {lat:51.5074,lng:-0.1278},
              'dubai': {lat:25.2048,lng:55.2708},
              'new york': {lat:40.7128,lng:-74.0060},
              'rome': {lat:41.9028,lng:12.4964},
              'sydney': {lat:-33.8688,lng:151.2093},
              'mumbai': {lat:19.0760,lng:72.8777},
              'delhi': {lat:28.6139,lng:77.2090},
            }
            const key = dest.toLowerCase().split(',')[0].trim()
            const coords = cityCoords[key] || {lat:35.6762,lng:139.6503}
            const bbox = `${coords.lng-0.06},${coords.lat-0.05},${coords.lng+0.06},${coords.lat+0.05}`
            return (
              <div className="rounded-2xl overflow-hidden" style={{border:'1px solid var(--border)'}}>
                <div className="px-4 py-3 flex items-center justify-between" style={{background:'var(--bg-3)',borderBottom:'1px solid var(--border)'}}>
                  <span className="text-sm font-semibold flex items-center gap-2" style={{color:'var(--text-primary)'}}>
                    <MapPin className="w-4 h-4" style={{color:'var(--gold)'}}/> Hotels area — {dest}
                  </span>
                  <a href={`https://www.google.com/maps/search/hotels+in+${encodeURIComponent(dest)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                    style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.2)',color:'var(--gold-light)'}}>
                    <ExternalLink className="w-3 h-3"/>Google Maps
                  </a>
                </div>
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
                  style={{width:'100%',height:300,border:'none'}}
                  loading="lazy"
                  title={`Map of ${dest}`}
                />
              </div>
            )
          })()}
          <div className="glass rounded-2xl p-8 text-center">
            <Hotel className="w-12 h-12 mx-auto mb-4" style={{color:'var(--text-muted)'}}/>
            <h3 className="font-display text-xl font-bold mb-2" style={{color:'var(--text-primary)'}}>Find hotels</h3>
            <p className="text-sm mb-6" style={{color:'var(--text-secondary)'}}>
              Compare local gems, boutique hotels and chains — with location maps
            </p>
            <button className="btn-primary flex items-center gap-2 mx-auto" onClick={searchHotels}>
              <Zap className="w-4 h-4"/>Search hotels
            </button>
          </div>
        </div>
      )}

      {loading&&(
        <div className="space-y-4">
          {[...Array(4)].map((_,i)=>(
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex gap-4">
                <div className="w-24 h-24 skeleton rounded-xl flex-shrink-0"/>
                <div className="flex-1 space-y-3">
                  <div className="h-5 skeleton rounded w-1/2"/>
                  <div className="h-4 skeleton rounded w-1/3"/>
                  <div className="h-3 skeleton rounded w-2/3"/>
                  <div className="flex gap-2">
                    <div className="h-6 skeleton rounded-full w-16"/>
                    <div className="h-6 skeleton rounded-full w-20"/>
                    <div className="h-6 skeleton rounded-full w-14"/>
                  </div>
                </div>
                <div className="w-24 space-y-2">
                  <div className="h-8 skeleton rounded"/>
                  <div className="h-4 skeleton rounded"/>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hotels&&!loading&&(
        <div className="space-y-4">
          {/* Area guide */}
          {areaGuide.length>0&&(
            <div className="glass rounded-2xl p-5">
              <p className="section-label mb-3">Area guide</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {areaGuide.map((area:any,i:number)=>(
                  <div key={i} className="p-3 rounded-xl" style={{background:'var(--bg-3)'}}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{area.area}</p>
                      <span className="text-xs" style={{color:'var(--gold-light)'}}>~${area.avg_price_usd}/night</span>
                    </div>
                    <p className="text-xs mb-1" style={{color:'var(--text-secondary)'}}>{area.vibe}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>{area.distance_to_center}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(area.pros||[]).map((p:string,j:number)=>(
                        <span key={j} className="text-xs px-1.5 py-0.5 rounded"
                          style={{background:'rgba(45,212,160,0.08)',color:'#2dd4a0'}}>✓ {p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotels map — split screen: hotels + nearest transit + attractions */}
          {filtered.length > 0 && (() => {
            const dest = (tripData.destination || itinerary?.destination || '') as string

            // Hotel locations with full metadata
            const hotelLocs = filtered.slice(0,8)
              .filter((h:any) => h.lat && h.lng && Number(h.lat) !== 0)
              .map((h:any,idx:number) => ({
                name: h.name,
                lat: Number(h.lat),
                lng: Number(h.lng),
                type: 'hotel' as const,
                isMain: true,
                badge: idx===0?'Best rated':idx===1&&filtered[0]?.price_per_night_usd>filtered[1]?.price_per_night_usd?'Cheapest':undefined,
                description: `$${h.price_per_night_usd}/night · ★ ${h.rating}/10`,
                distance: h.distance_to_center,
                distanceFromAirport: h.distance_from_airport,
                nearestTransit: h.nearest_transit||h.nearest_metro,
                priceHint: `$${h.price_per_night_usd}/night`,
                rating: h.rating,
              }))

            // Nearest transit hubs if available from hotels data
            const transitLocs = ((hotels?.transit_hubs as any[])||[]).slice(0,3).map((t:any)=>({
              name: t.name,
              lat: Number(t.lat),
              lng: Number(t.lng),
              type: 'transit' as const,
              description: t.lines||t.description,
              distance: t.distance_from_center,
            }))

            // Top attractions from itinerary
            const attractionLocs = (itinerary?.days || []).slice(0, 2)
              .flatMap((d:any) => (d.slots || []))
              .filter((s:any) => s.lat && s.lng && Number(s.lat) !== 0 && s.type !== 'transport')
              .slice(0, 5)
              .map((s:any) => ({
                name: s.title,
                lat: Number(s.lat),
                lng: Number(s.lng),
                type: 'attraction' as const,
                description: s.location,
              }))

            const allMapLocs = [...hotelLocs, ...transitLocs, ...attractionLocs]

            return allMapLocs.length === 0 ? (
              <div className="glass rounded-2xl p-4 mb-4 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2" style={{color:'var(--text-muted)'}}/>
                <p className="text-sm" style={{color:'var(--text-muted)'}}>Map loads once hotels have location data</p>
                <a href={`https://www.google.com/maps/search/hotels+in+${encodeURIComponent(dest)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs mt-2 inline-flex items-center gap-1" style={{color:'var(--gold-light)'}}>
                  <ExternalLink className="w-3 h-3"/>Search on Google Maps
                </a>
              </div>
            ) : (
              <div className="mb-4">
                <EmbedMap
                  locations={allMapLocs}
                  title={`Hotels, transit & attractions — ${dest}`}
                  height={420}
                  showList={true}
                  splitScreen={true}
                />
              </div>
            )
          })()}

          {/* Filters + sort */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1">
              {(['all','budget','mid-range','luxury'] as const).map(f=>(
                <button key={f} onClick={()=>setFilter(f)}
                  className={`day-tab text-xs ${filter===f?'active':''}`}>
                  {f.charAt(0).toUpperCase()+f.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-1 ml-auto">
              <span className="text-xs self-center" style={{color:'var(--text-muted)'}}>Sort:</span>
              {(['rating','price'] as const).map(s=>(
                <button key={s} onClick={()=>setSortBy(s)}
                  className={`day-tab text-xs ${sortBy===s?'active':''}`}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Hotel cards */}
          {filtered.map((h:any,i:number)=>(
            <div key={i} className="glass feature-card rounded-2xl p-5 hover-lift">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {h.badge&&<span className="badge badge-gold">{h.badge}</span>}
                    <span className="badge" style={{
                      background:h.chain_or_local==='local'?'rgba(74,127,212,0.12)':'rgba(167,139,250,0.12)',
                      color:h.chain_or_local==='local'?'#7aa8e8':'#a78bfa'
                    }}>{h.chain_or_local==='local'?'Local':'Chain'}</span>
                    {h.free_cancellation&&<span className="badge badge-green">Free cancel</span>}
                    {h.breakfast_included&&<span className="badge badge-amber">Breakfast incl.</span>}
                  </div>
                  <h3 className="font-semibold text-lg" style={{color:'var(--text-primary)'}}>{h.name}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs" style={{color:'var(--text-muted)'}}>📍 {h.area}</span>
                    <span className="text-xs" style={{color:'var(--text-muted)'}}>{h.distance_to_center}</span>
                    {h.nearby_metro&&<span className="text-xs" style={{color:'#60a5fa'}}>🚇 {h.nearby_metro}</span>}
                  </div>
                  {h.distance_to_main_attraction&&(
                    <p className="text-xs mt-1" style={{color:'var(--text-secondary)'}}>🏛 {h.distance_to_main_attraction}</p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg"
                      style={{background:'rgba(201,168,76,0.1)'}}>
                      <span className="font-bold text-sm" style={{color:'var(--gold)'}}>{h.rating}</span>
                      <span className="text-xs" style={{color:'var(--text-muted)'}}>/ 10</span>
                    </div>
                    <span className="text-xs font-medium" style={{color:'var(--text-secondary)'}}>{h.rating_label}</span>
                    {h.reviews_count&&<span className="text-xs" style={{color:'var(--text-muted)'}}>({h.reviews_count.toLocaleString()} reviews)</span>}
                    <div className="flex gap-0.5">
                      {[...Array(h.stars||0)].map((_,j)=>(
                        <span key={j} className="text-xs" style={{color:'var(--gold)'}}>★</span>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm mt-2" style={{color:'var(--text-secondary)'}}>{h.why_recommended}</p>

                  {/* Amenities */}
                  {(h.amenities||[]).length>0&&(
                    <div className="flex flex-wrap gap-1 mt-2">
                      {h.amenities.map((a:string,j:number)=>(
                        <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                          style={{background:'var(--bg-4)',color:'var(--text-muted)'}}>{a}</span>
                      ))}
                    </div>
                  )}

                  {/* Map link */}
                  {h.google_maps_search&&(
                    <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.google_maps_search)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs mt-2"
                      style={{color:'#60a5fa'}}>
                      <MapPin className="w-3 h-3"/>View on Google Maps
                    </a>
                  )}
                </div>

                {/* Price + book */}
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-2xl" style={{color:'var(--text-primary)'}}>
                    ${h.price_per_night_usd}
                  </p>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>per night</p>
                  <p className="text-sm font-semibold mt-1" style={{color:'var(--gold-light)'}}>
                    ${h.total_usd} total
                  </p>
                  <a href={h.booking_link||'https://www.booking.com'}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 btn-primary text-sm py-2 px-4">
                    Book <ExternalLink className="w-3 h-3"/>
                  </a>
                </div>
              </div>

              {/* Compare links */}
              {(h.compare_links||[]).length>0&&(
                <div className="mt-3 pt-3 flex flex-wrap gap-2" style={{borderTop:'1px solid var(--border)'}}>
                  <span className="text-xs self-center" style={{color:'var(--text-muted)'}}>Compare:</span>
                  {h.compare_links.map((link:any,j:number)=>(
                    <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover-lift"
                      style={{background:'var(--bg-3)',border:'1px solid var(--border)',color:'var(--text-secondary)'}}>
                      <ExternalLink className="w-3 h-3"/>{link.platform}
                      {link.note&&<span style={{color:'var(--text-muted)'}}>· {link.note}</span>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Platform comparison — always shown, intelligently annotated */}
          {(() => {
            const dest = (tripData.destination || itinerary?.destination || '') as string
            const checkin = String(tripData.start_date||'')
            const checkout = String(tripData.end_date||'')
            const guests = Number(tripData.adults||tripData.group_size||2)
            const defaultPlatforms = [
              {name:'Booking.com',  note:'Largest inventory, free cancellation', best_for:'Most choice',  color:'rgba(0,100,200,0.1)', border:'rgba(0,100,200,0.25)', url:`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}&checkin=${checkin}&checkout=${checkout}&group_adults=${guests}`},
              {name:'Agoda',        note:'Best for Asia, loyalty discounts',      best_for:'Asia deals',   color:'rgba(220,40,40,0.1)',  border:'rgba(220,40,40,0.25)', url:`https://www.agoda.com/search?city=${encodeURIComponent(dest)}&checkIn=${checkin}&checkOut=${checkout}&adults=${guests}`},
              {name:'Hotels.com',   note:'10 nights = 1 free night rewards',     best_for:'Rewards',      color:'rgba(200,60,0,0.1)',   border:'rgba(200,60,0,0.25)', url:`https://www.hotels.com/search.do?q-destination=${encodeURIComponent(dest)}&q-check-in=${checkin}&q-check-out=${checkout}&q-rooms=1&q-room-0-adults=${guests}`},
              {name:'Expedia',      note:'Bundle with flights to save 15%+',     best_for:'Flight bundle',color:'rgba(0,170,240,0.1)',  border:'rgba(0,170,240,0.25)', url:`https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(dest)}&startDate=${checkin}&endDate=${checkout}&adults=${guests}`},
              {name:'Hostelworld',  note:'Best budget & hostel options',          best_for:'Budget',       color:'rgba(100,180,60,0.1)', border:'rgba(100,180,60,0.25)', url:`https://www.hostelworld.com/search?search_keywords=${encodeURIComponent(dest)}&dateFrom=${checkin}&dateTo=${checkout}&number_of_guests=${guests}`},
              {name:'Direct',       note:'Book hotel site directly — often cheaper', best_for:'No fees', color:'rgba(201,168,76,0.1)', border:'rgba(201,168,76,0.25)', url:`https://www.google.com/search?q=hotels+in+${encodeURIComponent(dest)}+official+website`},
            ]
            const toShow = platforms.length > 0 ? platforms : defaultPlatforms
            return (
              <div className="glass rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="section-label">📊 Where to book · cheapest first</p>
                  <span className="text-xs px-2 py-0.5 rounded" style={{background:'rgba(45,212,160,0.1)',color:'#2dd4a0'}}>
                    Compare before booking
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {toShow.map((p:any,i:number)=>(
                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl hover-lift"
                      style={{background:p.color||'var(--bg-3)',border:`1px solid ${p.border||'var(--border)'}`}}>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate" style={{color:'var(--text-primary)'}}>{p.name}</p>
                        <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{p.note||p.best_for||''}</p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 ml-1 flex-shrink-0" style={{color:'var(--text-muted)'}}/>
                    </a>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{color:'var(--text-muted)'}}>
                  💡 Pro tip: Check 2-3 platforms + the hotel's own website. Direct booking often beats OTAs by 5-15%.
                </p>
              </div>
            )
          })()}

          {(hotels.booking_tips as string[]||[]).length>0&&(
            <div className="glass-gold rounded-xl p-4">
              <p className="section-label mb-2">Booking tips</p>
              {(hotels.booking_tips as string[]).map((t:string,i:number)=>(
                <div key={i} className="flex items-start gap-2 mb-1">
                  <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{background:'var(--gold)'}}/>
                  <p className="text-xs" style={{color:'var(--gold-light)'}}>{t}</p>
                </div>
              ))}
            </div>
          )}

          <button className="btn-secondary w-full" onClick={searchHotels}>
            <RefreshCw className="w-4 h-4 inline mr-2"/>Refresh results
          </button>
        </div>
      )}
    </div>
  )
}



// ── TYPES ──
interface Slot {
  time:string; duration_mins:number; type:string; title:string;
  location:string; lat?:number; lng?:number; notes:string;
  cost_usd:number; cost_local?:number; local_currency?:string;
  booking_required:boolean; booking_link?:string; ticket_link?:string;
  book_days_ahead?:number; pro_tip?:string; what_to_wear?:string;
}
interface Day {
  day:number; date:string; theme:string; day_tip?:string;
  slots:Slot[]; day_total_usd:number; free_time_note?:string;
  rainy_backup:string; rainy_backup_link?:string;
}
interface Viability {
  overall_verdict:string; overall_reason:string; weather_summary:string;
  temperature_min:number; temperature_max:number; crowd_level:string;
  price_vs_average:string; visa_type:string; visa_cost_local_currency:number;
  visa_cost_usd:number; visa_processing_days:number; visa_docs:string[];
  visa_link?:string; visa_apply_link?:string;
  currency:string; exchange_rate_from_origin:string; best_money_method:string;
  sim_recommendation:string; power_socket:string; adapter_needed:boolean;
  tipping_culture:string; safety_level:string; safety_notes:string;
  travel_advisory:string; travel_advisory_link?:string;
  areas_to_avoid:{area:string;reason:string;severity:string}[];
  language_phrases:{phrase:string;local:string;phonetic:string}[];
  festivals_and_events:{name:string;date:string;type:string;description:string;tip:string}[];
  daily_weather_forecast:{date:string;condition:string;temp_min:number;temp_max:number;rain_chance:number;humidity:number;wind:string;icon:string}[];
  page_tips:{overview:string[];itinerary:string[];packing:string[];budget:string[]};
  emergency_info:Record<string,string>;
  nearby_countries_to_combine:{country:string;city:string;extra_days:number;extra_cost_usd:number;reason:string}[];
}
interface Itinerary {
  destination:string; days:Day[];
  accommodation:{recommended_area:string;reason:string;options:{type:string;name:string;area:string;price_per_night_usd:number;total_usd:number;rating:number;why:string;booking_link:string;amenities:string[]}[]};
  local_transport:{primary_recommendation:string;reason:string;cost_for_trip_usd:number;daily_cost_usd:number;how_to_get:string;official_link?:string;airport_transfer?:{recommendation:string;cost_usd:number;duration_mins:number;from:string;link?:string}};
  food_guide:{must_try:string[];vegetarian_options:string[];budget_per_meal_usd:number;food_safety_tips:string[];avoid?:string[]};
  packing_list:Record<string,{item:string;essential:boolean;reason:string}[]>;
  budget_summary:{flights_usd:number;accommodation_usd:number;food_usd:number;transport_usd:number;activities_usd:number;sim_usd:number;misc_usd:number;total_usd:number;per_person_usd:number;budget_tips:string[]};
  advance_bookings:{item:string;why_book_ahead:string;book_by:string;link:string;cost_usd:number;required:boolean}[];
  emergency_info:Record<string,string>;
}

// ── HELPERS ──
function VerdictBadge({text}:{text?:string}) {
  if(!text) return null
  const pos = ['Very Safe','Safe','Great','Good','Low','Cheap','Free'].some(w=>text.includes(w))
  const warn = ['Okay','Medium','Moderate','Exercise','Caution'].some(w=>text.includes(w))
  return <span className={`badge ${pos?'badge-green':warn?'badge-amber':'badge-red'}`}>{text}</span>
}

function Section({title,icon:Icon,children,defaultOpen=true,tip}:{title:string;icon?:React.ComponentType<{className?:string;style?:React.CSSProperties}>;children:React.ReactNode;defaultOpen?:boolean;tip?:string}) {
  const [open,setOpen] = useState(defaultOpen)
  return (
    <div className="glass rounded-2xl overflow-hidden mb-4">
      <button className="w-full flex items-center justify-between p-5" onClick={()=>setOpen(!open)}>
        <div className="flex items-center gap-2">
          {Icon&&<Icon className="w-4 h-4" style={{color:'var(--gold)'}} />}
          <span className="font-semibold" style={{color:'var(--text-primary)'}}>{title}</span>
        </div>
        {open?<ChevronUp className="w-4 h-4" style={{color:'var(--text-muted)'}} />:<ChevronDown className="w-4 h-4" style={{color:'var(--text-muted)'}} />}
      </button>
      {open&&(
        <div className="px-5 pb-5">
          {tip&&(
            <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{background:'rgba(201,168,76,0.07)',border:'1px solid rgba(201,168,76,0.15)'}}>
              <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{color:'var(--gold)'}} />
              <p className="text-xs" style={{color:'var(--gold-light)'}}>{tip}</p>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  )
}

function TipsBox({tips}:{tips?:string[]}) {
  if(!tips||tips.length===0) return null
  return (
    <div className="glass-gold rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4" style={{color:'var(--gold)'}} />
        <span className="text-xs font-semibold tracking-wide" style={{color:'var(--gold-light)'}}>TIPS FOR THIS SECTION</span>
      </div>
      <div className="space-y-1.5">
        {tips.map((tip,i)=>(
          <div key={i} className="flex items-start gap-2">
            <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{background:'var(--gold)'}} />
            <p className="text-xs" style={{color:'var(--text-secondary)'}}>{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function WeatherIcon({icon,size=16}:{icon:string;size?:number}) {
  const style = {width:size,height:size}
  if(icon==='sunny'||icon==='clear') return <Sun style={{...style,color:'#fbbf24'}} />
  if(icon==='rainy'||icon==='rain') return <CloudRain style={{...style,color:'#60a5fa'}} />
  return <Cloud style={{...style,color:'#94a3b8'}} />
}

function exportToExcel(itinerary:Itinerary, viability:Viability, tripData:Record<string,unknown>) {
  const rows:string[][] = []
  rows.push(['TripWise — Trip Export'])
  rows.push([`${tripData.origin||''} → ${itinerary.destination}`])
  rows.push([`${tripData.start_date||''} to ${tripData.end_date||''}`])
  rows.push([])
  rows.push(['DAY-BY-DAY ITINERARY'])
  rows.push(['Day','Date','Theme','Time','Activity','Location','Type','Cost (USD)','Notes','Pro Tip','Booking Required','Booking Link'])
  itinerary.days.forEach(day=>{
    day.slots.forEach((slot,si)=>{
      rows.push([
        si===0?String(day.day):'',
        si===0?day.date:'',
        si===0?day.theme:'',
        slot.time,slot.title,slot.location,slot.type,
        String(slot.cost_usd||0),slot.notes||'',slot.pro_tip||'',
        slot.booking_required?'Yes':'No',slot.booking_link||slot.ticket_link||'',
      ])
    })
    rows.push(['','','','','',`Day Total: $${day.day_total_usd}`])
    if(day.rainy_backup) rows.push(['','','','','Rainy backup:',day.rainy_backup])
    rows.push([])
  })
  rows.push([])
  rows.push(['BUDGET BREAKDOWN'])
  rows.push(['Category','Amount (USD)'])
  const b = itinerary.budget_summary
  ;[['Flights',b.flights_usd],['Accommodation',b.accommodation_usd],['Food',b.food_usd],
    ['Transport',b.transport_usd],['Activities',b.activities_usd],['SIM',b.sim_usd],
    ['Miscellaneous',b.misc_usd],['TOTAL',b.per_person_usd]
  ].forEach(([k,v])=>rows.push([String(k),String(v)]))
  rows.push([])
  rows.push(['ADVANCE BOOKINGS'])
  rows.push(['Item','Book By','Cost (USD)','Required','Link'])
  itinerary.advance_bookings.forEach(b=>rows.push([b.item,b.book_by,String(b.cost_usd),b.required?'Yes':'No',b.link||'']))
  rows.push([])
  rows.push(['VISA & ENTRY'])
  rows.push(['Visa Type',viability.visa_type])
  rows.push(['Processing Days',String(viability.visa_processing_days)])
  rows.push(['Apply',viability.visa_apply_link||''])
  rows.push([])
  rows.push(['EMERGENCY CONTACTS'])
  Object.entries(itinerary.emergency_info||{}).forEach(([k,v])=>rows.push([k.replace(/_/g,' '),String(v)]))

  const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href=url; a.download=`TripWise_${itinerary.destination.replace(/\s/g,'_')}.csv`
  a.click(); URL.revokeObjectURL(url)
}

function TransportTab({tripData}:{tripData:Record<string,unknown>}) {
  const [subTab, setSubTab] = useState<'getting-there'|'local-travel'>('getting-there')
  const [transport, setTransport] = useState<Record<string,unknown>|null>(null)
  const [flights, setFlights]     = useState<Record<string,unknown>|null>(null)
  const [loadingT, setLoadingT]   = useState(false)
  const [loadingF, setLoadingF]   = useState(false)

  const orig = String(tripData.origin||'').split(',')[0].trim()
  const dest = String(tripData.destination||'').split(',')[0].trim()
  const dep  = String(tripData.start_date||'').replace(/-/g,'')
  const ret  = String(tripData.end_date||'').replace(/-/g,'')
  const adults = Number(tripData.group_size||1)

  async function loadTransport() {
    setLoadingT(true)
    try {
      const res = await fetch(`${API}/api/transport`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({origin:tripData.origin,destination:tripData.destination,
          departure_date:tripData.start_date,return_date:tripData.end_date,adults:tripData.group_size})})
      if(res.ok) setTransport(await res.json())
    }catch(e){console.error(e)}finally{setLoadingT(false)}
  }

  async function loadFlights() {
    setLoadingF(true)
    try {
      const res = await fetch(`${API}/api/flights`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({origin:tripData.origin,destination:tripData.destination,
          departure_date:tripData.start_date,return_date:tripData.end_date,adults:tripData.group_size})})
      if(res.ok) setFlights(await res.json())
    }catch(e){console.error(e)}finally{setLoadingF(false)}
  }

  const transportOptions = (transport?.options as any[])||[]
  const localT = transport?.local_transport_at_destination as any
  const flightResults = (flights?.results as any[])||[]

  // Determine cheapest + fastest from transport options
  const available = transportOptions.filter((o:any)=>o.available!==false)
  const cheapest  = available.reduce((best:any,o:any)=>(!best||o.price_from_usd<best.price_from_usd)?o:best, null)
  const fastest   = available.reduce((best:any,o:any)=>{
    const mins = (s:string)=>{const m=s?.match(/(\d+)h\s*(\d+)?m?/);return m?Number(m[1])*60+Number(m[2]||0):9999}
    return(!best||mins(o.duration)<mins(best.duration))?o:best
  }, null)

  // Build booking platform URLs for flights
  const flightPlatforms = [
    {name:'Skyscanner',  note:'Best overall',         color:'rgba(0,134,195,0.1)', border:'rgba(0,134,195,0.25)',  url:`https://www.skyscanner.com/transport/flights/${orig.toLowerCase().replace(/\s/g,'')}/${dest.toLowerCase().replace(/\s/g,'')}/${dep}/${ret}/?adults=${adults}`},
    {name:'Google Flights', note:'Price alerts',      color:'rgba(66,133,244,0.1)', border:'rgba(66,133,244,0.25)', url:`https://flights.google.com/search?q=flights+from+${encodeURIComponent(orig)}+to+${encodeURIComponent(dest)}`},
    {name:'Kiwi.com',    note:'Cheapest multi-stop',  color:'rgba(0,200,150,0.1)', border:'rgba(0,200,150,0.25)',  url:`https://www.kiwi.com/en/search/results/${orig.toLowerCase()}/${dest.toLowerCase()}/${dep}/${ret}`},
    {name:'Kayak',       note:'Flexible dates',       color:'rgba(255,111,0,0.1)', border:'rgba(255,111,0,0.25)', url:`https://www.kayak.com/flights/${orig.replace(/\s/g,'-')}-${dest.replace(/\s/g,'-')}/${dep}/${ret}/${adults}adults`},
    {name:'Momondo',     note:'Hidden deals',         color:'rgba(255,87,34,0.1)', border:'rgba(255,87,34,0.25)', url:`https://www.momondo.com/flight-search/${orig}/${dest}/${dep}/${ret}`},
    {name:'Expedia',     note:'Bundle + hotel',       color:'rgba(0,170,240,0.1)', border:'rgba(0,170,240,0.25)', url:`https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from:${orig},to:${dest},departure:${dep}`},
  ]

  return (
    <div className="space-y-4">
      {/* Sub-tab switcher */}
      <div className="flex gap-2 p-1 rounded-xl" style={{background:'var(--bg-3)', border:'1px solid var(--border)'}}>
        {([['getting-there','🛫 How to Get There'], ['local-travel','🚇 Local Travel']] as const).map(([key,label])=>(
          <button key={key} onClick={()=>setSubTab(key)}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all"
            style={{
              background: subTab===key ? 'var(--bg-1)' : 'transparent',
              color: subTab===key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: subTab===key ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ───────────── HOW TO GET THERE ───────────── */}
      {subTab==='getting-there'&&(
        <div className="space-y-4">
          {/* Intelligence banner: cheapest + fastest */}
          {(cheapest||fastest)&&(
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cheapest&&(
                <div className="rounded-xl p-4 flex items-start gap-3"
                  style={{background:'rgba(45,212,160,0.06)',border:'1px solid rgba(45,212,160,0.2)'}}>
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{color:'#2dd4a0'}}>Cheapest Route</p>
                    <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{cheapest.title}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>From <span style={{color:'#2dd4a0'}}>${cheapest.price_from_usd}</span> · {cheapest.duration}</p>
                  </div>
                </div>
              )}
              {fastest&&fastest!==cheapest&&(
                <div className="rounded-xl p-4 flex items-start gap-3"
                  style={{background:'rgba(96,165,250,0.06)',border:'1px solid rgba(96,165,250,0.2)'}}>
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{color:'#60a5fa'}}>Fastest Route</p>
                    <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{fastest.title}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>From <span style={{color:'#60a5fa'}}>${fastest.price_from_usd}</span> · {fastest.duration}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!transport&&!loadingT&&(
            <div className="glass rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="font-display text-xl font-bold mb-2" style={{color:'var(--text-primary)'}}>All ways to get from {orig} → {dest}</h3>
              <p className="text-sm mb-6" style={{color:'var(--text-secondary)'}}>
                Flights, trains, buses, road trips — compared by price, speed, and comfort. We'll tell you the cheapest platform to book from.
              </p>
              <button className="btn-primary flex items-center gap-2 mx-auto" onClick={loadTransport}>
                <Zap className="w-4 h-4"/>Compare all options
              </button>
            </div>
          )}

          {loadingT&&(
            <div className="space-y-3">
              {[...Array(4)].map((_,i)=>(
                <div key={i} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 skeleton rounded-xl"/>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton rounded w-1/3"/>
                      <div className="h-3 skeleton rounded w-1/2"/>
                    </div>
                    <div className="w-20 h-8 skeleton rounded"/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {transport&&!loadingT&&(
            <div className="space-y-3">
              {transport.recommended_reason&&(
                <div className="glass-gold rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" style={{color:'var(--gold)'}}/>
                    <p className="text-sm" style={{color:'var(--gold-light)'}}>{transport.recommended_reason as string}</p>
                  </div>
                </div>
              )}

              {/* Transport option cards */}
              {available.map((opt:any,i:number)=>{
                const isCheapest = opt===cheapest
                const isFastest  = opt===fastest&&opt!==cheapest
                return (
                  <div key={i} className="glass feature-card rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-2xl">{opt.mode_icon}</span>
                          <span className="font-semibold" style={{color:'var(--text-primary)'}}>{opt.title}</span>
                          {isCheapest&&<span className="badge" style={{background:'rgba(45,212,160,0.15)',color:'#2dd4a0',border:'1px solid rgba(45,212,160,0.3)'}}>💰 Cheapest</span>}
                          {isFastest&&<span className="badge" style={{background:'rgba(96,165,250,0.15)',color:'#60a5fa',border:'1px solid rgba(96,165,250,0.3)'}}>⚡ Fastest</span>}
                          {opt.badge&&!isCheapest&&!isFastest&&<span className="badge badge-gold">{opt.badge}</span>}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap mb-3">
                          {opt.duration&&<span className="text-sm" style={{color:'var(--text-secondary)'}}>⏱ {opt.duration}</span>}
                          {opt.price_from_usd&&<span className="text-sm font-semibold" style={{color:'var(--gold-light)'}}>From ${opt.price_from_usd}</span>}
                          {opt.price_to_usd&&<span className="text-sm" style={{color:'var(--text-muted)'}}>– ${opt.price_to_usd}</span>}
                        </div>
                        {(opt.pros||[]).length>0&&(
                          <div className="flex flex-wrap gap-1 mb-2">
                            {opt.pros.map((p:string,j:number)=>(
                              <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                                style={{background:'rgba(45,212,160,0.1)',color:'#2dd4a0'}}>✓ {p}</span>
                            ))}
                          </div>
                        )}
                        {(opt.cons||[]).length>0&&(
                          <div className="flex flex-wrap gap-1 mb-2">
                            {opt.cons.map((c:string,j:number)=>(
                              <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                                style={{background:'rgba(244,63,94,0.08)',color:'#fb7185'}}>✗ {c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Comfort + eco */}
                      <div className="text-right flex-shrink-0 space-y-1.5">
                        {opt.comfort&&(
                          <div className="flex items-center gap-1 justify-end">
                            {[...Array(5)].map((_,k)=>(
                              <div key={k} className="w-2 h-2 rounded-full" style={{background:k<opt.comfort?'var(--gold)':'var(--bg-4)'}}/>
                            ))}
                            <span className="text-xs ml-1" style={{color:'var(--text-muted)'}}>comfort</span>
                          </div>
                        )}
                        {opt.eco_score&&(
                          <div className="flex items-center gap-1 justify-end">
                            {[...Array(5)].map((_,k)=>(
                              <div key={k} className="w-2 h-2 rounded-full" style={{background:k<opt.eco_score?'#2dd4a0':'var(--bg-4)'}}/>
                            ))}
                            <span className="text-xs ml-1" style={{color:'var(--text-muted)'}}>eco</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Platform comparison — THE KEY INTELLIGENCE */}
                    {((opt.book_platforms||[]).length>0||(opt.mode_icon==='✈️'))&&(
                      <div className="mt-3 pt-3" style={{borderTop:'1px solid var(--border)'}}>
                        <p className="text-xs font-semibold mb-2" style={{color:'var(--text-muted)'}}>
                          📊 Where to book · cheapest first
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {(opt.book_platforms?.length ? opt.book_platforms : flightPlatforms).map((p:any,j:number)=>(
                            <a key={j} href={p.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center justify-between p-2.5 rounded-xl transition-all hover-lift"
                              style={{background:p.color||'var(--bg-3)',border:`1px solid ${p.border||'var(--border)'}`}}>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate" style={{color:'var(--text-primary)'}}>{p.name}</p>
                                <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{p.note||p.why||''}</p>
                              </div>
                              <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" style={{color:'var(--text-muted)'}}/>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {(opt.tips||[]).length>0&&(
                      <div className="mt-2 space-y-1">
                        {opt.tips.map((t:string,j:number)=>(
                          <div key={j} className="flex items-start gap-2">
                            <Star className="w-3 h-3 mt-0.5 flex-shrink-0" style={{color:'var(--gold)'}}/>
                            <p className="text-xs" style={{color:'var(--text-muted)'}}>{t}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Unavailable */}
              {transportOptions.filter((o:any)=>o.available===false).map((opt:any,i:number)=>(
                <div key={i} className="glass rounded-xl p-4 opacity-40">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{opt.mode_icon}</span>
                    <span className="text-sm" style={{color:'var(--text-secondary)'}}>{opt.title}</span>
                    <span className="text-xs ml-auto" style={{color:'var(--text-muted)'}}>{opt.reason_unavailable}</span>
                  </div>
                </div>
              ))}

              {/* Flexible dates tip for flights */}
              {(transport as any)?.flexible_dates_tip&&(
                <div className="rounded-xl p-4 flex items-start gap-3"
                  style={{background:'rgba(45,212,160,0.06)',border:'1px solid rgba(45,212,160,0.2)'}}>
                  <span className="text-lg">📅</span>
                  <p className="text-sm" style={{color:'var(--text-secondary)'}}>{(transport as any).flexible_dates_tip}</p>
                </div>
              )}

              <button className="btn-secondary w-full" onClick={loadTransport}>
                <RefreshCw className="w-4 h-4 inline mr-2"/>Refresh
              </button>
            </div>
          )}

          {/* Flights-only deep search */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>✈️ Flight-only deep search</p>
              <button onClick={loadFlights} disabled={loadingF}
                className="btn-secondary flex items-center gap-1.5 text-xs py-1.5 px-3">
                {loadingF?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Zap className="w-3.5 h-3.5"/>}
                {loadingF?'Searching...':'Search flights'}
              </button>
            </div>
            {/* Platform grid — always visible */}
            <p className="text-xs mb-2" style={{color:'var(--text-muted)'}}>Book directly on these platforms — open in new tab to compare:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {flightPlatforms.map((p,i)=>(
                <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl transition-all hover-lift"
                  style={{background:p.color,border:`1px solid ${p.border}`}}>
                  <div>
                    <p className="text-xs font-semibold" style={{color:'var(--text-primary)'}}>{p.name}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>{p.note}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" style={{color:'var(--text-muted)'}}/>
                </a>
              ))}
            </div>
            {/* AI flight results */}
            {loadingF&&(
              <div className="mt-4 space-y-3">
                {[...Array(3)].map((_,i)=>(
                  <div key={i} className="glass rounded-xl p-4 space-y-2">
                    <div className="flex justify-between"><div className="h-4 skeleton rounded w-1/3"/><div className="h-5 skeleton rounded w-1/5"/></div>
                    <div className="h-3 skeleton rounded w-1/2"/>
                  </div>
                ))}
              </div>
            )}
            {flights&&!loadingF&&(
              <div className="mt-4 space-y-3">
                {(flights.flexible_dates as any)?.note&&(
                  <div className="rounded-lg p-3 flex items-start gap-2"
                    style={{background:'rgba(45,212,160,0.06)',border:'1px solid rgba(45,212,160,0.2)'}}>
                    <span className="text-sm">📅</span>
                    <p className="text-xs" style={{color:'var(--text-secondary)'}}>{(flights.flexible_dates as any).note}
                      {(flights.flexible_dates as any).savings_usd&&<strong style={{color:'#2dd4a0'}}> ~${(flights.flexible_dates as any).savings_usd} saved</strong>}
                    </p>
                  </div>
                )}
                {flightResults.map((f:any,i:number)=>(
                  <div key={i} className="glass feature-card rounded-xl p-4 hover-lift">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          {f.badge&&<span className="badge badge-gold text-xs">{f.badge}</span>}
                          <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{f.airline}</span>
                          <span className="text-xs font-mono" style={{color:'var(--text-muted)'}}>{f.flight_number}</span>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold" style={{color:'var(--text-primary)'}}>{f.departure_time}</span>
                          <div className="flex-1 flex items-center gap-1.5">
                            <div className="flex-1 h-px" style={{background:'var(--border)'}}/>
                            <div className="text-center px-1">
                              <p className="text-xs leading-none" style={{color:'var(--text-muted)'}}>{f.duration}</p>
                              <p className="text-xs leading-none mt-0.5" style={{color:f.stops===0?'#2dd4a0':'var(--text-muted)'}}>
                                {f.stops===0?'Direct':`${f.stops} stop`}
                              </p>
                            </div>
                            <div className="flex-1 h-px" style={{background:'var(--border)'}}/>
                          </div>
                          <span className="font-bold" style={{color:'var(--text-primary)'}}>{f.arrival_time}</span>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                          {f.baggage_kg&&<span className="text-xs" style={{color:'var(--text-muted)'}}>🧳 {f.baggage_kg}kg</span>}
                          {f.on_time_percent&&<span className="text-xs" style={{color:'var(--text-muted)'}}>⏱ {f.on_time_percent}% on-time</span>}
                          {(f.pros||[]).map((p:string,j:number)=>(
                            <span key={j} className="text-xs" style={{color:'#2dd4a0'}}>✓ {p}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-xl" style={{color:'var(--text-primary)'}}>${f.price_usd}</p>
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>per person</p>
                        <a href={f.skyscanner_url||flightPlatforms[0].url}
                          target="_blank" rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 btn-primary text-xs py-1.5 px-3">
                          Book <ExternalLink className="w-3 h-3"/>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────── LOCAL TRAVEL ───────────── */}
      {subTab==='local-travel'&&(
        <div className="space-y-4">
          {!transport&&!loadingT&&(
            <div className="glass rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">🚇</div>
              <h3 className="font-display text-xl font-bold mb-2" style={{color:'var(--text-primary)'}}>Local transport in {dest}</h3>
              <p className="text-sm mb-6" style={{color:'var(--text-secondary)'}}>
                Metro, buses, airport transfers, ride-hailing — with key routes and how much to budget
              </p>
              <button className="btn-primary flex items-center gap-2 mx-auto" onClick={loadTransport}>
                <Zap className="w-4 h-4"/>Load local transport guide
              </button>
            </div>
          )}
          {loadingT&&(
            <div className="space-y-3">
              {[...Array(3)].map((_,i)=>(
                <div key={i} className="glass rounded-xl p-5 space-y-3">
                  <div className="h-5 skeleton rounded w-1/3"/>
                  <div className="h-4 skeleton rounded w-1/2"/>
                  <div className="h-3 skeleton rounded w-2/3"/>
                </div>
              ))}
            </div>
          )}
          {transport&&!loadingT&&localT&&(
            <div className="space-y-4">
              {/* Primary recommendation */}
              <div className="glass-gold rounded-2xl p-5">
                <p className="section-label mb-2">TripWise recommends</p>
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{localT.primary_icon||'🚇'}</span>
                  <div>
                    <p className="font-bold text-lg" style={{color:'var(--text-primary)'}}>{localT.primary_mode}</p>
                    <p className="text-sm" style={{color:'var(--text-secondary)'}}>{localT.why}</p>
                    {localT.pass_recommendation&&(
                      <div className="mt-2 p-2 rounded-lg inline-flex items-center gap-2"
                        style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.2)'}}>
                        <span className="text-sm">💳</span>
                        <div>
                          <p className="text-xs font-semibold" style={{color:'var(--gold-light)'}}>{localT.pass_recommendation}</p>
                          <p className="text-xs" style={{color:'var(--text-muted)'}}>${localT.pass_cost_usd} · {localT.pass_where_to_buy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Airport transfer */}
              {localT.airport_transfer&&(
                <div className="glass rounded-2xl p-5">
                  <p className="section-label mb-3">✈️ Airport → City transfer</p>
                  <div className="p-3 rounded-xl mb-3" style={{background:'var(--bg-3)'}}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{localT.airport_transfer.recommendation}</span>
                      <span className="text-sm font-bold" style={{color:'var(--gold-light)'}}>${localT.airport_transfer.cost_usd} · {localT.airport_transfer.duration_mins}min</span>
                    </div>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>{localT.airport_transfer.from}</p>
                  </div>
                  {/* Map: airport + city center */}
                  {localT.airport_lat&&localT.city_lat&&(
                    <EmbedMap
                      locations={[
                        {name:`${dest} Airport`, lat:Number(localT.airport_lat), lng:Number(localT.airport_lng), type:'airport', description:'International airport', isMain:true},
                        {name:`${dest} City Center`, lat:Number(localT.city_lat), lng:Number(localT.city_lng), type:'attraction', description:'Main city hub'},
                        ...(localT.transit_hubs||[]).map((h:any)=>({name:h.name, lat:Number(h.lat), lng:Number(h.lng), type:'transit' as const, description:h.lines, distance:h.distance_from_center})),
                      ]}
                      title={`${dest} — Airport & key transit hubs`}
                      height={360}
                      splitScreen={true}
                    />
                  )}
                </div>
              )}

              {/* Key routes */}
              {((localT.key_routes as any[])||[]).length>0&&(
                <div className="glass rounded-2xl p-5">
                  <p className="section-label mb-3">Key routes</p>
                  <div className="space-y-2">
                    {(localT.key_routes as any[]).map((r:any,i:number)=>(
                      <div key={i} className="p-3 rounded-xl" style={{background:'var(--bg-3)'}}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{r.from} → {r.to}</span>
                          <span className="text-xs font-bold" style={{color:'var(--gold-light)'}}>${r.cost_usd} · {r.duration_mins}min</span>
                        </div>
                        {r.line&&<p className="text-xs" style={{color:'var(--text-muted)'}}>{r.line}{r.direction?` → ${r.direction}`:''}</p>}
                        {r.stations&&<p className="text-xs mt-0.5" style={{color:'var(--text-secondary)'}}>{r.stations}</p>}
                        {r.tip&&(
                          <div className="flex items-start gap-1.5 mt-1">
                            <Star className="w-3 h-3 mt-0.5 flex-shrink-0" style={{color:'var(--gold)'}}/>
                            <p className="text-xs" style={{color:'var(--gold-light)'}}>{r.tip}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apps */}
              {((localT.apps as any[])||[]).length>0&&(
                <div className="glass rounded-2xl p-5">
                  <p className="section-label mb-3">Recommended apps</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(localT.apps as any[]).map((app:any,j:number)=>(
                      <a key={j} href={app.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 rounded-xl hover-lift"
                        style={{background:'rgba(74,127,212,0.08)',border:'1px solid rgba(74,127,212,0.2)'}}>
                        <span className="text-lg">{app.icon||'📱'}</span>
                        <div>
                          <p className="text-xs font-semibold" style={{color:'var(--text-primary)'}}>{app.name}</p>
                          {app.what_for&&<p className="text-xs" style={{color:'var(--text-muted)'}}>{app.what_for}</p>}
                        </div>
                        <ExternalLink className="w-3 h-3 ml-auto" style={{color:'var(--text-muted)'}}/>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {localT.avoid&&(
                <div className="flex items-start gap-3 p-4 rounded-xl"
                  style={{background:'rgba(244,63,94,0.06)',border:'1px solid rgba(244,63,94,0.15)'}}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{color:'#fb7185'}}/>
                  <div>
                    <p className="text-xs font-semibold mb-0.5" style={{color:'#fb7185'}}>Avoid</p>
                    <p className="text-xs" style={{color:'#fb7185'}}>{localT.avoid}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          {transport&&!loadingT&&!localT&&(
            <div className="glass rounded-xl p-6 text-center">
              <p className="text-sm" style={{color:'var(--text-muted)'}}>Local transport data not available for this destination.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}



export default function TripPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const [activeTab,setActiveTab] = useState('Overview')
  const [activeDay,setActiveDay] = useState(0)
  const [viability,setViability] = useState<Viability|null>(null)
  const [itinerary,setItinerary] = useState<Itinerary|null>(null)
  const [tripData,setTripData] = useState<Record<string,unknown>>({})
  const [editMode,setEditMode] = useState(false)
  const [editPrompt,setEditPrompt] = useState('')
  const [editing,setEditing] = useState(false)
  const [copied,setCopied] = useState(false)
  const [checkedPacking,setCheckedPacking] = useState<string[]>([])
  const [expenses,setExpenses] = useState<{id?:string;title:string;amount_usd:number;paid_by:string;paid_by_name:string;created_at?:string}[]>([])
  const [newExp,setNewExp] = useState({title:'',amount:'',who:'',whoName:''})
  const [addingExpense,setAddingExpense] = useState(false)
  const [members,setMembers] = useState<{user_id:string;user_name:string;user_email:string;role:string;joined_at:string}[]>([])
  const [notes,setNotes] = useState<{id:string;user_id:string;user_name:string;content:string;pinned:boolean;created_at:string}[]>([])
  const [newNote,setNewNote] = useState('')
  const [addingNote,setAddingNote] = useState(false)
  const [splits,setSplits] = useState<{from:string;to:string;amount:number}[]>([])
  const [removingMember,setRemovingMember] = useState<string|null>(null)
  const [showSplitModal,setShowSplitModal] = useState(false)
  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(()=>{
    async function loadTrip() {
      // First try sessionStorage (fast path for just-generated trips)
      try {
        const v = sessionStorage.getItem('tripwise_viability')
        const i = sessionStorage.getItem('tripwise_itinerary')
        const t = sessionStorage.getItem('tripwise_tripdata')
        const savedId = sessionStorage.getItem('tripwise_trip_id')
        // If URL id matches sessionStorage id, use sessionStorage for heavy data
        if (v && i && (params.id === 'new' || params.id === savedId)) {
          setViability(JSON.parse(v))
          setItinerary(JSON.parse(i))
          if (t) setTripData(JSON.parse(t))
          // Still fetch live group data (members, notes, expenses) from DB
          if (params.id && params.id !== 'new') {
            try {
              const mRes = await fetch(`${API}/api/trips/${params.id}/members`)
              if (mRes.ok) { const mData = await mRes.json(); setMembers(Array.isArray(mData) ? mData : []) }
            } catch {}
            try {
              const nRes = await fetch(`${API}/api/trips/${params.id}/notes`)
              if (nRes.ok) { const nData = await nRes.json(); setNotes(Array.isArray(nData) ? nData : []) }
            } catch {}
            try {
              const eRes = await fetch(`${API}/api/trips/${params.id}/expenses`)
              if (eRes.ok) { const eData = await eRes.json(); setExpenses(Array.isArray(eData) ? eData : []) }
            } catch {}
          }
          return
        }
      } catch(e) { console.error(e) }

      // Otherwise fetch from database (handles shared links & history)
      if (params.id && params.id !== 'new') {
        try {
          const res = await fetch(`${API}/api/trips/${params.id}`)
          if (!res.ok) throw new Error('Trip not found')
          const full = await res.json()
          if (full.viability_report) setViability(full.viability_report)
          if (full.itinerary)        setItinerary(full.itinerary)
          setTripData({
            origin:       full.origin,
            destination:  full.destination,
            start_date:   full.start_date,
            end_date:     full.end_date,
            group_size:   full.group_size,
            budget_usd:   full.budget_usd,
          })
          // Cache invite code for share tab
          if (full.invite_code) sessionStorage.setItem('tripwise_invite_code', full.invite_code)
          // Fetch members
          let loadedMembers: typeof members = []
          try {
            const mRes = await fetch(`${API}/api/trips/${params.id}/members`)
            if (mRes.ok) { const mData = await mRes.json(); loadedMembers = Array.isArray(mData) ? mData : []; setMembers(loadedMembers) }
          } catch {}
          // Auto-join: if the current user is not yet a member, add them silently
          // (handles direct shared-link navigation where user wasn't added via invite flow)
          if (user && !loadedMembers.find((m: any) => m.user_id === user.uid)) {
            try {
              await fetch(`${API}/api/trips/${params.id}/members`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.uid, user_email: user.email, user_name: user.displayName }),
              })
              // Re-fetch members after joining
              const mRes2 = await fetch(`${API}/api/trips/${params.id}/members`)
              if (mRes2.ok) { const mData2 = await mRes2.json(); setMembers(Array.isArray(mData2) ? mData2 : []) }
            } catch {}
          }
          // Fetch notes
          try {
            const nRes = await fetch(`${API}/api/trips/${params.id}/notes`)
            if (nRes.ok) { const nData = await nRes.json(); setNotes(Array.isArray(nData) ? nData : []) }
          } catch {}
          // Fetch expenses
          try {
            const eRes = await fetch(`${API}/api/trips/${params.id}/expenses`)
            if (eRes.ok) { const eData = await eRes.json(); setExpenses(Array.isArray(eData) ? eData : []) }
          } catch {}
        } catch(e) {
          console.error('Failed to load trip from DB:', e)
        }
      }
    }
    loadTrip()
  },[params.id])

  async function handleEdit() {
    if(!editPrompt.trim()) return
    setEditing(true)
    try {
      const res = await fetch(`${API}/api/edit-itinerary`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({original_itinerary:itinerary,edit_request:editPrompt})})
      const updated = await res.json()
      setItinerary(updated)
      sessionStorage.setItem('tripwise_itinerary',JSON.stringify(updated))
      setEditPrompt(''); setEditMode(false)
    } catch{alert('Edit failed.')} finally{setEditing(false)}
  }

  function copyLink(){navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2000)}

  if(!viability||!itinerary) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <p style={{color:'var(--text-secondary)'}}>No trip data found.</p>
      <button className="btn-primary" onClick={()=>router.push('/plan')}>Plan a trip</button>
    </div>
  )

  const days = itinerary.days||[]
  const budget = itinerary.budget_summary||{} as Itinerary['budget_summary']
  const packing = itinerary.packing_list||{}
  const allItems = Object.values(packing).flat()
  const packPct = allItems.length>0?Math.round((checkedPacking.length/allItems.length)*100):0

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-50" style={{background:'rgba(6,9,18,0.92)',backdropFilter:'blur(24px)',borderBottom:'1px solid var(--border)'}}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={()=>router.push('/')} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{background:'linear-gradient(135deg,#1c2642,#0f1628)',border:'1px solid rgba(201,168,76,0.35)'}}>
                <Plane className="w-3.5 h-3.5" style={{color:'var(--gold)'}} />
              </div>
              <span className="font-display font-bold text-lg gradient-text">TripWise</span>
            </button>
            <ChevronRight className="w-4 h-4" style={{color:'var(--text-muted)'}} />
            <span className="text-sm" style={{color:'var(--text-secondary)'}}>
              {String(tripData.origin||'')} → {itinerary.destination}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>exportToExcel(itinerary,viability,tripData)}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all"
              style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.25)',color:'var(--gold-light)'}}>
              <Download className="w-3.5 h-3.5"/>Export
            </button>
            <button onClick={()=>setEditMode(true)}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all"
              style={{background:'var(--bg-3)',border:'1px solid var(--border)',color:'var(--text-secondary)'}}>
              <Edit3 className="w-3.5 h-3.5"/>Edit
            </button>
            <button onClick={()=>router.push('/history')}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all"
              style={{background:'var(--bg-3)',border:'1px solid var(--border)',color:'var(--text-secondary)'}}>
              <History className="w-3.5 h-3.5"/>My trips
            </button>
            <button onClick={copyLink}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all"
              style={{background:'var(--bg-3)',border:'1px solid var(--border)',color:'var(--text-secondary)'}}>
              <Share2 className="w-3.5 h-3.5"/>{copied?'Copied!':'Share'}
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto pb-px">
            {TABS.map(tab=>(
              <button key={tab} onClick={()=>setActiveTab(tab)}
                className={`day-tab flex-shrink-0 ${activeTab===tab?'active':''}`}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editMode&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.75)'}}>
          <div className="glass rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{color:'var(--text-primary)'}}>Edit itinerary</h3>
              <button onClick={()=>setEditMode(false)}><X className="w-5 h-5" style={{color:'var(--text-muted)'}} /></button>
            </div>
            <p className="text-sm mb-4" style={{color:'var(--text-secondary)'}}>Describe what to change — AI updates your trip.</p>
            <textarea className="input-field mb-4" rows={4} style={{resize:'none'}}
              placeholder="e.g. 'Replace Day 2 museum with street food tour' or 'Make Day 3 more relaxed'"
              value={editPrompt} onChange={e=>setEditPrompt(e.target.value)} />
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={()=>setEditMode(false)}>Cancel</button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2"
                onClick={handleEdit} disabled={editing||!editPrompt.trim()}>
                {editing?<Loader2 className="w-4 h-4 animate-spin"/>:<RefreshCw className="w-4 h-4"/>}
                {editing?'Updating...':'Apply changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── OVERVIEW ── */}
        {activeTab==='Overview'&&(
          <div className="tab-content space-y-4">
            <TipsBox tips={viability.page_tips?.overview} />

            {/* Hero */}
            <div className="liquid-card rounded-2xl p-6" style={{boxShadow:'0 0 60px rgba(201,168,76,0.05)'}}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <VerdictBadge text={viability.safety_level} />
                    {viability.crowd_level&&<VerdictBadge text={viability.crowd_level+' crowds'} />}
                    {viability.price_vs_average&&<VerdictBadge text={viability.price_vs_average+' prices'} />}
                  </div>
                  <h1 className="font-display text-3xl font-bold mb-2" style={{color:'var(--text-primary)'}}>
                    {viability.overall_verdict||'Trip Overview'}
                  </h1>
                  <p style={{color:'var(--text-secondary)'}}>{viability.overall_reason}</p>
                </div>
                <div className="text-right">
                  <div className="font-display text-4xl font-bold gradient-text">
                    {viability.temperature_min}°–{viability.temperature_max}°C
                  </div>
                  <div className="text-sm mt-1" style={{color:'var(--text-muted)'}}>{viability.weather_summary}</div>
                </div>
              </div>
            </div>

            {/* Weather forecast */}
            {(viability.daily_weather_forecast||[]).length>0&&(
              <Section title="Daily Weather Forecast" icon={Sun}>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {viability.daily_weather_forecast.map((w,i)=>(
                    <div key={i} className="flex-shrink-0 text-center rounded-xl p-3 min-w-[80px]"
                      style={{background:'var(--bg-3)',border:'1px solid var(--border)'}}>
                      <p className="text-xs mb-2" style={{color:'var(--text-muted)'}}>{w.date?.slice(5)}</p>
                      <WeatherIcon icon={w.icon||'cloudy'} size={20} />
                      <p className="text-xs font-semibold mt-1" style={{color:'var(--text-primary)'}}>
                        {w.temp_max}° / {w.temp_min}°
                      </p>
                      <p className="text-xs mt-0.5" style={{color:'#60a5fa'}}>{w.rain_chance}%</p>
                      <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{w.condition?.split(' ')[0]}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Festivals */}
            {(viability.festivals_and_events||[]).length>0&&(
              <Section title="Festivals & Events During Your Visit" icon={Music}>
                <div className="space-y-3">
                  {viability.festivals_and_events.map((f,i)=>(
                    <div key={i} className="p-4 rounded-xl" style={{background:'var(--bg-3)'}}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`badge ${f.type==='national_holiday'?'badge-red':f.type==='festival'?'badge-gold':'badge-purple'}`}>
                          {f.type?.replace('_',' ')}
                        </span>
                        <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{f.name}</span>
                        <span className="text-xs ml-auto" style={{color:'var(--text-muted)'}}>{f.date}</span>
                      </div>
                      <p className="text-sm mb-2" style={{color:'var(--text-secondary)'}}>{f.description}</p>
                      {f.tip&&(
                        <div className="flex items-start gap-2">
                          <Star className="w-3 h-3 mt-0.5 flex-shrink-0" style={{color:'var(--gold)'}} />
                          <p className="text-xs" style={{color:'var(--gold-light)'}}>{f.tip}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Key info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {icon:Shield,label:'Visa',val:viability.visa_type,sub:viability.visa_cost_usd>0?`$${viability.visa_cost_usd} · ${viability.visa_processing_days} days`:'Check requirements',link:viability.visa_apply_link},
                {icon:CreditCard,label:'Currency',val:viability.currency?.split(' ')[0]||'—',sub:viability.exchange_rate_from_origin,link:undefined},
                {icon:Smartphone,label:'SIM',val:'Local SIM',sub:'See recommendation below',link:undefined},
                {icon:Plug,label:'Adapter',val:viability.power_socket||'—',sub:viability.adapter_needed?'Adapter needed':'No adapter needed',link:undefined},
              ].map(({icon:Icon,label,val,sub,link})=>(
                <div key={label} className="stat-card">
                  <Icon className="w-4 h-4 mb-3" style={{color:'var(--gold)'}} />
                  <p className="section-label mb-1">{label}</p>
                  <p className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{val}</p>
                  <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{sub}</p>
                  {link&&<a href={link} target="_blank" rel="noopener noreferrer"
                    className="text-xs mt-2 flex items-center gap-1" style={{color:'var(--gold-light)'}}>
                    Apply online <ExternalLink className="w-3 h-3" />
                  </a>}
                </div>
              ))}
            </div>

            {/* Areas to avoid */}
            {(viability.areas_to_avoid||[]).length>0&&(
              <Section title="Areas to Avoid" icon={AlertTriangle} defaultOpen={false}>
                <div className="space-y-3">
                  {viability.areas_to_avoid.map((a,i)=>(
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{background:a.severity==='avoid'?'rgba(244,63,94,0.08)':'rgba(245,158,11,0.08)',
                        border:`1px solid ${a.severity==='avoid'?'rgba(244,63,94,0.2)':'rgba(245,158,11,0.2)'}`}}>
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{color:a.severity==='avoid'?'#f43f5e':'#fbbf24'}} />
                      <div>
                        <p className="font-medium text-sm" style={{color:'var(--text-primary)'}}>{a.area}</p>
                        <p className="text-xs mt-0.5" style={{color:'var(--text-secondary)'}}>{a.reason}</p>
                      </div>
                      <span className={`badge ml-auto flex-shrink-0 ${a.severity==='avoid'?'badge-red':'badge-amber'}`}>
                        {a.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Visa & Entry Requirements" icon={Shield}>
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className="badge badge-gold">{viability.visa_type}</span>
                  {viability.visa_cost_usd>0&&(
                    <span className="text-sm" style={{color:'var(--text-secondary)'}}>
                      ${viability.visa_cost_usd} · {viability.visa_processing_days} days processing
                    </span>
                  )}
                </div>
                <p className="section-label mb-2">Documents needed:</p>
                {(viability.visa_docs||[]).map((doc,i)=>(
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-4 h-4" style={{color:'var(--emerald)'}} />
                    <span className="text-sm" style={{color:'var(--text-secondary)'}}>{doc}</span>
                  </div>
                ))}
                <div className="flex gap-3 mt-3 flex-wrap">
                  {viability.visa_link&&<a href={viability.visa_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                    style={{background:'rgba(201,168,76,0.1)',color:'var(--gold-light)',border:'1px solid rgba(201,168,76,0.2)'}}>
                    <ExternalLink className="w-3 h-3"/>Visa info
                  </a>}
                  {viability.visa_apply_link&&<a href={viability.visa_apply_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                    style={{background:'rgba(201,168,76,0.1)',color:'var(--gold-light)',border:'1px solid rgba(201,168,76,0.2)'}}>
                    <ExternalLink className="w-3 h-3"/>Apply online
                  </a>}
                </div>
              </div>
            </Section>

            <Section title="Currency & Money" icon={CreditCard}>
              <div className="space-y-3">
                <div className="p-4 rounded-xl" style={{background:'var(--bg-3)'}}>
                  <p className="font-semibold mb-1" style={{color:'var(--text-primary)'}}>{viability.exchange_rate_from_origin}</p>
                  <p className="text-sm" style={{color:'var(--text-secondary)'}}>{viability.best_money_method}</p>
                </div>
                <div className="p-4 rounded-xl" style={{background:'var(--bg-3)'}}>
                  <p className="text-sm font-medium mb-1" style={{color:'var(--text-primary)'}}>Tipping culture</p>
                  <p className="text-sm" style={{color:'var(--text-secondary)'}}>{viability.tipping_culture}</p>
                </div>
                <div className="p-4 rounded-xl" style={{background:'var(--bg-3)'}}>
                  <p className="text-sm font-medium mb-1" style={{color:'var(--text-primary)'}}>SIM & connectivity</p>
                  <p className="text-sm" style={{color:'var(--text-secondary)'}}>{viability.sim_recommendation}</p>
                </div>
              </div>
            </Section>

            <Section title="Essential Language Phrases" icon={Flag} defaultOpen={false}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(viability.language_phrases||[]).map(({phrase,local,phonetic},i)=>(
                  <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{background:'var(--bg-3)'}}>
                    <span className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{phrase}</span>
                    <div className="text-right">
                      <p className="text-sm" style={{color:'var(--gold-light)'}}>{local}</p>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>{phonetic}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Safety & Travel Advisory" icon={Shield} defaultOpen={false}
              tip={viability.travel_advisory}>
              <div className="space-y-3">
                <VerdictBadge text={viability.safety_level} />
                <p className="text-sm mt-2" style={{color:'var(--text-secondary)'}}>{viability.safety_notes}</p>
                {viability.travel_advisory_link&&(
                  <a href={viability.travel_advisory_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs mt-2" style={{color:'var(--gold-light)'}}>
                    <ExternalLink className="w-3 h-3"/>Official advisory link
                  </a>
                )}
              </div>
            </Section>

            <Section title="Emergency Information" icon={Phone} defaultOpen={false}>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(viability.emergency_info||{}).map(([key,val])=>(
                  <div key={key} className="flex items-center gap-3 p-3 rounded-xl" style={{background:'var(--bg-3)'}}>
                    <Phone className="w-4 h-4" style={{color:'#f43f5e'}} />
                    <div>
                      <p className="text-xs capitalize" style={{color:'var(--text-muted)'}}>{key.replace(/_/g,' ')}</p>
                      <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{String(val)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {(viability.nearby_countries_to_combine||[]).length>0&&(
              <Section title="Nearby Countries to Combine" defaultOpen={false}>
                {viability.nearby_countries_to_combine.map((c,i)=>(
                  <div key={i} className="p-4 rounded-xl mb-3" style={{background:'var(--bg-3)'}}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold" style={{color:'var(--text-primary)'}}>{c.country} — {c.city}</p>
                      <span className="badge badge-green">+${c.extra_cost_usd}</span>
                    </div>
                    <p className="text-sm" style={{color:'var(--text-secondary)'}}>{c.reason}</p>
                    <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>+{c.extra_days} days</p>
                  </div>
                ))}
              </Section>
            )}

            <button className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={()=>setActiveTab('Itinerary')}>
              View day-by-day itinerary <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── ITINERARY ── */}
        {activeTab==='Itinerary'&&(
          <div className="tab-content">
            <TipsBox tips={viability.page_tips?.itinerary} />
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              {days.map((day,i)=>(
                <button key={i} onClick={()=>setActiveDay(i)}
                  className={`day-tab flex-shrink-0 flex flex-col items-center py-3 px-4 ${activeDay===i?'active':''}`}>
                  <span className="text-xs mb-0.5">Day {day.day}</span>
                  <span className="text-xs" style={{color:'var(--text-muted)'}}>{day.date}</span>
                </button>
              ))}
            </div>
            {days[activeDay]&&(
              <div>
                <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="font-display text-2xl font-bold" style={{color:'var(--text-primary)'}}>
                      Day {days[activeDay].day} — {days[activeDay].theme}
                    </h2>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm" style={{color:'var(--text-muted)'}}>{days[activeDay].date}</span>
                      <span className="text-sm font-medium" style={{color:'var(--gold-light)'}}>
                        ~${days[activeDay].day_total_usd}/person
                      </span>
                    </div>
                  </div>
                  {/* Day weather */}
                  {viability.daily_weather_forecast?.[activeDay]&&(
                    <div className="glass rounded-xl px-4 py-2 flex items-center gap-3">
                      <WeatherIcon icon={viability.daily_weather_forecast[activeDay].icon||'cloudy'} size={18} />
                      <div>
                        <p className="text-sm font-medium" style={{color:'var(--text-primary)'}}>
                          {viability.daily_weather_forecast[activeDay].temp_max}° / {viability.daily_weather_forecast[activeDay].temp_min}°C
                        </p>
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>
                          {viability.daily_weather_forecast[activeDay].condition} · {viability.daily_weather_forecast[activeDay].rain_chance}% rain
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {days[activeDay].day_tip&&(
                  <div className="flex items-start gap-2 p-3 rounded-xl mb-5" style={{background:'rgba(201,168,76,0.07)',border:'1px solid rgba(201,168,76,0.15)'}}>
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5" style={{color:'var(--gold)'}} />
                    <p className="text-xs" style={{color:'var(--gold-light)'}}>{days[activeDay].day_tip}</p>
                  </div>
                )}

                {/* Day map — shows ALL locations for this day with names */}
                {(() => {
                  const dayLocs = (days[activeDay].slots || [])
                    .filter((s:any) => s.lat && s.lng && Number(s.lat) !== 0 && Number(s.lng) !== 0)
                    .map((s:any, idx:number) => ({
                      name: s.title,
                      lat: Number(s.lat),
                      lng: Number(s.lng),
                      type: (s.type === 'meal' ? 'restaurant' : s.type === 'transport' ? 'transport' : 'activity') as any,
                      description: `${s.time} · ${s.location}${s.notes ? ' — ' + s.notes.slice(0,80) : ''}`,
                      distance: s.time,
                    }))
                  return dayLocs.length > 0 ? (
                    <div className="mb-5">
                      <EmbedMap
                        locations={dayLocs}
                        title={`Day ${days[activeDay].day} — ${days[activeDay].theme}`}
                        height={360}
                        showList={true}
                        splitScreen={true}
                      />
                    </div>
                  ) : (
                    <div className="mb-4 glass rounded-xl p-3 flex items-center gap-2" style={{border:'1px solid var(--border)'}}>
                      <MapPin className="w-4 h-4" style={{color:'var(--text-muted)'}}/>
                      <p className="text-xs" style={{color:'var(--text-muted)'}}>
                        Map will appear once your itinerary includes location coordinates.
                      </p>
                    </div>
                  )
                })()}

                <div className="space-y-0 mb-5">
                  {(days[activeDay].slots||[]).map((slot,si)=>(
                    <div key={si} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="timeline-dot mt-1" style={{
                          background:slot.type==='meal'?'#f59e0b':slot.type==='transport'?'#a78bfa':'var(--gold)'
                        }} />
                        {si<(days[activeDay].slots||[]).length-1&&<div className="timeline-line"/>}
                      </div>
                      <div className="pb-5 flex-1">
                        <div className="glass feature-card rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-mono text-xs px-2 py-0.5 rounded"
                                  style={{background:'var(--bg-3)',color:'var(--text-muted)'}}>{slot.time}</span>
                                <span className={`badge ${slot.type==='meal'?'badge-amber':slot.type==='transport'?'badge-purple':'badge-gold'}`}>
                                  {slot.type}
                                </span>
                                {slot.booking_required&&<span className="badge badge-red">Book ahead</span>}
                              </div>
                              <h3 className="font-semibold" style={{color:'var(--text-primary)'}}>{slot.title}</h3>
                              <div className="flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" style={{color:'var(--text-muted)'}} />
                                <span className="text-xs" style={{color:'var(--text-muted)'}}>{slot.location}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold" style={{color:'var(--text-primary)'}}>
                                {slot.cost_usd===0?'Free':`$${slot.cost_usd}`}
                              </p>
                              {slot.cost_local&&slot.local_currency&&(
                                <p className="text-xs" style={{color:'var(--text-muted)'}}>{slot.cost_local} {slot.local_currency}</p>
                              )}
                              <p className="text-xs" style={{color:'var(--text-muted)'}}>{slot.duration_mins}m</p>
                            </div>
                          </div>
                          {slot.notes&&<p className="text-sm mt-3" style={{color:'var(--text-secondary)'}}>{slot.notes}</p>}
                          {slot.what_to_wear&&(
                            <p className="text-xs mt-2" style={{color:'var(--text-muted)'}}>👕 {slot.what_to_wear}</p>
                          )}
                          {slot.pro_tip&&(
                            <div className="mt-2 flex items-start gap-2 p-2 rounded-lg"
                              style={{background:'rgba(201,168,76,0.07)'}}>
                              <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{color:'var(--gold)'}} />
                              <p className="text-xs" style={{color:'var(--gold-light)'}}>{slot.pro_tip}</p>
                            </div>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {slot.ticket_link&&(
                              <a href={slot.ticket_link} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                                style={{background:'rgba(201,168,76,0.1)',color:'var(--gold-light)',border:'1px solid rgba(201,168,76,0.2)'}}>
                                <Bookmark className="w-3 h-3"/>Buy ticket
                              </a>
                            )}
                            {slot.booking_link&&slot.booking_link!==slot.ticket_link&&(
                              <a href={slot.booking_link} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg"
                                style={{background:'rgba(201,168,76,0.1)',color:'var(--gold-light)',border:'1px solid rgba(201,168,76,0.2)'}}>
                                <ExternalLink className="w-3 h-3"/>
                                Book {slot.book_days_ahead?`(${slot.book_days_ahead} days ahead)`:''}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {days[activeDay].free_time_note&&(
                  <div className="glass rounded-xl p-4 mb-4" style={{borderColor:'rgba(167,139,250,0.3)'}}>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4" style={{color:'#a78bfa'}} />
                      <span className="text-sm font-medium" style={{color:'#a78bfa'}}>Free time</span>
                    </div>
                    <p className="text-sm" style={{color:'var(--text-secondary)'}}>{days[activeDay].free_time_note}</p>
                  </div>
                )}
                <div className="glass rounded-xl p-4" style={{borderColor:'rgba(201,168,76,0.2)'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <Cloud className="w-4 h-4" style={{color:'var(--gold)'}} />
                    <span className="text-sm font-medium" style={{color:'var(--gold-light)'}}>Rainy day backup</span>
                  </div>
                  <p className="text-sm" style={{color:'var(--text-secondary)'}}>{days[activeDay].rainy_backup}</p>
                  {days[activeDay].rainy_backup_link&&(
                    <a href={days[activeDay].rainy_backup_link!} target="_blank" rel="noopener noreferrer"
                      className="text-xs mt-2 flex items-center gap-1" style={{color:'var(--gold-light)'}}>
                      <ExternalLink className="w-3 h-3"/>Book now
                    </a>
                  )}
                </div>
                <div className="flex gap-3 mt-6">
                  {activeDay>0&&<button className="btn-secondary flex-1" onClick={()=>setActiveDay(activeDay-1)}>← Day {activeDay}</button>}
                  {activeDay<days.length-1&&<button className="btn-primary flex-1" onClick={()=>setActiveDay(activeDay+1)}>Day {activeDay+2} →</button>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FLIGHTS ── */}
        {activeTab==='Transport'&&<TransportTab tripData={tripData} />}

        {/* ── HOTELS ── */}
        {activeTab==='Hotels'&&(
          <HotelsTab tripData={tripData} itinerary={itinerary} />
        )}

        {/* ── PACKING ── */}
        {activeTab==='Packing'&&(
          <div className="tab-content space-y-4">
            <TipsBox tips={viability.page_tips?.packing} />
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold" style={{color:'var(--text-primary)'}}>Packing progress</p>
                <p style={{color:'var(--text-secondary)'}}>{checkedPacking.length} / {allItems.length} items</p>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${packPct}%`}} />
              </div>
            </div>
            {Object.entries(packing).map(([category,items])=>(
              <div key={category} className="glass rounded-2xl p-5">
                <h3 className="font-semibold capitalize mb-4" style={{color:'var(--text-primary)'}}>
                  {category==='misc'?'Miscellaneous':category}
                </h3>
                <div className="space-y-2">
                  {(items as {item:string;essential:boolean;reason:string}[]).map((obj,i)=>{
                    const itemStr = typeof obj==='string'?obj:obj.item
                    const reason = typeof obj==='string'?'':obj.reason
                    const essential = typeof obj==='string'?false:obj.essential
                    return (
                      <button key={i} onClick={()=>setCheckedPacking(prev=>prev.includes(itemStr)?prev.filter(x=>x!==itemStr):[...prev,itemStr])}
                        className="w-full flex items-start gap-3 py-2 text-left group">
                        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                          style={{
                            background:checkedPacking.includes(itemStr)?'var(--emerald)':'var(--bg-3)',
                            border:`1px solid ${checkedPacking.includes(itemStr)?'var(--emerald)':'var(--border)'}`,
                          }}>
                          {checkedPacking.includes(itemStr)&&<Check className="w-3 h-3 text-white"/>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm" style={{
                              color:checkedPacking.includes(itemStr)?'var(--text-muted)':'var(--text-secondary)',
                              textDecoration:checkedPacking.includes(itemStr)?'line-through':'none',
                            }}>{itemStr}</span>
                            {essential&&!checkedPacking.includes(itemStr)&&(
                              <span className="badge badge-red" style={{fontSize:'9px',padding:'1px 5px'}}>must</span>
                            )}
                          </div>
                          {reason&&<p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{reason}</p>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BUDGET ── */}
        {activeTab==='Budget'&&(
          <div className="tab-content space-y-4">
            <TipsBox tips={viability.page_tips?.budget} />
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold" style={{color:'var(--text-primary)'}}>Budget breakdown</h2>
                <button onClick={()=>exportToExcel(itinerary,viability,tripData)}
                  className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all"
                  style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.25)',color:'var(--gold-light)'}}>
                  <Download className="w-3.5 h-3.5"/>Export CSV
                </button>
              </div>
              <div className="space-y-4">
                {[
                  {label:'Flights',key:'flights_usd',icon:Plane,color:'var(--gold)'},
                  {label:'Accommodation',key:'accommodation_usd',icon:Hotel,color:'#a78bfa'},
                  {label:'Food',key:'food_usd',icon:Utensils,color:'#f59e0b'},
                  {label:'Local Transport',key:'transport_usd',icon:Car,color:'#2dd4a0'},
                  {label:'Activities & Tickets',key:'activities_usd',icon:Bookmark,color:'#f43f5e'},
                  {label:'SIM Card',key:'sim_usd',icon:Smartphone,color:'#60a5fa'},
                  {label:'Miscellaneous',key:'misc_usd',icon:Package,color:'#6b7280'},
                ].map(({label,key,icon:Icon,color})=>{
                  const val=(budget as Record<string,number>)[key]||0
                  const total=budget.total_usd||1
                  const pct=Math.round((val/total)*100)
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" style={{color}} />
                          <span className="text-sm" style={{color:'var(--text-secondary)'}}>{label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{color:'var(--text-muted)'}}>{pct}%</span>
                          <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>${val.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:color,height:'3px',transition:'width 0.6s ease'}} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 pt-4" style={{borderTop:'1px solid var(--border)'}}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{color:'var(--text-primary)'}}>Total per person</span>
                  <span className="font-display text-2xl font-bold gradient-text">
                    ${(budget.per_person_usd||0).toLocaleString()}
                  </span>
                </div>
                {Number(tripData.group_size)>1&&(
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm" style={{color:'var(--text-muted)'}}>Group total ({tripData.group_size} people)</span>
                    <span className="font-semibold" style={{color:'var(--text-secondary)'}}>
                      ${((budget.per_person_usd||0)*Number(tripData.group_size)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {(budget.budget_tips||[]).length>0&&(
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>💡 Budget tips</h3>
                <div className="space-y-2">
                  {budget.budget_tips.map((tip:string,i:number)=>(
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{background:'var(--gold)'}} />
                      <p className="text-sm" style={{color:'var(--text-secondary)'}}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(itinerary.advance_bookings||[]).length>0&&(
              <div className="glass rounded-2xl p-5">
                <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>📋 Book before you travel</h3>
                <div className="space-y-3">
                  {itinerary.advance_bookings.map((b,i)=>(
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{background:'var(--bg-3)'}}>
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:'#fbbf24'}} />
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{color:'var(--text-primary)'}}>{b.item}</p>
                        <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>
                          {b.why_book_ahead} · Book by: {b.book_by}
                        </p>
                        {b.cost_usd>0&&<p className="text-xs mt-1" style={{color:'var(--gold-light)'}}>${b.cost_usd}</p>}
                      </div>
                      {b.link&&(
                        <a href={b.link.startsWith('http')?b.link:`https://${b.link}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                          style={{background:'rgba(201,168,76,0.1)',color:'var(--gold-light)',border:'1px solid rgba(201,168,76,0.2)'}}>
                          Book →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GROUP ── */}
        {activeTab==='Group'&&(
          <div className="tab-content space-y-5">

            {/* MEMBERS CARD */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{color:'var(--text-primary)'}}>Trip members ({members.length})</h3>
                {user && members.find(m=>m.user_id===user.uid&&m.role==='owner') && (
                  <span className="badge badge-gold">You are the owner</span>
                )}
              </div>
              {members.length===0?(
                <p className="text-sm" style={{color:'var(--text-muted)'}}>No members yet. Share the invite code below.</p>
              ):(
                <div className="space-y-2">
                  {members.map((m,i)=>(
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl transition-all"
                      style={{background:'var(--bg-3)'}}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{background:'rgba(201,168,76,0.15)',color:'var(--gold)',border:'1px solid rgba(201,168,76,0.2)'}}>
                        {(m.user_name||m.user_email||'?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{color:'var(--text-primary)'}}>
                          {m.user_name||'Anonymous'}
                        </p>
                        {m.user_email&&(
                          <p className="text-xs truncate" style={{color:'var(--text-muted)'}}>{m.user_email}</p>
                        )}
                      </div>
                      <span className="badge flex-shrink-0"
                        style={{background:m.role==='owner'?'rgba(201,168,76,0.15)':'rgba(74,127,212,0.12)',
                          color:m.role==='owner'?'var(--gold-light)':'#7aa8e8'}}>
                        {m.role}
                      </span>
                      {/* Owner can remove members (not themselves) */}
                      {user&&members.find(me=>me.user_id===user.uid&&me.role==='owner')&&m.role!=='owner'&&(
                        <button
                          onClick={async()=>{
                            if(!confirm(`Remove ${m.user_name||m.user_email} from trip?`)) return
                            setRemovingMember(m.user_id)
                            try{
                              await fetch(`${API}/api/trips/${params.id}/members/${m.user_id}`,{method:'DELETE'})
                              setMembers(p=>p.filter(x=>x.user_id!==m.user_id))
                            }catch(e){alert('Could not remove member')}
                            finally{setRemovingMember(null)}
                          }}
                          disabled={removingMember===m.user_id}
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                          style={{background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.15)',color:'#fb7185'}}>
                          {removingMember===m.user_id
                            ? <Loader2 className="w-3 h-3 animate-spin"/>
                            : <X className="w-3 h-3"/>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SHARE / INVITE */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>Invite your group</h3>
              <p className="section-label mb-2">Share link</p>
              <div className="flex gap-3 mb-4">
                <input className="input-field flex-1"
                  value={typeof window!=='undefined'?window.location.href:''}
                  readOnly/>
                <button className="btn-primary px-4 flex items-center gap-2" onClick={copyLink}>
                  {copied?'Copied!':'Copy link'}
                </button>
              </div>
              {(()=>{
                const code=typeof window!=='undefined'?sessionStorage.getItem('tripwise_invite_code'):null
                return code?(
                  <div>
                    <p className="section-label mb-2">Invite code</p>
                    <div className="flex gap-3">
                      <div className="input-field flex-1 font-mono text-center text-lg"
                        style={{color:'var(--gold-light)',letterSpacing:'0.2em'}}>{code}</div>
                      <button className="btn-secondary px-4"
                        onClick={()=>navigator.clipboard.writeText(code)}>Copy</button>
                    </div>
                    <p className="text-xs mt-2" style={{color:'var(--text-muted)'}}>
                      Friends paste this code on the TripWise home page to join
                    </p>
                  </div>
                ):null
              })()}
            </div>

            {/* EXPENSES + SPLITWISE */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>Expense tracker</h3>
              <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>
                Expenses are shared in real-time with all trip members.
              </p>
              <div className="grid grid-cols-1 gap-2 mb-3">
                <input className="input-field" placeholder="What for? (e.g. Dinner at Tsukiji)"
                  value={newExp.title} onChange={e=>setNewExp(p=>({...p,title:e.target.value}))}/>
                <div className="grid grid-cols-2 gap-2">
                  <input className="input-field" placeholder="$ Amount" type="number"
                    value={newExp.amount} onChange={e=>setNewExp(p=>({...p,amount:e.target.value}))}/>
                  <select className="input-field" value={newExp.who}
                    onChange={e=>{
                      const m = members.find(m=>m.user_id===e.target.value)
                      setNewExp(p=>({...p,who:e.target.value,whoName:m?.user_name||m?.user_email||e.target.value}))
                    }}>
                    <option value="">Paid by...</option>
                    {members.map((m,i)=>(
                      <option key={i} value={m.user_id}>
                        {m.user_name||m.user_email||'Member'}
                      </option>
                    ))}
                    {members.length===0&&<option value={user?.uid||'me'}>{user?.displayName||'Me'}</option>}
                  </select>
                </div>
              </div>
              <button className="btn-secondary w-full flex items-center justify-center gap-2 mb-4"
                disabled={addingExpense||!newExp.title||!newExp.amount||!newExp.who}
                onClick={async()=>{
                  if(!newExp.title||!newExp.amount||!newExp.who||!params.id||params.id==='new') return
                  setAddingExpense(true)
                  try {
                    const payerName = newExp.whoName||(members.find(m=>m.user_id===newExp.who)?.user_name)||newExp.who
                    const res = await fetch(`${API}/api/trips/${params.id}/expense`,{
                      method:'POST', headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({
                        trip_id: params.id,
                        paid_by: newExp.who,
                        paid_by_name: payerName,
                        title: newExp.title,
                        amount_usd: Number(newExp.amount),
                        split_between: members.map(m=>m.user_id),
                      })
                    })
                    if(res.ok){const saved=await res.json();setExpenses(p=>[...p,saved])}
                    setNewExp({title:'',amount:'',who:'',whoName:''})
                  }catch(err){console.error(err)}finally{setAddingExpense(false)}
                }}>
                {addingExpense?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}
                Add expense
              </button>

              {expenses.length>0&&(
                <div className="space-y-2 mb-4">
                  {expenses.map((e,i)=>(
                    <div key={e.id||i} className="flex items-center justify-between py-2 px-3 rounded-lg"
                      style={{background:'var(--bg-3)'}}>
                      <div>
                        <span className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{e.title}</span>
                        <span className="text-xs ml-2" style={{color:'var(--text-muted)'}}>paid by {e.paid_by_name}</span>
                      </div>
                      <span className="font-semibold" style={{color:'var(--text-primary)'}}>
                        ${e.amount_usd.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2" style={{borderTop:'1px solid var(--border)'}}>
                    <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Total spent</span>
                    <span className="font-bold gradient-text font-display">
                      ${expenses.reduce((s,e)=>s+e.amount_usd,0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {expenses.length>0&&members.length>0&&(()=>{
                const totalSpent = expenses.reduce((s,e)=>s+e.amount_usd,0)
                const sharePerPerson = totalSpent/members.length
                const paid: Record<string,number> = {}
                members.forEach(m=>{paid[m.user_id]=0})
                expenses.forEach(e=>{if(paid[e.paid_by]!==undefined) paid[e.paid_by]+=e.amount_usd})
                const balances: Record<string,number> = {}
                members.forEach(m=>{balances[m.user_id]=(paid[m.user_id]||0)-sharePerPerson})
                const nameOf=(uid:string)=>members.find(m=>m.user_id===uid)?.user_name||members.find(m=>m.user_id===uid)?.user_email||uid
                const creditors=Object.entries(balances).filter(([,v])=>v>0.5).sort((a,b)=>b[1]-a[1])
                const debtors=Object.entries(balances).filter(([,v])=>v<-0.5).sort((a,b)=>a[1]-b[1])
                const settlements:{from:string;to:string;amt:number}[]=[]
                const creds=creditors.map(([id,v])=>({id,v}))
                const debts=debtors.map(([id,v])=>({id,v:Math.abs(v)}))
                let ci=0,di=0
                while(ci<creds.length&&di<debts.length){
                  const pay=Math.min(creds[ci].v,debts[di].v)
                  if(pay>0.5) settlements.push({from:nameOf(debts[di].id),to:nameOf(creds[ci].id),amt:Math.round(pay*100)/100})
                  creds[ci].v-=pay;debts[di].v-=pay
                  if(creds[ci].v<0.5)ci++;if(debts[di].v<0.5)di++
                }
                return settlements.length>0?(
                  <div className="mt-3 p-4 rounded-xl" style={{background:'rgba(45,212,160,0.06)',border:'1px solid rgba(45,212,160,0.2)'}}>
                    <p className="text-xs font-semibold mb-3" style={{color:'#2dd4a0'}}>💸 WHO PAYS WHOM</p>
                    <div className="space-y-2">
                      {settlements.map((s,i)=>(
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{s.from}</span>
                          <ArrowRight className="w-4 h-4" style={{color:'var(--text-muted)'}}/>
                          <span className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{s.to}</span>
                          <span className="ml-auto font-bold" style={{color:'#2dd4a0'}}>${s.amt}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-3" style={{color:'var(--text-muted)'}}>Each person's share: ${sharePerPerson.toFixed(2)}</p>
                  </div>
                ):null
              })()}
            </div>

                        {/* GROUP NOTES */}
            <div className="glass rounded-2xl p-5">
              <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>Group notes</h3>
              <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>
                Add reminders, tips, or things everyone should know. Pin important ones.
              </p>

              {/* Add note */}
              <div className="flex gap-3 mb-4">
                <input className="input-field flex-1"
                  placeholder="Add a note for the group..."
                  value={newNote}
                  onChange={e=>setNewNote(e.target.value)}
                  onKeyDown={async e=>{
                    if(e.key==='Enter'&&newNote.trim()&&user&&params.id&&params.id!=='new'){
                      setAddingNote(true)
                      try{
                        const res=await fetch(`${API}/api/trips/${params.id}/notes`,{
                          method:'POST',headers:{'Content-Type':'application/json'},
                          body:JSON.stringify({trip_id:params.id,user_id:user.uid,user_name:user.displayName,content:newNote,pinned:false})
                        })
                        if(res.ok){const note=await res.json();setNotes(p=>[...p,note])}
                      }catch(err){console.error(err)}
                      finally{setAddingNote(false);setNewNote('')}
                    }
                  }}
                />
                <button
                  disabled={addingNote||!newNote.trim()}
                  onClick={async()=>{
                    if(!newNote.trim()||!user||!params.id||params.id==='new') return
                    setAddingNote(true)
                    try{
                      const res=await fetch(`${API}/api/trips/${params.id}/notes`,{
                        method:'POST',headers:{'Content-Type':'application/json'},
                        body:JSON.stringify({trip_id:params.id,user_id:user.uid,user_name:user.displayName,content:newNote,pinned:false})
                      })
                      if(res.ok){const note=await res.json();setNotes(p=>[...p,note])}
                    }catch(err){console.error(err)}
                    finally{setAddingNote(false);setNewNote('')}
                  }}
                  className="btn-primary px-4 flex items-center gap-2">
                  {addingNote?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}
                </button>
              </div>

              {/* Notes list */}
              {notes.length===0?(
                <p className="text-sm text-center py-4" style={{color:'var(--text-muted)'}}>No notes yet. Add something the group should know.</p>
              ):(
                <div className="space-y-2">
                  {[...notes].sort((a,b)=>Number(b.pinned)-Number(a.pinned)).map((note,i)=>(
                    <div key={note.id||i} className="flex items-start gap-3 p-3 rounded-xl transition-all"
                      style={{
                        background:note.pinned?'rgba(201,168,76,0.07)':'var(--bg-3)',
                        border:`1px solid ${note.pinned?'rgba(201,168,76,0.25)':'var(--border)'}`,
                      }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{color:'var(--text-primary)'}}>{note.content}</p>
                        <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>
                          {note.user_name||'Member'} · {note.created_at?new Date(note.created_at).toLocaleDateString():''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Pin toggle */}
                        <button
                          onClick={async()=>{
                            const updated={...note,pinned:!note.pinned}
                            setNotes(p=>p.map(n=>n.id===note.id?updated:n))
                            if(note.id&&params.id&&params.id!=='new'){
                              try{
                                await fetch(`${API}/api/trips/${params.id}/notes/${note.id}`,{
                                  method:'PATCH',headers:{'Content-Type':'application/json'},
                                  body:JSON.stringify({pinned:!note.pinned})
                                })
                              }catch{}
                            }
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            background:note.pinned?'rgba(201,168,76,0.2)':'var(--bg-4)',
                            color:note.pinned?'var(--gold)':'var(--text-muted)',
                          }}
                          title={note.pinned?'Unpin':'Pin for everyone'}>
                          📌
                        </button>
                        {/* Delete — only own notes */}
                        {user&&note.user_id===user.uid&&(
                          <button
                            onClick={async()=>{
                              setNotes(p=>p.filter(n=>n.id!==note.id))
                              if(note.id&&params.id&&params.id!=='new'){
                                try{
                                  await fetch(`${API}/api/trips/${params.id}/notes/${note.id}?user_id=${user.uid}`,{method:'DELETE'})
                                }catch{}
                              }
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{background:'rgba(244,63,94,0.08)',color:'#fb7185'}}>
                            <X className="w-3 h-3"/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOD GUIDE */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>🍜 Food guide</h3>
              <div className="space-y-4">
                <div>
                  <p className="section-label mb-2">Must try</p>
                  <div className="flex flex-wrap gap-2">
                    {(itinerary.food_guide?.must_try||[]).map((f:string,i:number)=>(
                      <span key={i} className="tag text-xs">{f}</span>
                    ))}
                  </div>
                </div>
                {(itinerary.food_guide?.vegetarian_options||[]).length>0&&(
                  <div>
                    <p className="section-label mb-2">Vegetarian options</p>
                    <div className="flex flex-wrap gap-2">
                      {itinerary.food_guide.vegetarian_options.map((f:string,i:number)=>(
                        <span key={i} className="tag text-xs">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(itinerary.food_guide?.food_safety_tips||[]).map((tip:string,i:number)=>(
                  <div key={i} className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5" style={{color:'var(--gold)'}}/>
                    <p className="text-sm" style={{color:'var(--text-secondary)'}}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}