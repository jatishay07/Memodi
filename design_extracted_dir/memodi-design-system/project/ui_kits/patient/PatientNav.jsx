// PatientNav — floating pill nav top-left of every patient screen.

const PatientNav = ({ current, onNavigate }) => {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: "home" },
    { id: "memory-lane", label: "Memory Lane", icon: "images" },
  ];
  return (
    <nav
      style={{
        position: "absolute",
        top: 24,
        left: 32,
        zIndex: 50,
        display: "flex",
        gap: 12,
      }}
    >
      {items.map((item) => {
        const active = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 22px",
              border: `2px solid ${active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)"}`,
              borderRadius: 999,
              background: active ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              color: active ? "#DC4F7C" : "#6B6B6B",
              boxShadow: active ? "var(--shadow-md)" : "none",
              fontFamily: "var(--font-body)",
              fontSize: 17,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all .25s ease",
            }}
          >
            <i data-lucide={item.icon} style={{ width: 20, height: 20 }} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

window.PatientNav = PatientNav;
