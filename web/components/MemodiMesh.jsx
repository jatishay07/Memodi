'use client';

export default function MemodiMesh() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#FFF9F0',
        zIndex: 0,
      }}
    >
      {/* Layer 1: large soft conic — full palette sweep */}
      <div style={{
        position: 'absolute', inset: '-20%',
        background: 'conic-gradient(from 40deg, #FCE9AB 0%, #FC8A2D 14%, #DC4F7C 28%, #C42B34 42%, #9E9820 58%, #FC8A2D 74%, #FCE9AB 88%, #FCE9AB 100%)',
        filter: 'blur(80px)', opacity: 0.55,
        animation: 'meshSpin 32s linear infinite',
      }} />
      {/* Layer 2: counter-rotating */}
      <div style={{
        position: 'absolute', inset: '-20%',
        background: 'conic-gradient(from 220deg, #FC8A2D 0%, #FCE9AB 30%, #DC4F7C 55%, #FCE9AB 78%, #9E9820 100%)',
        filter: 'blur(110px)', opacity: 0.4,
        mixBlendMode: 'multiply',
        animation: 'meshSpinReverse 48s linear infinite',
      }} />
      {/* Drifting hotspot pools */}
      <div style={{
        position: 'absolute', top: '8%', left: '12%', width: '55%', height: '55%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(252,138,45,0.55), transparent 65%)',
        filter: 'blur(60px)',
        animation: 'meshDrift1 22s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: '30%', right: '8%', width: '60%', height: '60%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,79,124,0.50), transparent 70%)',
        filter: 'blur(70px)',
        animation: 'meshDrift2 26s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '20%', width: '70%', height: '55%',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(158,152,32,0.32), transparent 70%)',
        filter: 'blur(90px)',
        animation: 'meshDrift3 30s ease-in-out infinite',
      }} />
      {/* Cream wash — keeps text readable */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,251,247,0.45) 0%, rgba(255,251,247,0.10) 50%, rgba(255,251,247,0.55) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}
