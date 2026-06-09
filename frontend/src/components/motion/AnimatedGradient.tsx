'use client'
// components/motion/AnimatedGradient.tsx
// Slow, imperceptible luxury gradient that shifts over time — Layer it under hero

import { motion } from 'framer-motion'

export default function AnimatedGradient() {
  return (
    <motion.div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
      animate={{
        background: [
          'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(201,168,76,0.07) 0%, rgba(120,148,255,0.04) 50%, transparent 100%)',
          'radial-gradient(ellipse 80% 60% at 75% 20%, rgba(120,148,255,0.07) 0%, rgba(45,212,160,0.03) 50%, transparent 100%)',
          'radial-gradient(ellipse 80% 60% at 50% 70%, rgba(45,212,160,0.05) 0%, rgba(201,168,76,0.06) 50%, transparent 100%)',
          'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(201,168,76,0.07) 0%, rgba(120,148,255,0.04) 50%, transparent 100%)',
        ],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
