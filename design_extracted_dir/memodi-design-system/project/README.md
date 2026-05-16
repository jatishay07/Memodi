# Memodi Design System

> *Helping memories stay close.*

Memodi is an AI-powered memory companion for people living with Alzheimer's, dementia, and other memory-loss conditions — and the caregivers who love them. The product is built around a comforting, voice-led AI orb that listens, recalls, and reassures, plus a shared "Memory Lane" where caregivers seed cherished photographs, stories, and voice notes that the patient can revisit at any time.

This design system captures the visual and emotional vocabulary of Memodi so future surfaces — slides, marketing pages, second-screen apps, print collateral — feel like they belong to the same gentle, premium sanctuary.

---

## 1. The product at a glance

Memodi has two intertwined surfaces:

| Surface | Audience | Feeling | Anchor screens |
|---|---|---|---|
| **Patient app** | The person living with memory loss | Sanctuary, calm, presence | Dashboard (AI orb), Memory Lane |
| **Caregiver app** | Family / professional carers | Warm but structured control | Memory Base, Alerts, Add Memory |

A neutral **Landing** screen lets a returning user pick which experience to enter. Both surfaces share the same palette and motion language; the patient surface is more spacious, the caregiver surface denser.

It should NOT feel like hospital software, enterprise SaaS, a cold AI tool, or a productivity dashboard. It SHOULD feel like a peaceful digital sanctuary — a memory scrapbook meeting a modern, compassionate AI companion.

---

## 2. Sources used to build this system

This design system was synthesised from the following inputs the user provided. Future readers without the same access can still rely on what's captured in this folder — but if you do have access, go to the originals first.

- **Local codebase** — `Create app from description/` (attached via Import → Local folder). React + TypeScript + Tailwind v4 + Framer Motion + Radix + Lucide. Read in particular:
  - `src/styles/theme.css` (raw tokens),
  - `src/styles/fonts.css` (Crimson Pro + Nunito imports),
  - `src/app/components/AIOrb.tsx`, `Landing.tsx`, `PatientDashboard.tsx`, `MemoryLane.tsx`, `MemoryBase.tsx`, `Alerts.tsx`, `PatientNav.tsx`, `CaregiverNav.tsx`.
