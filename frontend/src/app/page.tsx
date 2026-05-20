'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane, MapPin, Globe, ArrowRight, Zap,
  Shield, Map, Wallet, Package, Phone,
  ChevronRight, Star, Sparkles, Check,
  Hotel, Car, Bookmark, Download,
  LogOut, User, Loader2
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { signInWithGoogle, signOutUser } from '@/lib/firebase'

const DESTINATIONS = ['Tokyo', 'Bali', 'Paris', 'New York', 'London', 'Bangkok', 'Dubai', 'Singapore', 'Rome', 'Sydney']
const ORIGIN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'London', 'New York', 'Dubai', 'Singapore', 'Sydney', 'Toronto']

const FEATURES = [
  { icon: Zap, label: 'Trip Viability Report', desc: 'Weather, crowds, visa, safety, festivals — before you commit to anything', color: '#e4c76b' },
  { icon: Map, label: 'AI Day-by-Day Itinerary', desc: 'Detailed plans with timings, costs, insider tips and booking links for every activity', color: '#7aa8e8' },
  { icon: Plane, label: 'Flight Intelligence', desc: 'Cheapest fares, flexible dates, layover hacks, airline reliability scores', color: '#a78bfa' },
  { icon: Hotel, label: 'Smart Hotel Match', desc: 'Area guide, type selector, proximity filters — matched to your travel style', color: '#2dd4a0' },
  { icon: Wallet, label: 'Budget Breakdown', desc: 'Real costs per category, group splits, live expense logger during the trip', color: '#e4c76b' },
  { icon: Package, label: 'Tailored Packing List', desc: 'Climate and activity specific — from sunscreen to camera to toothbrush', color: '#f472b6' },
  { icon: Phone, label: 'Live Trip Companion', desc: 'Today-view, offline access, emergency info, real-time weather alerts', color: '#fb923c' },
  { icon: Shield, label: 'Group Coordination', desc: 'Shared itinerary, collaborative editing, bill splitting with settlements', color: '#34d399' },
  { icon: Globe, label: 'Works Worldwide', desc: 'International and domestic trips from any origin city — not just India', color: '#60a5fa' },
]

const TOKYO_EXAMPLE = {
  days: [
    { day: 1, theme: 'Arrival & Shinjuku', items: ['Land at Narita — take NEX train ¥3,070', 'Check in at Shinjuku Granbell Hotel', 'Evening stroll through Kabukicho & Omoide Yokocho'], cost: '$65' },
    { day: 2, theme: 'Temples & Culture', items: ['Senso-ji Temple at 8AM before crowds arrive', 'Tsukiji Outer Market — fresh sushi breakfast', 'teamLab Planets 3PM — book 2 weeks ahead'], cost: '$80' },
    { day: 3, theme: 'Harajuku & Shibuya', items: ['Meiji Jingu Shrine morning walk in the forest', 'Harajuku Takeshita Street & Omotesando', 'Shibuya Crossing at dusk — dinner in Nonbei Yokocho'], cost: '$75' },
  ],
  budget: { flights: '$550', hotel: '$420', food: '$140', transport: '$45', activities: '$90', total: '$1,245' },
}

const TICKER_ITEMS = ['Tokyo 🇯🇵', 'Bali 🇮🇩', 'Paris 🇫🇷', 'New York 🇺🇸', 'London 🇬🇧', 'Bangkok 🇹🇭', 'Dubai 🇦🇪', 'Singapore 🇸🇬', 'Rome 🇮🇹', 'Sydney 🇦🇺', 'Istanbul 🇹🇷', 'Barcelona 🇪🇸', 'Maldives 🇲🇻', 'Kyoto 🇯🇵', 'Amsterdam 🇳🇱']

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function useMagneticButtons() {
  useEffect(() => {
    const btns = document.querySelectorAll('.btn-primary')
    const handlers: { el: Element; move: (e: MouseEvent) => void; leave: () => void }[] = []
    btns.forEach(btn => {
      const move = (e: MouseEvent) => {
        const r = (btn as HTMLElement).getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) * 0.18
        const y = (e.clientY - r.top - r.height / 2) * 0.18
          ; (btn as HTMLElement).style.transform = `translate(${x}px,${y}px)`
      }
      const leave = () => { (btn as HTMLElement).style.transform = '' }
      btn.addEventListener('mousemove', move as EventListener)
      btn.addEventListener('mouseleave', leave)
      handlers.push({ el: btn, move, leave })
    })
    return () => handlers.forEach(({ el, move, leave }) => {
      el.removeEventListener('mousemove', move as EventListener)
      el.removeEventListener('mouseleave', leave)
    })
  }, [])
}

function useFeatureCardGlow() {
  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card')
    const handlers: { el: Element; fn: (e: MouseEvent) => void }[] = []
    cards.forEach(card => {
      const fn = (e: MouseEvent) => {
        const r = (card as HTMLElement).getBoundingClientRect()
          ; (card as HTMLElement).style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
          ; (card as HTMLElement).style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
      }
      card.addEventListener('mousemove', fn as EventListener)
      handlers.push({ el: card, fn })
    })
    return () => handlers.forEach(({ el, fn }) => el.removeEventListener('mousemove', fn as EventListener))
  }, [])
}

