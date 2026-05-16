// Alerts — severity-ramped notifications for the caregiver.

const severityConfig = {
  mild: {
    color: "#9E9820",
    bg: "rgba(158,152,32,0.14)",
    border: "rgba(158,152,32,0.32)",
    title: "#6e6915",
  },
  medium: {
    color: "#FC8A2D",
    bg: "rgba(252,138,45,0.16)",
    border: "rgba(252,138,45,0.42)",
    title: "#b8500e",
  },
  severe: {
    color: "#C42B34",
    bg: "rgba(196,43,52,0.16)",
    border: "rgba(196,43,52,0.50)",
    title: "#8a1117",
  },
};

const alertIcons = {
  distress: "alert-circle",
  medication: "pill",
  confusion: "brain",
  emergency: "alert-triangle",
};

const alertsSeed = [
  {
    id: 1,
    type: "distress",
    severity: "medium",
    message: "Elevated stress detected",
    time: "2 hours ago",
    details:
      "Patient showed signs of anxiety during conversation about upcoming appointment.",
  },
  {
    id: 2,
    type: "medication",
    severity: "mild",
    message: "Medication reminder acknowledged",
    time: "4 hours ago",
    details: "Morning medications taken on schedule.",
  },
  {
    id: 3,
    type: "confusion",
    severity: "medium",
    message: "Confusion spike detected",
    time: "6 hours ago",
    details:
      "Patient asked about location of items multiple times within a short period.",
  },
  {
    id: 4,
    type: "emergency",
    severity: "severe",
    message: "Emergency assistance requested",
    time: "Yesterday, 8:30 PM",
    details:
      "Patient activated emergency call button. Caregiver responded within 3 minutes.",
  },
];

const StatTile = ({ label, count, icon, color }) => (
  <div
    style={{
      padding: "22px 26px",
      borderRadius: 24,
      background: "rgba(255,255,255,0.65)",
      backdropFilter: "blur(20px)",
      border: "2px solid rgba(255,255,255,0.85)",
      boxShadow: "0 8px 24px rgba(45,45,45,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 16, color: "#6B6B6B" }}>{label}</span>
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: color,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <i data-lucide={icon} style={{ width: 20, height: 20, color: "#fff" }} />
      </span>
    </div>
    <div style={{ fontFamily: "var(--font-serif)", fontSize: 48, lineHeight: 1, fontWeight: 400 }}>
      {count}
    </div>
  </div>
);

const AlertCard = ({ alert }) => {
  const cfg = severityConfig[alert.severity];
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 24,
        padding: "26px 30px",
        background: cfg.bg,
        backdropFilter: "blur(10px)",
        border: `2px solid ${cfg.border}`,
        display: "flex",
        gap: 22,
        alignItems: "flex-start",
      }}
    >
      {alert.severity === "severe" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(196,43,52,0.10)",
            animation: "alertSweep 2.4s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 999,
          background: cfg.color,
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <i
          data-lucide={alertIcons[alert.type]}
          style={{ width: 28, height: 28, color: "#fff" }}
        />
      </div>
      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                fontWeight: 500,
                margin: "0 0 4px",
                color: cfg.title,
              }}
            >
              {alert.message}
            </h3>
            <div
              style={{
                color: "#6B6B6B",
                fontSize: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i data-lucide="clock" style={{ width: 14, height: 14 }} />
              {alert.time}
            </div>
          </div>
          <span
            style={{
              padding: "5px 14px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.10em",
              color: cfg.color,
              background: "rgba(255,255,255,0.6)",
            }}
          >
            {alert.severity.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "#2D2D2D", margin: "10px 0 16px" }}>
          {alert.details}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{
              padding: "9px 18px",
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.85)",
              background: "rgba(255,255,255,0.7)",
              color: "#2D2D2D",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            View details
          </button>
          <button
            style={{
              padding: "9px 18px",
              borderRadius: 999,
              border: "2px solid rgba(255,255,255,0.85)",
              background: "rgba(255,255,255,0.7)",
              color: "#2D2D2D",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Mark resolved
          </button>
        </div>
      </div>
    </div>
  );
};

const Alerts = () => {
  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });
  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 64 }}>
      <CaregiverAmbient />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "120px 40px 0",
          maxWidth: 980,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 52,
            fontWeight: 400,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Alerts & notifications
        </h1>
        <p style={{ fontSize: 18, color: "#6B6B6B", margin: "8px 0 36px" }}>
          Monitor and respond to important events
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}>
          <StatTile
            label="Active alerts"
            count={4}
            icon="alert-circle"
            color="#9E9820"
          />
          <StatTile
            label="This week"
            count={12}
            icon="clock"
            color="#DC4F7C"
          />
          <StatTile
            label="Severe"
            count={1}
            icon="alert-triangle"
            color="#C42B34"
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {alertsSeed.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </div>

        {/* Weekly summary */}
        <div
          style={{
            marginTop: 40,
            padding: "32px 36px",
            borderRadius: 32,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(20px)",
            border: "2px solid rgba(255,255,255,0.85)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 30,
              fontWeight: 500,
              margin: "0 0 18px",
              color: "#2D2D2D",
            }}
          >
            Weekly summary
          </h2>
          {[
            ["Average daily interactions", "8"],
            ["Memory recall success rate", "78%"],
            ["Emotional well-being score", "7.2 / 10"],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <span style={{ fontSize: 16, color: "#6B6B6B" }}>{label}</span>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 26,
                  color: "#2D2D2D",
                  fontWeight: 500,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes alertSweep { 0%,100%{opacity:0.4;} 50%{opacity:0.85;} }
      `}</style>
    </div>
  );
};

window.Alerts = Alerts;
