// lib/animations.ts — TripWise Premium Motion System
import { Variants, Transition } from 'framer-motion'

// ─── Easing curves ───────────────────────────────────────────────────────────
export const ease = {
  out:      [0.16, 1, 0.3, 1]   as const,   // expo out — snappy, premium
  in:       [0.7, 0, 0.84, 0]   as const,   // expo in
  inOut:    [0.87, 0, 0.13, 1]  as const,   // cinematic slow-slow
  spring:   { type: 'spring', stiffness: 280, damping: 28 } as const,
  springFast:{ type: 'spring', stiffness: 420, damping: 36 } as const,
  springSoft:{ type: 'spring', stiffness: 160, damping: 22 } as const,
} as const

// ─── Spring transitions ──────────────────────────────────────────────────────
export const springTransition: Transition = {
  type: 'spring', stiffness: 300, damping: 30, mass: 0.8,
}
export const softSpring: Transition = {
  type: 'spring', stiffness: 180, damping: 22, mass: 1,
}

// ─── Scroll reveals (variety — never repeat the same one back-to-back) ────────
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: ease.out } },
}
export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: ease.out } },
}
export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: ease.out } },
}
export const scaleReveal: Variants = {
  hidden:  { opacity: 0, scale: 0.88, filter: 'blur(3px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: ease.out } },
}
export const depthReveal: Variants = {
  hidden:  { opacity: 0, y: 48, scale: 0.94, rotateX: 6 },
  visible: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { duration: 0.75, ease: ease.out } },
}
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: ease.out } },
}
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
}
export const slideReveal: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: springTransition },
}

// ─── Page entrance ───────────────────────────────────────────────────────────
export const pageEntrance: Variants = {
  hidden:  { opacity: 0, scale: 0.98, filter: 'blur(2px)' },
  visible: { opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.65, ease: ease.out, delay: 0.05 } },
}

// ─── Hero section ────────────────────────────────────────────────────────────
export const heroContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}
export const heroItem: Variants = {
  hidden:  { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: ease.out } },
}

// ─── Stagger systems ─────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
export const staggerContainerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
}
export const staggerContainerSlow: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
}
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 20, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: ease.out } },
}

// ─── Itinerary card assembly (AI-building feel) ───────────────────────────────
export const cardAssemble: Variants = {
  hidden:  { opacity: 0, y: 30, scale: 0.92, rotateX: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1, rotateX: 0,
    transition: { duration: 0.65, ease: ease.out, delay: 0.3 + i * 0.15 },
  }),
}
export const timelineItem: Variants = {
  hidden:  { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.5, ease: ease.out, delay: 0.2 + i * 0.12 },
  }),
}

// ─── Micro-interaction presets ───────────────────────────────────────────────
export const buttonHover   = { scale: 1.03, y: -1 }
export const buttonTap     = { scale: 0.97 }
export const cardHover     = { y: -6, scale: 1.02 }
export const destCardHover = { y: -8, scale: 1.035 }
export const iconHover     = { scale: 1.15, rotate: 5 }

// ─── Modal animations ────────────────────────────────────────────────────────
export const modalBackdrop: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
}
export const modalPanel: Variants = {
  hidden:  { opacity: 0, scale: 0.92, y: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)',
    transition: { ...springTransition, duration: 0.35 } },
  exit: { opacity: 0, scale: 0.96, y: 8,
    transition: { duration: 0.2, ease: ease.in } },
}

// ─── Tab switch (used in trip/[id]/page.tsx) ─────────────────────────────────
export const tabSwitch: Variants = {
  hidden:  { opacity: 0, y: 10, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,
    transition: { duration: 0.35, ease: ease.out } },
  exit:    { opacity: 0, y: -6, scale: 0.98,
    transition: { duration: 0.2, ease: ease.in } },
}

// ─── Viewport config ─────────────────────────────────────────────────────────
export const viewportOnce   = { once: true,  margin: '-60px' }
export const viewportRepeat = { once: false, margin: '-40px' }
