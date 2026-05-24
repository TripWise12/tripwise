'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane, MapPin, Sparkles, ArrowRight, Loader2,
  TrendingDown, Calendar, Star, Zap, Globe,
  Mountain, UtensilsCrossed, Waves, Building2,
  ShoppingBag, Coffee, ChevronRight, ExternalLink
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const INTERESTS_LIST = [
  {id:'culture',label:'Culture',icon:Building2},
  {id:'food',label:'Food',icon:UtensilsCrossed},
  {id:'beaches',label:'Beaches',icon:Waves},
  {id:'adventure',label:'Adventure',icon:Mountain},
  {id:'shopping',label:'Shopping',icon:ShoppingBag},
  {id:'coffee',label:'Slow Travel',icon:Coffee},
]

const TIMEFRAMES = [
  {val:1,label:'Next month',desc:'Short notice deals'},
  {val:2,label:'Next 2 months',desc:'Sweet spot for planning'},
  {val:4,label:'Next 4 months',desc:'Best prices, most options'},
]

function DealScoreBar({score}:{score:number}) {
  const color = score>=85?'#2dd4a0':score>=70?'#e4c76b':'#fb7185'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{background:'var(--bg-4)'}}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{width:`${score}%`,background:color}} />
      </div>
      <span className="text-xs font-bold" style={{color}}>{score}</span>
    </div>
  )
}

