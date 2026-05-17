'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  {
    title: 'Your companion',
    body: 'You can talk to me when you need help remembering something. I am always here.',
    pos: { bottom: '38%', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: 'Start talking',
    body: 'Tap the button below, then speak naturally. You do not need to use any special words.',
    pos: { bottom: '22%', left: '50%', transform: 'translateX(-50%)' },
  },
  {
    title: "I'll answer clearly",
    body: 'When I respond, my words will appear on screen so you can read along.',
    pos: { top: '50%', right: '5%', transform: 'translateY(-50%)' },
    demoResponse: true,
  },
  {
    title: 'Make it comfortable',
    body: 'Use the Aa button to make text larger, or adjust the screen anytime.',
    pos: { bottom: '100px', right: '100px' },
  },
  {
    title: 'Memory Lane',
    body: 'Look through familiar photos, people, places, and moments saved by your family.',
    pos: { top: '76px', left: '260px' },
  },
  {
    title: "You're ready",
    body: "Whenever you need me, I'll be right here.",
    pos: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
    isFinal: true,
  },
];

function StepDots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 5, marginBottom: 16 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 3, borderRadius: 2,
          flex: i === current ? 2 : 1,
          background: i <= current
            ? 'linear-gradient(90deg, #FC8A2D, #DC4F7C)'
            : 'rgba(61,52,42,0.10)',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </div>
  );
}

export default function TutorialBubble({ onComplete, onSkip, onStepChange }) {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  function goTo(n) {
    setMounted(false);
    setTimeout(() => {
      setStep(n);
      setMounted(true);
      onStepChange?.(n);
    }, 280);
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  // Responsive: on narrow screens, anchor to bottom-center
  const pos = current.pos;

  return (
    <>
      {/* Soft backdrop dimming — very subtle, not blocking */}
      <div
        aria-hidden
        style={{
          position: 'fixed', inset: 0, zIndex: 85,
          background: 'rgba(255,249,240,0.18)',
          pointerEvents: 'none',
        }}
      />

      <div
        aria-live="polite"
        role="region"
        aria-label={`Tutorial step ${step + 1} of ${STEPS.length}: ${current.title}`}
        style={{
          position: 'fixed',
          ...pos,
          zIndex: 90,
          maxWidth: 310,
          width: 'calc(100vw - 48px)',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.35s ease',
          /* bubbleFloat uses CSS `translate` property so it composes with
             `transform` centering offsets in pos without overriding them */
          animation: mounted ? 'bubbleFloat 5s ease-in-out infinite' : 'none',
        }}
      >
        <div style={{
          background: 'rgba(255,251,247,0.94)',
          backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
          border: '1.5px solid rgba(220,79,124,0.14)',
          borderRadius: 22,
          padding: '22px 24px 18px',
          boxShadow: '0 16px 52px rgba(45,45,45,0.10), inset 0 1px 0 rgba(255,255,255,0.85)',
        }}>
          <StepDots total={STEPS.length} current={step} />

          {current.title && (
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500,
              color: '#3d342a', margin: '0 0 8px', letterSpacing: '-0.01em',
            }}>
              {current.title}
            </p>
          )}

          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: 15,
            lineHeight: 1.65, color: 'rgba(61,52,42,0.72)',
            margin: '0 0 20px',
          }}>
            {current.body}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={onSkip}
              style={{
                background: 'none', border: 'none', padding: '4px 0',
                color: 'rgba(61,52,42,0.35)', fontFamily: 'var(--font-sans)',
                fontSize: 13, cursor: 'pointer',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'rgba(61,52,42,0.60)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(61,52,42,0.35)'; }}
            >
              Skip
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              {step > 0 && (
                <button
                  onClick={() => goTo(step - 1)}
                  style={{
                    padding: '10px 18px', borderRadius: 999,
                    border: '1.5px solid rgba(61,52,42,0.12)',
                    background: 'rgba(255,251,247,0.7)',
                    color: 'rgba(61,52,42,0.60)',
                    fontFamily: 'var(--font-sans)', fontSize: 14,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,251,247,1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,251,247,0.7)'; }}
                >
                  Back
                </button>
              )}

              <button
                onClick={isLast ? onComplete : () => goTo(step + 1)}
                style={{
                  padding: '10px 24px', borderRadius: 999, border: 'none',
                  background: 'linear-gradient(135deg, #FC8A2D 0%, #DC4F7C 100%)',
                  color: '#fff', fontFamily: 'var(--font-sans)',
                  fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(220,79,124,0.28)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(220,79,124,0.38)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(220,79,124,0.28)';
                }}
              >
                {isLast ? 'Begin' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
