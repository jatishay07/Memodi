'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import MemodiMesh from '../components/MemodiMesh';
import Logo from '../components/Logo';

export default function Landing() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (user?.role === 'patient')   router.replace('/patient');
    if (user?.role === 'caregiver') router.replace('/caregiver');
  }, [ready, user]);

  return (
    <div style={{
      position: 'relative', minHeight: '100vh', width: '100%',
      overflow: 'hidden', fontFamily: 'var(--font-body)', color: '#3d342a',
    }}>
      <MemodiMesh />

      {/* SVG filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id="memodi-gooey" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="gooey" />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Header */}
      <header style={{
        position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '26px 36px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <img src="/logo-transparent.png" alt="Memodi" style={{ width: 36, height: 36, objectFit: 'contain', mixBlendMode: 'multiply' }} />
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 20, fontWeight: 700, color: '#7B1B54', letterSpacing: '-0.02em', lineHeight: 1 }}>
            memodi
          </span>
        </div>

        <nav style={{ display: 'flex', gap: 4 }}>
<<<<<<< Updated upstream
          {['About', 'Help'].map(label => (
            <a key={label} href="#" style={{
=======
          {[
            { label: 'About', href: '#' },
            { label: 'Help', href: '#' },
          ].map(item => (
            <a key={item.label} href={item.href} style={{
>>>>>>> Stashed changes
              color: 'rgba(61,52,42,0.72)', fontSize: 13, fontWeight: 400,
              padding: '8px 14px', borderRadius: 999, textDecoration: 'none',
              transition: 'all .2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,251,247,0.5)'; e.currentTarget.style.color = '#3d342a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(61,52,42,0.72)'; }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Gooey sign-in pill */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center',
          filter: 'url(#memodi-gooey)',
        }}
          onMouseEnter={e => { const arrow = e.currentTarget.querySelector('.gooey-arrow'); if (arrow) arrow.style.transform = 'translateX(-72px)'; }}
          onMouseLeave={e => { const arrow = e.currentTarget.querySelector('.gooey-arrow'); if (arrow) arrow.style.transform = 'translateX(-40px)'; }}
        >
          <button className="gooey-arrow" style={{
            position: 'absolute', right: 0, width: 32, height: 32,
            borderRadius: 999, background: '#3d342a', color: '#FFFBF7', border: 0,
            fontSize: 12, transform: 'translateX(-40px)', transition: 'transform .35s ease',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 0,
          }} aria-hidden>↗</button>
          <button onClick={() => router.push('/auth/patient')} style={{
            padding: '0 24px', height: 32, borderRadius: 999,
            background: '#3d342a', color: '#FFFBF7', border: 0,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            fontFamily: 'var(--font-sans)', zIndex: 1,
          }}>
            Sign in
          </button>
        </div>
      </header>

      {/* Hero (bottom-left) */}
      <main style={{
        position: 'absolute', bottom: 56, left: 56,
        zIndex: 20, maxWidth: 640,
      }}>
        {/* Glass chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '8px 16px', borderRadius: 999,
          background: 'rgba(255,251,247,0.55)',
          backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(61,52,42,0.10)', marginBottom: 28,
          position: 'relative', animation: 'fadeUp .8s ease both',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 6, right: 6, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(220,79,124,0.40), transparent)',
            borderRadius: 999,
          }} />
          <span style={{ color: 'rgba(61,52,42,0.85)', fontSize: 13, fontWeight: 500, letterSpacing: '0.04em' }}>
            A memory companion
          </span>
        </div>

        {/* Multi-line headline */}
        <h1 style={{
          margin: '0 0 26px', lineHeight: 1.0,
          fontFamily: 'var(--font-serif)', fontWeight: 400,
          color: '#3d342a', letterSpacing: '-0.02em',
          animation: 'fadeUp 1s ease .15s both',
        }}>
          <span style={{ display: 'block', fontSize: 56, fontWeight: 300, color: 'rgba(61,52,42,0.75)', marginBottom: 8 }}>
            Helping
          </span>
          <span style={{ display: 'block', fontSize: 96, fontWeight: 500 }}>
            memories
          </span>
          <span style={{ display: 'block', fontSize: 80, fontStyle: 'italic', fontWeight: 400, color: 'rgba(61,52,42,0.85)' }}>
            stay close.
          </span>
        </h1>

        <p style={{
          fontSize: 17, lineHeight: 1.65, color: 'rgba(61,52,42,0.70)',
          margin: '0 0 36px', maxWidth: 520, fontWeight: 400,
          animation: 'fadeUp 1s ease .35s both',
        }}>
          A gentle AI companion for people living with memory loss — and the caregivers who love them.
          Conversations, photographs, and the people who matter, held close.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
          animation: 'fadeUp 1s ease .5s both',
        }}>
          <button
            onClick={() => router.push('/auth/patient')}
            style={{
              padding: '14px 36px', borderRadius: 999,
              background: 'rgba(255,251,247,0.30)',
              border: '1.5px solid rgba(61,52,42,0.22)',
              color: '#3d342a', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14,
              cursor: 'pointer', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              transition: 'all .3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,251,247,0.55)'; e.currentTarget.style.borderColor = 'rgba(61,52,42,0.40)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,251,247,0.30)'; e.currentTarget.style.borderColor = 'rgba(61,52,42,0.22)'; }}
          >
            I&apos;m a patient
          </button>
          <button
            onClick={() => router.push('/auth/caregiver')}
            style={{
              padding: '14px 36px', borderRadius: 999,
              background: '#3d342a', border: '1.5px solid #3d342a',
              color: '#FFFBF7', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: 14,
              cursor: 'pointer', boxShadow: '0 12px 28px rgba(61,52,42,0.18)',
              transition: 'all .3s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2d251c'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#3d342a'; }}
          >
            I&apos;m a caregiver
          </button>
        </div>
      </main>

      {/* Bottom-right pulsing orb widget */}
      <div style={{
        position: 'absolute', bottom: 40, right: 40, zIndex: 30,
        width: 96, height: 96,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', width: 64, height: 64, borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #DC4F7C, #FC8A2D, #FCE9AB, #9E9820, #FC8A2D, #DC4F7C)',
          filter: 'blur(2px)',
          animation: 'orbSpin 4s linear infinite, orbPulse 2.4s ease-in-out infinite',
        }} />
        <div style={{ position: 'absolute', width: 52, height: 52, borderRadius: '50%', background: '#FFFBF7' }} />
        <svg viewBox="0 0 100 100" style={{
          position: 'absolute', width: '100%', height: '100%',
          animation: 'orbSpin 24s linear infinite',
          transform: 'scale(1.6)',
        }} aria-hidden>
          <defs>
            <path id="lc" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text style={{ fontSize: 8, fill: 'rgba(61,52,42,0.65)', fontFamily: 'var(--font-sans)', letterSpacing: '0.25em', fontWeight: 500 }}>
            <textPath href="#lc" startOffset="0%">
              Memodi · helping memories stay close · Memodi · helping memories stay close ·
            </textPath>
          </text>
        </svg>
      </div>

      {/* Mission line */}
      <p style={{
        position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, fontSize: 13, color: 'rgba(61,52,42,0.50)',
        fontStyle: 'italic', whiteSpace: 'nowrap',
        fontFamily: 'var(--font-serif)',
      }}>
        A gentle AI preserving someone&apos;s sense of self and memories.
      </p>
    </div>
  );
}
