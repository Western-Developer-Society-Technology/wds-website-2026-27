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

All six sections are built: hero, what we do, events, portfolios, the team,
footer. At a 1920px viewport the page comes out **6848px tall — exactly the
Figma frame height** — and every section's origin, type ink position and
component box has been measured against the design rather than eyeballed.

Not yet done: the responsive pass (breakpoint behaviour below 1025px is a
working first cut, not a designed one), animations, and the menu overlay.

See [ASSETS.md](ASSETS.md) for what is still outstanding — the short version is
that several assets are 1:1 crops out of `design/figma-1920.png` rather than
exported originals, the team data is Figma's placeholder, and the Coolvetica
commercial licence is unresolved.

## Verifying a change

Run the dev server and compare at exactly 1920px, where `--u` resolves to 1px
and the build should be a pixel match. Measuring in the console beats eyeballing
a screenshot — this pattern converts any element to design pixels:

```js
const u = 0.0520833 * document.body.clientWidth / 100;
const r = document.querySelector("#events article").getBoundingClientRect();
[r.x / u, (r.y + scrollY) / u, r.width / u, r.height / u];
```

For type, measure the *ink* rather than the box: a zero-height inline-block
gives you the baseline, and `canvas.measureText().actualBoundingBoxAscent`
gives the distance from baseline to ink top. Several font sizes in the design
were recovered this way — `view all` turned out to be 32.6px where `learn more`
is 37px, which no amount of looking would have shown.
