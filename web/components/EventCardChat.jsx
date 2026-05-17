'use client';

import { Calendar, Sparkles } from 'lucide-react';

export default function EventCardChat({ events, textScale = 1, reducedMotion = false }) {
  if (!events?.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 'min(620px, 100%)', marginTop: 10 }}>
      {events.map((ev, i) => (
        <article
          key={i}
          aria-label={`Event: ${ev.description}`}
          style={{
            borderRadius: 24,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 14px 36px rgba(45,45,45,0.08), 0 0 0 1px rgba(252,138,45,0.08) inset',
            overflow: 'hidden',
            animation: reducedMotion ? 'none' : 'memodiPersonCardIn .55s cubic-bezier(.34,1.56,.64,1) both',
          }}
        >
          <header style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px 10px', borderBottom: '1px solid rgba(45,45,45,0.05)',
            background: 'rgba(252,138,45,0.08)',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font-body)', fontSize: 11.5, color: '#9C9C9C',
              fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <Sparkles size={12} color="#FC8A2D" strokeWidth={2.2} />
              From your Memory Lane
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(255,255,255,0.7)', color: '#FC8A2D',
              fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600,
            }}>
              <Calendar size={11} color="#FC8A2D" strokeWidth={2.4} />
              Upcoming
            </span>
          </header>

          <div style={{ display: 'flex', gap: 18, padding: 16, alignItems: 'stretch' }}>
            {ev.photoUrl && (
              <div style={{
                position: 'relative', width: 132, minWidth: 132,
                borderRadius: 18, overflow: 'hidden', background: '#FFF9F0',
                boxShadow: '0 10px 24px rgba(252,138,45,0.20)', aspectRatio: '1 / 1',
              }}>
                <img
                  src={ev.photoUrl} alt={ev.description}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                fontFamily: 'var(--font-serif)', fontWeight: 500,
                fontSize: 22 * textScale, lineHeight: 1.2, color: '#2D2D2D',
              }}>
                {ev.description}
              </div>
              {ev.date && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-body)', fontSize: 14 * textScale, color: '#6B6B6B', fontWeight: 500,
                }}>
                  <Calendar size={13} color="#FC8A2D" strokeWidth={2.2} />
                  {ev.date}
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
