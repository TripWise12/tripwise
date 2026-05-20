'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Plane, MapPin, Calendar, ArrowRight, ArrowLeft,
  Zap, Mountain, Coffee, UtensilsCrossed, ShoppingBag,
  Building2, Baby, Backpack, Waves, Check, Loader2, MessageSquare
} from 'lucide-react'

import { useAuth } from '@/context/AuthContext'
import { signInWithGoogle } from '@/lib/firebase'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const INTERESTS = [
  {id:'adventure',label:'Adventure',icon:Mountain},
  {id:'culture',label:'Culture & History',icon:Building2},
  {id:'food',label:'Food & Nightlife',icon:UtensilsCrossed},
  {id:'beaches',label:'Beaches',icon:Waves},
  {id:'shopping',label:'Shopping',icon:ShoppingBag},
  {id:'coffee',label:'Cafés & Slow Travel',icon:Coffee},
  {id:'family',label:'Family-friendly',icon:Baby},
  {id:'backpacker',label:'Budget Backpacker',icon:Backpack},
]

const DIETARY = ['Vegetarian','Vegan','Halal','Gluten-free','No restrictions']
const STAY_TYPES = ['Hotel','Airbnb / Homestay','Hostel','Guesthouse','Resort',"Doesn't matter"]
const PACE_OPTIONS = [
  {id:'hectic',label:'Hectic',desc:'Pack in everything — 6-8 spots/day'},
  {id:'balanced',label:'Balanced',desc:'Mix of planned + free time — 4-5 spots/day'},
  {id:'relaxed',label:'Relaxed',desc:'Slow travel — fewer spots, more depth'},
]

const LOADING_MESSAGES = [
  'Checking conditions at destination...',
  'Analysing visa requirements...',
  'Forecasting weather for your dates...',
  'Identifying festivals and events...',
  'Mapping the best routes...',
  'Crafting your day-by-day plan...',
  'Building your packing list...',
  'Calculating real costs...',
  'Almost ready...',
]

interface TripData {
  origin: string
  destination: string
  start_date: string
  end_date: string
  group_size: number
  interests: string[]
  pace: string
  stay_type: string
  budget_usd: number
  dietary: string[]
  planning_to_drive: boolean
  personal_notes: string
}

function PlanContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingIdx, setLoadingIdx] = useState(0)

  const [data, setData] = useState<TripData>({
    origin: params.get('origin') || '',
    destination: params.get('dest') || '',
    start_date: '',
    end_date: '',
    group_size: 2,
    interests: [],
    pace: 'balanced',
    stay_type: 'hotel',
    budget_usd: 2000,
    dietary: [],
    planning_to_drive: false,
    personal_notes: '',
  })

  // Redirect to home if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    let t: ReturnType<typeof setInterval>
    if (loading) t = setInterval(() => setLoadingIdx(m => (m + 1) % LOADING_MESSAGES.length), 2200)
    return () => clearInterval(t)
  }, [loading])

  function update(key: keyof TripData, val: unknown) {
    setData(d => ({...d, [key]: val}))
  }

  function toggleArr(key: 'interests' | 'dietary', val: string) {
    setData(d => {
      const arr = d[key] as string[]
      return {...d, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]}
    })
  }

  async function handleGenerate() {
    setLoading(true)
    try {
      const [vRes, iRes] = await Promise.all([
        fetch(`${API}/api/viability`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            destination: data.destination, origin: data.origin,
            start_date: data.start_date, end_date: data.end_date,
            interests: data.interests,
          }),
        }),
        fetch(`${API}/api/generate-itinerary`, {
          method: 'POST', headers: {'Content-Type':'application/json'},
          body: JSON.stringify(data),
        }),
      ])

      const viability = await vRes.json()
      const itinerary = await iRes.json()

      sessionStorage.setItem('tripiq_viability', JSON.stringify(viability))
      sessionStorage.setItem('tripiq_itinerary', JSON.stringify(itinerary))
      sessionStorage.setItem('tripiq_tripdata', JSON.stringify(data))

      router.push('/trip/new')
    } catch (err) {
      console.error(err)
      alert('Generation failed. Check your API key and backend connection.')
    } finally {
      setLoading(false)
    }
  }

  const steps = [{n:1,label:'Where & When'},{n:2,label:'Your Style'},{n:3,label:'Budget'},{n:4,label:'Details'}]
  const canProceed1 = data.destination.trim() && data.origin.trim() && data.start_date && data.end_date
  const canProceed2 = data.interests.length > 0
  const canProceed3 = data.budget_usd > 0

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{color:'var(--gold)'}} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="orb w-96 h-96 top-1/4 left-1/4" style={{background:'#c9a84c',opacity:0.08}} />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 glow-gold relative pulse-ring"
            style={{background:'rgba(201,168,76,0.1)',border:'1px solid rgba(201,168,76,0.3)'}}>
            <Loader2 className="w-9 h-9 animate-spin" style={{color:'var(--gold)'}} />
          </div>
          <h2 className="font-display text-3xl font-bold mb-4" style={{color:'var(--text-primary)'}}>
            Building your trip
          </h2>
          <p className="mb-8 text-lg transition-all" style={{color:'var(--text-secondary)'}}>
            {LOADING_MESSAGES[loadingIdx]}
          </p>
          <div className="space-y-3 text-left">
            {['Viability report, visa & weather check','AI day-by-day itinerary','Packing list & budget breakdown'].map((item,i)=>(
              <div key={item} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{background:i===0?'rgba(45,212,160,0.15)':'rgba(201,168,76,0.1)'}}>
                  {i===0
                    ? <Check className="w-3 h-3" style={{color:'#2dd4a0'}} />
                    : <Loader2 className="w-3 h-3 animate-spin" style={{color:'var(--gold)'}} />}
                </div>
                <span className="text-sm" style={{color:'var(--text-secondary)'}}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="orb w-72 h-72 -top-20 left-1/3" style={{background:'#c9a84c',opacity:0.07}} />
      <div className="max-w-2xl mx-auto relative z-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center gap-3 justify-center mb-5 cursor-pointer" onClick={()=>router.push('/')}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{background:'linear-gradient(135deg,#1c2642,#0f1628)',border:'1px solid rgba(201,168,76,0.35)'}}>
              <Plane className="w-4 h-4" style={{color:'var(--gold)'}} />
            </div>
            <span className="font-display text-xl font-bold gradient-text">TripWise</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{color:'var(--text-primary)'}}>Plan your perfect trip</h1>
          <p className="text-sm" style={{color:'var(--text-secondary)'}}>Answer 4 quick questions — we handle the rest</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map(({n,label},i)=>(
            <div key={n} className="flex items-center gap-2 flex-1">
              <button onClick={()=>step>n&&setStep(n)} className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step===n?'step-active text-[#060912]':step>n?'step-done text-white':'step-inactive'}`}>
                  {step>n?<Check className="w-3.5 h-3.5"/>:n}
                </div>
                <span className="text-xs hidden sm:block"
                  style={{color:step===n?'var(--text-primary)':'var(--text-muted)'}}>{label}</span>
              </button>
              {i<steps.length-1&&(
                <div className="flex-1 h-px mx-1 transition-all duration-500"
                  style={{background:step>n?'var(--emerald)':'var(--border)'}} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 ── */}
        {step===1&&(
          <div className="space-y-5 animate-slide-up">
            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-4">Flying from (any city worldwide)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--text-muted)'}} />
                <input className="input-field pl-9" placeholder="e.g. Mumbai, London, New York, Dubai..."
                  value={data.origin} onChange={e=>update('origin',e.target.value)} />
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-4">Destination</label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--text-muted)'}} />
                <input className="input-field pl-9" placeholder="e.g. Tokyo, Bali, Paris..."
                  value={data.destination} onChange={e=>update('destination',e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Tokyo','Bali','Bangkok','Singapore','Dubai','Paris','London','New York'].map(d=>(
                  <button key={d} className={`tag text-xs ${data.destination===d?'active':''}`}
                    onClick={()=>update('destination',d)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[{label:'Departure',key:'start_date'},{label:'Return',key:'end_date'}].map(({label,key})=>(
                <div key={key} className="glass rounded-2xl p-6">
                  <label className="section-label block mb-4">{label}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--text-muted)'}} />
                    <input type="date" className="input-field pl-9"
                      value={(data as Record<string,unknown>)[key] as string}
                      onChange={e=>update(key as keyof TripData,e.target.value)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-4">Group size</label>
              <div className="flex items-center gap-2 flex-wrap">
                {[1,2,3,4,5,6].map(n=>(
                  <button key={n} onClick={()=>update('group_size',n)}
                    className="w-11 h-11 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      background:data.group_size===n?'linear-gradient(135deg,#c9a84c,#a07830)':'var(--bg-3)',
                      border:`1px solid ${data.group_size===n?'var(--gold)':'var(--border)'}`,
                      color:data.group_size===n?'#060912':'var(--text-secondary)',
                    }}>{n}</button>
                ))}
                <button onClick={()=>update('group_size',8)}
                  className="px-4 h-11 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background:data.group_size>6?'linear-gradient(135deg,#c9a84c,#a07830)':'var(--bg-3)',
                    border:`1px solid ${data.group_size>6?'var(--gold)':'var(--border)'}`,
                    color:data.group_size>6?'#060912':'var(--text-secondary)',
                  }}>7+</button>
              </div>
            </div>

            <button className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!canProceed1} onClick={()=>setStep(2)}>
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step===2&&(
          <div className="space-y-5 animate-slide-up">
            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-5">Travel style (pick all that apply)</label>
              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map(({id,label,icon:Icon})=>(
                  <button key={id} onClick={()=>toggleArr('interests',id)}
                    className="flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                    style={{
                      background:data.interests.includes(id)?'rgba(201,168,76,0.1)':'var(--bg-3)',
                      border:`1px solid ${data.interests.includes(id)?'var(--gold)':'var(--border)'}`,
                    }}>
                    <Icon className="w-4 h-4 flex-shrink-0"
                      style={{color:data.interests.includes(id)?'var(--gold)':'var(--text-muted)'}} />
                    <span className="text-sm font-medium"
                      style={{color:data.interests.includes(id)?'var(--text-primary)':'var(--text-secondary)'}}>
                      {label}
                    </span>
                    {data.interests.includes(id)&&<Check className="w-3.5 h-3.5 ml-auto" style={{color:'var(--gold)'}} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-5">Trip pace</label>
              <div className="space-y-3">
                {PACE_OPTIONS.map(({id,label,desc})=>(
                  <button key={id} onClick={()=>update('pace',id)}
                    className="w-full flex items-center gap-4 rounded-xl p-4 text-left transition-all"
                    style={{
                      background:data.pace===id?'rgba(201,168,76,0.1)':'var(--bg-3)',
                      border:`1px solid ${data.pace===id?'var(--gold)':'var(--border)'}`,
                    }}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{borderColor:data.pace===id?'var(--gold)':'var(--border)'}}>
                      {data.pace===id&&<div className="w-2 h-2 rounded-full" style={{background:'var(--gold)'}} />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>{label}</div>
                      <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-5">Stay preference</label>
              <div className="flex flex-wrap gap-2">
                {STAY_TYPES.map(type=>(
                  <button key={type}
                    className={`tag ${data.stay_type===type.toLowerCase().split('/')[0].trim()?'active':''}`}
                    onClick={()=>update('stay_type',type.toLowerCase().split('/')[0].trim())}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={()=>setStep(1)}>
                <ArrowLeft className="w-4 h-4 inline mr-2" />Back
              </button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={!canProceed2} onClick={()=>setStep(3)}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step===3&&(
          <div className="space-y-5 animate-slide-up">
            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-5">Budget per person (USD)</label>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  {label:'Budget',sublabel:'Under $500',val:400},
                  {label:'Mid-range',sublabel:'$500 – $1,500',val:1000},
                  {label:'Comfort',sublabel:'$1,500 – $3,000',val:2200},
                  {label:'Luxury',sublabel:'$3,000+',val:5000},
                ].map(({label,sublabel,val})=>(
                  <button key={label} onClick={()=>update('budget_usd',val)}
                    className="rounded-xl p-4 text-left transition-all"
                    style={{
                      background:data.budget_usd===val?'rgba(201,168,76,0.1)':'var(--bg-3)',
                      border:`1px solid ${data.budget_usd===val?'var(--gold)':'var(--border)'}`,
                    }}>
                    <div className="font-semibold text-sm" style={{color:'var(--text-primary)'}}>{label}</div>
                    <div className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{sublabel}</div>
                  </button>
                ))}
              </div>
              <label className="text-xs mb-2 block" style={{color:'var(--text-muted)'}}>Or enter exact amount (USD):</label>
              <input type="number" className="input-field" placeholder="e.g. 1500"
                value={data.budget_usd} onChange={e=>update('budget_usd',Number(e.target.value))} />
              <div className="mt-3 p-3 rounded-xl" style={{background:'var(--bg-3)'}}>
                <p className="text-xs" style={{color:'var(--text-muted)'}}>
                  Includes flights, accommodation, food, transport & activities. Your itinerary will be calibrated to this budget.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={()=>setStep(2)}>
                <ArrowLeft className="w-4 h-4 inline mr-2" />Back
              </button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={!canProceed3} onClick={()=>setStep(4)}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 ── */}
        {step===4&&(
          <div className="space-y-5 animate-slide-up">
            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-5">Dietary restrictions</label>
              <div className="flex flex-wrap gap-2">
                {DIETARY.map(d=>(
                  <button key={d} className={`tag ${data.dietary.includes(d)?'active':''}`}
                    onClick={()=>{
                      if(d==='No restrictions'){update('dietary',[]);return}
                      toggleArr('dietary',d)
                    }}>
                    {data.dietary.includes(d)&&d!=='No restrictions'&&<Check className="w-3 h-3" />}
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal notes */}
            <div className="glass rounded-2xl p-6">
              <label className="section-label block mb-2">Your personal notes & preferences</label>
              <p className="text-xs mb-4" style={{color:'var(--text-muted)'}}>
                Tell the AI anything specific — "I have a bad knee so no heavy hiking", "celebrating our anniversary", "obsessed with street food", "travelling with a toddler", etc.
              </p>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3.5 w-4 h-4" style={{color:'var(--text-muted)'}} />
                <textarea className="input-field pl-9 pt-3" rows={3}
                  placeholder="Any personal preferences, physical limitations, special occasions, things you love or hate..."
                  value={data.personal_notes}
                  onChange={e=>update('personal_notes',e.target.value)}
                  style={{resize:'none'}} />
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium" style={{color:'var(--text-primary)'}}>Planning to drive?</p>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>We'll include driving rules, IDP & parking tips</p>
                </div>
                <button onClick={()=>update('planning_to_drive',!data.planning_to_drive)}
                  className="w-11 h-6 rounded-full transition-all relative"
                  style={{background:data.planning_to_drive?'var(--gold)':'var(--bg-4)'}}>
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all"
                    style={{left:data.planning_to_drive?'22px':'2px'}} />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-gold rounded-2xl p-6">
              <p className="section-label mb-4">Trip summary</p>
              <div className="space-y-2 text-sm">
                {[
                  {label:'Route',val:`${data.origin} → ${data.destination}`},
                  {label:'Dates',val:`${data.start_date} → ${data.end_date}`},
                  {label:'Group',val:`${data.group_size} ${data.group_size===1?'person':'people'}`},
                  {label:'Style',val:data.interests.join(', ')||'—'},
                  {label:'Pace',val:data.pace},
                  {label:'Budget',val:`$${data.budget_usd.toLocaleString()}/person`},
                ].map(({label,val})=>(
                  <div key={label} className="flex justify-between">
                    <span style={{color:'var(--text-muted)'}}>{label}</span>
                    <span className="font-medium text-right max-w-xs" style={{color:'var(--text-primary)'}}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={()=>setStep(3)}>
                <ArrowLeft className="w-4 h-4 inline mr-2" />Back
              </button>
              <button className="btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={!canProceed1||data.interests.length===0} onClick={handleGenerate}>
                <Zap className="w-4 h-4" />Generate my trip
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" style={{color:'var(--gold)'}} /></div>}>
      <PlanContent />
    </Suspense>
  )
}
