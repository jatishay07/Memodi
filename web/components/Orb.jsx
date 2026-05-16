'use client';

export default function Orb({ state = 'idle', size = 200, onClick }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size * 1.8, height: size * 1.8 }}
      onClick={onClick}
    >
      <div className="orb-glow" />
      <div
        className="orb-core select-none"
        data-state={state}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