function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const word = words[wordIdx]
    const t = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, charIdx + 1))
        if (charIdx + 1 === word.length) setTimeout(() => setDeleting(true), pause)
        else setCharIdx(c => c + 1)
      } else {
        setDisplay(word.slice(0, charIdx - 1))
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); setCharIdx(0) }
        else setCharIdx(c => c - 1)
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(t)
  }, [charIdx, deleting, wordIdx, words, speed, pause])
  return display
}

function UserMenu({ user, onSignOut }: { user: { displayName: string | null; photoURL: string | null; email: string | null }; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
        style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
        {user.photoURL
          ? <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
          : <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(201,168,76,0.2)', color: 'var(--gold)' }}>
            {user.displayName?.[0] || 'U'}
          </div>
        }
        <span className="text-sm hidden md:block" style={{ color: 'var(--text-primary)' }}>
          {user.displayName?.split(' ')[0]}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 glass rounded-xl overflow-hidden z-50"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{user.displayName}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <button onClick={onSignOut}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm transition-all"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [quickDest, setQuickDest] = useState('')
  const [quickOrigin, setQuickOrigin] = useState('Mumbai')
  const [signingIn, setSigningIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const typed = useTypewriter(DESTINATIONS)

  useScrollReveal()
  useMagneticButtons()
  useFeatureCardGlow()

  async function handleGoogleSignIn() {
    setSigningIn(true)
    try {
      await signInWithGoogle()
      setShowAuthModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSigningIn(false)
    }
  }

  async function handleSignOut() {
    await signOutUser()
  }

  function handlePlanTrip() {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    const p = new URLSearchParams()
    if (quickDest) p.set('dest', quickDest)
    if (quickOrigin) p.set('origin', quickOrigin)
    router.push(`/plan?${p.toString()}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] -top-32 -left-20" style={{ background: '#1a3a6e', opacity: 0.18 }} />
      <div className="orb w-96 h-96 top-1/2 right-0" style={{ background: '#c9a84c', opacity: 0.06 }} />
      <div className="orb w-72 h-72 bottom-40 left-20" style={{ background: '#c9a84c', opacity: 0.04 }} />

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="glass rounded-2xl p-8 max-w-sm w-full text-center"
            style={{ border: '1px solid rgba(201,168,76,0.2)', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <div className="w-14 h-14 rounded-xl overflow-hidden">
              <img src="/logo.png" alt="TripWise" className="w-full h-full object-cover" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Sign in to TripWise
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
              Sign in to start planning your trip. Your itineraries will be saved to your account.
            </p>
            <button onClick={handleGoogleSignIn} disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: 'white', color: '#1a1a2e',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}>
              {signingIn
                ? <Loader2 className="w-5 h-5 animate-spin" />
                : <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
              {signingIn ? 'Signing in...' : 'Continue with Google'}
            </button>
            <button onClick={() => setShowAuthModal(false)}
              className="mt-4 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1c2642,#0f1628)', border: '1px solid rgba(201,168,76,0.35)' }}>
            <Plane className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          </div>
          <span className="font-display text-2xl font-bold gradient-text">TripWise</span>
        </div>

        {/* Auth — right side */}
        <div>
          {loading ? (
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} />
            </div>
          ) : user ? (
            <UserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <button onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2 btn-primary text-sm py-2.5 px-5">
              <User className="w-4 h-4" />
              Sign in
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full reveal"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
          <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--gold-light)' }}>
            AI-POWERED TRAVEL INTELLIGENCE
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 leading-tight reveal"
          style={{ transitionDelay: '100ms' }}>
          <span style={{ color: 'var(--text-primary)' }}>Plan your trip to</span>
          <br />
          <span className="gradient-text typewriter-cursor" style={{ minHeight: '1.2em', display: 'inline-block' }}>
            {typed}
          </span>
        </h1>

        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto reveal"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.8, transitionDelay: '200ms' }}>
          From "I want to travel" to fully planned trip in under 2 minutes.
          Flights, hotels, itinerary, packing, group coordination — all personalized.
        </p>

        {/* Quick start card */}
        <div className="liquid-card rounded-2xl p-6 max-w-2xl mx-auto mb-12 reveal"
          style={{ transitionDelay: '300ms', boxShadow: '0 0 80px rgba(201,168,76,0.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input className="input-field pl-9" placeholder="Flying from (any city)"
                value={quickOrigin} onChange={e => setQuickOrigin(e.target.value)} list="origins-list" />
              <datalist id="origins-list">
                {ORIGIN_CITIES.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input className="input-field pl-9" placeholder="Where to? (e.g. Tokyo)"
                value={quickDest} onChange={e => setQuickDest(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePlanTrip()} />
            </div>
            <button className="btn-primary flex items-center justify-center gap-2" onClick={handlePlanTrip}>
              {user ? <><ArrowRight className="w-4 h-4" />Plan my trip</> : <><User className="w-4 h-4" />Sign in to plan</>}
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Any origin city', 'International & domestic', 'Free to start'].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--gold)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap reveal stagger"
          style={{ transitionDelay: '400ms' }}>
          {[{ v: '2 min', l: 'Avg planning time' }, { v: '50+', l: 'Countries covered' }, { v: '9', l: 'Integrated modules' }, { v: 'Free', l: 'To start' }].map(({ v, l }) => (
            <div key={l} className="text-center">
              <div className="font-display text-3xl font-bold gradient-text">{v}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden py-4 my-2"
        style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(10,15,30,0.5)' }}>
        <div className="ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Example Trip */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 reveal">
            <p className="section-label mb-3">See it in action</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
              A complete trip — built in 90 seconds
            </h2>
            <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
              Mumbai → Tokyo. 7 days. Everything planned.
            </p>
          </div>

          <div className="liquid-card rounded-3xl p-8 mb-6 reveal glow-gold-sm">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="badge badge-gold">Example trip</span>
                  <span className="badge badge-silver">AI-generated</span>
                </div>
                <h3 className="font-display text-3xl font-bold mb-1 gradient-text">Mumbai → Tokyo</h3>
                <p style={{ color: 'var(--text-secondary)' }}>15–22 March 2025 · 7 days</p>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {[
                  { label: 'Weather', val: '8°C – 16°C', sub: 'Cool, light jacket' },
                  { label: 'Visa', val: 'e-Visa', sub: '$30 · 3 days' },
                  { label: 'Budget', val: '$1,245', sub: 'per person', gold: true },
                ].map(({ label, val, sub, gold }) => (
                  <div key={label} className="glass rounded-xl px-4 py-3 text-center">
                    <p className="section-label mb-1">{label}</p>
                    <p className={`font-semibold text-sm ${gold ? 'gradient-text font-display text-lg' : ''}`}
                      style={gold ? {} : { color: 'var(--text-primary)' }}>{val}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 stagger">
            {TOKYO_EXAMPLE.days.map((day, i) => (
              <div key={i} className="glass feature-card rounded-2xl p-5 reveal" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="badge badge-gold">Day {day.day}</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{day.cost}</span>
                </div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{day.theme}</h4>
                <div className="space-y-2">
                  {day.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className="timeline-dot mt-1.5 flex-shrink-0" style={{ width: 6, height: 6 }} />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-2xl p-6 mb-8 reveal">
            <p className="section-label mb-4">Budget breakdown per person</p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(TOKYO_EXAMPLE.budget).map(([k, v]) => (
                <div key={k} className="text-center">
                  <p className="text-xs capitalize mb-1" style={{ color: 'var(--text-muted)' }}>{k}</p>
                  <p className={`font-bold ${k === 'total' ? 'gradient-text font-display text-xl' : 'text-sm'}`}
                    style={k === 'total' ? {} : { color: 'var(--text-primary)' }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center reveal">
            <button className="btn-primary flex items-center gap-3 mx-auto text-lg px-8 py-4"
              onClick={() => {
                setQuickDest('Tokyo')
                setQuickOrigin('Mumbai')
                handlePlanTrip()
              }}>
              <Sparkles className="w-5 h-5" />
              Build your own trip like this
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
              {user ? 'Takes 2 minutes' : 'Sign in with Google · Takes 2 minutes'}
            </p>
          </div>
        </div>
      </section>

      <div className="gold-line mx-6 md:mx-12" />

      {/* Features */}
      <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(7,9,18,0.6)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="section-label mb-3">Everything in one place</p>
            <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              9 modules. Zero tab-switching.
            </h2>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
              Every tool you need from planning to landing — built into one platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger">
            {FEATURES.map(({ icon: Icon, label, desc, color }, i) => (
              <div key={label} className="glass feature-card rounded-2xl p-6 reveal"
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}28` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="gold-line mx-6 md:mx-12" />
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center reveal">
          <h2 className="font-display text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Ready to plan smarter?
          </h2>
          <p className="mb-10 text-lg" style={{ color: 'var(--text-secondary)' }}>
            {user
              ? `Welcome back, ${user.displayName?.split(' ')[0]}. Start your next trip.`
              : 'Sign in with Google. No account needed separately.'}
          </p>
          <button className="btn-primary text-lg px-10 py-4 flex items-center gap-3 mx-auto"
            onClick={handlePlanTrip}>
            <Sparkles className="w-5 h-5" />
            {user ? 'Start planning' : 'Sign in & start planning'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <div className="gold-line mx-6 md:mx-12" />
      <footer className="relative z-10 px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1c2642,#0f1628)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Plane className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            </div>
            <span className="font-display font-semibold gradient-text">TripWise</span>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            © 2026 TripWise. Built for travelers everywhere.
          </p>
        </div>
      </footer>
    </div>
  )
}
