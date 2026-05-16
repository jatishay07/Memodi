# Caregiver UI kit

The caregiver-facing surfaces of Memodi. Built as a single-page React prototype with click-thru navigation — `Memory Base ↔ Alerts`, plus the `Add memory` modal.

Open [`index.html`](./index.html) directly in a browser.

## Files

| File | Purpose |
|---|---|
| `index.html` | Mount point + screen router (Memory Base / Alerts). |
| `CaregiverAmbient.jsx` | `<CaregiverAmbient />` — two subdued drifting blobs (no particles). |
| `CaregiverNav.jsx` | Fixed glass top bar — brand + tabs + sign-out. |
| `MemoryBase.jsx` | 4-column masonry library, search, "Add memory" pill, `<AddMemoryModal />`. |
| `Alerts.jsx` | Severity-ramped alert list, 3 summary stat tiles, weekly summary card. |

## Severity ramp

The whole alert system escalates **warmth** rather than contrast:

| Severity | Color | Tone |
|---|---|---|
| `mild` | `#9E9820` Olive | Routine acknowledgement |
| `medium` | `#FC8A2D` Princeton orange | Attention-worthy, not urgent |
| `severe` | `#C42B34` Tomato jam | Active urgency — animated sweep |

Severe alerts get an extra ambient sweep animation across the card; everything else stays still.

## Add Memory modal

The modal demonstrates the full caregiver form vocabulary:

- Title (text input)
- Description (textarea)
- Date (date picker) + Location (text) — paired row
- Tags (comma-separated)
- People (comma-separated)
- Upload media (dashed orange dropzone)
- Save memory (gradient meadow CTA)

Every field uses the cream input with white border + orange focus ring.

## Differences from the source codebase

- React Router → `useState` screen switching.
- Framer Motion → CSS keyframes from `colors_and_type.css`.
- Masonry → manual 4-column split.
- The verified badge uses the brand gradient instead of green — green is not part of the Memodi palette, and the source codebase's green badge was the one inconsistency we corrected.

If green-as-success status is canonical, restore it by swapping `linear-gradient(135deg, #DC4F7C, #FC8A2D)` for `#10B981` in `MemoryBaseCard`. Flag this change with the brand owner.
