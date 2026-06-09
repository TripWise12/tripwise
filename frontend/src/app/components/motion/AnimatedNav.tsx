'use client'
// components/motion/AnimatedNav.tsx
// Enhances your existing nav: adds scroll-based glass blur + logo entrance

import { motion, useScroll, useTransform } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AnimatedNav({ children }: Props) {
  const { scrollY } = useScroll()

  // As user scrolls, nav gains solid background
  const bg = useTransform(
    scrollY,
    [0, 80],
    ['rgba(6,9,18,0)', 'rgba(6,9,18,0.85)'],
  )
  const backdropBlur = useTransform(scrollY, [0, 80], ['blur(0px)', 'blur(20px)'])
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const shadow = useTransform(
    scrollY,
    [0, 80],
    ['0 0 0 rgba(0,0,0,0)', '0 4px 32px rgba(0,0,0,0.35)'],
  )

  return (
    <motion.nav
      style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        backgroundColor: bg,
        backdropFilter: backdropBlur,
        boxShadow: shadow,
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      {/* Border bottom fades in on scroll */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: '1px',
          background: 'var(--border)',
          opacity: borderOpacity,
          pointerEvents: 'none',
        }}
      />
      {children}
    </motion.nav>
  )
}
