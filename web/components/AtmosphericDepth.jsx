'use client';

import { useMemo } from 'react';

export default function AtmosphericDepth({ reduced = false }) {
  const particles = useMemo(() =>
    Array.from({ length: 14 }).map((_, i) => ({
      left: 8 + (i * 6.5) % 84,
      top: 5 + (i * 11.3) % 88,
      size: 3 + (i % 3) * 1.5,
      delay: (i * 0.7) % 8,
      duration: 9 + (i % 5) * 2.2,
      hue: i % 3,
    })),
  []);

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        pointerEvents: 'none', zIndex: 0,
      }}
    >
      {/* Warm vignette — edges feel enclosed and cozy */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 50%, transparent 38%, rgba(252,233,171,0.16) 85%, rgba(252,138,45,0.10) 100%)',
      }} />

      {/* Morning light bloom — top left corner */}
      {!reduced && (
        <div style={{
          position: 'absolute', top: '-15%', left: '-8%',
          width: 640, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,233,171,0.30) 0%, transparent 62%)',
          filter: 'blur(70px)',
          animation: 'lightBloom 30s ease-in-out infinite',
        }} />
      )}

      {/* Warm haze — bottom right */}
      {!reduced && (
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-6%',
          width: 520, height: 480, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(252,138,45,0.14) 0%, transparent 65%)',
          filter: 'blur(90px)',
          animation: 'lightBloom 38s ease-in-out infinite',
          animationDelay: '-14s',
        }} />
      )}

      {/* Blush bloom — upper right */}
      {!reduced && (
        <div style={{
          position: 'absolute', top: '5%', right: '10%',
          width: 340, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,79,124,0.07) 0%, transparent 68%)',
          filter: 'blur(50px)',
          animation: 'lightBloom 24s ease-in-out infinite',
          animationDelay: '-6s',
        }} />
      )}

      {/* Center warmth — keeps orb area glowing softly */}
      <div style={{
        position: 'absolute', top: '35%', left: '50%', transform: 'translateX(-50%)',
        width: 420, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,233,171,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        ...(reduced ? {} : { animation: 'lightBloom 20s ease-in-out infinite', animationDelay: '-3s' }),
      }} />

      {/* Fine floating particles */}
      {!reduced && particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.left}%`, top: `${p.top}%`,
          width: p.size, height: p.size, borderRadius: '50%',
          background: p.hue === 0
            ? 'rgba(252,138,45,0.45)'
            : p.hue === 1
            ? 'rgba(220,79,124,0.38)'
            : 'rgba(252,233,171,0.55)',
          filter: 'blur(1.5px)',
          opacity: 0.10 + (i % 4) * 0.03,
          animationName: 'floatUp',
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          animationTimingFunction: 'var(--ease-breath)',
          animationIterationCount: 'infinite',
        }} />
      ))}
    </div>
  );
}
