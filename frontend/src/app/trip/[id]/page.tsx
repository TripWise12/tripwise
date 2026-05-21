'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane, MapPin, Cloud, Shield, CreditCard, Smartphone, Plug, History,
  Check, ChevronRight, ChevronDown, ChevronUp, Clock,
  Package, Bookmark, Phone, Edit3, Share2, Utensils, Car,
  Hotel, ArrowRight, X, Loader2, RefreshCw, Plus, Info,
  Zap, Star, AlertTriangle, Sun, CloudRain, Wind,
  Calendar, Music, Flag, Download, ExternalLink, Lightbulb
} from 'lucide-react'

import { useAuth } from '@/context/AuthContext'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const TABS = ['Overview','Itinerary','Flights','Hotels','Packing','Budget','Group']

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

function FlightsTab({tripData}:{tripData:Record<string,unknown>}) {
  const [flights,setFlights] = useState<Record<string,unknown>|null>(null)
  const [loading,setLoading] = useState(false)
  async function search() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/flights`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({origin:tripData.origin,destination:tripData.destination,departure_date:tripData.start_date,return_date:tripData.end_date,adults:tripData.group_size})})
      setFlights(await res.json())
    } catch{alert('Flight search failed.')} finally{setLoading(false)}
  }
  if(!flights) return (
    <div className="glass rounded-2xl p-12 text-center">
      <Plane className="w-12 h-12 mx-auto mb-4" style={{color:'var(--text-muted)'}} />
      <h3 className="font-display text-xl font-bold mb-2" style={{color:'var(--text-primary)'}}>Find flights</h3>
      <p className="mb-6 text-sm" style={{color:'var(--text-secondary)'}}>Search AI-powered flight options for your route</p>
      <button className="btn-primary flex items-center gap-2 mx-auto" onClick={search} disabled={loading}>
        {loading?<Loader2 className="w-4 h-4 animate-spin"/>:<Zap className="w-4 h-4"/>}
        {loading?'Searching...':'Search flights'}
      </button>
    </div>
  )
  const results = (flights.results as Record<string,unknown>[])||[]
  const fd = flights.flexible_dates as Record<string,unknown>|undefined
  return (
    <div className="space-y-4">
      {fd&&<div className="glass rounded-xl p-4" style={{borderColor:'rgba(45,212,160,0.3)'}}>
        <div className="flex items-center gap-2"><span className="badge badge-green">Tip</span>
        <p className="text-sm" style={{color:'var(--text-secondary)'}}>{String(fd.note||'')}</p></div>
      </div>}
      {results.map((f,i)=>(
        <div key={i} className="glass feature-card rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {f.badge&&<span className="badge badge-gold">{String(f.badge)}</span>}
                <span className="font-semibold" style={{color:'var(--text-primary)'}}>{String(f.airline)}</span>
                <span className="text-xs font-mono" style={{color:'var(--text-muted)'}}>{String(f.flight_number)}</span>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold text-lg" style={{color:'var(--text-primary)'}}>{String(f.departure_time)}</p>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-px" style={{background:'var(--border)'}} />
                  <div className="text-center">
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>{String(f.duration)}</p>
                    <p className="text-xs" style={{color:f.stops===0?'#2dd4a0':'var(--text-muted)'}}>
                      {f.stops===0?'Direct':`${f.stops} stop`}
                    </p>
                  </div>
                  <div className="flex-1 h-px" style={{background:'var(--border)'}} />
                </div>
                <p className="font-bold text-lg" style={{color:'var(--text-primary)'}}>{String(f.arrival_time)}</p>
              </div>
              <div className="flex gap-4 mt-2">
                <span className="text-xs" style={{color:'var(--text-muted)'}}>🧳 {String(f.baggage_kg)}kg</span>
                <span className="text-xs" style={{color:'var(--text-muted)'}}>⏱ {String(f.on_time_percent)}% on-time</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-2xl" style={{color:'var(--text-primary)'}}>${Number(f.price_inr||f.price_usd||0).toLocaleString()}</p>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>per person</p>
              <a href="https://www.google.com/flights" target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-block btn-primary text-sm py-2 px-4">Book →</a>
            </div>
          </div>
        </div>
      ))}
      <button className="btn-secondary w-full" onClick={search}><RefreshCw className="w-4 h-4 inline mr-2"/>Refresh</button>
    </div>
  )
}

export default function TripPage() {
  const router = useRouter()
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
  const [expenses,setExpenses] = useState<{title:string;amount:number;who:string}[]>([])
  const [newExp,setNewExp] = useState({title:'',amount:'',who:''})

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(()=>{
    try {
      const v=sessionStorage.getItem('tripwise_viability')
      const i=sessionStorage.getItem('tripwise_itinerary')
      const t=sessionStorage.getItem('tripwise_tripdata')
      if(v) setViability(JSON.parse(v))
      if(i) setItinerary(JSON.parse(i))
      if(t) setTripData(JSON.parse(t))
    } catch(e){console.error(e)}
  },[])

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
          <div className="space-y-4">
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
          <div>
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
        {activeTab==='Flights'&&<FlightsTab tripData={tripData} />}

        {/* ── HOTELS ── */}
        {activeTab==='Hotels'&&(
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Hotel className="w-5 h-5 mt-0.5" style={{color:'var(--gold)'}} />
                <div>
                  <h3 className="font-semibold" style={{color:'var(--text-primary)'}}>
                    Recommended area: {itinerary.accommodation?.recommended_area}
                  </h3>
                  <p className="text-sm mt-1" style={{color:'var(--text-secondary)'}}>{itinerary.accommodation?.reason}</p>
                </div>
              </div>
            </div>
            {(itinerary.accommodation?.options||[]).map((opt,i)=>(
              <div key={i} className="glass feature-card rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="badge badge-purple">{opt.type}</span>
                      {opt.rating&&<span className="text-xs" style={{color:'#fbbf24'}}>★ {opt.rating}</span>}
                    </div>
                    <h3 className="font-semibold" style={{color:'var(--text-primary)'}}>{opt.name}</h3>
                    <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{opt.area}</p>
                    <p className="text-sm mt-2" style={{color:'var(--text-secondary)'}}>{opt.why}</p>
                    {(opt.amenities||[]).length>0&&(
                      <div className="flex flex-wrap gap-1 mt-3">
                        {opt.amenities.map((a,j)=>(
                          <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                            style={{background:'var(--bg-3)',color:'var(--text-muted)'}}>{a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg" style={{color:'var(--text-primary)'}}>
                      ${(opt.price_per_night_usd||0)}/night
                    </p>
                    <p className="text-sm font-medium mt-1" style={{color:'var(--gold-light)'}}>
                      ${(opt.total_usd||0)} total
                    </p>
                  </div>
                </div>
                <a href={opt.booking_link||'https://www.booking.com'} target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 btn-secondary text-sm py-2.5 px-4">
                  Book on Booking.com <ArrowRight className="w-3.5 h-3.5"/>
                </a>
              </div>
            ))}
            {itinerary.local_transport&&(
              <div className="glass rounded-2xl p-5">
                <h4 className="font-semibold mb-3" style={{color:'var(--text-primary)'}}>Getting around</h4>
                <div className="flex items-start gap-3">
                  <Car className="w-4 h-4 mt-0.5" style={{color:'var(--gold)'}} />
                  <div>
                    <p className="font-medium text-sm" style={{color:'var(--text-primary)'}}>{itinerary.local_transport.primary_recommendation}</p>
                    <p className="text-xs mt-1" style={{color:'var(--text-secondary)'}}>{itinerary.local_transport.reason}</p>
                    <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>How to get: {itinerary.local_transport.how_to_get}</p>
                    <p className="text-sm font-medium mt-2" style={{color:'var(--gold-light)'}}>
                      ~${itinerary.local_transport.cost_for_trip_usd} for the trip · ${itinerary.local_transport.daily_cost_usd}/day
                    </p>
                    {itinerary.local_transport.official_link&&(
                      <a href={itinerary.local_transport.official_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs mt-1 flex items-center gap-1" style={{color:'var(--gold-light)'}}>
                        <ExternalLink className="w-3 h-3"/>Official site
                      </a>
                    )}
                    {itinerary.local_transport.airport_transfer&&(
                      <div className="mt-3 p-3 rounded-xl" style={{background:'var(--bg-3)'}}>
                        <p className="text-xs font-medium mb-1" style={{color:'var(--text-primary)'}}>Airport transfer</p>
                        <p className="text-xs" style={{color:'var(--text-secondary)'}}>
                          {itinerary.local_transport.airport_transfer.recommendation} · ${itinerary.local_transport.airport_transfer.cost_usd} · ~{itinerary.local_transport.airport_transfer.duration_mins} min
                        </p>
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>{itinerary.local_transport.airport_transfer.from}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── PACKING ── */}
        {activeTab==='Packing'&&(
          <div className="space-y-4">
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
          <div className="space-y-4">
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
          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>Invite your group</h3>
              <div className="flex gap-3">
                <input className="input-field flex-1"
                  value={typeof window!=='undefined'?window.location.href:''}
                  readOnly />
                <button className="btn-primary px-4 flex items-center gap-2" onClick={copyLink}>
                  {copied?'Copied!':'Copy link'}
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>Expense tracker</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <input className="input-field" placeholder="What for?" value={newExp.title}
                  onChange={e=>setNewExp(p=>({...p,title:e.target.value}))} />
                <input className="input-field" placeholder="$ Amount" type="number" value={newExp.amount}
                  onChange={e=>setNewExp(p=>({...p,amount:e.target.value}))} />
                <input className="input-field" placeholder="Paid by" value={newExp.who}
                  onChange={e=>setNewExp(p=>({...p,who:e.target.value}))} />
              </div>
              <button className="btn-secondary w-full flex items-center justify-center gap-2"
                onClick={()=>{
                  if(newExp.title&&newExp.amount&&newExp.who){
                    setExpenses(p=>[...p,{title:newExp.title,amount:Number(newExp.amount),who:newExp.who}])
                    setNewExp({title:'',amount:'',who:''})
                  }
                }}>
                <Plus className="w-4 h-4"/>Add expense
              </button>
              {expenses.length>0&&(
                <div className="mt-4 space-y-2">
                  {expenses.map((e,i)=>(
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{background:'var(--bg-3)'}}>
                      <div>
                        <span className="text-sm font-medium" style={{color:'var(--text-primary)'}}>{e.title}</span>
                        <span className="text-xs ml-2" style={{color:'var(--text-muted)'}}>paid by {e.who}</span>
                      </div>
                      <span className="font-semibold" style={{color:'var(--text-primary)'}}>
                        ${e.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2" style={{borderTop:'1px solid var(--border)'}}>
                    <span className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>Total spent</span>
                    <span className="font-bold gradient-text font-display">
                      ${expenses.reduce((s,e)=>s+e.amount,0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4" style={{color:'var(--text-primary)'}}>🍜 Food guide</h3>
              <div className="space-y-4">
                <div>
                  <p className="section-label mb-2">Must try</p>
                  <div className="flex flex-wrap gap-2">
                    {(itinerary.food_guide?.must_try||[]).map((f,i)=>(
                      <span key={i} className="tag text-xs">{f}</span>
                    ))}
                  </div>
                </div>
                {(itinerary.food_guide?.vegetarian_options||[]).length>0&&(
                  <div>
                    <p className="section-label mb-2">Vegetarian options</p>
                    <div className="flex flex-wrap gap-2">
                      {itinerary.food_guide.vegetarian_options.map((f,i)=>(
                        <span key={i} className="tag text-xs">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                {(itinerary.food_guide?.food_safety_tips||[]).map((tip,i)=>(
                  <div key={i} className="flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 mt-0.5" style={{color:'var(--gold)'}} />
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
