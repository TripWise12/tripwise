/**
 * TripWise — Shared Framer Motion animation variants
 * Import these everywhere for consistent motion language.
 */

// ── Entrance variants ──────────────────────────────────────────
export const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const fadeLeft = {
  hidden:  { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export const fadeRight = {
  hidden:  { opacity: 0, x: 28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

// ── Stagger container — wraps a list, children animate in sequence ──
export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
}

// Slightly faster for dense lists (itinerary slots)
export const staggerContainerFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.0,
    },
  },
}

// Child variant to pair with stagger containers
export const staggerItem = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
}

// ── Card hover — use on motion.div with whileHover ──────────────
export const cardHover = {
  rest:  { y: 0,  scale: 1,   boxShadow: '0 4px 20px rgba(0,0,0,0.3)' },
  hover: {
    y: -6, scale: 1.02,
    boxShadow: '0 20px 48px rgba(0,0,0,0.45)',
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
}

// Destination card — more dramatic
export const destCardHover = {
  rest:  { y: 0,  scale: 1 },
  hover: {
    y: -8, scale: 1.035,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
}

// ── Button press feedback ──────────────────────────────────────
export const buttonTap = { scale: 0.95 }

export const buttonHover = {
  scale: 1.03,
  transition: { duration: 0.18, ease: 'easeOut' },
}

// ── Hero section stagger ───────────────────────────────────────
export const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

export const heroItem = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

// ── Tab content swap ───────────────────────────────────────────
export const tabSwitch = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
}

// ── Modal pop ─────────────────────────────────────────────────
export const modalBackdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
}

export const modalPanel = {
  hidden:  { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit:    { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.2 } },
}

// ── Progress bar fill ─────────────────────────────────────────
export const progressFill = (pct: number) => ({
  hidden:  { width: '0%' },
  visible: {
    width: `${pct}%`,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
  },
})

// ── Number counter (for stats) ────────────────────────────────
export const counterVariant = {
  hidden:  { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
}

// ── Viewport defaults (use with whileInView) ──────────────────
export const viewportOnce = { once: true, margin: '-60px' }
