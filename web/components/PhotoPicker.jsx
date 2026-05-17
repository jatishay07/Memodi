'use client';

import { useEffect, useRef, useState } from 'react';

export default function PhotoPicker({ value, existingUrl, onChange, accent = '#DC4F7C', shape = 'square' }) {
  const [mode, setMode] = useState('idle'); // 'idle' | 'camera'
  const [cameraReady, setCameraReady] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const accentSoft = accent === '#DC4F7C' ? 'rgba(220,79,124,0.35)' : 'rgba(252,138,45,0.35)';
  const accentBg   = accent === '#DC4F7C' ? 'rgba(220,79,124,0.05)' : 'rgba(252,138,45,0.05)';
  const borderRadius = shape === 'round' ? '50%' : 16;

  // Attach stream to video after every render until connected
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || video.srcObject === stream) return;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
    setCameraReady(true);
  });

  useEffect(() => () => stopCamera(), []);

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraReady(false);
      setMode('camera');
    } catch {
      alert('Camera access was denied or is unavailable.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraReady(false);
    setMode('idle');
  }

  function snap() {
    const video = videoRef.current;
    if (!video) return;
    const MAX = 320;
    const ratio = Math.min(MAX / video.videoWidth, MAX / video.videoHeight, 1);
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(video.videoWidth  * ratio);
    canvas.height = Math.round(video.videoHeight * ratio);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    onChange(canvas.toDataURL('image/jpeg', 0.80).split(',')[1]);
    stopCamera();
  }

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

  // ── Camera viewfinder ──
  if (mode === 'camera') {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden',
          background: '#000', aspectRatio: '4/3', width: '100%',
        }}>
          <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
          {!cameraReady && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.6)', fontSize: 14,
            }}>
              Starting camera…
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={stopCamera} style={{
            flex: 1, padding: '11px', borderRadius: 999,
            border: '2px solid rgba(0,0,0,0.10)', background: 'rgba(255,255,255,0.75)',
            cursor: 'pointer', fontSize: 14, color: '#6B6B6B', fontFamily: 'var(--font-sans)',
          }}>
            Cancel
          </button>
          <button onClick={snap} disabled={!cameraReady} style={{
            flex: 2, padding: '11px', borderRadius: 999, border: 0,
            background: cameraReady ? accent : 'rgba(0,0,0,0.15)',
            color: '#fff', cursor: cameraReady ? 'pointer' : 'default',
            fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-sans)',
            transition: 'background .2s ease',
          }}>
            Snap photo
          </button>
        </div>
      </div>
    );
  }

  // ── Photo preview ──
  if (displaySrc) {
    return (
      <div style={{ marginBottom: 16 }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: shape === 'round' ? 'center' : 'flex-start' }}>
          <img src={displaySrc} alt="" style={{
            width:  shape === 'round' ? 88 : '100%',
            height: shape === 'round' ? 88 : 160,
            borderRadius, objectFit: 'cover',
            boxShadow: '0 4px 14px rgba(45,45,45,0.12)',
          }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => fileRef.current?.click()} style={{
            flex: 1, padding: '9px', borderRadius: 999,
            border: `2px solid ${accentSoft}`, background: accentBg,
            color: accent, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
          }}>
            Upload new
          </button>
          <button onClick={openCamera} style={{
            flex: 1, padding: '9px', borderRadius: 999,
            border: `2px solid ${accentSoft}`, background: accentBg,
            color: accent, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
          }}>
            Retake
          </button>
          <button onClick={() => onChange(null)} style={{
            padding: '9px 14px', borderRadius: 999,
            border: '2px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.7)',
            color: '#9C9C9C', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
          }}>
            ✕
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state: upload + camera ──
  return (
    <div style={{ marginBottom: 16 }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => fileRef.current?.click()} style={{
          flex: 1, padding: '16px 10px', borderRadius: 16,
          border: `2px dashed ${accentSoft}`, background: accentBg,
          color: accent, cursor: 'pointer', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'var(--font-sans)', transition: 'border-color .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = accentSoft; }}
        >
          <span style={{ fontSize: 18 }}>⊕</span> Upload
        </button>
        <button onClick={openCamera} style={{
          flex: 1, padding: '16px 10px', borderRadius: 16,
          border: `2px dashed ${accentSoft}`, background: accentBg,
          color: accent, cursor: 'pointer', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'var(--font-sans)', transition: 'border-color .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = accentSoft; }}
        >
          <span style={{ fontSize: 18 }}>◉</span> Take photo
        </button>
      </div>
    </div>
  );
}
