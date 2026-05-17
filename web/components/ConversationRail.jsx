'use client';

import { Mic, Pause, Volume2, X } from 'lucide-react';
import Orb from './Orb';

function Waveform({ reducedMotion }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 22 }}>
      {[0, 0.12, 0.24, 0.36, 0.48].map(delay => (
        <span
          key={delay}
          style={{
            display: 'block',
            width: 3,
            height: 22,
            borderRadius: 2,
            background: delay % 0.24 === 0 ? '#DC4F7C' : '#C42B34',
            transformOrigin: 'center',
            animation: reducedMotion ? 'none' : `wf 1.2s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function ConversationRail({
  phase,
  orbState,
  onMic,
  onEnd,
  textScale = 1,
  reducedMotion = false,
}) {
  const isListening = phase === 'listening';
  const isThinking = phase === 'thinking';
  const isSpeaking = phase === 'speaking';

  const captionText = isListening
    ? "I'm listening"
    : isThinking
      ? "I'm thinking…"
      : isSpeaking
        ? 'Memodi is speaking'
        : 'Tap to speak with me';
  const captionColor = (isListening || isSpeaking) ? '#5C2238' : '#6B6B6B';
  const micBg = isListening ? '#C42B34' : 'linear-gradient(135deg, #FC8A2D 0%, #DC4F7C 100%)';
  const micLabel = isListening
    ? 'Tap to stop'
    : isThinking
      ? 'Thinking…'
      : isSpeaking
        ? 'Tap to interrupt'
        : 'Tap to speak';

  return (
    <div
      style={{
        position: 'sticky',
        top: 16,
        padding: '28px 16px 22px',
        borderRadius: 32,
        background: 'rgba(255,255,255,0.50)',
        border: '1.5px solid rgba(255,255,255,0.75)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        boxShadow: '0 18px 48px rgba(45,45,45,0.08), inset 0 1px 0 rgba(255,255,255,0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 22,
      }}
    >
      <div
        style={{
          transition: reducedMotion
            ? 'none'
            : 'width 0.7s cubic-bezier(.45,.05,.55,.95), height 0.7s cubic-bezier(.45,.05,.55,.95)',
        }}
      >
        <Orb state={orbState} size={200} />
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.55)',
          border: '1.5px solid rgba(255,255,255,0.85)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 4px 18px rgba(45,45,45,0.06)',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: captionColor,
          transition: 'color 0.4s ease',
        }}
      >
        {isListening && <Waveform reducedMotion={reducedMotion} />}
        {isSpeaking && <Volume2 size={16} color="#DC4F7C" strokeWidth={2.2} />}
        {captionText}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onMic}
          disabled={isThinking}
          aria-label={micLabel}
          aria-disabled={isThinking}
          onMouseDown={event => { if (!isThinking) event.currentTarget.style.transform = 'scale(0.94)'; }}
          onMouseUp={event => { event.currentTarget.style.transform = 'scale(1)'; }}
          onMouseLeave={event => { event.currentTarget.style.transform = 'scale(1)'; }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 999,
            border: 0,
            background: micBg,
            color: '#fff',
            cursor: isThinking ? 'not-allowed' : 'pointer',
            opacity: isThinking ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: isListening && !reducedMotion ? 'micPulse 1.5s ease-out infinite' : 'none',
            boxShadow: isListening ? '0 0 0 0 rgba(220,79,124,0.5)' : '0 10px 32px rgba(220,79,124,0.32)',
            transition: 'background 0.3s ease, opacity 0.2s ease, transform 0.2s ease',
          }}
        >
          {isSpeaking ? <Pause size={32} strokeWidth={2.2} /> : <Mic size={32} strokeWidth={2.2} />}
        </button>

        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14 * textScale, fontWeight: 500, color: '#6B6B6B' }}>
          {micLabel}
        </span>
      </div>

      <button
        onClick={onEnd}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.45)',
          border: '1.5px solid rgba(255,255,255,0.75)',
          color: '#9C9C9C',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 12.5,
          fontWeight: 500,
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={event => { event.currentTarget.style.background = 'rgba(255,255,255,0.70)'; }}
        onMouseLeave={event => { event.currentTarget.style.background = 'rgba(255,255,255,0.45)'; }}
      >
        <X size={12} strokeWidth={2.2} />
        End conversation
      </button>
    </div>
  );
}
