# wds-website-2026-27

Website for the Western Developers Society, built from the
[Figma design](https://www.figma.com/design/u2Enk8gf9yDD0ewDPxEcyU/WDS-Website-26-27?node-id=128-396).

Next.js (App Router) · JavaScript · CSS Modules. No Tailwind.

```bash
npm run dev
```

## How the design system works

Everything lives in [`src/styles/tokens.css`](src/styles/tokens.css).

The design is drawn on a **1920 × 6848** frame, so the codebase uses a single
fluid unit, `--u`, meaning _"one design pixel at 1920"_. Write every desktop
dimension as the number straight off Figma:

```css
font-size: calc(150 * var(--u)); /* Figma says 150px */
top: calc(2588 * var(--u)); /* Figma says y = 2588 */
```

At a 1920px viewport `--u` resolves to exactly `1px`, so the build is a pixel
match to the design; it scales proportionally at every other width and stops
growing at 2560px. Below 1024px, type switches to independent `clamp()` values
(same file) because pure proportional scaling would put body copy under 6px on
a phone.

Two things that are deliberate, not oversights:

- **`--radius: 0`** — every surface in the design is a hard rectangle.
- **No shadow tokens** — there is not one shadow in the design. Depth comes
  from overlap and flat colour.

Tracking is set once per family (`-0.02em` on Coolvetica, `-0.05em` on
Helvetica) and holds at every size in the design. Don't set it per-element.

## Layout

```
design/figma-1920.png     1:1 reference render — 1 image px = 1 design px
src/styles/tokens.css     colours, --u, type scale, spacing
src/app/                  layout.js (Nav + Footer), page.js (section order)
src/components/ui/        shared primitives — Button, Asterisk, Marquee, …
src/components/layout/    Nav, MenuOverlay, Footer
src/components/sections/  Hero, WhatWeDo, Events, Portfolios, Team
src/data/                 events.js, portfolios.js, team.js
```

## Current state

Foundation only. All six sections are placeholders rendered by
`components/ui/SectionStub` — delete that component once they are all built.

See [ASSETS.md](ASSETS.md) for what still needs exporting from Figma.
`public/fonts/coolvetica.woff2` is the one blocker for visual accuracy: without
it the display font silently falls back to Arial Black.
