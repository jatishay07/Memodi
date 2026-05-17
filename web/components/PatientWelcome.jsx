'use client';

import { useState, useEffect } from 'react';

export default function PatientWelcome({ name = 'Margaret', onComplete, onSkip }) {
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setLine(1), 500),
      setTimeout(() => setLine(2), 1500),
      setTimeout(() => setLine(3), 2600),
      setTimeout(() => setLine(4), 3700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const fadeStyle = (n) => ({
    opacity: line >= n ? 1 : 0,
    transform: line >= n ? 'translateY(0)' : 'translateY(14px)',
    transition: 'opacity 1.1s ease, transform 1.1s ease',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Welcome, ${name}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,249,240,0.86)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        animation: 'overlayFadeIn 0.9s ease',
      }}
    >
      {/* Soft radial warmth behind the text */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(252,233,171,0.35) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        textAlign: 'center', maxWidth: 560, padding: '0 36px',
      }}>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: 58, fontWeight: 300,
          color: '#3d342a', margin: '0 0 14px', letterSpacing: '-0.02em',
          lineHeight: 1.1,
          ...fadeStyle(1),
        }}>
          Hello, {name}.
        </p>

        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400,
          fontStyle: 'italic', color: 'rgba(61,52,42,0.68)',
          margin: '0 0 22px',
          ...fadeStyle(2),
        }}>
          I&rsquo;m here with you.
        </p>

        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 400,
          color: 'rgba(61,52,42,0.58)', lineHeight: 1.65,
          margin: '0 0 52px', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto',
          ...fadeStyle(3),
        }}>
          When you&rsquo;re ready, we can talk, remember, or look through Memory Lane together.
        </p>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
          ...fadeStyle(4),
        }}>
          <button
            onClick={onComplete}
            autoFocus
            style={{
              padding: '18px 56px', borderRadius: 999, border: 'none',
              background: 'linear-gradient(135deg, #FC8A2D 0%, #DC4F7C 100%)',
              color: '#fff', fontFamily: 'var(--font-sans)',
              fontWeight: 600, fontSize: 18, cursor: 'pointer',
              letterSpacing: '0.01em',
              animation: 'buttonBreathe 3.5s ease-in-out infinite',
              boxShadow: '0 8px 36px rgba(220,79,124,0.34)',
            }}
          >
            Let&rsquo;s get started
          </button>

          <button
            onClick={onSkip}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(61,52,42,0.40)', fontFamily: 'var(--font-sans)',
              fontSize: 15, cursor: 'pointer', padding: '6px 16px',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(61,52,42,0.20)',
              textUnderlineOffset: '3px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(61,52,42,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(61,52,42,0.40)'; }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
