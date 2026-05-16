# Iconography — Lucide

Memodi uses **[Lucide](https://lucide.dev)** line icons exclusively. The source codebase imports them from `lucide-react`. For static HTML artifacts in this design system, link the Lucide CDN once at the top of your file:

```html
<!-- Lucide via UMD — call lucide.createIcons() after DOM ready -->
<script src="https://unpkg.com/lucide@0.487.0/dist/umd/lucide.min.js"></script>
<script>document.addEventListener('DOMContentLoaded', () => lucide.createIcons());</script>
```

Then drop icons with the `data-lucide` attribute:

```html
<i data-lucide="mic" style="width:24px;height:24px;color:var(--primary)"></i>
<i data-lucide="heart"></i>
<i data-lucide="calendar"></i>
```

## Icon roster — every icon Memodi uses

| Icon name | data-lucide | Where it appears |
|---|---|---|
| Heart | `heart` | Patient brand mark, Landing card |
| Users | `users` | Caregiver brand mark, "People" memory field |
| Microphone | `mic` | Patient Dashboard primary CTA |
| Speaker | `volume-2` | Assistant transcript label |
| Type / Aa | `type` | Accessibility text-size cycler |
| Home | `home` | Patient nav — Dashboard |
| Images | `images` | Patient nav — Memory Lane |
| Database | `database` | Caregiver nav — Memory Base |
| Bell | `bell` | Caregiver nav — Alerts |
| Calendar | `calendar` | Memory metadata — date |
| Map pin | `map-pin` | Memory metadata — location |
| Tag | `tag` | Memory tags input |
| Upload | `upload` | Add-Memory media dropzone |
| Play | `play` | Voice-note button |
| Check circle | `check-circle` | "Verified" memory badge |
| Plus | `plus` | "Add Memory" primary action |
| Close | `x` | Modal close |
| Alert circle | `alert-circle` | Distress alert |
| Pill | `pill` | Medication alert |
| Brain | `brain` | Confusion alert |
| Alert triangle | `alert-triangle` | Emergency alert |
| Clock | `clock` | Alert timestamps, weekly summary |

## Style rules
- Stroke width: 2 (Lucide default).
- Line caps & joins: round (Lucide default).
- Color: inherits from `currentColor`. Use `color: var(--primary)` etc.
- Min size: 16px. Default 20px in lists, 24px in CTAs, 32–40px in hero badges.
- Never fill an icon. Never recolour mid-glyph. Never stack two icons.

## Things we DO NOT use
- ❌ Emoji as icons
- ❌ Heroicons, Material, Feather, FontAwesome
- ❌ Custom hand-drawn SVG (except the Memodi wordmark/mark itself)
- ❌ Unicode dingbats (★ ✓ ✕ →)
