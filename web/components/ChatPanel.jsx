'use client';

import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import AiTurn from './AiTurn';

function ThinkingBubble({ reducedMotion }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{ maxWidth: 'min(620px, 86%)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          margin: '0 0 6px 6px',
          fontFamily: 'var(--font-body)', fontSize: 12, color: '#9C9C9C',
        }}>
          <span style={{ fontSize: 13, color: '#DC4F7C' }}>✦</span>
          <span style={{ fontWeight: 600, color: '#6B6B6B' }}>Memodi</span>
        </div>
        <div style={{
          padding: '18px 24px', borderRadius: 28, borderBottomLeftRadius: 10,
          background: 'rgba(255,255,255,0.78)',
          border: '2px solid rgba(255,255,255,0.9)',
          boxShadow: '0 14px 36px rgba(45,45,45,0.08)',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          {[0, 0.16, 0.32].map((delay, i) => (
            <span key={i} style={{
              display: 'block', width: 8, height: 8, borderRadius: 999,
              background: '#DC4F7C',
              animation: reducedMotion ? 'none' : `dotBlink 1.4s ease-in-out ${delay}s infinite`,
            }} />
          ))}
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 15, color: '#6B6B6B',
            fontStyle: 'italic', marginLeft: 4,
          }}>
            I&apos;m thinking…
          </span>
        </div>
      </div>
    </div>
  );
}

function DateDivider() {
  const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px', borderRadius: 999,
        background: 'rgba(255,251,247,0.7)',
        border: '1px solid rgba(255,255,255,0.85)',
      }}>
        <span style={{
          display: 'block', width: 4, height: 4, borderRadius: 999,
          background: '#DC4F7C', flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 11.5, fontWeight: 600,
          color: '#9C9C9C', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          TODAY · {time}
        </span>
      </div>
    </div>
  );
}

export default function ChatPanel({
  phase,
  history,
  partialUser,
  partialAI,
  textScale = 1,
  reducedMotion = false,
  peopleIndex,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [history, partialUser, partialAI, phase]);

  function ts() {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-atomic="false"
        style={{
          flex: 1, overflowY: 'auto',
          padding: '8px 12px 24px 4px',
          display: 'flex', flexDirection: 'column', gap: 22,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(45,45,45,0.10) transparent',
        }}
      >
        <DateDivider />

        {/* Conversation history */}
        {history.map((turn, i) => (
          turn.role === 'user'
            ? (
              <ChatBubble
                key={i}
                role="user"
                text={turn.text}
                t={turn.t}
                textScale={textScale}
                reducedMotion={reducedMotion}
              />
            ) : (
              <AiTurn
                key={i}
                text={turn.text}
                t={turn.t}
                live={false}
                showVolume={!!turn.voice}
                textScale={textScale}
                reducedMotion={reducedMotion}
                peopleIndex={peopleIndex}
              />
            )
        ))}

        {/* Live partial user transcript */}
        {phase === 'listening' && partialUser && (
          <ChatBubble
            role="user"
            partial={partialUser}
            textScale={textScale}
            reducedMotion={reducedMotion}
          />
        )}

        {/* Thinking indicator */}
        {phase === 'thinking' && <ThinkingBubble reducedMotion={reducedMotion} />}

        {/* Streaming AI response */}
        {phase === 'speaking' && partialAI && (
          <AiTurn
            partial={partialAI}
            live={true}
            showVolume={true}
            textScale={textScale}
            reducedMotion={reducedMotion}
            peopleIndex={peopleIndex}
          />
        )}
      </div>
    </div>
  );
}
