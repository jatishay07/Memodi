'use client';

import { useMemo } from 'react';

export default function Ambient({ particleCount = 8 }) {
  const particles = useMemo(() =>
    Array.from({ length: particleCount }).map((_, i) => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 4 + Math.random() * 3,
    })),
  [particleCount]);

  return (
    <div
      aria-hidden
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
    >
      <div className="anim-drift" style={{
        position: 'absolute', top: '20%', left: '-8%',
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, #FC8A2D, transparent)',
        opacity: 0.22, filter: 'blur(100px)',
      }} />
      <div className="anim-drift" style={{
        position: 'absolute', bottom: '15%', right: '-8%',
        width: 420, height: 420, borderRadius: '50%',
        background: 'radial-gradient(circle, #DC4F7C, transparent)',
        opacity: 0.22, filter: 'blur(100px)',
        animationDelay: '-8s',
      }} />
      {particles.map((p, i) => (
        <div
          key={i}
          className="anim-float"
          style={{
            position: 'absolute',
            left: `${p.left}%`, top: `${p.top}%`,
            width: 6, height: 6, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(220,79,124,0.55), rgba(252,138,45,0.55))',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
