// Landing — ShaderShowcase-inspired hero, Memodi palette.
// Animated mesh gradient bg, top header (wordmark + nav + gooey login),
// bottom-left hero block (chip + multi-line headline + paragraph + two CTAs),
// bottom-right pulsing border with rotating text.

const Landing = ({ onEnter }) => {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        overflow: "hidden",
        fontFamily: "var(--font-body)",
        color: "#3d342a",
      }}
    >
      <MemodiMesh />

      {/* Inline SVG filters — gooey + glass distortion + text glow */}
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id="memodi-gooey" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
          <filter id="memodi-glass" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
          </filter>
        </defs>
      </svg>

      {/* ===== HEADER ===== */}
      <header
        style={{
          position: "relative",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "26px 36px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 28,
            fontWeight: 500,
            color: "#3d342a",
            letterSpacing: "-0.01em",
          }}
        >
          Memodi
        </div>

        <nav style={{ display: "flex", gap: 4 }}>
          {["Memory Lane", "About", "Help"].map((label) => (
            <a
              key={label}
              href="#"
              className="memodi-nav-link"
              style={{
                color: "rgba(61,52,42,0.72)",
                fontSize: 13,
                fontWeight: 400,
                padding: "8px 14px",
                borderRadius: 999,
                textDecoration: "none",
                transition: "all .2s ease",
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Gooey login pill — arrow slides out on hover */}
        <div
          className="memodi-gooey-btn"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            filter: "url(#memodi-gooey)",
          }}
        >
          <button
            className="memodi-gooey-arrow"
            style={{
              position: "absolute",
              right: 0,
              padding: "0 10px",
              borderRadius: 999,
              background: "#3d342a",
              color: "#FFFBF7",
              border: 0,
              height: 32,
              width: 32,
              fontSize: 12,
              transform: "translateX(-40px)",
              transition: "transform .35s ease",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 0,
            }}
            aria-hidden="true"
          >
            ↗
          </button>
          <button
            onClick={() => onEnter("patient")}
            style={{
              padding: "0 24px",
              height: 32,
              borderRadius: 999,
              background: "#3d342a",
              color: "#FFFBF7",
              border: 0,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              zIndex: 1,
              fontFamily: "var(--font-body)",
            }}
          >
            Sign in
          </button>
        </div>
      </header>

      {/* ===== HERO (bottom-left) ===== */}
      <main
        style={{
          position: "absolute",
          bottom: 56,
          left: 56,
          zIndex: 20,
          maxWidth: 640,
        }}
      >
        {/* Glass chip */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 16px",
            borderRadius: 999,
            background: "rgba(255,251,247,0.55)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(61,52,42,0.10)",
            marginBottom: 28,
            position: "relative",
            animation: "memodiFadeUp .8s ease both",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 6,
              right: 6,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(220,79,124,0.40), transparent)",
              borderRadius: 999,
            }}
          />
          <span
            style={{
              color: "rgba(61,52,42,0.85)",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.04em",
            }}
          >
            A memory companion
          </span>
        </div>

        {/* Multi-line headline */}
        <h1
          style={{
            margin: "0 0 26px",
            lineHeight: 1.0,
            fontFamily: "var(--font-serif)",
            fontWeight: 400,
            color: "#3d342a",
            letterSpacing: "-0.02em",
            animation: "memodiFadeUp 1s ease .15s both",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: 56,
              fontWeight: 300,
              color: "rgba(61,52,42,0.75)",
              letterSpacing: "0.005em",
              marginBottom: 8,
            }}
          >
            Helping
          </span>
          <span style={{ display: "block", fontSize: 96, fontWeight: 500 }}>
            memories
          </span>
          <span
            style={{
              display: "block",
              fontSize: 80,
              fontStyle: "italic",
              fontWeight: 400,
              color: "rgba(61,52,42,0.85)",
            }}
          >
            stay close.
          </span>
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: "rgba(61,52,42,0.70)",
            margin: "0 0 36px",
            maxWidth: 520,
            fontWeight: 400,
            animation: "memodiFadeUp 1s ease .35s both",
          }}
        >
          A gentle AI companion for people living with memory loss — and the
          caregivers who love them. Conversations, photographs, and the people
          who matter, held close.
        </p>

        {/* Two CTA pills — Patient & Caregiver */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            animation: "memodiFadeUp 1s ease .5s both",
          }}
        >
          <button
            onClick={() => onEnter("patient")}
            className="memodi-cta memodi-cta-ghost"
            style={{
              padding: "14px 36px",
              borderRadius: 999,
              background: "rgba(255,251,247,0.30)",
              border: "1.5px solid rgba(61,52,42,0.22)",
              color: "#3d342a",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              transition: "all .3s ease",
            }}
          >
            I'm a patient
          </button>
          <button
            onClick={() => onEnter("caregiver")}
            className="memodi-cta memodi-cta-solid"
            style={{
              padding: "14px 36px",
              borderRadius: 999,
              background: "#3d342a",
              border: "1.5px solid #3d342a",
              color: "#FFFBF7",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 12px 28px rgba(61,52,42,0.18)",
              transition: "all .3s ease",
            }}
          >
            I'm a caregiver
          </button>
        </div>
      </main>

      {/* ===== BOTTOM-RIGHT: Pulsing border + rotating text ===== */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          right: 40,
          zIndex: 30,
          width: 96,
          height: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Pulsing border ring */}
        <div
          style={{
            position: "absolute",
            width: 64,
            height: 64,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, #DC4F7C, #FC8A2D, #FCE9AB, #9E9820, #FC8A2D, #DC4F7C)",
            filter: "blur(2px)",
            animation: "memodiOrbSpin 4s linear infinite, memodiOrbPulse 2.4s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#FFFBF7",
          }}
        />

        {/* Rotating outer text */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            animation: "memodiOrbSpin 24s linear infinite",
            transform: "scale(1.6)",
          }}
          aria-hidden
        >
          <defs>
            <path
              id="memodi-circle"
              d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
            />
          </defs>
          <text
            style={{
              fontSize: 8,
              fill: "rgba(61,52,42,0.65)",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            <textPath href="#memodi-circle" startOffset="0%">
              Memodi · helping memories stay close · Memodi · helping memories stay close ·
            </textPath>
          </text>
        </svg>
      </div>

      <style>{`
        .memodi-nav-link:hover { background: rgba(255,251,247,0.5); color: #3d342a; }
        .memodi-gooey-btn:hover .memodi-gooey-arrow { transform: translateX(-72px); }
        .memodi-cta-ghost:hover { background: rgba(255,251,247,0.55); border-color: rgba(61,52,42,0.40); }
        .memodi-cta-solid:hover { background: #2d251c; }
        .memodi-cta:active { transform: scale(0.97); }
        @keyframes memodiFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes memodiOrbSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes memodiOrbPulse {
          0%, 100% { box-shadow: 0 0 16px rgba(220,79,124,0.55); }
          50% { box-shadow: 0 0 28px rgba(252,138,45,0.75); }
        }
      `}</style>
    </div>
  );
};

window.Landing = Landing;
