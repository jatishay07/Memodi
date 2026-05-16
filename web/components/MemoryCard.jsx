'use client';

export default function MemoryCard({ type, data }) {
  const cardStyle = {
    borderRadius: 20, overflow: 'hidden',
    background: 'rgba(255,255,255,0.75)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '2px solid rgba(255,255,255,0.90)',
    boxShadow: '0 8px 24px rgba(45,45,45,0.08)',
    marginBottom: 16,
    padding: '18px 20px',
    transition: 'transform .3s ease, box-shadow .3s ease',
  };

  if (type === 'person') {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {data.photoUrl ? (
            <img
              src={data.photoUrl} alt={data.name}
              style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(220,79,124,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: '#DC4F7C', fontWeight: 500 }}>
                {data.name?.[0] ?? '?'}
              </span>
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 500, color: '#2D2D2D' }}>
                {data.name}
              </span>
              {data.isDeceased && (
                <span style={{
                  fontSize: 11, color: '#6B6B6B',
                  background: 'rgba(0,0,0,0.07)', padding: '2px 8px', borderRadius: 999,
                }}>
                  In memory
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: '#FC8A2D', fontWeight: 500, margin: '0 0 4px' }}>
              {data.relationship}
            </p>
            {data.story && (
              <p style={{
                fontSize: 14, color: '#6B6B6B', lineHeight: 1.55, margin: 0,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {data.story}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'object') {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'rgba(252,138,45,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#FC8A2D', fontSize: 20 }}>⊙</span>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, margin: '0 0 3px', color: '#2D2D2D' }}>
              {data.item}
            </p>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: 0 }}>{data.location}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'medication') {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'rgba(158,152,32,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#9E9820', fontSize: 18 }}>+</span>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, margin: '0 0 3px', color: '#2D2D2D' }}>
              {data.name}
            </p>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: 0 }}>{data.time} — {data.location}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'event') {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'rgba(220,79,124,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ color: '#DC4F7C', fontSize: 18 }}>◷</span>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500, margin: '0 0 3px', color: '#2D2D2D' }}>
              {data.description}
            </p>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: 0 }}>{data.date}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.6, margin: 0 }}>
        {typeof data === 'string' ? data : JSON.stringify(data)}
      </p>
    </div>
  );
}
