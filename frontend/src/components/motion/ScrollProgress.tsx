'use client'
// ScrollProgress — native scroll listener, no framer-motion, runs on compositor thread
import { useEffect, useRef } from 'react'

export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    let rafId: number
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const doc = document.documentElement
        const pct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight) || 0
        if (bar) bar.style.transform = `scaleX(${pct})`
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '2px',
        transform: 'scaleX(0)',
        transformOrigin: '0%',
        zIndex: 9999,
        background: 'linear-gradient(90deg, #c9a84c 0%, #e8d07a 50%, #c9a84c 100%)',
        boxShadow: '0 0 6px rgba(201,168,76,0.5)',
        willChange: 'transform',
      }}
    />
  )
}
