'use client';

import { useRef } from 'react';

export default function PhotoPicker({ value, existingUrl, onChange, accent = '#DC4F7C', shape = 'square' }) {
  const fileRef = useRef(null);

  const accentSoft = accent === '#DC4F7C' ? 'rgba(220,79,124,0.35)' : 'rgba(252,138,45,0.35)';
  const accentBg   = accent === '#DC4F7C' ? 'rgba(220,79,124,0.05)' : 'rgba(252,138,45,0.05)';
  const borderRadius = shape === 'round' ? '50%' : 16;

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 320;
      const ratio = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.naturalWidth  * ratio);
      canvas.height = Math.round(img.naturalHeight * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      onChange(canvas.toDataURL('image/jpeg', 0.80).split(',')[1]);
    };
    img.src = url;
    e.target.value = '';
  }

  const displaySrc = value
    ? `data:image/jpeg;base64,${value}`
    : existingUrl || null;

  if (displaySrc) {
    return (
      <div style={{ marginBottom: 16 }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: shape === 'round' ? 'center' : 'flex-start' }}>
          <img
            src={displaySrc}
            alt=""
            style={{
              width:  shape === 'round' ? 88 : '100%',
              height: shape === 'round' ? 88 : 160,
              borderRadius,
              objectFit: 'cover',
              boxShadow: '0 4px 14px rgba(45,45,45,0.12)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              flex: 1, padding: '9px', borderRadius: 999,
              border: `2px solid ${accentSoft}`, background: accentBg,
              color: accent, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
            }}
          >
            Change photo
          </button>
          <button
            onClick={() => onChange(null)}
            style={{
              padding: '9px 14px', borderRadius: 999,
              border: '2px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.7)',
              color: '#9C9C9C', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        style={{
          width: '100%', padding: '18px', borderRadius: 16,
          border: `2px dashed ${accentSoft}`, background: accentBg,
          color: accent, cursor: 'pointer', fontSize: 15,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontFamily: 'var(--font-sans)', transition: 'border-color .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = accent; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = accentSoft; }}
      >
        <span style={{ fontSize: 20 }}>⊕</span> Add photo (optional)
      </button>
    </div>
  );
}
