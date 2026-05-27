'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane, MapPin, Sparkles, ArrowRight, Loader2,
  TrendingDown, Calendar, Star, Zap, Globe,
  Mountain, UtensilsCrossed, Waves, Building2,
  ShoppingBag, Coffee, ExternalLink, AlertCircle,
  RefreshCw, DollarSign, Clock, Users
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const INTERESTS_LIST = [
  { id: 'culture',   label: 'Culture',     icon: Building2 },
  { id: 'food',      label: 'Food',        icon: UtensilsCrossed },
  { id: 'beaches',   label: 'Beaches',     icon: Waves },
  { id: 'adventure', label: 'Adventure',   icon: Mountain },
  { id: 'shopping',  label: 'Shopping',    icon: ShoppingBag },
  { id: 'coffee',    label: 'Slow Travel', icon: Coffee },
]

const TIMEFRAMES = [
  { val: 1, label: 'Next month',    desc: 'Short notice deals' },
  { val: 2, label: 'Next 2 months', desc: 'Sweet spot for planning' },
  { val: 4, label: 'Next 4 months', desc: 'Best prices, most options' },
]

// Use Unsplash Source API - searches by keyword, always returns a relevant image
// No API key needed, always works
function getUnsplashUrl(city: string, country: string): string {
  const query = encodeURIComponent(`${city} ${country} travel cityscape`)
  // Use Unsplash source with search - returns real relevant photo
  return `https://source.unsplash.com/600x400/?${query}`
}

// Fallback curated IDs for top cities (faster load)
const CITY_PHOTOS: Record<string, string> = {
  'tokyo':        '1540959733332-eab4deabeeaf',
  'bali':         '1537996194471-e657df975ab4',
  'paris':        '1502602898657-3e91760cbb34',
  'new york':     '1485871981521-5b1fd3805eee',
  'london':       '1513635269975-59663e0ac1ad',
  'bangkok':      '1563492065599-3520f775eeed',
  'dubai':        '1512453979798-5ea266f8880c',
  'singapore':    '1525625293386-3f8f99389edd',
  'rome':         '1552832230-c0197dd311b5',
  'sydney':       '1506973035872-a4ec16b8e8d9',
  'barcelona':    '1583422409516-2895a77efded',
  'amsterdam':    '1534351590666-13e3e96b5702',
  'istanbul':     '1524231757912-21f4fe3a7200',
  'seoul':        '1601979031925-424d5056e54b',
  'kyoto':        '1493976040374-85c8e12f0c0e',
  'maldives':     '1514282401047-d79a71a590e8',
  'kuala lumpur': '1596422846543-ba35f8a7e3f9',
  'hong kong':    '1536599018926-a7ef57d9b851',
  'prague':       '1541849546-216c0b64e813',
  'lisbon':       '1548707309-dcebeab9ea9b',
  'vienna':       '1516550135131-ff64accc9eb4',
  'delhi':        '1587474260584-136574297316',
  'mumbai':       '1570168007204-dfb528c6958f',
  'phuket':       '1537996194471-e657df975ab4',
  'milan':        '1520175090-80f9e48d5852',
  'berlin':       '1560969184-10fe8719e047',
  'zurich':       '1515488534-d5d8f5f3b3d3',
  'toronto':      '1517935706615-2717063c2225',
  'vancouver':    '1560813962-ff3d8fcf59ba',
  'cape town':    '1580060839134-75a5edca2e99',
  'nairobi':      '1547517023-7d00575dc9f1',
  'cairo':        '1539650116574-75c0c6d73f6e',
  'mexico city':  '1518638150340-f706e86654de',
  'rio':          '1483729600765-4c5f2c0e0ae2',
  'buenos aires': '1589909202802-8f4aadce9d53',
}

