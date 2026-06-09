'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane, MapPin, Globe, ArrowRight, Zap,
  Shield, Map, Wallet, Package, Phone,
  ChevronRight, Star, Sparkles, Check, Link2, Compass,
  Hotel, Car, Bookmark, Download,
  LogOut, User, Loader2, History
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { signInWithGoogle, signOutUser } from '@/lib/firebase'
import {
  motion, AnimatePresence, useScroll, useTransform,
  useSpring, useMotionValue
} from 'framer-motion'
import {
  fadeUp, fadeIn, scaleIn,
  staggerContainer, staggerContainerFast, staggerItem,
  heroContainer, heroItem,
  buttonTap, buttonHover,
  modalBackdrop, modalPanel,
  viewportOnce,
  cardAssemble,
  depthReveal, scaleReveal, fadeLeft, fadeRight,
} from '@/lib/animations'
import AnimatedNav from '@/components/motion/AnimatedNav'
import AnimatedGradient from '@/components/motion/AnimatedGradient'

// ─── Data ─────────────────────────────────────────────────────────────────────

const DESTINATIONS = ['Tokyo', 'Bali', 'Paris', 'New York', 'London', 'Bangkok', 'Dubai', 'Singapore', 'Rome', 'Sydney']
const ORIGIN_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'London', 'New York', 'Dubai', 'Singapore', 'Sydney', 'Toronto']

const FEATURES = [
  { icon: Zap,     label: 'Trip Viability Report',   desc: 'Weather, crowds, visa, safety, festivals — before you commit to anything',                              color: '#e4c76b' },
  { icon: Map,     label: 'AI Day-by-Day Itinerary',  desc: 'Detailed plans with timings, costs, insider tips and booking links for every activity',                  color: '#7aa8e8' },
  { icon: Plane,   label: 'Flight Intelligence',      desc: 'Cheapest fares, flexible dates, layover hacks, airline reliability scores',                              color: '#a78bfa' },
  { icon: Hotel,   label: 'Smart Hotel Match',        desc: 'Area guide, type selector, proximity filters — matched to your travel style',                            color: '#2dd4a0' },
  { icon: Wallet,  label: 'Budget Breakdown',         desc: 'Real costs per category, group splits, live expense logger during the trip',                             color: '#e4c76b' },
  { icon: Package, label: 'Tailored Packing List',    desc: 'Climate and activity specific — from sunscreen to camera to toothbrush',                                 color: '#f472b6' },
  { icon: Phone,   label: 'Live Trip Companion',      desc: 'Today-view, offline access, emergency info, real-time weather alerts',                                   color: '#fb923c' },
  { icon: Shield,  label: 'Group Coordination',       desc: 'Shared itinerary, collaborative editing, bill splitting with settlements',                               color: '#34d399' },
  { icon: Globe,   label: 'Works Worldwide',          desc: 'International and domestic trips from any origin city — not just India',                                 color: '#60a5fa' },
]

const TOKYO_EXAMPLE = {
  days: [
    { day: 1, theme: 'Arrival & Shinjuku',     items: ['Narita → Shinjuku on NEX train ¥3,070', 'Check in, explore Omoide Yokocho (Memory Lane)', 'Ramen dinner at Ichiran — solo booths'],                      cost: '$55' },
    { day: 2, theme: 'Temples & Old Tokyo',    items: ['Senso-ji at 7AM — before the crowds hit', 'Tsukiji Outer Market — fresh tuna sashimi breakfast', 'teamLab Planets digital art — book 2 weeks ahead'],      cost: '$85' },
    { day: 3, theme: 'Harajuku & Shibuya',     items: ['Meiji Shrine morning walk through cedar forest', 'Harajuku Takeshita St + Omotesando boutiques', 'Shibuya scramble at dusk — dinner in Nonbei Yokocho'],    cost: '$75' },
    { day: 4, theme: 'Day Trip to Nikko',      items: ['Shinkansen to Nikko (1.5hr) — stunning mountain temples', 'Tosho-gu Shrine complex — UNESCO heritage site', 'Back to Tokyo — kaiseki dinner in Ginza'],      cost: '$90' },
    { day: 5, theme: 'Akihabara & Ueno',       items: ['Akihabara electronics & anime district — morning', 'Ueno Park & Tokyo National Museum after lunch', 'Izakaya bar hopping in Shimokitazawa at night'],       cost: '$65' },
    { day: 6, theme: 'Departure Day',          items: ['Tsukiji breakfast one last time at 7AM', 'Last-minute shopping in Shibuya or duty-free', 'NEX train to Narita — check-in 3hrs before'],                    cost: '$40' },
  ],
  budget: { flights: '$550', hotel: '$360', food: '$120', transport: '$55', activities: '$90', total: '$1,175' },
}

