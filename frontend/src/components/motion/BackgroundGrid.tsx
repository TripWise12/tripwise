'use client'
// components/motion/BackgroundGrid.tsx
// Very subtle animated dot grid — appears only in non-hero content sections

import { motion } from 'framer-motion'

export default function BackgroundGrid() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Dot grid pattern */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle, rgba(201,168,76,0.18) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
          opacity: 0,
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
        }}
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{
          duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1,
        }}
      />

      {/* Faint horizontal lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(201,168,76,0.03) 50%)',
        backgroundSize: '100% 80px',
      }} />
    </div>
  )
}
