// MemoryBase — the caregiver's library of memories: masonry grid, search,
// pill add-button, verification badges, and the Add Memory modal.

const memoryBaseSeed = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&q=80",
    title: "Summer Garden",
    description: "The roses were in full bloom that year.",
    date: "2018-06-15",
    location: "Home Garden",
    tags: ["garden", "flowers", "summer"],
    people: ["Mom"],
    verified: true,
    h: 220,
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80",
    title: "Family Gathering",
    description: "Thanksgiving celebration with everyone.",
    date: "2019-11-28",
    location: "Home",
    tags: ["family", "holiday", "thanksgiving"],
    people: ["Mom", "Dad", "Sarah", "John"],
    verified: true,
    h: 280,
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    title: "Beach Sunset",
    description: "Peaceful evening walk along the shore.",
    date: "2020-08-12",
    location: "Coastal Beach",
    tags: ["beach", "sunset", "nature"],
    people: ["Mom", "Dad"],
    verified: false,
    h: 200,
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1513385223519-9412ca9b47f7?w=800&q=80",
    title: "Birthday Celebration",
    description: "Your 70th birthday party.",
    date: "2021-03-04",
    location: "Community Hall",
    tags: ["birthday", "family"],
    people: ["Mom", "Dad", "Sarah"],
    verified: true,
    h: 240,
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80",
    title: "Spring Flowers",
    description: "Tulips you planted last fall.",
    date: "2019-04-10",
    location: "Home Garden",
    tags: ["garden", "spring"],
    people: ["Mom"],
    verified: false,
    h: 200,
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
    title: "Cozy Reading",
    description: "A quiet afternoon with a book.",
    date: "2020-10-22",
    location: "Living Room",
    tags: ["home", "reading"],
    people: ["Mom"],
    verified: true,
    h: 220,
  },
  {
    id: 7,
    img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    title: "Mountain Walk",
    description: "An autumn hike through the woods.",
    date: "2017-10-08",
    location: "Blue Ridge",
    tags: ["nature", "autumn"],
    people: ["Mom", "Sarah"],
    verified: false,
    h: 260,
  },
  {
    id: 8,
    img: "https://images.unsplash.com/photo-1502780402662-acc01917ef88?w=800&q=80",
    title: "Wedding Day",
    description: "Your 40th anniversary.",
    date: "2022-05-30",
    location: "Garden Chapel",
    tags: ["family", "anniversary"],
    people: ["Mom", "Dad"],
    verified: true,
    h: 280,
  },
];

