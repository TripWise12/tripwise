'use client'
// components/motion/DestinationCard.tsx
// Drop-in replacement for the destination cards in page.tsx

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { staggerItem } from '@/lib/animations'

interface Props {
  city: string
  country: string
  img: string
  emoji: string
  onPlan: (city: string) => void
}

export default function DestinationCard({ city, country, img, emoji, onPlan }: Props) {
  const cardRef = useRef<HTMLButtonElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springX = useSpring(x, { stiffness: 200, damping: 25 })
  const springY = useSpring(y, { stiffness: 200, damping: 25 })

  // 3D tilt — max 8deg
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8])

  // Dynamic highlight follows cursor
  const highlightX = useTransform(mouseX, [0, 1], ['0%', '100%'])
  const highlightY = useTransform(mouseY, [0, 1], ['0%', '100%'])

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = cardRef.current!.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5   // -0.5 to 0.5
    const ny = (e.clientY - rect.top)  / rect.height - 0.5
    x.set(nx)
    y.set(ny)
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top)  / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={cardRef}
      variants={staggerItem}
      onClick={() => onPlan(city)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        aspectRatio: '3/4',
        cursor: 'pointer',
        perspective: 800,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        border: 'none',
        padding: 0,
        background: 'none',
      }}
    >
      {/* Image */}
      <motion.img
        src={img}
        alt={city}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Bottom fade */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(6,9,18,0.92) 0%, rgba(6,9,18,0.25) 45%, transparent 100%)',
      }} />

      {/* Dynamic cursor spotlight */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse 60% 60% at ${highlightX} ${highlightY}, rgba(201,168,76,0.18) 0%, transparent 70%)`,
          opacity: 0,
          pointerEvents: 'none',
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      />

      {/* Gold hover overlay */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(201,168,76,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* City label */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 14px',
      }}>
        <p style={{
          fontFamily: 'var(--font-display, inherit)',
          fontWeight: 700,
          fontSize: 14,
          color: 'white',
          margin: 0,
          letterSpacing: '-0.01em',
        }}>{city}</p>
        <p style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.55)',
          margin: 0,
          marginTop: 2,
        }}>{emoji} {country}</p>
      </div>

      {/* "Plan trip" CTA on hover */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          opacity: 0,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.04em',
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(201,168,76,0.95)',
            color: '#060912',
            backdropFilter: 'blur(8px)',
          }}
          initial={{ scale: 0.85, y: 4 }}
          whileHover={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          Plan trip →
        </motion.span>
      </motion.div>

      {/* Glass edge shimmer */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0)',
          pointerEvents: 'none',
        }}
        whileHover={{
          borderColor: 'rgba(201,168,76,0.35)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}
