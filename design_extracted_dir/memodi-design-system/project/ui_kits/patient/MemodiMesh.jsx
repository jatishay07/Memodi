// Memodi MeshGradient — CSS approximation of @paper-design/shaders MeshGradient.
// Layered conic + radial gradients on slow, independent translations + blur.
// Uses the Memodi warm palette (blush, princeton orange, vanilla custard, olive, tomato).

const MemodiMesh = () => (
  <div
    aria-hidden
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background: "#FFF9F0",
    }}
  >
    {/* Layer 1: large soft conic — full palette sweep */}
    <div
      style={{
        position: "absolute",
        inset: "-20%",
        background:
          "conic-gradient(from 40deg, #FCE9AB 0%, #FC8A2D 14%, #DC4F7C 28%, #C42B34 42%, #9E9820 58%, #FC8A2D 74%, #FCE9AB 88%, #FCE9AB 100%)",
        filter: "blur(80px)",
        opacity: 0.55,
        animation: "memodiMeshSpin 32s linear infinite",
      }}
    />
    {/* Layer 2: counter-rotating, softer */}
    <div
      style={{
        position: "absolute",
        inset: "-20%",
        background:
          "conic-gradient(from 220deg, #FC8A2D 0%, #FCE9AB 30%, #DC4F7C 55%, #FCE9AB 78%, #9E9820 100%)",
        filter: "blur(110px)",
        opacity: 0.4,
        mixBlendMode: "multiply",
        animation: "memodiMeshSpinReverse 48s linear infinite",
      }}
    />
    {/* Layer 3: drifting bright pools to mimic mesh hotspots */}
    <div
      style={{
        position: "absolute",
        top: "8%",
        left: "12%",
        width: "55%",
        height: "55%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(252,138,45,0.55), transparent 65%)",
        filter: "blur(60px)",
        animation: "memodiMeshDrift1 22s ease-in-out infinite",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: "30%",
        right: "8%",
        width: "60%",
        height: "60%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(220,79,124,0.50), transparent 70%)",
        filter: "blur(70px)",
        animation: "memodiMeshDrift2 26s ease-in-out infinite",
      }}
    />
    <div
      style={{
        position: "absolute",
        bottom: "-10%",
        left: "20%",
        width: "70%",
        height: "55%",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(158,152,32,0.32), transparent 70%)",
        filter: "blur(90px)",
        animation: "memodiMeshDrift3 30s ease-in-out infinite",
      }}
    />
    {/* Cream wash on top — keeps the page readable, gives the "diffused" look */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(255,251,247,0.45) 0%, rgba(255,251,247,0.10) 50%, rgba(255,251,247,0.55) 100%)",
        pointerEvents: "none",
      }}
    />

    <style>{`
      @keyframes memodiMeshSpin       { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes memodiMeshSpinReverse{ from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      @keyframes memodiMeshDrift1     { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px, 28px) scale(1.1); } }
      @keyframes memodiMeshDrift2     { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-50px, 36px) scale(1.12); } }
      @keyframes memodiMeshDrift3     { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(28px, -24px) scale(1.08); } }
    `}</style>
  </div>
);

window.MemodiMesh = MemodiMesh;
