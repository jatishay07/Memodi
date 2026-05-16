---
name: memodi-design
description: Use this skill to generate well-branded interfaces and assets for Memodi — the AI memory companion for people with Alzheimer's, dementia, and memory-loss conditions — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# Memodi design skill

Memodi is an AI-powered memory companion. The visual identity is a **peaceful digital sanctuary** — warm nostalgic palette, soft serif headers, rounded sans body, glassmorphism, ambient breathing motion. It should never feel clinical, enterprise, or like a productivity tool.

Read [`README.md`](./README.md) first — it contains the full system: voice & tone, color, type, motion, components, and accessibility rules. Then explore the other files in this folder:

- [`colors_and_type.css`](./colors_and_type.css) — single source of truth for tokens (CSS custom properties). Always import it at the top of new HTML artifacts.
- [`assets/`](./assets/) — wordmark, orb mark, icon roster (Lucide).
- [`fonts/`](./fonts/) — font policy. Memodi uses **Crimson Pro** (serif) + **Nunito** (rounded sans), loaded from Google Fonts.
- [`preview/`](./preview/) — pre-rendered specimen cards for every token + component (palette, gradients, severity ramp, typography scale, glass anatomy, buttons, alerts, memory polaroids, the AI orb in five states, etc.). Open these to see how each token looks in context.
- [`ui_kits/patient/`](./ui_kits/patient/) — modular React components for the patient flow (Landing, AIOrb, Dashboard, Memory Lane). Each `.jsx` is self-contained and copy-pastable into a new prototype.
- [`ui_kits/caregiver/`](./ui_kits/caregiver/) — modular React components for the caregiver flow (top nav, Memory Base, Add memory modal, Alerts with severity ramp, stat tiles).

## How to use this skill

**If the user invokes the skill with a specific brief** ("design a Memodi onboarding screen", "make a Memodi alert toast"):
1. Skim [`README.md`](./README.md) for voice and visual rules.
2. Open the relevant preview cards in [`preview/`](./preview/) to anchor your token usage.
3. Open the relevant UI kit components — copy them, don't reinvent. The patient surface is **spacious + glassmorphic + animated**; the caregiver surface is **denser + still warm + structured**.
4. For visual artifacts (slides, mocks, throwaway prototypes), copy assets out of `assets/` and create static HTML files for the user to view. Use `colors_and_type.css` for every token.
5. For production code (a real React app), copy the component patterns; don't ship the prototype files verbatim — they cut corners on routing and animation libraries the real codebase uses (`react-router`, `motion/react`).

**If the user invokes the skill without guidance:**
- Ask what they want to build. Probe: is this for the patient surface, the caregiver surface, or marketing? Is this a single screen, a flow, or a slide deck? Do they want fidelity to the existing product or a creative spin?
- Then act as an expert Memodi designer.

## Non-negotiables

- **Never use emoji** for iconography. Lucide line icons only, 2-px stroke.
- **Never use cool greys, pure black (`#000`), or unbranded blues.** Ink is `#2D2D2D`.
- **Body text minimum 18 px in patient flows, 16 px in caregiver flows.** Hit targets ≥ 44 px.
- **Wrap ambient animations in `prefers-reduced-motion: reduce`.**
- **Headings use Crimson Pro; body uses Nunito.** No third typeface.
- **Glassmorphism is core** — `rgba(255,255,255,0.6)` + `backdrop-filter: blur(20px)` + 2-px white border at 80% opacity. Memorize this recipe.
- **Severity ramps in warmth, not contrast** — olive → orange → tomato. Never red-on-grey enterprise alerts.

## Imagery direction

Use real, warm-toned photography (gardens, kitchens, hands, golden hour). Never AI-generated, never corporate stock, never illustrated brain/medical iconography. When a real photo isn't available, use a warm gradient placeholder from the canonical four (`sunset`, `dawn`, `meadow`, `warmth`).
