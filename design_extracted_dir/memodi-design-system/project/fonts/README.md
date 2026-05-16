# Fonts

Both Memodi typefaces are loaded from **Google Fonts** at runtime — the source codebase imports them via CDN, no `.woff2` / `.ttf` files are bundled. This folder is intentionally empty.

## Canonical families

| Role | Family | Weights | Google Fonts |
|---|---|---|---|
| Heading (soft serif) | **Crimson Pro** | 300 / 400 / 500 / 600 / 700 | https://fonts.google.com/specimen/Crimson+Pro |
| Body (rounded sans) | **Nunito** | 300 / 400 / 500 / 600 / 700 / 800 | https://fonts.google.com/specimen/Nunito |

Both are loaded by the `@import` at the top of `colors_and_type.css`.

## If you need fully-offline assets

1. Download the families from the links above.
2. Drop the `.ttf` / `.woff2` files into this folder, e.g. `fonts/CrimsonPro-Regular.ttf`.
3. Replace the `@import` in `colors_and_type.css` with local `@font-face` blocks:

```css
@font-face {
  font-family: 'Crimson Pro';
  src: url('fonts/CrimsonPro-Variable.woff2') format('woff2-variations');
  font-weight: 200 900;
  font-display: swap;
}
@font-face {
  font-family: 'Nunito';
  src: url('fonts/Nunito-Variable.woff2') format('woff2-variations');
  font-weight: 200 1000;
  font-display: swap;
}
```

## No substitutions have been made

This is the typography the upstream Memodi codebase actually uses. Crimson Pro and Nunito are the originals; we have not silently swapped in alternatives.

If you want to *explore* alternatives — A/B candidates noted in the README — try **Fraunces (Soft optical axis)**, **Cormorant Garamond**, or **Lora** for the serif; **Quicksand** or **Manrope** for the sans. Flag the change in your design notes before adopting.
