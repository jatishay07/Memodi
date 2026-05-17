# Design System

Memodi uses a dark, calming interface optimized for older adults and low cognitive load. Tokens are defined in `web/tailwind.config.js` and `web/app/globals.css`.

## Color palette

| Token | Hex | Usage |
|-------|-----|--------|
| `navy` | `#0A0E1A` | Page background |
| `navy-card` | `#111827` | Cards, modals |
| `navy-border` | `#1F2937` | Borders, inputs |
| `amber` | `#F5A623` | Primary accent, active nav, CTA |
| `amber-bright` | `#F7C948` | Listening orb |
| `cream` | `#F5EDD4` | Clock, secondary emphasis |
| `pink` | `#F4A0A0` | Distress state, distress metrics |
| `gold` | `#FFD580` | Morning orb state |

Supporting grays: `text-gray-300` body secondary, `text-gray-500` hints, `#374151` inputs.

## Typography

- **Font:** Inter, system-ui, sans-serif (`font-sans`)
- **Patient greeting:** `text-3xl font-light tracking-wide` white
- **Section titles:** `text-2xl font-semibold` white
- **Clock:** date `text-sm cream`; time `text-4xl font-extralight tracking-widest cream`
- **Hints:** `text-sm tracking-wide` gray or pink when distressed

## Layout

| Breakpoint | Navigation |
|------------|------------|
| Mobile (`< md`) | Fixed bottom tab bar, `pb-20` on main |
| Desktop (`≥ md`) | Fixed left sidebar `w-56`, `pl-56` on main |

Main content max width on caregiver/family screens: `max-w-2xl mx-auto`.

## The orb

Central UI on `/patient`. Component: `web/components/Orb.jsx`.

### States (`data-state` on `.orb-core`)

| State | Color | Animation | Meaning |
|-------|-------|-----------|---------|
| `idle` | Amber | Slow breathe 3s | Ready to listen |
| `listening` | Amber-bright | Pulse 0.6s | Recording |
| `speaking` | Amber | Quick pulse 0.35s | Playing response |
| `distress` | Pink | Soft pulse 1s | Distress detected |
| `morning` | Gold | Slow breathe 4s | Morning routine (optional) |

CSS variables `--orb-color` and `--orb-glow` drive core fill and radial glow. Default size: 200px; container ~1.8× for glow bleed.

### Interaction

- Single tap target (orb + glow area)
- `select-none` on patient page to avoid text selection while tapping
- Cursor pointer on core

## Components

| Component | Role |
|-----------|------|
| `Orb.jsx` | WebGL companion (`ogl`) |
| `EmotionMonitor.jsx` | Webcam + emotion bars |
| `PatientWelcome.jsx` | First-visit welcome |
| `TutorialBubble.jsx` | Onboarding on `/patient` |
| `ComfortTray.jsx` | Text scale, motion, contrast |
| `AtmosphericDepth.jsx` | Patient page depth layers |
| `MemodiMesh.jsx` | Landing background |
| `Logo.jsx` | Auth branding |
| `MemoryCard.jsx` | Memory Bank rows |
| `PatientNav` / `CaregiverNav` | Role navigation |

### TabNav

- Brand: “Memodi” in amber on desktop sidebar
- Active tab: `bg-[#1C1408] text-amber`
- Inactive: gray with hover

### MemoryCard

- Person: avatar or initial circle, relationship in amber, “In memory” badge if deceased
- Object: pin emoji + item + location
- Medication / event: icon + title + metadata

### AlertCard

- Severity borders: red / orange / yellow by trigger level
- Patient quote in nested navy box
- Resolve button: blue (`bg-blue-700`) full width

### Modals (Memory Bank)

- Mobile: bottom sheet `rounded-t-2xl`
- Desktop: centered `max-w-lg`
- Inputs: `#1F2937` background, rounded-xl

## Motion

| Class | Effect |
|-------|--------|
| `.response-fade-in` | 0.4s fade + 6px translate up for Memodi text |
| Orb keyframes | `orb-breathe`, `orb-listen`, `orb-speak`, `orb-distress`, `orb-morning` |

Prefer reduced motion respect in future (`prefers-reduced-motion` not yet implemented).

## Accessibility (dementia-friendly UX)

Guidelines for implementation and content:

1. **Large touch targets** — Orb 200px; buttons min ~44px vertical padding
2. **Simple copy** — One action per hint line; avoid jargon
3. **High contrast** — White/cream on navy; amber for focus states
4. **Predictable flow** — Tap to start, tap to send; same pattern every time
5. **Error recovery** — Plain language; no error codes shown to patient
6. **Audio first** — Text response is supplementary; always play Piper audio on success
7. **Distress visibility** — Pink state + caregiver alert; do not rely on color alone (hint text changes too)

## Category chips (Memory Bank)

Active: `border-amber text-amber bg-[#1C1408]`  
Inactive: `border-[#1F2937] text-gray-400`

## Scrollbars

Thin 4px thumb `#374151` on navy track (webkit).

## Related docs

- [user-journeys.md](user-journeys.md)
- [../for-agents/rebuild-from-scratch.md](../for-agents/rebuild-from-scratch.md) (full CSS reference)
