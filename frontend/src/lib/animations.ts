// lib/animations.ts — TripWise Motion System (Perf Edition)
// CHANGES: removed all filter:blur() from variants (triggers GPU layer promotion on every frame)
//          reduced rotateX/3D transforms (force compositing)
//          tightened durations for snappier feel on mobile
import { Variants, Transition } from 'framer-motion'

// ─── Easing curves ───────────────────────────────────────────────────────────
export const ease = {
  out:       [0.16, 1, 0.3, 1]  as const,
  in:        [0.7, 0, 0.84, 0]  as const,
  inOut:     [0.87, 0, 0.13, 1] as const,
  spring:    { type: 'spring', stiffness: 280, damping: 28 } as const,
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

// ─── Scroll reveals ──────────────────────────────────────────────────────────
// NO filter:blur — only opacity + translate (compositor-only, 60fps on mobile)
export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } },
}
export const fadeLeft: Variants = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.out } },
}
export const fadeRight: Variants = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: ease.out } },
}
export const scaleReveal: Variants = {
  // removed filter:blur — was causing GPU repaint on every frame
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: ease.out } },
}
export const depthReveal: Variants = {
  // removed rotateX — forces 3D context and layer promotion
  hidden:  { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: ease.out } },
}
export const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: ease.out } },
}
export const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: springTransition },
}
export const slideReveal: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: springTransition },
}

// ─── Page entrance ───────────────────────────────────────────────────────────
export const pageEntrance: Variants = {
  // removed filter:blur — whole-page blur is the most expensive possible GPU op
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: ease.out } },
}

// ─── Hero section ────────────────────────────────────────────────────────────
export const heroContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
}
export const heroItem: Variants = {
  // removed filter:blur — staggered blur on 5+ elements = frame drops guaranteed
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: ease.out } },
}

// ─── Stagger systems ─────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}
export const staggerContainerFast: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
}
export const staggerContainerSlow: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: ease.out } },
}

// ─── Itinerary card assembly ──────────────────────────────────────────────────
export const cardAssemble: Variants = {
  // removed rotateX — 3D perspective forces compositing on all cards simultaneously
  hidden:  { opacity: 0, y: 24, scale: 0.94 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: ease.out, delay: 0.2 + i * 0.1 },
  }),
}
export const timelineItem: Variants = {
  hidden:  { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.4, ease: ease.out, delay: 0.1 + i * 0.08 },
  }),
}

// ─── Micro-interactions ──────────────────────────────────────────────────────
// Kept minimal — only transform (compositor-only, free on GPU)
export const buttonHover = { scale: 1.02, y: -1 }
export const buttonTap   = { scale: 0.97 }
export const cardHover   = { y: -4, scale: 1.01 }
export const destCardHover = { y: -6, scale: 1.02 }
export const iconHover   = { scale: 1.12, rotate: 4 }

// ─── Modal animations ────────────────────────────────────────────────────────
export const modalBackdrop: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}
export const modalPanel: Variants = {
  // removed filter:blur — expensive on a centered overlay
  hidden:  { opacity: 0, scale: 0.94, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring', stiffness: 360, damping: 30 } },
  exit:    { opacity: 0, scale: 0.96, y: 8,
    transition: { duration: 0.15, ease: ease.in } },
}

// ─── Tab switch ──────────────────────────────────────────────────────────────
export const tabSwitch: Variants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: ease.out } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.18, ease: ease.in } },
}

// ─── Viewport config ─────────────────────────────────────────────────────────
export const viewportOnce   = { once: true,  margin: '-40px' }
export const viewportRepeat = { once: false, margin: '-30px' }