const TICKER_ITEMS = ['Tokyo 🇯🇵', 'Bali 🇮🇩', 'Paris 🇫🇷', 'New York 🇺🇸', 'London 🇬🇧', 'Bangkok 🇹🇭', 'Dubai 🇦🇪', 'Singapore 🇸🇬', 'Rome 🇮🇹', 'Sydney 🇦🇺', 'Istanbul 🇹🇷', 'Barcelona 🇪🇸', 'Maldives 🇲🇻', 'Kyoto 🇯🇵', 'Amsterdam 🇳🇱']

const DEST_IMAGES = [
  { city: 'Tokyo',     country: 'Japan',       img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', emoji: '🇯🇵' },
  { city: 'Bali',      country: 'Indonesia',   img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', emoji: '🇮🇩' },
  { city: 'Paris',     country: 'France',      img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', emoji: '🇫🇷' },
  { city: 'New York',  country: 'USA',         img: 'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=600&q=80', emoji: '🇺🇸' },
  { city: 'Dubai',     country: 'UAE',         img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', emoji: '🇦🇪' },
  { city: 'Singapore', country: 'Singapore',   img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80', emoji: '🇸🇬' },
  { city: 'Bangkok',   country: 'Thailand',    img: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80', emoji: '🇹🇭' },
  { city: 'London',    country: 'UK',          img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80', emoji: '🇬🇧' },
  { city: 'Rome',      country: 'Italy',       img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80', emoji: '🇮🇹' },
  { city: 'Sydney',    country: 'Australia',   img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80', emoji: '🇦🇺' },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

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

// Mouse parallax for hero
function useMouseParallax() {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springX = useSpring(mouseX, { stiffness: 40, damping: 18 })
  const springY = useSpring(mouseY, { stiffness: 40, damping: 18 })
  useEffect(() => {
    const h = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [mouseX, mouseY])
  return { springX, springY }
}

// Magnetic buttons
function useMagneticButtons() {
  useEffect(() => {
    const btns = document.querySelectorAll<HTMLElement>('.btn-primary')
    const cleanup: (() => void)[] = []
    btns.forEach(btn => {
      const move = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width / 2) * 0.18
        const y = (e.clientY - r.top - r.height / 2) * 0.18
        btn.style.transform = `translate(${x}px,${y}px)`
      }
      const leave = () => { btn.style.transform = '' }
      btn.addEventListener('mousemove', move)
      btn.addEventListener('mouseleave', leave)
      cleanup.push(() => { btn.removeEventListener('mousemove', move); btn.removeEventListener('mouseleave', leave) })
    })
    return () => cleanup.forEach(fn => fn())
  }, [])
}

// Feature card glow
function useFeatureCardGlow() {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('.feature-card')
    const cleanup: (() => void)[] = []
    cards.forEach(card => {
      const fn = (e: MouseEvent) => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
        card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
      }
      card.addEventListener('mousemove', fn)
      cleanup.push(() => card.removeEventListener('mousemove', fn))
    })
    return () => cleanup.forEach(fn => fn())
  }, [])
}

// ─── Destination Card (3D tilt + magnetic + spotlight) ────────────────────────

function DestinationCard({ city, country, img, emoji, onPlan }: {
  city: string; country: string; img: string; emoji: string; onPlan: () => void
}) {
  const cardRef = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mxNorm = useMotionValue(0.5)
  const myNorm = useMotionValue(0.5)
  const sx = useSpring(x, { stiffness: 200, damping: 25 })
  const sy = useSpring(y, { stiffness: 200, damping: 25 })
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8])
  const hlX = useTransform(mxNorm, [0, 1], ['0%', '100%'])
  const hlY = useTransform(myNorm, [0, 1], ['0%', '100%'])

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = cardRef.current!.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
    mxNorm.set((e.clientX - r.left) / r.width)
    myNorm.set((e.clientY - r.top) / r.height)
  }
  const onLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      ref={cardRef}
      variants={staggerItem}
      onClick={onPlan}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative', borderRadius: 16, overflow: 'hidden',
        aspectRatio: '3/4', cursor: 'pointer',
        rotateX, rotateY,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        border: 'none', padding: 0, background: 'none',
        perspective: 800,
      }}
    >
      {/* Image — zooms on hover */}
      <motion.img
        src={img} alt={city}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Base gradient */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to top, rgba(6,9,18,0.95) 0%, rgba(6,9,18,0.3) 50%, transparent 100%)'
      }} />
      {/* Dynamic cursor spotlight */}
      <motion.div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 60% at ${hlX} ${hlY}, rgba(201,168,76,0.18) 0%, transparent 70%)`,
        opacity: 0,
      }} whileHover={{ opacity: 1 }} transition={{ duration: 0.25 }} />
      {/* Gold shimmer overlay */}
      <motion.div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 60%)',
        opacity: 0,
      }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} />
      {/* City label */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-display font-bold text-sm" style={{ color: 'white' }}>{city}</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{emoji} {country}</p>
      </div>
      {/* "Plan trip" pill — fades in on hover */}
      <motion.div style={{
        position: 'absolute', inset: 0, display: 'flex',
        alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        opacity: 0,
      }} whileHover={{ opacity: 1 }} transition={{ duration: 0.2 }}>
        <motion.span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
          padding: '6px 14px', borderRadius: 999,
          background: 'rgba(201,168,76,0.95)', color: '#060912',
        }}
          initial={{ scale: 0.85, y: 4 }}
          whileHover={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          Plan trip →
        </motion.span>
      </motion.div>
      {/* Gold border on hover */}
      <motion.div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        border: '1px solid rgba(255,255,255,0)', pointerEvents: 'none',
      }}
        whileHover={{
          borderColor: 'rgba(201,168,76,0.4)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}

// ─── Itinerary Day Card (cinematic assembly) ───────────────────────────────────

function ItineraryCard({ day, index }: { day: typeof TOKYO_EXAMPLE.days[0]; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={cardAssemble}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6, scale: 1.015, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
      className="glass feature-card rounded-2xl p-5"
      style={{ willChange: 'transform' }}
    >
      <div className="flex items-center justify-between mb-3">
        <motion.span
          className="badge badge-gold"
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.3 + index * 0.15 }}
        >
          Day {day.day}
        </motion.span>
        <motion.span
          className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + index * 0.15, duration: 0.4 }}
        >
          {day.cost}
        </motion.span>
      </div>
      <motion.h4
        className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 + index * 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {day.theme}
      </motion.h4>
      <div className="space-y-2">
        {day.items.map((item, j) => (
          <motion.div
            key={j}
            className="flex items-start gap-2"
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + index * 0.15 + j * 0.09, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="timeline-dot flex-shrink-0"
              style={{ width: 6, height: 6, marginTop: 6 }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.55 + index * 0.15 + j * 0.09 }}
            />
            <p className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Feature Card (spring hover + cursor glow + accent line) ──────────────────

function FeatureCard({ icon: Icon, label, desc, color }: {
  icon: React.ElementType; label: string; desc: string; color: string
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -7, scale: 1.022, transition: { type: 'spring', stiffness: 300, damping: 26 } }}
      className="glass feature-card rounded-2xl p-6 cursor-default"
      style={{ willChange: 'transform', position: 'relative', overflow: 'hidden' }}
    >
      <motion.div
        style={{
          width: 44, height: 44, borderRadius: 12, marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${color}18`, border: `1px solid ${color}28`,
        }}
        whileHover={{ scale: 1.12, rotate: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </motion.div>
      <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{label}</h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</p>
      {/* Colored accent line slides in from center on hover */}
      <motion.div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${color}00, ${color}cc, ${color}00)`,
        opacity: 0, scaleX: 0, transformOrigin: 'center',
      }}
        whileHover={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  )
}

// ─── Auth Modal (AnimatePresence spring physics) ──────────────────────────────

function AuthModal({ show, onClose, onSignIn, signingIn }: {
  show: boolean; onClose: () => void; onSignIn: () => void; signingIn: boolean
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="modal-backdrop"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            key="modal-panel"
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            className="glass rounded-2xl p-8 max-w-sm w-full text-center"
            style={{
              border: '1px solid rgba(201,168,76,0.2)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Top shimmer edge */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
            }} />
            <motion.div
              className="w-14 h-14 rounded-xl overflow-hidden mx-auto mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
            >
              <img src="/logo.png" alt="TripWise" className="w-full h-full object-cover" />
            </motion.div>
            <motion.h2
              className="font-display text-2xl font-bold mb-2"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              Sign in to TripWise
            </motion.h2>
            <motion.p
              className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              Sign in to start planning your trip. Your itineraries will be saved to your account.
            </motion.p>
            <motion.button
              onClick={onSignIn}
              disabled={signingIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold text-sm"
              style={{ background: 'white', color: '#1a1a2e', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              whileHover={{ scale: 1.02, y: -1, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
            >
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
            </motion.button>
            <motion.button
              onClick={onClose}
              className="mt-4 text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              whileHover={{ color: 'var(--text-secondary)' } as any}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              Cancel
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main page component ───────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [quickDest, setQuickDest]       = useState('')
  const [quickOrigin, setQuickOrigin]   = useState('Mumbai')
  const [signingIn, setSigningIn]       = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [joinCode, setJoinCode]         = useState('')
  const [joining, setJoining]           = useState(false)
  const [joinError, setJoinError]       = useState('')
  const typed = useTypewriter(DESTINATIONS)
  const [bgIdx, setBgIdx]               = useState(0)
  const { springX, springY }            = useMouseParallax()

  // Parallax transform values
  const bgParX  = useTransform(springX, [0, 1], ['-2%', '2%'])
  const bgParY  = useTransform(springY, [0, 1], ['-2%', '2%'])
  const fgParX  = useTransform(springX, [0, 1], ['6px', '-6px'])
  const fgParY  = useTransform(springY, [0, 1], ['3px', '-3px'])

  // Page entrance
  const { scrollY } = useScroll()
  const pageOpacity = useTransform(scrollY, [0, 40], [1, 1])

  // Sync background image to typewriter destination
  useEffect(() => {
    const idx = DEST_IMAGES.findIndex(d => typed && d.city.toLowerCase().startsWith(typed.toLowerCase().slice(0, 3)))
    if (idx !== -1) setBgIdx(idx)
  }, [typed])

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
    try {
      await signOutUser()
      router.push('/')
    } catch (e) {
      console.error('Sign out failed:', e)
    }
  }

  function handlePlanTrip() {
    if (!user) { setShowAuthModal(true); return }
    const p = new URLSearchParams()
    if (quickDest)   p.set('dest',   quickDest)
    if (quickOrigin) p.set('origin', quickOrigin)
    router.push(`/plan?${p.toString()}`)
  }

  async function handleJoinTrip() {
    if (!joinCode.trim()) return
    if (!user) { setShowAuthModal(true); return }
    setJoining(true); setJoinError('')
    try {
      const code = joinCode.trim()
      const extractedCode = code.includes('/trip/')
        ? ''
        : code.includes('invite_code=')
          ? new URL(code).searchParams.get('invite_code') || code
          : code
      if (code.startsWith('http') && code.includes('/trip/')) {
        const url  = new URL(code)
        const tripId = url.pathname.split('/trip/')[1]
        if (tripId && tripId !== 'new') {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/trips/${tripId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.uid, user_email: user.email, user_name: user.displayName }),
          })
          router.push(`/trip/${tripId}`); return
        }
      }
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiBase}/api/trips/join/${extractedCode || code}`)
      if (!res.ok) throw new Error('Trip not found')
      const trip = await res.json()
      await fetch(`${apiBase}/api/trips/${trip.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.uid, user_email: user.email, user_name: user.displayName }),
      })
      router.push(`/trip/${trip.id}`)
    } catch (e) {
      setJoinError('Could not find that trip. Check the code or link and try again.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(2px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 2.3 }}
    >
      {/* ── Full-screen hero background with parallax ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ height: '100vh', overflow: 'hidden' }}>
        <motion.div
          style={{ position: 'absolute', inset: '-4%', x: bgParX, y: bgParY, willChange: 'transform' }}
        >
          {DEST_IMAGES.map((d, i) => (
            <div key={d.city}
              className="absolute inset-0 transition-opacity duration-1500"
              style={{ opacity: i === bgIdx ? 1 : 0 }}>
              <img src={d.img} alt={d.city}
                className="w-full h-full object-cover object-center"
                style={{ filter: 'brightness(0.32) saturate(0.85)' }} />
            </div>
          ))}
        </motion.div>

        {/* Animated gradient layer */}
        <AnimatedGradient />

        {/* Dark vignette */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(6,9,18,0.25) 0%, rgba(6,9,18,0.55) 60%, rgba(6,9,18,1) 100%)' }} />
        {/* Edge vignette */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 38%, rgba(6,9,18,0.68) 100%)' }} />

        {/* Floating particles */}
        {[
          { top: '22%', left: '11%', size: 3, delay: 0,   dur: 8  },
          { top: '38%', left: '83%', size: 2, delay: 1.5, dur: 11 },
          { top: '62%', left: '24%', size: 4, delay: 3,   dur: 9  },
          { top: '50%', left: '70%', size: 2, delay: 0.8, dur: 13 },
          { top: '78%', left: '53%', size: 3, delay: 2,   dur: 7  },
          { top: '30%', left: '47%', size: 2, delay: 4,   dur: 10 },
        ].map((p, i) => (
          <motion.div
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              top: p.top, left: p.left,
              width: p.size, height: p.size,
              borderRadius: '50%',
              background: 'rgba(201,168,76,0.55)',
              boxShadow: '0 0 6px rgba(201,168,76,0.3)',
              pointerEvents: 'none',
            }}
            animate={{ y: [0, -16, 0], opacity: [0.3, 0.8, 0.3], scale: [1, 1.3, 1] }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}

        {/* Subtle flight-path SVG arc */}
        <svg
          aria-hidden
          style={{ position: 'absolute', top: '26%', left: '6%', width: '42%', height: '28%', opacity: 0.07, pointerEvents: 'none' }}
          viewBox="0 0 400 120" fill="none"
        >
          <motion.path
            d="M 0 80 Q 200 10 400 60"
            stroke="#c9a84c" strokeWidth="1.5" strokeDasharray="6 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 3, delay: 2.8, ease: 'easeOut' }}
          />
        </svg>
      </div>

      {/* Subtle gold orb accent */}
      <div className="orb" style={{
        width: 384, height: 384, top: '33%', right: 40,
        background: '#c9a84c', opacity: 0.035, position: 'absolute', zIndex: 1, pointerEvents: 'none'
      }} />

      {/* ── Auth Modal ── */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleGoogleSignIn}
        signingIn={signingIn}
      />

      {/* ── Nav ── */}
      <AnimatedNav>
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#1c2642,#0f1628)', border: '1px solid rgba(201,168,76,0.35)' }}
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            <Plane className="w-5 h-5" style={{ color: 'var(--gold)' }} />
          </motion.div>
          <span className="font-display text-2xl font-bold gradient-text">TripWise</span>
        </div>

        <div className="flex items-center gap-2">
          {authLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
          ) : user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)' }}>
                {user.photoURL
                  ? <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                  : <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(201,168,76,0.2)', color: 'var(--gold)' }}>
                    {user.displayName?.[0] || 'U'}
                  </div>
                }
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user.displayName?.split(' ')[0]}
                </span>
              </div>
              <button onClick={() => router.push('/discover')}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold-light)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                <Sparkles className="w-3.5 h-3.5" /><span className="hidden sm:inline">Discover</span>
              </button>
              <button onClick={() => router.push('/history')}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold-light)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                <History className="w-3.5 h-3.5" /><span className="hidden sm:inline">My trips</span>
              </button>
              <button onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#fb7185'; e.currentTarget.style.color = '#fb7185' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                <LogOut className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/discover')}
                className="hidden md:flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl transition-all"
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold-light)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                <Sparkles className="w-3.5 h-3.5" />Discover
              </button>
              <motion.button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5"
                whileHover={buttonHover} whileTap={buttonTap}
              >
                <User className="w-4 h-4" />Sign in
              </motion.button>
            </>
          )}
        </div>
      </AnimatedNav>

      {/* ── Hero ── */}
      <section className="relative z-10 pt-20 pb-16 px-6 text-center">
        {/* Content layer with subtle counter-parallax */}
        <motion.div style={{ x: fgParX, y: fgParY, willChange: 'transform' }}>
          <motion.div
            variants={heroContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <motion.div
              variants={heroItem}
              className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
              style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)' }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(201,168,76,0.45)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -10, 15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
              </motion.span>
              <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--gold-light)' }}>
                AI-POWERED TRAVEL INTELLIGENCE
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={heroItem}
              className="font-display text-5xl md:text-7xl font-bold mb-4 leading-tight"
            >
              <span style={{ color: 'var(--text-primary)' }}>Plan your trip to</span>
              <br />
              <span className="gradient-text typewriter-cursor" style={{ minHeight: '1.2em', display: 'inline-block' }}>
                {typed}
              </span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              variants={heroItem}
              className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}
            >
              From &quot;I want to travel&quot; to fully planned trip in under 2 minutes.
              Flights, hotels, itinerary, packing, group coordination — all personalized.
            </motion.p>

            {/* Search card */}
            <motion.div
              variants={heroItem}
              className="liquid-card rounded-2xl p-6 max-w-2xl mx-auto mb-12 w-full"
              style={{ boxShadow: '0 0 80px rgba(201,168,76,0.06)' }}
              whileHover={{ boxShadow: '0 0 100px rgba(201,168,76,0.1)', borderColor: 'rgba(201,168,76,0.28)' } as any}
              transition={{ duration: 0.4 }}
            >
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
                <motion.button
                  className="btn-primary flex items-center justify-center gap-2"
                  onClick={handlePlanTrip}
                  whileHover={buttonHover} whileTap={buttonTap}
                >
                  {user ? <><ArrowRight className="w-4 h-4" />Plan my trip</> : <><User className="w-4 h-4" />Sign in to plan</>}
                </motion.button>
              </div>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {['Any origin city', 'International & domestic', 'Free to start'].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                  >
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--gold)' }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.6 }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={heroItem}
              className="flex items-center justify-center gap-8 md:gap-16 flex-wrap"
            >
              {[{ v: '2 min', l: 'Avg planning time' }, { v: 'AI', l: 'Powered planning' }, { v: 'Free', l: 'To start' }].map(({ v, l }, i) => (
                <motion.div
                  key={l}
                  className="text-center"
                  whileHover={{ y: -3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <div className="font-display text-3xl font-bold gradient-text">{v}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{l}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Solid background wrapper (everything below hero) ── */}
      <div className="relative z-10" style={{ background: 'var(--bg-0)' }}>

        {/* ── Ticker ── */}
        <div className="overflow-hidden py-4 my-2"
          style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'rgba(10,15,30,0.5)' }}>
          <div className="ticker-inner">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{item}</span>
            ))}
          </div>
        </div>

        {/* ── Destination Gallery ── */}
        <section className="relative z-10 py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-10"
              variants={scaleReveal}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <p className="section-label mb-3">Where will you go next?</p>
              <h2 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Popular destinations
              </h2>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid grid-cols-2 md:grid-cols-5 gap-3"
            >
              {DEST_IMAGES.map(({ city, country, img, emoji }) => (
                <DestinationCard
                  key={city}
                  city={city} country={country} img={img} emoji={emoji}
                  onPlan={() => { setQuickDest(city); handlePlanTrip() }}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Join a Trip ── */}
        <section className="relative z-10 py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="liquid-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                >
                  <Link2 className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                </motion.div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Join a friend&apos;s trip</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Paste an invite code or full trip link to view and collaborate</p>
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  className="input-field flex-1"
                  placeholder="Paste invite code (e.g. xK9mP2qR) or full trip link..."
                  value={joinCode}
                  onChange={e => { setJoinCode(e.target.value); setJoinError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleJoinTrip()}
                />
                <motion.button
                  className="btn-primary flex items-center gap-2 flex-shrink-0"
                  onClick={handleJoinTrip}
                  disabled={joining || !joinCode.trim()}
                  whileHover={buttonHover} whileTap={buttonTap}
                >
                  {joining
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Joining...</>
                    : <><ArrowRight className="w-4 h-4" />Join trip</>}
                </motion.button>
              </div>
              <AnimatePresence>
                {joinError && (
                  <motion.p
                    className="text-xs mt-2"
                    style={{ color: '#fb7185' }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {joinError}
                  </motion.p>
                )}
              </AnimatePresence>
              {!user && joinCode && (
                <motion.p
                  className="text-xs mt-2"
                  style={{ color: 'var(--text-muted)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  You&apos;ll need to sign in first — we&apos;ll bring you right back.
                </motion.p>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Example Trip ── */}
        <section className="relative z-10 py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-14"
              variants={depthReveal}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <p className="section-label mb-3">See it in action</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold" style={{ color: 'var(--text-primary)' }}>
                A complete trip — built in 90 seconds
              </h2>
              <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
                Mumbai → Tokyo. 6 days. Every detail planned.
              </p>
            </motion.div>

            <motion.div
              className="liquid-card rounded-3xl p-8 mb-6 glow-gold-sm"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <div className="flex items-start justify-between flex-wrap gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="badge badge-gold">Example trip</span>
                    <span className="badge badge-silver">AI-generated</span>
                  </div>
                  <h3 className="font-display text-3xl font-bold mb-1 gradient-text">Mumbai → Tokyo</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>15–21 March 2025 · 6 days</p>
                </div>
                <motion.div
                  className="flex items-center gap-4 flex-wrap"
                  variants={staggerContainerFast}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                >
                  {[
                    { label: 'Weather', val: '8°C – 16°C', sub: 'Cool, light jacket' },
                    { label: 'Visa',    val: 'e-Visa',     sub: '$30 · 3 days' },
                    { label: 'Budget',  val: '$1,245',     sub: 'per person', gold: true },
                  ].map(({ label, val, sub, gold }) => (
                    <motion.div
                      key={label}
                      variants={staggerItem}
                      className="glass rounded-xl px-4 py-3 text-center"
                      whileHover={{ y: -4, scale: 1.04, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                    >
                      <p className="section-label mb-1">{label}</p>
                      <p className={`font-semibold text-sm ${gold ? 'gradient-text font-display text-lg' : ''}`}
                        style={gold ? {} : { color: 'var(--text-primary)' }}>{val}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* Day cards — cinematic assembly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {TOKYO_EXAMPLE.days.map((day, i) => (
                <ItineraryCard key={i} day={day} index={i} />
              ))}
            </div>

            {/* Budget breakdown */}
            <motion.div
              className="glass rounded-2xl p-6 mb-8"
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <p className="section-label mb-4">Budget breakdown per person</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(TOKYO_EXAMPLE.budget).map(([k, v], i) => (
                  <motion.div
                    key={k}
                    className="text-center"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -3 }}
                  >
                    <p className="text-xs capitalize mb-1" style={{ color: 'var(--text-muted)' }}>{k}</p>
                    <p className={`font-bold ${k === 'total' ? 'gradient-text font-display text-xl' : 'text-sm'}`}
                      style={k === 'total' ? {} : { color: 'var(--text-primary)' }}>{v}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              variants={scaleReveal}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <motion.button
                className="btn-primary flex items-center gap-3 mx-auto text-lg px-8 py-4"
                onClick={() => { setQuickDest('Tokyo'); setQuickOrigin('Mumbai'); handlePlanTrip() }}
                whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(201,168,76,0.4)', transition: { duration: 0.22 } }}
                whileTap={{ scale: 0.97 }}
              >
                <Sparkles className="w-5 h-5" />
                Build your own trip like this
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                {user ? 'Takes 2 minutes' : 'Sign in with Google · Takes 2 minutes'}
              </p>
            </motion.div>
          </div>
        </section>

        <div className="gold-line mx-6 md:mx-12" />

        {/* ── Features ── */}
        <section className="relative z-10 py-24 px-6" style={{ background: 'rgba(7,9,18,0.6)' }}>
          <div className="max-w-5xl mx-auto">
            <motion.div
              className="text-center mb-16"
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
            >
              <p className="section-label mb-3">Everything in one place</p>
              <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                9 modules. Zero tab-switching.
              </h2>
              <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
                Every tool you need from planning to landing — built into one platform.
              </p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {FEATURES.map(f => (
                <FeatureCard key={f.label} icon={f.icon} label={f.label} desc={f.desc} color={f.color} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="gold-line mx-6 md:mx-12" />
        <section className="relative z-10 py-24 px-6">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            variants={depthReveal}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <h2 className="font-display text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Ready to plan smarter?
            </h2>
            <p className="mb-10 text-lg" style={{ color: 'var(--text-secondary)' }}>
              {user
                ? `Welcome back, ${user.displayName?.split(' ')[0]}. Start your next trip.`
                : 'Sign in with Google. No account needed separately.'}
            </p>
            <motion.button
              className="btn-primary text-lg px-10 py-4 flex items-center gap-3 mx-auto"
              onClick={handlePlanTrip}
              whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(201,168,76,0.35)', transition: { duration: 0.22 } }}
              whileTap={{ scale: 0.97 }}
            >
              <Sparkles className="w-5 h-5" />
              {user ? 'Start planning' : 'Sign in & start planning'}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </section>

      </div>{/* end solid background wrapper */}

      {/* ── Footer ── */}
      <div className="gold-line mx-6 md:mx-12" style={{ position: 'relative', zIndex: 10, background: 'var(--bg-0)' }} />
      <footer className="relative z-10 px-6 py-10" style={{ background: 'var(--bg-0)' }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1c2642,#0f1628)', border: '1px solid rgba(201,168,76,0.3)' }}>
              <Plane className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            </div>
            <span className="font-display font-semibold gradient-text">TripWise</span>
          </motion.div>
          <motion.p
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            © 2026 TripWise. Built for travelers everywhere.
          </motion.p>
        </div>
      </footer>
    </motion.div>
  )
}