function getPhotoUrl(city: string, country: string): string {
  const key = city.toLowerCase().trim()
  // Try exact match first
  if (CITY_PHOTOS[key]) {
    return `https://images.unsplash.com/photo-${CITY_PHOTOS[key]}?w=600&q=80&auto=format&fit=crop`
  }
  // Try partial match
  for (const [k, v] of Object.entries(CITY_PHOTOS)) {
    if (key.includes(k) || k.includes(key.split(' ')[0])) {
      return `https://images.unsplash.com/photo-${v}?w=600&q=80&auto=format&fit=crop`
    }
  }
  // Fall back to Unsplash Source API (keyword search - always returns relevant image)
  return `https://source.unsplash.com/600x400/?${encodeURIComponent(city + ' ' + country + ' travel')}`
}

function DealBar({ score }: { score: number }) {
  const color = score >= 85 ? '#2dd4a0' : score >= 70 ? '#e4c76b' : '#fb7185'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-4)' }}>
        <div className="h-full rounded-full score-bar"
          style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-6" style={{ color }}>{score}</span>
    </div>
  )
}

interface Destination {
  rank: number
  city: string
  country: string
  emoji_flag: string
  why_now: string
  seasonal_highlight: string
  deal_score: number
  deal_badge: string
  estimated_flight_usd: number
  flight_note: string
  skyscanner_link: string
  estimated_hotel_per_night_usd: number
  hotel_note: string
  estimated_total_usd: number
  total_vs_budget: string
  best_for: string[]
  not_ideal_for: string[]
  weather: string
  crowd_level: string
  visa_for_origin: string
  top_3_things: string[]
  local_tip: string
  hidden_gem: string
  festivals_in_window: string[]
  similar_to: string
}

interface DiscoverResults {
  timeframe: string
  search_month: string
  deals_summary: string
  best_month_to_travel: string
  money_saving_tip: string
  destinations: Destination[]
}

