'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ProgressBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
    setProgress(20)
    const t1 = setTimeout(() => setProgress(60), 150)
    const t2 = setTimeout(() => setProgress(85), 400)
    const t3 = setTimeout(() => setProgress(100), 700)
    const t4 = setTimeout(() => setVisible(false), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="progress-indicator"
      style={{ width: `${progress}%` }}
    />
  )
}
