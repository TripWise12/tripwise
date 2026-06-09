'use client'
// components/motion/ScrollProgress.tsx
// Premium scroll progress indicator — paste into your layout

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200, damping: 30, restDelta: 0.001,
  })

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '2px',
        scaleX,
        transformOrigin: '0%',
        zIndex: 9999,
        background: 'linear-gradient(90deg, #c9a84c 0%, #e8d07a 50%, #c9a84c 100%)',
        boxShadow: '0 0 8px rgba(201,168,76,0.6)',
      }}
    />
  )
}
