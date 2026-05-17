'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Heart, Users, Clock } from 'lucide-react';

const ACCENT = {
  friend: { ink: '#FC8A2D', soft: 'rgba(252,138,45,0.10)', glow: 'rgba(252,138,45,0.20)' },
  family: { ink: '#DC4F7C', soft: 'rgba(220,79,124,0.08)', glow: 'rgba(220,79,124,0.18)' },
};

export default function PersonCardChat({
  people,
  live = false,
  cycleMs = 4500,
  textScale = 1,
  reducedMotion = false,
  onActiveChange,
}) {
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    if (!live || userPaused || people.length <= 1) return;
    const id = setInterval(() => {
      setActive(i => {
        if (i >= people.length - 1) { clearInterval(id); return i; }
        return i + 1;
      });
    }, Math.max(1500, cycleMs));
    return () => clearInterval(id);
  }, [live, userPaused, people.length, cycleMs]);

  useEffect(() => {
    if (people[active] && onActiveChange) onActiveChange(people[active].name);
  }, [active, people, onActiveChange]);

  if (!people || people.length === 0) return null;

  const person = people[active];
  const accent = ACCENT[person.category] || ACCENT.family;
  const isFriend = person.category === 'friend';
  const fadeMs = reducedMotion ? 0 : 900;
  const zoomMs = reducedMotion ? 0 : 1600;

  return (
    <article
      aria-label={`Memory of ${person.name}`}
      style={{
        marginTop: 10,
        width: 'min(620px, 100%)',
        borderRadius: 24,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(255,255,255,0.9)',
        boxShadow: `0 14px 36px rgba(45,45,45,0.08), 0 0 0 1px ${accent.soft} inset`,
        overflow: 'hidden',
        animation: reducedMotion ? 'none' : 'memodiPersonCardIn .55s cubic-bezier(.34,1.56,.64,1) both',
      }}
    >
      {/* Top strip */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px 10px',
        borderBottom: '1px solid rgba(45,45,45,0.05)',
        background: accent.soft,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontFamily: 'var(--font-body)', fontSize: 11.5,
          color: '#9C9C9C', fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          <Sparkles size={12} color={accent.ink} strokeWidth={2.2} />
          From your Memory Lane
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: 'rgba(255,255,255,0.7)',
          color: accent.ink, fontFamily: 'var(--font-body)',
          fontSize: 11.5, fontWeight: 600, letterSpacing: '0.03em',
        }}>
          {isFriend
            ? <Heart size={11} color={accent.ink} fill={accent.ink} strokeWidth={2.4} />
            : <Users size={11} color={accent.ink} strokeWidth={2.4} />}
          {isFriend ? 'Friend' : 'Family'}
        </span>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', gap: 18, padding: 16, alignItems: 'stretch' }}>
        {/* Portrait stack — cross-fade between people */}
        <div style={{
          position: 'relative', width: 132, minWidth: 132,
          borderRadius: 18, overflow: 'hidden',
          background: '#FFF9F0',
          boxShadow: `0 10px 24px ${accent.glow}`,
          aspectRatio: '1 / 1',
        }}>
          {people.map((p, i) => (
            <img
              key={p.id}
              src={p.portrait || p.mediaUrl}
              alt={p.name}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: i === active ? 1 : 0,
                transform: i === active ? 'scale(1)' : 'scale(1.04)',
                transition: `opacity ${fadeMs}ms ease, transform ${zoomMs}ms ease`,
              }}
            />
          ))}
        </div>

        {/* Right column */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)', fontWeight: 500,
              fontSize: 28 * textScale, lineHeight: 1.1,
              letterSpacing: '-0.01em', color: '#2D2D2D',
            }}>
              {person.name}
            </div>
            {(person.relationship || person.since) && (
              <div style={{
                marginTop: 3, display: 'inline-flex',
                alignItems: 'baseline', gap: 8,
                fontFamily: 'var(--font-body)', fontSize: 13 * textScale,
                color: '#6B6B6B', fontWeight: 500,
              }}>
                {person.relationship && <span>{person.relationship}</span>}
                {person.relationship && person.since && <span style={{ opacity: 0.45 }}>·</span>}
                {person.since && <span style={{ opacity: 0.75 }}>{person.since}</span>}
              </div>
            )}
          </div>

          <p style={{
            margin: 0, fontFamily: 'var(--font-body)',
            fontSize: 15 * textScale, lineHeight: 1.5,
            color: '#2D2D2D',
          }}>
            {person.description}
          </p>

          {person.featuredMemory && (
            <div style={{
              marginTop: 4, display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 14,
              background: 'rgba(252,233,171,0.30)',
              border: '1px solid rgba(255,255,255,0.85)',
            }}>
              <img
                src={person.featuredMemory.thumb}
                alt={person.featuredMemory.caption}
                style={{
                  width: 44, height: 44, borderRadius: 10,
                  objectFit: 'cover', flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(45,45,45,0.10)',
                }}
              />
              <div style={{ minWidth: 0, lineHeight: 1.25 }}>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 10.5, fontWeight: 700,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: accent.ink, marginBottom: 1,
                }}>
                  Remember when…
                </div>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 14.5 * textScale, color: '#2D2D2D',
                }}>
                  {person.featuredMemory.caption}
                </div>
                {person.featuredMemory.when && (
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: '#9C9C9C', marginTop: 1 }}>
                    {person.featuredMemory.when}
                  </div>
                )}
              </div>
            </div>
          )}

          {person.lastSeen && (
            <div style={{
              marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-body)', fontSize: 12.5, color: '#6B6B6B',
            }}>
              <Clock size={12} color={accent.ink} strokeWidth={2.2} />
              Last seen: {person.lastSeen}
            </div>
          )}
        </div>
      </div>

      {/* Footer — only when multiple people */}
      {people.length > 1 && (
        <footer style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px',
          borderTop: '1px solid rgba(45,45,45,0.05)',
          background: 'rgba(255,251,247,0.65)',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: '#9C9C9C', letterSpacing: '0.02em' }}>
            {active + 1} of {people.length} mentioned
          </div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            {people.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { setActive(i); setUserPaused(true); }}
                aria-label={`Show ${p.name}`}
                aria-pressed={i === active}
                style={{ padding: 12, margin: -12, border: 0, background: 'transparent', cursor: 'pointer' }}
              >
                <span style={{
                  display: 'block',
                  width: i === active ? 22 : 8, height: 8,
                  borderRadius: 999,
                  background: i === active ? accent.ink : 'rgba(45,45,45,0.18)',
                  transition: reducedMotion ? 'none' : 'all .35s ease',
                }} />
              </button>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
}
