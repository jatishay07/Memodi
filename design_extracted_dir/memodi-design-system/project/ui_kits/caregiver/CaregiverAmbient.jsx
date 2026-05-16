// CaregiverAmbient — slightly more subdued than patient: 1 blob, no particles.

const CaregiverAmbient = () => (
  <div
    aria-hidden
    style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}
  >
    <div
      className="anim-drift"
      style={{
        position: "absolute",
        top: 80,
        right: -120,
        width: 420,
        height: 420,
        borderRadius: "50%",
        background: "radial-gradient(circle, #FC8A2D, transparent)",
        opacity: 0.18,
        filter: "blur(100px)",
      }}
    />
    <div
      className="anim-drift"
      style={{
        position: "absolute",
        bottom: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, #9E9820, transparent)",
        opacity: 0.16,
        filter: "blur(100px)",
        animationDelay: "-7s",
      }}
    />
  </div>
);

window.CaregiverAmbient = CaregiverAmbient;
