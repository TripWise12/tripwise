'use client'
// components/motion/AnimatedModal.tsx
// Drop-in for your auth modal — adds spring entrance + animated backdrop

import { motion, AnimatePresence } from 'framer-motion'
import { modalBackdrop, modalPanel } from '@/lib/animations'
import { ReactNode } from 'react'

interface Props {
  show: boolean
  onClose: () => void
  children: ReactNode
}

export default function AnimatedModal({ show, onClose, children }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="modal-backdrop"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            key="modal-panel"
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            className="glass rounded-2xl p-8 max-w-sm w-full text-center"
            style={{
              border: '1px solid rgba(201,168,76,0.2)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Gold shimmer edge */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
            }} />

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
