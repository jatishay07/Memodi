'use client';

import { useMemo } from 'react';
import { Sparkles, Volume2 } from 'lucide-react';

const USER_INK = '#5C2238';
const MENTION_ACCENT = { friend: '#FC8A2D', family: '#DC4F7C' };
const MENTION_ACTIVE_BG = { friend: 'rgba(252,138,45,0.22)', family: 'rgba(220,79,124,0.18)' };
const MENTION_SOFT_BG = 'rgba(252,233,171,0.55)';

export default function ChatBubble({
  role,
  text,
  partial,
  t,
  showVolume = false,
  textScale = 1,
  mentions = [],
  activeName = null,
  peopleIndex,
  reducedMotion = false,
}) {
  const isUser = role === 'user';
  const body = text || partial || ' ';

  const rendered = useMemo(() => {
    if (!mentions.length || body === ' ') return body;
    return renderWithMentions(body, mentions, activeName, peopleIndex, isUser);
  }, [body, mentions, activeName, peopleIndex, isUser]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      margin: '0 0 4px',
      animation: reducedMotion ? 'none' : 'bubbleIn .5s cubic-bezier(.45,.05,.55,.95) both',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: 'min(620px, 86%)',
      }}>
        {!isUser && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            margin: '0 0 6px 6px',
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: '#9C9C9C', letterSpacing: '0.02em',
          }}>
            <Sparkles size={13} color="#DC4F7C" strokeWidth={2.2} />
            <span style={{ fontWeight: 600, color: '#6B6B6B' }}>Memodi</span>
            {showVolume && <Volume2 size={13} color="#DC4F7C" strokeWidth={2.2} />}
          </div>
        )}
        <div style={{
          padding: `${18 * textScale}px ${24 * textScale}px`,
          borderRadius: 28,
          borderBottomRightRadius: isUser ? 10 : 28,
          borderBottomLeftRadius: isUser ? 28 : 10,
          background: isUser
            ? 'linear-gradient(135deg, rgba(252,138,45,0.18) 0%, rgba(220,79,124,0.22) 100%)'
            : 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: isUser ? '1.5px solid rgba(220,79,124,0.28)' : '2px solid rgba(255,255,255,0.9)',
          boxShadow: isUser ? '0 10px 30px rgba(220,79,124,0.32)' : '0 14px 36px rgba(45,45,45,0.08)',
          color: isUser ? USER_INK : '#2D2D2D',
          fontFamily: 'var(--font-body)',
          fontSize: 21 * textScale,
          lineHeight: 1.55,
          fontWeight: 400,
          letterSpacing: '0.005em',
          minHeight: 24,
        }}>
          {rendered}
          {partial && !text && (
            <span style={{
              display: 'inline-block', width: 2,
              height: `${0.95 * textScale}em`,
              background: isUser ? USER_INK : '#DC4F7C',
              marginLeft: 4, verticalAlign: 'text-bottom',
              animation: reducedMotion ? 'none' : 'caret 1s steps(1) infinite',
            }} />
          )}
        </div>
        {t && (
          <div style={{
            fontSize: 11, color: '#B0AFAC', marginTop: 6, padding: '0 8px',
            fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
          }}>
            {t}
          </div>
        )}
      </div>
    </div>
  );
}

function renderWithMentions(body, mentions, activeName, peopleIndex, isUser) {
  const pattern = new RegExp(`\\b(${mentions.map(escapeRe).join('|')})\\b`, 'gi');
  const out = [];
  let last = 0;
  let m;
  while ((m = pattern.exec(body)) !== null) {
    if (m.index > last) out.push(body.slice(last, m.index));
    const matched = m[1];
    const isActive = activeName && matched.toLowerCase() === activeName.toLowerCase();
    const category = peopleIndex ? findCategoryByName(peopleIndex, matched) : 'family';
    const accent = MENTION_ACCENT[category] || MENTION_ACCENT.family;
    out.push(
      <span key={`mention-${m.index}`} style={{
        padding: '1px 8px', margin: '0 1px', borderRadius: 999,
        background: isActive ? MENTION_ACTIVE_BG[category] : MENTION_SOFT_BG,
        color: isActive ? accent : (isUser ? USER_INK : '#2D2D2D'),
        fontWeight: isActive ? 600 : 500,
        transition: 'background .35s ease, color .35s ease, font-weight .35s ease',
        whiteSpace: 'nowrap',
      }}>
        {matched}
      </span>
    );
    last = m.index + matched.length;
  }
  if (last < body.length) out.push(body.slice(last));
  return out;
}

function findCategoryByName(peopleIndex, name) {
  const target = name.toLowerCase();
  for (const p of peopleIndex.values()) {
    if (p.name && p.name.toLowerCase() === target) return p.category || 'family';
  }
  return 'family';
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
