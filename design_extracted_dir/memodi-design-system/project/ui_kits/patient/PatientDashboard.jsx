// PatientDashboard — the centerpiece screen. Big orb + mic CTA.
// When the user "speaks", the orb cycles: listening → thinking → speaking.

const dashboardResponses = [
  "Hello! I'm here with you. How are you feeling today?",
  "I remember you love looking at photos from your garden. Would you like to see them?",
  "Your glasses were last placed on the kitchen table, near the fruit bowl.",
  "That's a wonderful memory. Tell me more about it.",
];

const PatientDashboard = () => {
  const [orbState, setOrbState] = React.useState("idle");
  const [response, setResponse] = React.useState("");
  const [textScale, setTextScale] = React.useState(1); // 1 / 1.2 / 1.4
  const [isListening, setIsListening] = React.useState(false);

  const cycleScale = () =>
    setTextScale((s) => (s === 1 ? 1.2 : s === 1.2 ? 1.4 : 1));

  const handleMic = () => {
    if (isListening) {
      setIsListening(false);
      setOrbState("thinking");
      setTimeout(() => {
        setOrbState("speaking");
        const r = dashboardResponses[Math.floor(Math.random() * dashboardResponses.length)];
        setResponse(r);
        setTimeout(() => {
          setOrbState("idle");
        }, 6000);
      }, 1600);
    } else {
      setIsListening(true);
      setOrbState("listening");
      setResponse("");
    }
  };

  const reset = () => {
    setResponse("");
    setOrbState("idle");
    setIsListening(false);
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)",
      }}
    >
      <PatientAmbient particleCount={6} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          padding: "120px 32px 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 56,
            width: "100%",
            maxWidth: 1200,
            transition: "transform .6s ease",
          }}
        >
          <div
            style={{
              transition: "transform .8s ease",
              transform: response ? "translateX(-80px) scale(0.7)" : "translateX(0) scale(1)",
            }}
          >
            <AIOrb state={orbState} size={response ? 280 : 360} />
          </div>

          {response && (
            <div
              style={{
                maxWidth: 560,
                padding: "40px 44px",
                borderRadius: 32,
                background: "rgba(255,255,255,0.78)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 24px 60px rgba(45,45,45,0.12)",
                animation: "memodiSlideIn .6s ease",
              }}
            >
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <i
                  data-lucide="volume-2"
                  style={{ width: 28, height: 28, color: "#DC4F7C", flexShrink: 0, marginTop: 4 }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 22 * textScale,
                    lineHeight: 1.55,
                    color: "#2D2D2D",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {response}
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
                <button
                  onClick={cycleScale}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 22px",
                    borderRadius: 999,
                    border: 0,
                    background: "#DC4F7C",
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(220,79,124,0.26)",
                  }}
                >
                  <i data-lucide="type" style={{ width: 18, height: 18 }} />
                  {textScale === 1 ? "Aa" : textScale === 1.2 ? "Aa+" : "Aa++"}
                </button>
                <button
                  onClick={reset}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 999,
                    border: "2px solid rgba(255,255,255,0.9)",
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(10px)",
                    color: "#6B6B6B",
                    fontWeight: 500,
                    fontSize: 16,
                    cursor: "pointer",
                  }}
                >
                  Speak again
                </button>
              </div>
            </div>
          )}
        </div>

        {!response && (
          <div
            style={{
              marginTop: 64,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            <button
              onClick={handleMic}
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: 0,
                background: isListening
                  ? "#C42B34"
                  : "#DC4F7C",
                color: "#fff",
                boxShadow: isListening
                  ? "0 0 0 0 rgba(220,79,124,0.5), 0 8px 28px rgba(220,79,124,0.32)"
                  : "0 8px 28px rgba(220,79,124,0.32)",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                animation: isListening ? "micPulse 1.5s ease-out infinite" : "none",
                transition: "transform .2s ease",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.94)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <i data-lucide="mic" style={{ width: 40, height: 40 }} />
            </button>
            <p style={{ fontSize: 22, color: "#6B6B6B", fontFamily: "var(--font-body)" }}>
              {isListening
                ? "Listening…"
                : orbState === "thinking"
                ? "I'm thinking…"
                : "Tap to speak with me"}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes micPulse {
          0% { box-shadow: 0 0 0 0 rgba(220,79,124,0.55), 0 8px 40px rgba(220,79,124,0.5); }
          70% { box-shadow: 0 0 0 24px rgba(220,79,124,0), 0 8px 40px rgba(220,79,124,0.5); }
          100% { box-shadow: 0 0 0 0 rgba(220,79,124,0), 0 8px 40px rgba(220,79,124,0.5); }
        }
        @keyframes memodiSlideIn {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

window.PatientDashboard = PatientDashboard;
