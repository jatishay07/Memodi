// AIOrb — the centerpiece of Memodi.
// States: idle | listening | thinking | speaking | distress.
//
// Pixel-faithful to src/app/components/AIOrb.tsx in the original codebase.

const orbStateConfig = {
  idle: {
    gradient: "radial-gradient(circle, #FC8A2D 0%, #DC4F7C 40%, #FCE9AB 100%)",
    glow: "rgba(252,138,45,0.40)",
    breath: 4000,
  },
  listening: {
    gradient: "radial-gradient(circle, #FC8A2D 0%, #FCE9AB 60%, #FC8A2D 100%)",
    glow: "rgba(252,138,45,0.60)",
    breath: 3000,
  },
  thinking: {
    gradient: "radial-gradient(circle, #9E9820 0%, #FC8A2D 50%, #FCE9AB 100%)",
    glow: "rgba(158,152,32,0.55)",
    breath: 3500,
  },
  speaking: {
    gradient: "radial-gradient(circle, #DC4F7C 0%, #FC8A2D 50%, #DC4F7C 100%)",
    glow: "rgba(220,79,124,0.60)",
    breath: 2500,
  },
  distress: {
    gradient: "radial-gradient(circle, #C42B34 0%, #DC4F7C 60%, #C42B34 100%)",
    glow: "rgba(196,43,52,0.70)",
    breath: 1200,
  },
};

const AIOrb = ({ state = "idle", size = 360 }) => {
  const cfg = orbStateConfig[state] || orbStateConfig.idle;
  const isAudible = state === "listening" || state === "speaking";

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Main orb */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: cfg.gradient,
          boxShadow: `0 0 ${size * 0.22}px ${cfg.glow}`,
          position: "relative",
          overflow: "hidden",
          animation: `breath ${cfg.breath}ms ease-in-out infinite`,
        }}
      >
        {/* Glass highlight */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(255,255,255,0.32) 0%, transparent 55%)",
          }}
        />
        {/* Breathing inner glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45) 0%, transparent 55%)",
            animation: "breath 3s ease-in-out infinite",
            animationDelay: "-1s",
          }}
        />
        {/* Speaking / listening: inset highlight pulse */}
        {isAudible && (
          <div
            style={{
              position: "absolute",
              inset: size * 0.12,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)",
              animation: "breath 1.4s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Listening / speaking concentric audio rings */}
      {isAudible &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.35)",
              width: size * (1 + (i + 1) * 0.12),
              height: size * (1 + (i + 1) * 0.12),
              animation: "breath 2.5s ease-in-out infinite",
              animationDelay: `${i * 0.3}s`,
              opacity: 0.5,
            }}
          />
        ))}

      {/* Distress: outward pulse rings */}
      {state === "distress" &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "3px solid #C42B34",
              animation: "pulse-ring 2s ease-out infinite",
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}

      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

window.AIOrb = AIOrb;
window.orbStateConfig = orbStateConfig;
