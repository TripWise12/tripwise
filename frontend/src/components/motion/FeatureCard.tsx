'use client'
// components/motion/FeatureCard.tsx
// Drop-in for the 9-modules feature grid

import { motion } from 'framer-motion'
import { useRef, ElementType } from 'react'
import { staggerItem } from '@/lib/animations'

interface Props {
  icon: ElementType
  label: string
  desc: string
  color: string
}

export default function FeatureCard({ icon: Icon, label, desc, color }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current!.getBoundingClientRect()
    cardRef.current!.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    cardRef.current!.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    <motion.div
      ref={cardRef}
      variants={staggerItem}
      onMouseMove={handleMouseMove}
      whileHover={{
        y: -7,
        scale: 1.022,
        transition: { type: 'spring', stiffness: 300, damping: 26 },
      }}
      className="glass feature-card rounded-2xl p-6 cursor-default"
      style={{ willChange: 'transform', position: 'relative', overflow: 'hidden' }}
    >
      {/* Icon badge */}
      <motion.div
        style={{
          width: 44, height: 44,
          borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
          background: `${color}18`,
          border: `1px solid ${color}28`,
        }}
        whileHover={{ scale: 1.12, rotate: 4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <Icon style={{ width: 20, height: 20, color }} />
      </motion.div>

      <h3 style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 8 }}>
        {label}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
        {desc}
      </p>

      {/* Colored accent line on hover */}
      <motion.div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${color}00, ${color}cc, ${color}00)`,
          opacity: 0,
          scaleX: 0,
          transformOrigin: 'center',
        }}
        whileHover={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      />
    </motion.div>
  )
}
