# Patient UI kit

The patient-facing surfaces of Memodi. Built as a single-page React prototype with click-thru navigation — `Landing → Dashboard / Memory Lane`.

Open [`index.html`](./index.html) directly in a browser (no build step required — React + Babel are loaded from a CDN).

## Files

| File | Purpose |
|---|---|
| `index.html` | Mount point + screen router (Landing / Dashboard / Memory Lane). |
| `Ambient.jsx` | `<PatientAmbient />` — drifting blobs and floating particles. |
| `AIOrb.jsx` | `<AIOrb state size />` — the five-state breathing orb. |
| `PatientNav.jsx` | Floating pill nav (Dashboard / Memory Lane). |
| `Landing.jsx` | Wordmark + two big choice cards (Patient / Caregiver). |
| `PatientDashboard.jsx` | Centerpiece orb + mic CTA + assistant response panel + Aa cycler. |
| `MemoryLane.jsx` | Polaroid masonry grid + cinematic memory detail modal. |

## How to use a component in a new design

```html
<link rel="stylesheet" href="../../colors_and_type.css">
<!-- React 18.3.1 + Babel + Lucide UMD (see index.html for exact CDN tags) -->
<script type="text/babel" src="../../ui_kits/patient/AIOrb.jsx"></script>
<script type="text/babel">
  const App = () => <AIOrb state="speaking" size={320} />;
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
</script>
```

## Notable patterns

- **Orb states** flow `idle → listening → thinking → speaking → idle` automatically when the mic button is tapped. Set `state="distress"` to demo the severe-alert pulsing red.
- **Aa cycler** — the floating gradient button toggles between `1.0×`, `1.2×`, `1.4×` text scale.
- **Memory modal** — clicking any polaroid opens a full-bleed cinematic modal with optional `Play voice note` CTA.

## Differences from the source codebase

- React Router is replaced with `useState` screen switching (no real routing inside a static prototype).
- Framer Motion is replaced with CSS keyframes from `colors_and_type.css`.
- Masonry uses a manual 3-column split instead of `react-responsive-masonry`.

These are cosmetic simplifications — the *visual* output matches the codebase one-for-one. If you want functional fidelity, port your component back to the original stack.
