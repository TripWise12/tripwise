'use client'
// components/motion/StorySection.tsx
// Scroll-linked storytelling wrapper — each child section reveals differently

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import { Variants } from 'framer-motion'

type RevealStyle = 'fadeUp' | 'fadeLeft' | 'fadeRight' | 'scaleReveal' | 'depthReveal'

const revealMap: Record<RevealStyle, Variants> = {
  fadeUp: {
    hidden:  { opacity: 0, y: 48 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  },
  fadeLeft: {
    hidden:  { opacity: 0, x: -48 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  },
  fadeRight: {
    hidden:  { opacity: 0, x: 48 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  },
  scaleReveal: {
    hidden:  { opacity: 0, scale: 0.88, filter: 'blur(3px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
  },
  depthReveal: {
    hidden:  { opacity: 0, y: 60, scale: 0.93, rotateX: 8 },
    visible: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  },
}

interface Props {
  children: ReactNode
  reveal?: RevealStyle
  className?: string
  style?: React.CSSProperties
  delay?: number
}

export default function StorySection({
  children,
  reveal = 'fadeUp',
  className,
  style,
  delay = 0,
}: Props) {
  const variants = revealMap[reveal]

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── Parallax section (scroll-linked scale/opacity) ──────────────────────────
interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  speed?: number   // 0 = no parallax, 1 = full parallax
}

export function ParallaxSection({
  children, className, style, speed = 0.15,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -60}px`, `${speed * 60}px`])
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.95, 1, 1, 0.97])

  return (
    <div ref={ref} className={className} style={{ ...style, overflow: 'hidden' }}>
      <motion.div style={{ y, opacity, scale }}>
        {children}
      </motion.div>
    </div>
  )
}
