// MemoryLane — masonry of polaroid-styled memory cards + cinematic modal.

const memoryLaneItems = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=900&q=80",
    title: "Summer Garden",
    desc: "The roses were in full bloom that year. You spent every morning tending to them with such care.",
    date: "June 2018",
    location: "Home Garden",
    audio: true,
    h: 360,
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=80",
    title: "Family Gathering",
    desc: "Everyone came together for Thanksgiving. You made your famous pumpkin pie.",
    date: "November 2019",
    location: "Home",
    audio: false,
    h: 240,
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80",
    title: "Beach Sunset",
    desc: "A peaceful evening walk along the shore. The waves were gentle and the sky was painted orange.",
    date: "August 2020",
    location: "Coastal Beach",
    audio: true,
    h: 320,
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1513385223519-9412ca9b47f7?w=900&q=80",
    title: "Birthday Celebration",
    desc: "Your 70th birthday party. So many smiling faces and heartfelt wishes.",
    date: "March 2021",
    location: "Community Hall",
    audio: false,
    h: 280,
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80",
    title: "Spring Flowers",
    desc: "The tulips you planted last fall finally bloomed. Each color more vibrant than the last.",
    date: "April 2019",
    location: "Home Garden",
    audio: false,
    h: 320,
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=80",
    title: "Cozy Reading",
    desc: "A quiet afternoon with your favorite book and a cup of tea.",
    date: "October 2020",
    location: "Living Room",
    audio: false,
    h: 240,
  },
];

const MemoryCard = ({ memory, onOpen, tilt }) => (
  <div
    onClick={onOpen}
    className="memodi-mem"
    style={{
      cursor: "pointer",
      borderRadius: 24,
      overflow: "hidden",
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "2px solid rgba(255,255,255,0.9)",
      boxShadow: "0 16px 40px rgba(45,45,45,0.10)",
      transition: "transform .4s ease, box-shadow .4s ease",
      transform: `rotate(${tilt}deg)`,
      marginBottom: 24,
    }}
  >
    <div style={{ position: "relative", overflow: "hidden" }}>
      <img
        src={memory.img}
        alt={memory.title}
        style={{
          width: "100%",
          height: memory.h,
          objectFit: "cover",
          display: "block",
          transition: "transform .6s ease",
        }}
      />
    </div>
    <div style={{ padding: 22 }}>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 26,
          fontWeight: 500,
          margin: "0 0 8px",
          color: "#2D2D2D",
        }}
      >
        {memory.title}
      </h3>
      <p
        style={{
          fontSize: 16,
          color: "#6B6B6B",
          lineHeight: 1.55,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {memory.desc}
      </p>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginTop: 14,
          fontSize: 13,
          color: "#9C9C9C",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <i data-lucide="calendar" style={{ width: 14, height: 14 }} />
          {memory.date}
        </span>
        {memory.location && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <i data-lucide="map-pin" style={{ width: 14, height: 14 }} />
            {memory.location}
          </span>
        )}
      </div>
      {memory.audio && (
        <div
          style={{
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#DC4F7C",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <i data-lucide="play" style={{ width: 14, height: 14 }} />
          Voice note available
        </div>
      )}
    </div>
  </div>
);

const MemoryModal = ({ memory, onClose }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(0,0,0,0.55)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
      animation: "memodiFade .35s ease",
    }}
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "relative",
        maxWidth: 920,
        width: "100%",
        maxHeight: "90vh",
        overflowY: "auto",
        borderRadius: 32,
        background: "rgba(255,255,255,0.96)",
        border: "2px solid #fff",
        boxShadow: "0 32px 80px rgba(45,45,45,0.25)",
        animation: "memodiSlideUp .45s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 22,
          right: 22,
          zIndex: 2,
          width: 48,
          height: 48,
          borderRadius: 999,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
          border: 0,
          boxShadow: "var(--shadow-md)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <i data-lucide="x" style={{ width: 22, height: 22, color: "#2D2D2D" }} />
      </button>
      <img
        src={memory.img}
        alt={memory.title}
        style={{
          width: "100%",
          height: 420,
          objectFit: "cover",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          display: "block",
        }}
      />
      <div style={{ padding: 48 }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 52,
            fontWeight: 400,
            margin: "0 0 20px",
            color: "#2D2D2D",
            letterSpacing: "-0.01em",
          }}
        >
          {memory.title}
        </h2>
        <div style={{ display: "flex", gap: 26, marginBottom: 28, color: "#6B6B6B" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 17 }}>
            <i data-lucide="calendar" style={{ width: 18, height: 18 }} />
            {memory.date}
          </span>
          {memory.location && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 17 }}>
              <i data-lucide="map-pin" style={{ width: 18, height: 18 }} />
              {memory.location}
            </span>
          )}
        </div>
        <p style={{ fontSize: 24, lineHeight: 1.6, color: "#2D2D2D", margin: "0 0 32px" }}>
          {memory.desc}
        </p>
        {memory.audio && (
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 32px",
              borderRadius: 999,
              border: 0,
              background: "#DC4F7C",
              color: "#fff",
              fontWeight: 600,
              fontSize: 18,
              cursor: "pointer",
              boxShadow: "0 10px 28px rgba(220,79,124,0.30)",
            }}
          >
            <i data-lucide="play" style={{ width: 22, height: 22 }} />
            Play voice note
          </button>
        )}
      </div>
    </div>
  </div>
);

const MemoryLane = () => {
  const [open, setOpen] = React.useState(null);

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  // simple 3-column masonry
  const cols = [[], [], []];
  memoryLaneItems.forEach((m, i) => cols[i % 3].push(m));

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #FFF9F0 0%, #FFFBF7 40%, rgba(252,233,171,0.10) 100%)",
        paddingBottom: 80,
      }}
    >
      <PatientAmbient particleCount={12} />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "120px 40px 0",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 72,
              fontWeight: 400,
              margin: 0,
              color: "#4a3f33",
            }}
          >
            Memory Lane
          </h1>
          <p style={{ fontSize: 20, color: "#6B6B6B", marginTop: 14 }}>
            Your cherished moments, preserved with love
          </p>
        </div>

        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {cols.map((col, ci) => (
            <div key={ci}>
              {col.map((m, mi) => (
                <MemoryCard
                  key={m.id}
                  memory={m}
                  tilt={(ci + mi) % 2 === 0 ? -1.5 : 1.5}
                  onOpen={() => setOpen(m)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {open && <MemoryModal memory={open} onClose={() => setOpen(null)} />}

      <style>{`
        .memodi-mem:hover {
          transform: translateY(-8px) rotate(0deg) !important;
          box-shadow: 0 24px 56px rgba(45,45,45,0.18) !important;
        }
        .memodi-mem:hover img { transform: scale(1.08); }
        @keyframes memodiFade { from {opacity:0;} to {opacity:1;} }
        @keyframes memodiSlideUp { from { opacity: 0; transform: translateY(40px) scale(.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

window.MemoryLane = MemoryLane;
