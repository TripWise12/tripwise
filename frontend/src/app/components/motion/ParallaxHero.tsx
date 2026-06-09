'use client'
// components/motion/ParallaxHero.tsx
// Wraps your hero section to add mouse-tracked parallax layers

import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion'
import { useEffect, ReactNode } from 'react'

function useMouse() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 50, damping: 20 })
  const springY = useSpring(y, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      // Normalize -0.5 to 0.5 from center
      x.set((e.clientX / window.innerWidth  - 0.5))
      y.set((e.clientY / window.innerHeight - 0.5))
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [x, y])

  return { springX, springY }
}

interface Props {
  backgroundLayer: ReactNode   // The crossfading destination images
  children: ReactNode          // Hero text + form
}

export default function ParallaxHero({ backgroundLayer, children }: Props) {
  const { springX, springY } = useMouse()

  // Different depth layers move at different speeds
  const bgX = useTransform(springX, [-0.5, 0.5], ['-1.5%', '1.5%'])
  const bgY = useTransform(springY, [-0.5, 0.5], ['-1.5%', '1.5%'])
  const midX = useTransform(springX, [-0.5, 0.5], ['-3%', '3%'])
  const midY = useTransform(springY, [-0.5, 0.5], ['-3%', '3%'])
  const fgX = useTransform(springX, [-0.5, 0.5], ['8px', '-8px'])
  const fgY = useTransform(springY, [-0.5, 0.5], ['4px', '-4px'])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
      {/* Layer 0: background images — slowest parallax */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-5%',    // give it room to move
          x: bgX, y: bgY,
          zIndex: 0,
          willChange: 'transform',
        }}
      >
        {backgroundLayer}
      </motion.div>

      {/* Layer 1: gradient overlays stay fixed (no parallax) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
        {/* Dark vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(6,9,18,0.25) 0%, rgba(6,9,18,0.5) 55%, rgba(6,9,18,1) 100%)',
        }} />
        {/* Edge vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(6,9,18,0.65) 100%)',
        }} />
      </div>

      {/* Layer 2: floating ambient particles — mid parallax */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, zIndex: 2,
          pointerEvents: 'none',
          x: midX, y: midY,
          willChange: 'transform',
        }}
      >
        <FloatingParticles />
      </motion.div>

      {/* Layer 3: hero content — slight counter-parallax for depth feel */}
      <motion.div
        style={{
          position: 'relative', zIndex: 10,
          x: fgX, y: fgY,
          willChange: 'transform',
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

function FloatingParticles() {
  const particles = [
    { top: '20%', left: '12%',  size: 3, delay: 0,    dur: 8 },
    { top: '35%', left: '82%',  size: 2, delay: 1.5,  dur: 11 },
    { top: '65%', left: '25%',  size: 4, delay: 3,    dur: 9 },
    { top: '55%', left: '70%',  size: 2, delay: 0.8,  dur: 13 },
    { top: '80%', left: '55%',  size: 3, delay: 2,    dur: 7 },
    { top: '28%', left: '48%',  size: 2, delay: 4,    dur: 10 },
    { top: '70%', left: '88%',  size: 3, delay: 1,    dur: 12 },
    { top: '45%', left: '5%',   size: 2, delay: 3.5,  dur: 9 },
  ]

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: p.top, left: p.left,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: 'rgba(201,168,76,0.5)',
            boxShadow: '0 0 6px rgba(201,168,76,0.3)',
          }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      {/* Flight path SVG — subtle arc */}
      <svg
        style={{ position: 'absolute', top: '25%', left: '5%', width: '45%', height: '30%', opacity: 0.06 }}
        viewBox="0 0 400 120"
        fill="none"
      >
        <motion.path
          d="M 0 80 Q 200 10 400 60"
          stroke="#c9a84c"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, delay: 1.5, ease: 'easeOut' }}
        />
        <motion.circle
          cx="0" cy="80" r="3"
          fill="#c9a84c"
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          style={{
            offsetPath: "path('M 0 80 Q 200 10 400 60')",
            offset: 0,
          } as React.CSSProperties}
          transition={{ duration: 3, delay: 1.5, ease: 'easeOut' }}
        />
      </svg>
    </>
  )
}
