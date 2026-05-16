'use client';

const SEVERITY_CFG = {
  high:   { color: '#C42B34', bg: 'rgba(196,43,52,0.16)',  border: 'rgba(196,43,52,0.50)',  titleColor: '#8a1117', label: 'SEVERE',  pulse: true },
  medium: { color: '#FC8A2D', bg: 'rgba(252,138,45,0.16)', border: 'rgba(252,138,45,0.42)', titleColor: '#b8500e', label: 'MEDIUM',  pulse: false },
  low:    { color: '#9E9820', bg: 'rgba(158,152,32,0.14)', border: 'rgba(158,152,32,0.32)', titleColor: '#6e6915', label: 'MILD',    pulse: false },
};

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return isToday ? `Today, ${time}` : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
}

function getSeverity(alert) {
  if (alert.severity) {
    if (alert.severity === 'severe') return 'high';
    if (alert.severity === 'medium') return 'medium';
    return 'low';
  }
  if (alert.trigger?.includes('high')) return 'high';
  if (alert.trigger?.includes('medium')) return 'medium';
  return 'low';
}

export default function AlertCard({ alert, onResolve }) {
  const sev = getSeverity(alert);
  const cfg = SEVERITY_CFG[sev];
  const time = formatTime(alert.timestamp);

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 24, padding: '24px 28px',
      background: cfg.bg,
      backdropFilter: 'blur(10px)',
      border: `2px solid ${cfg.border}`,
      display: 'flex', gap: 20, alignItems: 'flex-start',
      marginBottom: 16,
    }}>
      {cfg.pulse && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(196,43,52,0.10)',
          animation: 'alertSweep 2.4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Icon circle */}
      <div style={{
        width: 52, height: 52, borderRadius: 999,
        background: cfg.color, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ color: '#fff', fontSize: 22 }}>
          {sev === 'high' ? '▲' : sev === 'medium' ? '!' : '•'}
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 500,
              margin: '0 0 4px', color: cfg.titleColor, lineHeight: 1.2,
            }}>
              {alert.message || alert.trigger || 'Alert'}
            </h3>
            <span style={{ color: '#6B6B6B', fontSize: 13 }}>{time}</span>
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: 999,
            fontSize: 11, fontWeight: 700, letterSpacing: '0.10em',
            color: cfg.color, background: 'rgba(255,255,255,0.60)',
          }}>
            {cfg.label}
          </span>
        </div>

        {alert.patientSaid && (
          <div style={{
            background: 'rgba(255,255,255,0.50)', borderRadius: 16, padding: '10px 16px',
            marginBottom: 12,
          }}>
            <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 4px' }}>Patient said:</p>
            <p style={{ fontSize: 15, color: '#2D2D2D', fontStyle: 'italic', margin: 0 }}>
              "{alert.patientSaid}"
            </p>
          </div>
        )}

        {alert.details && (
          <p style={{ fontSize: 15, lineHeight: 1.55, color: '#2D2D2D', margin: '8px 0 14px' }}>
            {alert.details}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {!alert.resolved && onResolve && (
            <button
              onClick={() => onResolve(alert.alertId)}
              style={{
                padding: '9px 18px', borderRadius: 999,
                border: '2px solid rgba(255,255,255,0.85)',
                background: 'rgba(255,255,255,0.70)',
                color: '#2D2D2D', fontSize: 14, fontWeight: 500, cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Mark resolved
            </button>
          )}
          {alert.resolved && (
            <span style={{ fontSize: 14, color: '#6B6B6B' }}>
              Resolved {alert.resolvedAt ? formatTime(alert.resolvedAt) : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
