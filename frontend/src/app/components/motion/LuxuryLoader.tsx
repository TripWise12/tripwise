'use client'
// components/motion/LuxuryLoader.tsx
// Branded loading screen — shown briefly on first load, then exits

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plane } from 'lucide-react'

export default function LuxuryLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2200)
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
            scale: 1.04,
            filter: 'blur(8px)',
            transition: { duration: 0.55, ease: [0.7, 0, 0.84, 0] },
          }}
        >
          {/* Globe arc path */}
          <svg width="120" height="80" viewBox="0 0 120 80" style={{ marginBottom: 24 }}>
            {/* Arc */}
            <motion.path
              d="M 10 60 Q 60 10 110 60"
              stroke="rgba(201,168,76,0.4)"
              strokeWidth="1"
              strokeDasharray="4 3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Departure dot */}
            <motion.circle
              cx="10" cy="60" r="3"
              fill="#c9a84c"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            />
            {/* Arrival dot */}
            <motion.circle
              cx="110" cy="60" r="3"
              fill="#c9a84c"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.3 }}
            />
            {/* Plane icon follows the arc */}
            <motion.g
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              initial={{ x: 10, y: 60, rotate: -35, opacity: 0 }}
              animate={[
                { x: 10,  y: 60,  rotate: -35, opacity: 1, transition: { duration: 0.01, delay: 0.2 } },
                { x: 60,  y: 12,  rotate: 0,   opacity: 1, transition: { duration: 0.6,  ease: [0.16, 1, 0.3, 1], delay: 0.2 } },
                { x: 110, y: 60,  rotate: 35,  opacity: 1, transition: { duration: 0.6,  ease: [0.7, 0, 0.84, 0], delay: 0.8 } },
              ]}
            >
              <text x="-5" y="5" fontSize="10" fill="#c9a84c">✈</text>
            </motion.g>
          </svg>

          {/* Logo */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1c2642, #0f1628)',
              border: '1px solid rgba(201,168,76,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plane size={16} style={{ color: '#c9a84c' }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-display, serif)',
              fontSize: 22, fontWeight: 700,
              background: 'linear-gradient(90deg, #c9a84c, #e8d07a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              TripWise
            </span>
          </motion.div>

          {/* Destination reveal text */}
          <motion.p
            style={{ fontSize: 11, color: 'rgba(201,168,76,0.5)', letterSpacing: '0.15em', fontFamily: 'monospace' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            PLANNING YOUR JOURNEY
          </motion.p>

          {/* Loading progress line */}
          <motion.div
            style={{
              marginTop: 24,
              width: 120, height: 1,
              background: 'rgba(201,168,76,0.15)',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #c9a84c, #e8d07a)',
                borderRadius: 1,
                transformOrigin: 'left',
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