export default function DiscoverPage() {
  const router = useRouter()
  const {user, loading:authLoading} = useAuth()
  const [origin, setOrigin] = useState('Mumbai')
  const [interests, setInterests] = useState<string[]>([])
  const [budget, setBudget] = useState(2000)
  const [duration, setDuration] = useState(7)
  const [timeframe, setTimeframe] = useState(2)
  const [results, setResults] = useState<Record<string,unknown>|null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(()=>{if(!authLoading&&!user) router.replace('/')},[user,authLoading,router])

  function toggleInterest(id:string){
    setInterests(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  }

  async function handleDiscover(){
    setLoading(true)
    setSearched(true)
    try{
      const res = await fetch(`${API}/api/discover`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({origin,interests,budget_usd:budget,trip_duration_days:duration,timeframe_months:timeframe,travel_style:'balanced'})
      })
      if(!res.ok) throw new Error('Failed')
      setResults(await res.json())
    }catch(e){console.error(e)}
    finally{setLoading(false)}
  }

  const dests = (results as any)?.destinations || []

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40" style={{background:'rgba(6,9,18,0.95)',backdropFilter:'blur(24px)',borderBottom:'1px solid var(--border)'}}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={()=>router.push('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#1c2642,#0f1628)',border:'1px solid rgba(201,168,76,0.35)'}}>
              <Plane className="w-4 h-4" style={{color:'var(--gold)'}}/>
            </div>
            <span className="font-display font-bold gradient-text">TripWise</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={()=>router.push('/history')} className="btn-secondary text-sm py-2 px-4">My trips</button>
            <button onClick={()=>router.push('/plan')} className="btn-primary text-sm py-2 px-4">Plan trip</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10 reveal">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full" style={{background:'rgba(201,168,76,0.08)',border:'1px solid rgba(201,168,76,0.2)'}}>
            <Sparkles className="w-3.5 h-3.5" style={{color:'var(--gold)'}}/>
            <span className="text-xs font-semibold tracking-wide" style={{color:'var(--gold-light)'}}>AI DEAL FINDER</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3" style={{color:'var(--text-primary)'}}>
            Find your next trip
          </h1>
          <p style={{color:'var(--text-secondary)'}}>
            Tell us your preferences — AI finds the best value destinations with cheap flights and hotels right now.
          </p>
        </div>

        {/* Search form */}
        <div className="glass rounded-2xl p-6 mb-8 reveal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Origin */}
            <div>
              <label className="section-label block mb-2">Flying from</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--text-muted)'}}/>
                <input className="input-field pl-9" placeholder="Your city" value={origin} onChange={e=>setOrigin(e.target.value)}/>
              </div>
            </div>
            {/* Budget */}
            <div>
              <label className="section-label block mb-2">Budget per person (USD)</label>
              <input type="number" className="input-field" placeholder="2000" value={budget} onChange={e=>setBudget(Number(e.target.value))}/>
            </div>
          </div>

          {/* Duration */}
          <div className="mb-5">
            <label className="section-label block mb-3">Trip duration</label>
            <div className="flex gap-2 flex-wrap">
              {[5,7,10,14].map(d=>(
                <button key={d} onClick={()=>setDuration(d)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background:duration===d?'rgba(201,168,76,0.15)':'var(--bg-3)',
                    border:`1px solid ${duration===d?'var(--gold)':'var(--border)'}`,
                    color:duration===d?'var(--gold-light)':'var(--text-secondary)',
                  }}>
                  {d} days
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="mb-5">
            <label className="section-label block mb-3">When are you looking to travel?</label>
            <div className="grid grid-cols-3 gap-3">
              {TIMEFRAMES.map(({val,label,desc})=>(
                <button key={val} onClick={()=>setTimeframe(val)}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background:timeframe===val?'rgba(201,168,76,0.1)':'var(--bg-3)',
                    border:`1px solid ${timeframe===val?'var(--gold)':'var(--border)'}`,
                  }}>
                  <p className="text-sm font-semibold" style={{color:timeframe===val?'var(--text-primary)':'var(--text-secondary)'}}>{label}</p>
                  <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="mb-6">
            <label className="section-label block mb-3">Your interests (optional)</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_LIST.map(({id,label,icon:Icon})=>(
                <button key={id} onClick={()=>toggleInterest(id)}
                  className={`tag ${interests.includes(id)?'active':''}`}>
                  <Icon className="w-3 h-3"/>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            onClick={handleDiscover} disabled={loading||!origin}>
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin"/>Finding best deals...</>
              : <><Sparkles className="w-5 h-5"/>Find my perfect trip</>}
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_,i)=>(
              <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-32 h-32 rounded-xl shimmer flex-shrink-0"/>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 shimmer rounded w-1/3"/>
                    <div className="h-6 shimmer rounded w-1/2"/>
                    <div className="h-3 shimmer rounded w-2/3"/>
                    <div className="h-3 shimmer rounded w-1/2"/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && searched && dests.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center">
            <Globe className="w-12 h-12 mx-auto mb-4" style={{color:'var(--text-muted)'}}/>
            <p style={{color:'var(--text-secondary)'}}>No results found. Try adjusting your preferences.</p>
          </div>
        )}

        {!loading && dests.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p style={{color:'var(--text-secondary)'}}>{dests.length} destinations found · {(results as any)?.timeframe}</p>
              {(results as any)?.best_month_to_travel && (
                <span className="badge badge-gold">Best month: {(results as any).best_month_to_travel}</span>
              )}
            </div>

            {dests.map((dest:any, i:number)=>(
              <div key={i} className="glass feature-card rounded-2xl overflow-hidden reveal"
                style={{transitionDelay:`${i*80}ms`}}>
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${getUnsplashId(dest.city)}?w=400&q=75`}
                      alt={dest.city}
                      className="w-full h-full object-cover"
                      onError={e=>{(e.target as HTMLImageElement).src=`https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&q=75`}}
                    />
                    <div className="absolute inset-0" style={{background:'linear-gradient(to right,transparent 60%,rgba(6,9,18,0.6))'}}/>
                    <div className="absolute top-3 left-3">
                      <span className="text-2xl">{dest.emoji_flag}</span>
                    </div>
                    {dest.badge && (
                      <div className="absolute top-3 right-3">
                        <span className="badge badge-gold text-xs">{dest.badge}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <h3 className="font-display text-2xl font-bold gradient-text">{dest.city}</h3>
                        <p className="text-sm" style={{color:'var(--text-secondary)'}}>{dest.country}</p>
                        <p className="text-sm mt-2" style={{color:'var(--text-secondary)'}}>{dest.why_now}</p>
                        {dest.seasonal_highlight && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Calendar className="w-3.5 h-3.5" style={{color:'var(--gold)'}}/>
                            <span className="text-xs" style={{color:'var(--gold-light)'}}>{dest.seasonal_highlight}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display text-2xl font-bold gradient-text">${dest.estimated_total_usd}</p>
                        <p className="text-xs" style={{color:'var(--text-muted)'}}>est. total per person</p>
                        {dest.total_vs_budget && (
                          <p className="text-xs mt-0.5" style={{color:'#2dd4a0'}}>{dest.total_vs_budget}</p>
                        )}
                      </div>
                    </div>

                    {/* Deal score */}
                    <div className="mt-3 mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{color:'var(--text-muted)'}}>Deal score</span>
                        <TrendingDown className="w-3.5 h-3.5" style={{color:'#2dd4a0'}}/>
                      </div>
                      <DealScoreBar score={dest.deal_score||75}/>
                    </div>

                    {/* Costs row */}
                    <div className="flex items-center gap-4 flex-wrap mb-3">
                      <div className="flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5" style={{color:'var(--text-muted)'}}/>
                        <span className="text-xs" style={{color:'var(--text-secondary)'}}>Flights from ${dest.estimated_flight_usd}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" style={{color:'var(--text-muted)'}}/>
                        <span className="text-xs" style={{color:'var(--text-secondary)'}}>Hotel ~${dest.estimated_hotel_per_night_usd}/night</span>
                      </div>
                      {dest.visa_for_origin && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(45,212,160,0.1)',color:'#2dd4a0'}}>{dest.visa_for_origin}</span>
                      )}
                    </div>

                    {/* Top 3 things */}
                    {dest.top_3_things && (
                      <div className="space-y-1 mb-3">
                        {dest.top_3_things.map((t:string,j:number)=>(
                          <div key={j} className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{background:'var(--gold)'}}/>
                            <p className="text-xs" style={{color:'var(--text-secondary)'}}>{t}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={()=>router.push(`/plan?dest=${encodeURIComponent(dest.city)}&origin=${encodeURIComponent(origin)}`)}
                        className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
                        <Zap className="w-3.5 h-3.5"/>Plan this trip
                      </button>
                      {dest.skyscanner_link && (
                        <a href={dest.skyscanner_link} target="_blank" rel="noopener noreferrer"
                          className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4">
                          <ExternalLink className="w-3.5 h-3.5"/>Search flights
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(results as any)?.money_saving_tip && (
              <div className="glass-gold rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 mt-0.5 flex-shrink-0" style={{color:'var(--gold)'}}/>
                  <p className="text-sm" style={{color:'var(--gold-light)'}}>{(results as any).money_saving_tip}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Map city names to curated Unsplash photo IDs
function getUnsplashId(city: string): string {
  const map: Record<string,string> = {
    'tokyo': '1540959733332-eab4deabeeaf',
    'bali': '1537996194471-e657df975ab4',
    'paris': '1502602898657-3e91760cbb34',
    'new york': '1485871981521-5b1fd3805eee',
    'london': '1513635269975-59663e0ac1ad',
    'bangkok': '1563492065599-3520f775eeed',
    'dubai': '1512453979798-5ea266f8880c',
    'singapore': '1525625293386-3f8f99389edd',
    'rome': '1552832230-c0197dd311b5',
    'sydney': '1506973035872-a4ec16b8e8d9',
    'barcelona': '1583422409516-2895a77efded',
    'amsterdam': '1534351590666-13e3e96b5702',
    'istanbul': '1524231757912-21f4fe3a7200',
    'seoul': '1601979031925-424d5056e54b',
    'kyoto': '1493976040374-85c8e12f0c0e',
    'maldives': '1514282401047-d79a71a590e8',
  }
  const key = city.toLowerCase()
  return map[key] || '1488646953014-85cb44e25828' // fallback: generic travel
}