- **GitHub** — [github.com/jatishay07/Memodi](https://github.com/jatishay07/Memodi) (main). At time of writing this contains only a README stub; the working source is the local codebase above. If the upstream repo gains files later, mirror its tokens here.
- **Brand brief** — the product description provided in chat (warm palette, "compassionate companion", orb states, etc.). This is the canonical source for tone of voice.

> **Recommendation to future designers:** before you build something new for Memodi, glance at the upstream repo and the local codebase. Tokens may have evolved; component patterns may have settled differently. The README in *this* folder reflects the system at first synthesis.

---

## 3. Quick index — what's in this folder

```
.
├── README.md                  ← you are here
├── SKILL.md                   ← portable agent-skill manifest
├── colors_and_type.css        ← single source of truth for tokens
├── fonts/                     ← Google-Fonts substitutes (see §10)
├── assets/                    ← logos, wordmark, illustrative placeholders
├── preview/                   ← Design-System-tab preview cards
└── ui_kits/
    ├── patient/               ← Patient flow (Landing, Dashboard, Memory Lane)
    └── caregiver/             ← Caregiver flow (Memory Base, Alerts, Add Memory)
```

Open `preview/<card>.html` to see individual specimens; open `ui_kits/<surface>/index.html` to interact with the recreated product surfaces.

---

## 4. Content fundamentals — voice, tone & copy

Memodi's copy is the *first* layer of comfort. The patient may be confused, anxious, or grieving the slow loss of their own memories; the caregiver is often exhausted. Every word has to earn its place.

### Voice
- **Companion, never clinician.** Memodi speaks as a warm friend who happens to remember things. It never references diagnosis, decline, "patients," or medical conditions in patient-facing copy.
- **First-person plural is rare; second person is intimate.** Address the user as *you*. The AI refers to itself as *I*, never *we* or *Memodi*.
- **Possessive about love, not data.** "Your cherished moments," "someone's sense of self" — never "your data," "your account," "your records."

### Tone
- **Calm, present-tense, reassuring.** Short sentences. Verbs in present or past, almost never future. No exclamation marks in patient-facing copy.
- **Sentence case everywhere.** Including buttons, navigation, and titles. ALL CAPS appears only on severity badges (`MILD` / `MEDIUM` / `SEVERE`) where legibility-at-a-glance matters.
- **No abbreviations** in the patient flow (write "Memory Lane," not "Mem. Lane"; "Voice note available," not "VN").
- **No technical jargon.** "I'm thinking…" instead of "Processing query." "Tell me more" instead of "Continue."

### Specific copy examples lifted from the codebase
- Wordmark tagline: *"Helping memories stay close."*
- Footer / mission line: *"A gentle AI preserving someone's sense of self and memories."*
- Patient-surface CTAs: *"Tap to speak with me"*, *"Listening…"*, *"Play voice note"*
- Patient-surface assistant lines (illustrative):
  - *"Hello! I'm here with you. How are you feeling today?"*
  - *"I remember you love looking at photos from your garden. Would you like to see them?"*
  - *"Your glasses were last placed on the kitchen table, near the fruit bowl."*
  - *"That's a wonderful memory. Tell me more about it."*
- Caregiver-surface labels: *"Manage and organize cherished memories"*, *"Tell the story of this memory…"*, *"Where was this?"*, *"Save Memory"*
- Alert messages: *"Elevated stress detected"*, *"Confusion spike detected"*, *"Emergency assistance requested"* — diagnostic phrasing is **allowed only in the caregiver surface**.

### I vs you, never we
Patient: *"I'm here with you."* (the AI is *I*; the patient is *you*). The brand never speaks as "we" in the product itself — that voice is reserved for marketing.

### Emoji policy
**Never use emoji.** Memodi uses real photographs and tactile illustrations to convey emotion. Emoji are too playful and read as immature beside the gravity of the use case. Iconography is exclusively Lucide line icons (see §11).

### Numbers, dates, times
- Dates in patient flow: written out — *"June 2018"*, *"Yesterday, 8:30 PM"*.
- Dates in caregiver flow: locale-formatted — `new Date(...).toLocaleDateString()`.
- Counts use bare numerals (*"4 active alerts"*).
- Percentages get a `%` sign with no space (*"78%"*).

### Microcopy guardrails
- Never write "AI" in patient copy. Memodi refers to itself by name or by *I*.
- Never write "error" or "failed" in patient copy. Use *"Let me try that again."*
- Never use a question mark in a button label.
- The word "remember" is sacred — reserve it for moments where Memodi is actively surfacing a memory. Don't dilute it on generic CTAs.

---

## 5. Visual foundations

### Colors
The Memodi palette is a five-color *warm nostalgic* set, anchored on creamy off-whites. **Never introduce a cool grey, true black, or unbranded blue.** When you need depth, reach for olive or tomato instead of grey.

| Token | Hex | Use |
|---|---|---|
| `--color-blush-rose` | `#DC4F7C` | Primary, speaking orb, link, focus ring |
| `--color-princeton-orange` | `#FC8A2D` | Secondary, listening orb, "Add" actions |
| `--color-olive` | `#9E9820` | Tertiary, thinking orb, mild alert |
| `--color-tomato-jam` | `#C42B34` | Destructive, distress orb, severe alert |
| `--color-vanilla-custard` | `#FCE9AB` | Accent, chips, soft highlights |
| `--color-cream` | `#FFF9F0` | Card / sidebar fill |
| `--color-warm-white` | `#FFFBF7` | App background |
| `--color-ink` | `#2D2D2D` | Text — never `#000` |
| `--color-ink-soft` | `#6B6B6B` | Secondary text |

Gradients are the brand's signature. Use them — but only the four canonical ones:

- **Sunset** `#FC8A2D → #DC4F7C` — primary CTAs and the wordmark.
- **Dawn** `#DC4F7C → #FC8A2D → #DC4F7C` — speaking orb, hero glows.
- **Meadow** `#FC8A2D → #9E9820` — caregiver primary, "save memory" actions.
- **Warmth** `#DC4F7C → #FC8A2D → #FCE9AB` — large background glows, idle orb.

### Typography
- **Headings — Crimson Pro** (serif, soft, slightly old-book). Weights 300–700; default 400 for display heads, 500 for in-card titles. Letter-spacing slightly tightened (`-0.01em`).
- **Body — Nunito** (rounded geometric sans). Weights 400 for body, 500 for emphasis/labels, 600 for buttons.
- **Base size is 18px** — much larger than typical web. Patient surfaces step up further via the Aa / Aa+ / Aa++ accessibility cycler (`--a11y-text-scale: 1 | 1.20 | 1.40`).
- **Line-height is generous** — body at 1.65, paragraphs at 1.50. Tighten only on display heads (1.15).
- **Never use a third typeface.** No monospace appears in product surfaces (this is not a developer tool).

### Spacing
A calm 4-px-based scale (`--space-1` through `--space-24`). Patient surfaces breathe at `--space-12` to `--space-16` between major blocks; caregiver surfaces tighten to `--space-6`–`--space-8`. **Never set zero padding on a card** — the brand depends on internal air.

### Backgrounds
- **Full app surface:** a fixed, very gentle gradient from `#FFF9F0` (top-left) → `#FFFBF7` (mid) → `rgba(252,233,171,0.30)` (bottom-right). Always `background-attachment: fixed`.
- **Ambient blobs:** every primary screen has 1–2 huge (≈400px) radial-gradient circles set to `opacity: 0.20`, `filter: blur(100px)`, drifting slowly (20–25s) via translate animation. They never sit still and never form recognisable shapes.
- **Floating particles:** 8–12 tiny (1–2px) coloured dots, randomly placed, gently floating up over 4–7s with opacity 0.2 → 0.6. Avoid stars, sparkles, hearts — keep them as anonymous specks of warmth.
- **No textures, no photo overlays, no patterns.** The cream + gradient + blur stack is the texture.

### Hover / press states
- **Hover** scales the element up to 1.04–1.05 (buttons) or 1.08–1.10 (orb / large cards), and *lifts* it with a 4–8px upward translate. Background tone may deepen by ~10% opacity. Never use the standard 0.5/0.8 opacity dim — keep colour saturated.
- **Press** scales down to 0.95–0.96. No colour change.
- **Focus ring** is a 2px halo of the primary (`--ring`); on patient surfaces, expand to 4px for accessibility. Never use the browser default outline.

### Borders
- **2-px solid white at 60–90% opacity** is the canonical glass-card border. Reach for `--border-glass` (`rgba(255,255,255,0.80)`).
- Inside dense caregiver lists, drop to a 1-px `--border` (`rgba(0,0,0,0.08)`).
- **No grey 1-px hairlines.** No coloured left-border accent strips. No dashed borders except on the *Upload* dropzone (where the dashed orange `#FC8A2D / 30%` border at 2px is canonical).

### Shadows & elevation
Shadows are warm-tinted and soft. The ramp is:

- `--shadow-xs` → `--shadow-sm`: dense lists, chips.
- `--shadow-md` → `--shadow-lg`: standard cards.
- `--shadow-xl`: floating modals.
- **Glow shadows** (`--shadow-glow-rose`, `--shadow-glow-orange`, etc.) are coloured halos — they're used on the orb, the mic button, and the gradient pill CTAs. Never on neutral surfaces.

There is no inner shadow except the subtle `inset 0 1px 0 rgba(255,255,255,0.6)` that lives inside the glass-card recipe.

### Corner radii
Memodi rounds *everything*.

- `--radius-md` (20px) — inputs, chips, small cards.
- `--radius-lg` (24px) — list cards, alert cards.
- `--radius-xl` (32px) — modals, large content panels.
- `--radius-pill` (999px) — every button, pill nav, badge.

No square corners. No 4-px or 8-px-radius cards. **The smallest radius in the system is 8px**, used only on tiny chips.

### Transparency & blur (glassmorphism)
Glass surfaces are core to the brand. Two recipes:

- **Standard glass:** `bg: rgba(255,255,255,0.60)`, `backdrop-filter: blur(20px)`, `border: 2px solid rgba(255,255,255,0.80)`.
- **Strong glass** (modals): `bg: rgba(255,255,255,0.95)` over a `bg-black/50 backdrop-blur-sm` scrim.

Apply blur sparingly elsewhere — never on text-only blocks, only on translucent surfaces. On performance-constrained devices, fall back to a solid `--surface` (cream).

### Motion
- **Slow, breathing, organic.** Default duration is 500ms; ambient cycles are 4–25s. Use `cubic-bezier(0.45, 0.05, 0.55, 0.95)` for breathing.
- **Never** use a snappy spring, bounce-back overshoot, or sub-200ms transition in patient flows. Caregiver flows may use a gentle bounce (`--ease-bounce`) for entry animations.
- The orb has **five animation states** (idle, listening, thinking, speaking, distress) — see the AIOrb specimen in `preview/`.
- All ambient motion is wrapped by `prefers-reduced-motion: reduce` and falls back gracefully.

### Layout rules
- **Patient screens are vertically centered** with a max width of ~6xl (≈72rem). They never feel "filled to the edges."
- **Caregiver screens have a max width of 5xl–7xl** with a fixed top nav bar (`backdrop-blur-xl` glass) and content starting at `pt-32`.
- **One primary action per screen.** Secondary actions live in glass pills or as ghost buttons.
- **No two-column splits below 1024px** — the design degrades to single-column.

### Imagery vibe
- Photographs are **warm-toned, soft, slightly desaturated** — late-afternoon light, gardens, family kitchens, hands, shorelines. Never harsh studio light, corporate handshakes, or stock-photo "diverse team smiling at laptop."
- Memory cards in Memory Lane mimic **polaroids** — slightly off-axis tilt on hover, white card frame, generous bottom margin where the caption sits.
- Modals lift the image full-bleed at the top of a tall rounded card.

---

## 6. Iconography

Memodi uses **Lucide line icons** exclusively, at a 2-px stroke weight, rounded line caps. Lucide is loaded via the `lucide-react` package in the source codebase, but for static HTML in this design system we use Lucide's CDN sprite (linked from `assets/icons/lucide.md`).

Standard recipe in JSX:
```tsx
import { Mic, Heart, Calendar, MapPin, Play, Bell, Database, Home, Images, X, Upload, Tag, Users, CheckCircle, AlertCircle, AlertTriangle, Brain, Pill, Clock, Volume2, Type, Plus } from 'lucide-react';
<Mic className="w-5 h-5 text-[#DC4F7C]" />
```

In static HTML, use the inline SVG copies in `assets/icons/`.

### Specific usage
- **`Heart`** — patient-flow brand mark (Landing card, footer).
- **`Users`** — caregiver-flow brand mark.
- **`Mic`** — the giant microphone CTA on the Patient Dashboard (always white-on-gradient).
- **`Volume2`** — speech transcript indicator.
- **`Type`** — the Aa accessibility cycler.
- **`Home` / `Images`** — patient nav.
- **`Database` / `Bell`** — caregiver nav.
- **`Calendar` / `MapPin` / `Tag` / `Users` / `Upload`** — memory metadata.
- **`Play`** — voice-note CTA.
- **`AlertCircle` / `Pill` / `Brain` / `AlertTriangle`** — alert types in caregiver (distress / medication / confusion / emergency).
- **`CheckCircle`** — memory "verified" state.
- **`Plus`** — primary "Add Memory" FAB-style pill.
- **`X`** — modal close.

### Icon size & color rules
- Default size in glass cards: `w-5 h-5` (20px). In hero CTAs: `w-6 h-6` to `w-10 h-10`. Above `w-12 h-12` icons must be inside a coloured circular badge.
- **Icon color follows context**, not state — text-coloured by default, primary-coloured when paired with a primary CTA, white when inside a gradient pill.
- **No icon ever stands alone as a button below 44×44 px.** Either pair with text or expand the hit target.

### Things we explicitly do not use
- ❌ Emoji as iconography.
- ❌ Filled / duotone icons (only Lucide-style line work).
- ❌ Custom hand-drawn SVG illustrations of people, brains, or hospital imagery.
- ❌ Unicode dingbats like ★, ✓, ✕, →.

The single exception is the **animated `w-2 h-2 rounded-full bg-[#C42B34] animate-pulse`** badge dot in the caregiver nav, indicating unread alerts — not an icon, a pure shape.

---

## 7. Components — see the UI kits

- `ui_kits/patient/` — Landing card pair, AI orb, Patient Dashboard, Memory Lane masonry, memory detail modal, Aa cycler, patient pill-nav.
- `ui_kits/caregiver/` — Caregiver top-nav, Memory Base masonry + chips, Add Memory modal with dashed dropzone, Alerts list with severity ramp, summary stat tiles.

Each kit has an `index.html` you can open to see the recreated surface, plus modular `.jsx` components you can copy into a new design.

---

## 8. Tokens (single-file reference)
All tokens live in [`colors_and_type.css`](./colors_and_type.css). Import it at the top of any HTML artifact:

```html
<link rel="stylesheet" href="colors_and_type.css">
```

Then reference variables directly: `color: var(--primary)`, `border-radius: var(--radius-lg)`.

---

## 9. Accessibility

This system is built for the most cognitively vulnerable user we work with. Non-negotiable rules:

1. **Minimum body size: 18px.** Never go below 14px even for metadata.
2. **Hit targets: 44×44 px minimum**, 64×64 px on the patient Dashboard.
3. **Contrast: WCAG AA against `--background`.** All ink colours are pre-checked. Never place primary brand colours on each other (e.g. blush rose text on tomato jam ❌).
4. **Respect `prefers-reduced-motion`** — the breathing orb falls back to a static gradient, ambient blobs freeze.
5. **Patient text controls (`Aa` / `Aa+` / `Aa++`) must always be reachable** via the `--a11y-text-scale` variable, never hidden behind a settings menu.
6. **Audio cues never replace visual cues.** A speaking orb always pairs with a written transcript.

---

## 10. Font substitution notice

**Both fonts are loaded from Google Fonts at runtime** — Crimson Pro and Nunito. There are no `.ttf` / `.woff2` files committed to this folder because the source codebase imports them via the Google Fonts CDN. If you need fully-offline assets, download the official families:

- Crimson Pro — https://fonts.google.com/specimen/Crimson+Pro
- Nunito — https://fonts.google.com/specimen/Nunito

…and drop them into `fonts/`, then add a local `@font-face` block at the top of `colors_and_type.css`. **No substitution has been silently made** — the originals are the originals.

> ⚠️ **Caveat to flag to the user:** if Crimson Pro feels too "literary" for Memodi marketing material, candidates closer to a "soft humanist serif" worth A/B-testing are *Fraunces* (Soft optical axis), *Cormorant Garamond*, or *Lora*. None has been swapped in; Crimson Pro from the codebase is canonical until told otherwise.

---

## 11. Versioning & ownership

This design system reflects the Memodi product as of the initial codebase synthesis (May 2026). When the upstream GitHub repo gains real content, re-sync `colors_and_type.css` and the UI kits against it.

For questions about voice, copy, or the orb's emotional states — those live in the brand brief, not in code. Treat that brief as the canonical reference for *what Memodi feels like*; this folder is the canonical reference for *how it looks*.
