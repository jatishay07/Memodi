'use client';

export default function CaregiverError({ error, reset }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
    }}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#C42B34', fontWeight: 400, margin: '0 0 8px' }}>
        Something went wrong.
      </p>
      <p style={{ fontSize: 16, color: '#9C9C9C', margin: '0 0 28px' }}>
        {error?.message || 'Let me try that again.'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '13px 32px', borderRadius: 999, border: 0,
          background: '#FC8A2D', color: '#fff',
          fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 600,
          cursor: 'pointer', boxShadow: '0 10px 28px rgba(252,138,45,0.30)',
        }}
      >
        Try again
      </button>
    </div>
  );
}
