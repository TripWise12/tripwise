'use client'
// components/motion/ItineraryCard.tsx
// Replaces the static day cards — gives the "AI is building this" feel

import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import { cardAssemble } from '@/lib/animations'

interface DayItem {
  day: number
  theme: string
  items: string[]
  cost: string
}

interface Props {
  day: DayItem
  index: number
}

export default function ItineraryCard({ day, index }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width)  * 100
    const y = ((e.clientY - rect.top)  / rect.height) * 100
    cardRef.current!.style.setProperty('--mx', `${x}%`)
    cardRef.current!.style.setProperty('--my', `${y}%`)
  }

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardAssemble}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      onMouseMove={handleMouseMove}
      whileHover={{
        y: -6, scale: 1.015,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      }}
      className="glass feature-card rounded-2xl p-5"
      style={{
        perspective: '800px',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Day badge + cost */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <motion.span
          className="badge badge-gold"
          initial={{ scale: 0.6, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: 'spring', stiffness: 400, damping: 22,
            delay: 0.3 + index * 0.15,
          }}
        >
          Day {day.day}
        </motion.span>
        <motion.span
          style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + index * 0.15, duration: 0.4 }}
        >
          {day.cost}
        </motion.span>
      </div>

      {/* Theme */}
      <motion.h4
        style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 12 }}
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 + index * 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {day.theme}
      </motion.h4>

      {/* Timeline items — staggered reveals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {day.items.map((item, j) => (
          <motion.div
            key={j}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.5 + index * 0.15 + j * 0.09,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Animated timeline dot */}
            <motion.div
              className="timeline-dot"
              style={{ width: 6, height: 6, marginTop: 5, flexShrink: 0 }}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{
                type: 'spring', stiffness: 500, damping: 20,
                delay: 0.55 + index * 0.15 + j * 0.09,
              }}
            />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {item}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