const AddMemoryModal = ({ onClose, onSave }) => {
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    date: "",
    location: "",
    tags: "",
    people: "",
  });
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        animation: "careFade .35s ease",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: 32,
          background: "rgba(255,255,255,0.96)",
          border: "2px solid #fff",
          boxShadow: "0 32px 80px rgba(45,45,45,0.25)",
          padding: 48,
          position: "relative",
          animation: "careSlideUp .45s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 22,
            right: 22,
            width: 42,
            height: 42,
            borderRadius: 999,
            background: "rgba(255,255,255,0.9)",
            border: 0,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <i data-lucide="x" style={{ width: 20, height: 20, color: "#2D2D2D" }} />
        </button>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 38,
            fontWeight: 400,
            margin: "0 0 28px",
            color: "#2D2D2D",
            letterSpacing: "-0.01em",
          }}
        >
          Add a new memory
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="Title">
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="What was this moment?"
              style={inputStyle}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Tell the story of this memory…"
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="Date" icon="calendar">
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Location" icon="map-pin">
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Where was this?"
                style={inputStyle}
              />
            </Field>
          </div>
          <Field label="Tags" icon="tag">
            <input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="garden, family, celebration"
              style={inputStyle}
            />
          </Field>
          <Field label="People" icon="users">
            <input
              value={form.people}
              onChange={(e) => set("people", e.target.value)}
              placeholder="Mom, Dad, Sarah"
              style={inputStyle}
            />
          </Field>
          <Field label="Upload media" icon="upload">
            <div
              style={{
                border: "2px dashed rgba(252,138,45,0.4)",
                borderRadius: 20,
                padding: 36,
                textAlign: "center",
                cursor: "pointer",
                background: "rgba(252,138,45,0.05)",
                transition: "border-color .25s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#FC8A2D")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "rgba(252,138,45,0.4)")
              }
            >
              <i
                data-lucide="upload"
                style={{ width: 44, height: 44, color: "#FC8A2D", marginBottom: 8 }}
              />
              <p style={{ margin: 0, fontSize: 16, color: "#6B6B6B" }}>
                Click to upload a photo, video, or audio
              </p>
            </div>
          </Field>

          <button
            onClick={() => onSave(form)}
            style={{
              padding: "16px 24px",
              border: 0,
              borderRadius: 999,
              background: "#FC8A2D",
              color: "#fff",
              fontFamily: "var(--font-body)",
              fontSize: 18,
              fontWeight: 600,
              boxShadow: "0 10px 28px rgba(252,138,45,0.30)",
              cursor: "pointer",
              marginTop: 4,
            }}
          >
            Save memory
          </button>
        </div>
      </div>
      <style>{`
        @keyframes careFade { from {opacity:0;} to {opacity:1;} }
        @keyframes careSlideUp { from { opacity: 0; transform: translateY(40px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "13px 20px",
  borderRadius: 18,
  background: "#FFF9F0",
  border: "2px solid rgba(255,255,255,0.9)",
  fontFamily: "var(--font-body)",
  fontSize: 16,
  color: "#2D2D2D",
  outline: "none",
  boxSizing: "border-box",
};

const Field = ({ label, icon, children }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span
      style={{
        fontSize: 15,
        fontWeight: 500,
        color: "#2D2D2D",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {icon && <i data-lucide={icon} style={{ width: 16, height: 16 }} />}
      {label}
    </span>
    {children}
  </label>
);

const MemoryBase = () => {
  const [memories] = React.useState(memoryBaseSeed);
  const [search, setSearch] = React.useState("");
  const [showAdd, setShowAdd] = React.useState(false);

  const filtered = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  React.useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  });

  // 4-column manual masonry
  const cols = [[], [], [], []];
  filtered.forEach((m, i) => cols[i % 4].push(m));

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        paddingBottom: 64,
      }}
    >
      <CaregiverAmbient />
      <div style={{ position: "relative", zIndex: 1, padding: "120px 40px 0", maxWidth: 1280, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 32,
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 52,
                fontWeight: 400,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Memory Base
            </h1>
            <p style={{ fontSize: 18, color: "#6B6B6B", margin: "8px 0 0" }}>
              Manage and organize cherished memories
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 26px",
              borderRadius: 999,
              border: 0,
              background: "#FC8A2D",
              color: "#fff",
              fontFamily: "var(--font-body)",
              fontSize: 17,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 10px 26px rgba(252,138,45,0.28)",
              whiteSpace: "nowrap",
            }}
          >
            <i data-lucide="plus" style={{ width: 20, height: 20 }} />
            Add memory
          </button>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search memories, tags, or people…"
          style={{
            width: "100%",
            padding: "14px 26px",
            borderRadius: 999,
            border: "2px solid rgba(255,255,255,0.85)",
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(20px)",
            fontFamily: "var(--font-body)",
            fontSize: 16,
            color: "#2D2D2D",
            outline: "none",
            marginBottom: 32,
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {col.map((m) => (
                <MemoryBaseCard key={m.id} memory={m} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {showAdd && <AddMemoryModal onClose={() => setShowAdd(false)} onSave={() => setShowAdd(false)} />}
    </div>
  );
};

const MemoryBaseCard = ({ memory }) => (
  <div
    className="memodi-base-card"
    style={{
      position: "relative",
      borderRadius: 20,
      overflow: "hidden",
      background: "rgba(255,255,255,0.75)",
      backdropFilter: "blur(8px)",
      border: "2px solid rgba(255,255,255,0.9)",
      boxShadow: "0 8px 24px rgba(45,45,45,0.08)",
      transition: "transform .35s ease, box-shadow .35s ease",
      cursor: "pointer",
    }}
  >
    {memory.verified && (
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          width: 32,
          height: 32,
          borderRadius: 999,
          background: "#DC4F7C",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(220,79,124,0.32)",
        }}
      >
        <i data-lucide="check-circle" style={{ width: 18, height: 18, color: "#fff" }} />
      </div>
    )}
    <img
      src={memory.img}
      alt={memory.title}
      style={{ width: "100%", height: memory.h, objectFit: "cover", display: "block" }}
    />
    <div style={{ padding: 16 }}>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 20,
          fontWeight: 500,
          margin: "0 0 4px",
          color: "#2D2D2D",
        }}
      >
        {memory.title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "#6B6B6B",
          margin: "0 0 12px",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {memory.description}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {memory.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            style={{
              padding: "3px 10px",
              fontSize: 12,
              borderRadius: 999,
              background: "rgba(252,233,171,0.55)",
              color: "#6B6B6B",
              fontWeight: 500,
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#9C9C9C",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <i data-lucide="calendar" style={{ width: 12, height: 12 }} />
        {new Date(memory.date).toLocaleDateString()}
      </div>
    </div>
    <style>{`
      .memodi-base-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(45,45,45,0.14); }
    `}</style>
  </div>
);

window.MemoryBase = MemoryBase;
window.AddMemoryModal = AddMemoryModal;
