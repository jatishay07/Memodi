'use client';

import { useState } from 'react';

function ControlRow({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontFamily: 'var(--font-sans)', fontSize: 11,
        color: 'rgba(61,52,42,0.42)', margin: '0 0 8px',
        textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 700,
      }}>
        {label}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 16px', borderRadius: 12, cursor: 'pointer',
        border: active
          ? '1.5px solid rgba(220,79,124,0.38)'
          : '1.5px solid rgba(61,52,42,0.09)',
        background: active
          ? 'rgba(252,138,45,0.09)'
          : 'rgba(255,251,247,0.60)',
        color: active ? '#C42B34' : 'rgba(61,52,42,0.62)',
        fontFamily: 'var(--font-sans)', fontSize: 14,
        fontWeight: active ? 600 : 400,
        minWidth: 52, textAlign: 'center',
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.background = 'rgba(255,251,247,0.95)';
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.background = 'rgba(255,251,247,0.60)';
      }}
    >
      {children}
    </button>
  );
}

export default function ComfortTray({ settings, onChange }) {
  const [open, setOpen] = useState(false);

  function update(key, val) {
    onChange({ ...settings, [key]: val });
  }

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 80,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12,
    }}>
      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Comfort settings"
          style={{
            background: 'rgba(255,251,247,0.97)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            border: '1.5px solid rgba(255,255,255,0.92)',
            borderRadius: 24, padding: '24px 24px 20px',
            boxShadow: '0 24px 64px rgba(45,45,45,0.11), inset 0 1px 0 rgba(255,255,255,0.9)',
            width: 292,
            animation: 'comfortTrayIn 0.28s ease',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 500,
              color: '#3d342a', margin: '0 0 4px',
            }}>
              Comfort settings
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: 13,
              color: 'rgba(61,52,42,0.48)', margin: 0, lineHeight: 1.5,
            }}>
              Adjust the screen so it feels easier to read and follow.
            </p>
          </div>

          <ControlRow label="Text size">
            <Chip active={settings.textScale === 1} onClick={() => update('textScale', 1)}>
              <span style={{ fontSize: 12 }}>Aa</span>
            </Chip>
            <Chip active={settings.textScale === 1.2} onClick={() => update('textScale', 1.2)}>
              <span style={{ fontSize: 15 }}>Aa</span>
            </Chip>
            <Chip active={settings.textScale === 1.4} onClick={() => update('textScale', 1.4)}>
              <span style={{ fontSize: 18 }}>Aa</span>
            </Chip>
          </ControlRow>

          <ControlRow label="Reading mode">
            <Chip active={!settings.readingMode} onClick={() => update('readingMode', false)}>Default</Chip>
            <Chip active={settings.readingMode} onClick={() => update('readingMode', true)}>Spacious</Chip>
          </ControlRow>

          <ControlRow label="Speech speed">
            {/* TODO: connect speech speed to Polly/audio pipeline */}
            <Chip active={settings.speechSpeed === 'slow'} onClick={() => update('speechSpeed', 'slow')}>Slower</Chip>
            <Chip active={settings.speechSpeed === 'normal'} onClick={() => update('speechSpeed', 'normal')}>Normal</Chip>
            <Chip active={settings.speechSpeed === 'fast'} onClick={() => update('speechSpeed', 'fast')}>Faster</Chip>
          </ControlRow>

          <ControlRow label="Contrast">
            <Chip active={settings.contrast === 'soft'} onClick={() => update('contrast', 'soft')}>Soft</Chip>
            <Chip active={settings.contrast === 'high'} onClick={() => update('contrast', 'high')}>High contrast</Chip>
          </ControlRow>

          <ControlRow label="Motion">
            <Chip active={settings.motion === 'full'} onClick={() => update('motion', 'full')}>Full</Chip>
            <Chip active={settings.motion === 'reduced'} onClick={() => update('motion', 'reduced')}>Reduced</Chip>
          </ControlRow>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close comfort settings' : 'Open comfort settings'}
        aria-expanded={open}
        aria-haspopup="dialog"
        style={{
          width: 52, height: 52, borderRadius: 999,
          border: open ? 'none' : '1.5px solid rgba(255,255,255,0.92)',
          background: open
            ? 'linear-gradient(135deg, #FC8A2D 0%, #DC4F7C 100%)'
            : 'rgba(255,251,247,0.92)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: open
            ? '0 8px 28px rgba(220,79,124,0.34)'
            : '0 8px 28px rgba(45,45,45,0.09)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: open ? '#fff' : 'rgba(61,52,42,0.68)',
          fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.boxShadow = '0 10px 32px rgba(45,45,45,0.14)';
            e.currentTarget.style.transform = 'scale(1.04)';
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(45,45,45,0.09)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        Aa
      </button>
    </div>
  );
}
