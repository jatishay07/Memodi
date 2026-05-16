// CaregiverNav — fixed glass top bar with brand + tabs + sign-out.

const CaregiverNav = ({ current, onNavigate, onSignOut, unread = 4 }) => (
  <nav
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: "20px 32px",
      background: "rgba(255,255,255,0.5)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "2px solid rgba(255,255,255,0.6)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1240,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 32,
            fontWeight: 500,
            margin: 0,
            color: "#4a3f33",
            letterSpacing: "normal",
          }}
        >
          Memodi
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { id: "memory-base", label: "Memory Base", icon: "database", badge: false },
            { id: "alerts", label: "Alerts", icon: "bell", badge: true },
          ].map((tab) => {
            const active = current === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 20px",
                  borderRadius: 999,
                  border: active ? "2px solid transparent" : "2px solid rgba(255,255,255,0.8)",
                  background: active
                    ? "#FC8A2D"
                    : "rgba(255,255,255,0.6)",
                  color: active ? "#fff" : "#6B6B6B",
                  fontFamily: "var(--font-body)",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                  boxShadow: active ? "0 8px 20px rgba(252,138,45,0.26)" : "none",
                  transition: "all .25s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <i data-lucide={tab.icon} style={{ width: 18, height: 18 }} />
                {tab.label}
                {tab.badge && unread > 0 && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "#C42B34",
                      marginLeft: 2,
                      animation: "carePulse 1.4s ease-in-out infinite",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={onSignOut}
        style={{
          padding: "11px 22px",
          borderRadius: 999,
          border: "2px solid rgba(255,255,255,0.8)",
          background: "rgba(255,255,255,0.6)",
          color: "#6B6B6B",
          fontFamily: "var(--font-body)",
          fontSize: 15,
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Sign out
      </button>
    </div>
    <style>{`
      @keyframes carePulse {
        0%,100% { opacity: 0.55; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.4); }
      }
    `}</style>
  </nav>
);

window.CaregiverNav = CaregiverNav;
