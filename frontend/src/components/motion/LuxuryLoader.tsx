'use client'
// LuxuryLoader — fast exit (1.2s vs 2.2s), no blur on exit, no filter animations
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plane } from 'lucide-react'

export default function LuxuryLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Cut from 2200ms → 1200ms — user sees app content faster
    const t = setTimeout(() => setVisible(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#060912',
          }}
          exit={{
            opacity: 0,
            // removed filter:blur from exit — whole-screen blur on unmount = jank
            transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] },
          }}
        >
          {/* Plane arc — simplified, one animation not three */}
          <svg width="120" height="80" viewBox="0 0 120 80" style={{ marginBottom: 20 }}>
            <motion.path
              d="M 10 60 Q 60 10 110 60"
              stroke="rgba(201,168,76,0.35)"
              strokeWidth="1"
              strokeDasharray="4 3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <circle cx="10" cy="60" r="3" fill="#c9a84c" />
            <circle cx="110" cy="60" r="3" fill="#c9a84c" />
            <motion.text
              x="0" y="5" fontSize="11" fill="#c9a84c"
              initial={{ x: 8, y: 58, opacity: 0 }}
              animate={{ x: 105, y: 58, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >✈</motion.text>
          </svg>

          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #1c2642, #0f1628)',
              border: '1px solid rgba(201,168,76,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plane size={15} style={{ color: '#c9a84c' }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 21, fontWeight: 700,
              background: 'linear-gradient(90deg, #c9a84c, #e8d07a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              TripWise
            </span>
          </motion.div>

          <motion.p
            style={{ fontSize: 10, color: 'rgba(201,168,76,0.45)', letterSpacing: '0.14em', fontFamily: 'monospace' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            PLANNING YOUR JOURNEY
          </motion.p>

          {/* Progress bar */}
          <div style={{ marginTop: 20, width: 110, height: 1, background: 'rgba(201,168,76,0.12)', borderRadius: 1, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg,#c9a84c,#e8d07a)', transformOrigin: 'left' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
