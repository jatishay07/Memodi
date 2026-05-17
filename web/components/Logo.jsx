'use client';

export default function Logo({ iconSize = 36, textSize = 22, gap = 8, stacked = false }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: stacked ? 'column' : 'row',
      alignItems: stacked ? 'flex-start' : 'center',
      gap,
    }}>
      <img
        src="/logo-transparent.png"
        alt="Memodi logo"
        style={{ width: iconSize, height: iconSize, objectFit: 'contain', display: 'block' }}
      />
      <span style={{
        fontFamily: 'var(--font-sans)',
        fontSize: textSize,
        fontWeight: 700,
        color: '#7B1B54',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        memodi
      </span>
    </div>
  );
}