export default function DiscoverPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [origin, setOrigin] = useState('Mumbai')
  const [interests, setInterests] = useState<string[]>([])
  const [budget, setBudget] = useState(2000)
  const [duration, setDuration] = useState(7)
  const [timeframe, setTimeframe] = useState(2)
  const [results, setResults] = useState<DiscoverResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  function toggleInterest(id: string) {
    setInterests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  async function handleDiscover() {
    if (!origin.trim()) return
    setLoading(true)
    setSearched(true)
    setError('')
    setResults(null)
    try {
      const res = await fetch(`${API}/api/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          interests,
          budget_usd: budget,
          trip_duration_days: duration,
          timeframe_months: timeframe,
          travel_style: 'balanced',
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error((errData as any).detail || `Server error ${res.status}`)
      }
      const data = await res.json()
      setResults(data)
    } catch (e: any) {
      console.error('Discover error:', e)
      setError(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--gold)' }} />
      </div>
    )
  }

  const dests = results?.destinations || []

  return (
    <div className="min-h-screen page-enter">

      {/* Nav */}
      <nav className="sticky top-0 z-40"
        style={{ background: 'rgba(6,9,18,0.95)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1c2642,#0f1628)', border: '1px solid rgba(201,168,76,0.35)' }}>
              <Plane className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            </div>
            <span className="font-display font-bold gradient-text">TripWise</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/history')} className="btn-secondary text-sm py-2 px-4">My trips</button>
            <button onClick={() => router.push('/plan')} className="btn-primary text-sm py-2 px-4">Plan trip</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--gold-light)' }}>
              AI DEAL FINDER
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Find your next trip
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Tell us your preferences — AI finds the best value destinations with cheap flights and hotels right now.
          </p>
        </div>

        {/* Search form */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="section-label block mb-2">Flying from</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input className="input-field pl-9" placeholder="Your city e.g. Mumbai, London"
                  value={origin} onChange={e => setOrigin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleDiscover()} />
              </div>
            </div>
            <div>
              <label className="section-label block mb-2">Budget per person (USD)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input type="number" className="input-field pl-9" placeholder="2000"
                  value={budget} onChange={e => setBudget(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-5">
            <label className="section-label block mb-3">Trip duration</label>
            <div className="flex gap-2 flex-wrap">
              {[5, 7, 10, 14].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: duration === d ? 'rgba(201,168,76,0.15)' : 'var(--bg-3)',
                    border: `1px solid ${duration === d ? 'var(--gold)' : 'var(--border)'}`,
                    color: duration === d ? 'var(--gold-light)' : 'var(--text-secondary)',
                  }}>
                  <Clock className="w-3 h-3 inline mr-1" />{d} days
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="mb-5">
            <label className="section-label block mb-3">When are you thinking?</label>
            <div className="grid grid-cols-3 gap-3">
              {TIMEFRAMES.map(({ val, label, desc }) => (
                <button key={val} onClick={() => setTimeframe(val)}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background: timeframe === val ? 'rgba(201,168,76,0.1)' : 'var(--bg-3)',
                    border: `1px solid ${timeframe === val ? 'var(--gold)' : 'var(--border)'}`,
                  }}>
                  <p className="text-sm font-semibold"
                    style={{ color: timeframe === val ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <label className="section-label block mb-3">Interests (optional)</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_LIST.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => toggleInterest(id)}
                  className={`tag ${interests.includes(id) ? 'active' : ''}`}>
                  <Icon className="w-3 h-3" />{label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            onClick={handleDiscover} disabled={loading || !origin.trim()}>
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" />Finding best deals...</>
              : <><Sparkles className="w-5 h-5" />Find my perfect trip</>}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="glass rounded-xl p-5 mb-6 flex items-start gap-3"
            style={{ border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.06)' }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#fb7185' }} />
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: '#fb7185' }}>Something went wrong</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </div>
            <button onClick={handleDiscover} className="btn-secondary text-sm py-2 px-3 flex items-center gap-1.5 flex-shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />Retry
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-52 h-48 skeleton flex-shrink-0" />
                  <div className="flex-1 p-5 space-y-3">
                    <div className="h-4 skeleton rounded w-1/4" />
                    <div className="h-7 skeleton rounded w-1/2" />
                    <div className="h-3 skeleton rounded w-3/4" />
                    <div className="h-3 skeleton rounded w-1/2" />
                    <div className="h-2 skeleton rounded w-full" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-9 skeleton rounded-xl w-32" />
                      <div className="h-9 skeleton rounded-xl w-28" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && searched && !error && dests.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No results found</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Try adjusting your budget or timeframe.</p>
          </div>
        )}

        {!loading && dests.length > 0 && (
          <div className="space-y-4 page-enter">

            {/* Summary bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {dests.length} destinations found · {results?.timeframe}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{results?.deals_summary}</p>
              </div>
              {results?.best_month_to_travel && (
                <span className="badge badge-gold">Best: {results.best_month_to_travel}</span>
              )}
            </div>

            {/* Destination cards */}
            {dests.map((dest, i) => (
              <div key={i} className="glass feature-card rounded-2xl overflow-hidden card-enter"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex flex-col md:flex-row">

                  {/* Image */}
                  <div className="relative w-full md:w-52 flex-shrink-0 overflow-hidden"
                    style={{ minHeight: '200px' }}>
                    <img
                      src={getPhotoUrl(dest.city, dest.country || '')}
                      alt={`${dest.city}, ${dest.country}`}
                      className="w-full h-full object-cover object-center"
                      style={{ minHeight: '200px' }}
                      loading="lazy"
                      onError={e => {
                        // Try Unsplash Source as fallback
                        const t = e.target as HTMLImageElement
                        if (!t.src.includes('source.unsplash')) {
                          t.src = `https://source.unsplash.com/600x400/?${encodeURIComponent(dest.city + ' travel landmark')}`
                        } else {
                          t.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80'
                        }
                      }}
                    />
                    {/* Rank badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{ background: 'rgba(6,9,18,0.85)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.4)' }}>
                      {dest.rank}
                    </div>
                    {dest.deal_badge && (
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-gold">{dest.deal_badge}</span>
                      </div>
                    )}
                    {/* Flag */}
                    <div className="absolute bottom-3 left-3 text-2xl">{dest.emoji_flag}</div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                      <div>
                        <h3 className="font-display text-2xl font-bold gradient-text">{dest.city}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{dest.country}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold gradient-text">
                          ~${dest.estimated_total_usd?.toLocaleString()}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>est. per person</p>
                        {dest.total_vs_budget && (
                          <p className="text-xs mt-0.5" style={{ color: '#2dd4a0' }}>{dest.total_vs_budget}</p>
                        )}
                      </div>
                    </div>

                    {/* Why now */}
                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{dest.why_now}</p>

                    {/* Seasonal highlight */}
                    {dest.seasonal_highlight && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                        <span className="text-xs" style={{ color: 'var(--gold-light)' }}>{dest.seasonal_highlight}</span>
                      </div>
                    )}

                    {/* Deal score */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Deal score</span>
                        <TrendingDown className="w-3.5 h-3.5" style={{ color: '#2dd4a0' }} />
                      </div>
                      <DealBar score={dest.deal_score || 75} />
                    </div>

                    {/* Cost pills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-3 py-1 rounded-full"
                        style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold-light)' }}>
                        ✈️ Flights from ${dest.estimated_flight_usd}
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full"
                        style={{ background: 'rgba(74,127,212,0.1)', color: '#7aa8e8' }}>
                        🏨 Hotel ~${dest.estimated_hotel_per_night_usd}/night
                      </span>
                      {dest.visa_for_origin && (
                        <span className="text-xs px-3 py-1 rounded-full"
                          style={{ background: 'rgba(45,212,160,0.1)', color: '#2dd4a0' }}>
                          🛂 {dest.visa_for_origin}
                        </span>
                      )}
                      {dest.crowd_level && (
                        <span className="text-xs px-3 py-1 rounded-full"
                          style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>
                          👥 {dest.crowd_level} crowds
                        </span>
                      )}
                    </div>

                    {/* Weather */}
                    {dest.weather && (
                      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                        🌤 {dest.weather}
                      </p>
                    )}

                    {/* Expand toggle */}
                    <button onClick={() => setExpanded(expanded === i ? null : i)}
                      className="text-xs mb-3 underline" style={{ color: 'var(--text-muted)' }}>
                      {expanded === i ? 'Show less' : 'Show top picks & tips'}
                    </button>

                    {/* Expanded content */}
                    {expanded === i && (
                      <div className="space-y-3 mb-3 tab-content">
                        {/* Top 3 things */}
                        {dest.top_3_things?.length > 0 && (
                          <div>
                            <p className="section-label mb-2">Top experiences</p>
                            <div className="space-y-1">
                              {dest.top_3_things.map((t, j) => (
                                <div key={j} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                                    style={{ background: 'var(--gold)' }} />
                                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Local tip */}
                        {dest.local_tip && (
                          <div className="flex items-start gap-2 p-3 rounded-xl"
                            style={{ background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.15)' }}>
                            <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                            <p className="text-xs" style={{ color: 'var(--gold-light)' }}>{dest.local_tip}</p>
                          </div>
                        )}
                        {/* Hidden gem */}
                        {dest.hidden_gem && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            💎 Hidden gem: {dest.hidden_gem}
                          </p>
                        )}
                        {/* Best for */}
                        {dest.best_for?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {dest.best_for.map((b, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(45,212,160,0.08)', color: '#2dd4a0' }}>
                                ✓ {b}
                              </span>
                            ))}
                          </div>
                        )}
                        {dest.similar_to && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Similar vibe: {dest.similar_to}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => router.push(`/plan?dest=${encodeURIComponent(dest.city)}&origin=${encodeURIComponent(origin)}`)}
                        className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
                        <Zap className="w-3.5 h-3.5" />Plan this trip
                      </button>
                      <a href={`https://www.skyscanner.com/transport/flights/${origin.split(',')[0].trim().substring(0, 3).toLowerCase()}/${dest.city.split(' ')[0].substring(0, 3).toLowerCase()}/`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4">
                        <ExternalLink className="w-3.5 h-3.5" />Search flights
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Money saving tip */}
            {results?.money_saving_tip && (
              <div className="glass-gold rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                  <p className="text-sm" style={{ color: 'var(--gold-light)' }}>{results.money_saving_tip}</p>
                </div>
              </div>
            )}

            <button className="btn-secondary w-full flex items-center justify-center gap-2" onClick={handleDiscover}>
              <RefreshCw className="w-4 h-4" />Search again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}