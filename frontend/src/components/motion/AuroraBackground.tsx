'use client'
// AuroraBackground — CSS-only, zero JS animation, zero mousemove, zero framer-motion
// Replaced heavy framer-motion blur orbs with will-change + CSS keyframes for 60fps GPU path

export default function AuroraBackground() {
  return (
    <>
      <style>{`
        @keyframes aurora1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50%       { transform: translate(3%, 2%) scale(1.12); opacity: 0.85; }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.35; }
          50%       { transform: translate(-3%, -2%) scale(1.18); opacity: 0.6; }
        }
        @keyframes aurora3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.25; }
          50%       { transform: translate(2%, -3%) scale(1.08); opacity: 0.5; }
        }
        .aurora-orb {
          position: absolute;
          border-radius: 50%;
          will-change: transform, opacity;
          pointer-events: none;
        }
      `}</style>
      <div
        aria-hidden
        style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}
      >
        {/* Orb 1 — gold */}
        <div className="aurora-orb" style={{
          top: '10%', left: '15%', width: 560, height: 560,
          background: 'radial-gradient(circle, rgba(201,168,76,0.13) 0%, transparent 68%)',
          filter: 'blur(48px)',
          animation: 'aurora1 14s ease-in-out infinite',
        }} />
        {/* Orb 2 — blue */}
        <div className="aurora-orb" style={{
          top: '38%', right: '10%', width: 480, height: 480,
          background: 'radial-gradient(circle, rgba(100,130,255,0.08) 0%, transparent 68%)',
          filter: 'blur(64px)',
          animation: 'aurora2 18s ease-in-out infinite 5s',
        }} />
        {/* Orb 3 — teal */}
        <div className="aurora-orb" style={{
          bottom: '8%', left: '38%', width: 380, height: 380,
          background: 'radial-gradient(circle, rgba(45,212,160,0.06) 0%, transparent 68%)',
          filter: 'blur(56px)',
          animation: 'aurora3 22s ease-in-out infinite 9s',
        }} />
      </div>
    </>
  )
}
