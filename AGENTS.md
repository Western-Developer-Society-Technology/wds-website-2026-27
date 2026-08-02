<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# WDS website conventions

Next.js App Router · **JavaScript** · **CSS Modules**. No Tailwind, no TypeScript,
no CSS-in-JS. One `.module.css` co-located with each component.

## Sizing: the `--u` unit

The design is a **1920 × 6848** Figma frame. `--u` means "one design pixel at
1920". Write every desktop dimension as the number read straight off Figma:

```css
font-size: calc(150 * var(--u));
top: calc(2588 * var(--u));
```

At a 1920px viewport `--u` resolves to exactly `1px`. Never convert to
percentages or rems by hand — that throws away the traceability back to Figma.

Below 1024px the `--fs-*` tokens switch to `clamp()` in `tokens.css`. **Raw
`calc(N * var(--u))` values do not**, so any component sizing type outside the
tokens needs its own `@media (max-width: 1024px)` clamp (see `Nav.module.css`).

## Non-negotiables from the design

- **Four colours only**: `--color-ink` `#1a1a1a`, `--color-white`,
  `--color-blue` `#0051ff`, `--color-yellow` `#ffdf0d`, plus
  `--color-text-muted` `#d2d2d2` for secondary copy. No new colours, no alpha,
  no gradients.
- **`border-radius: 0` everywhere.** Every surface in the design is a hard
  rectangle.
- **No shadows.** There is not one in the design; depth comes from overlap.
- **Tracking is set per family**, not per element: `-0.02em` Coolvetica,
  `-0.05em` Helvetica. Confirmed constant at every size in the file.
- **Coolvetica is Regular only** — never synthesise bold on display type.

## Reading the design

- `design/figma-1920.png` is a 1:1 render (1 image px = 1 design px). Crop and
  measure it locally rather than re-exporting.
- The Figma MCP server **truncates responses over ~5.3 KB**, so
  `get_design_context` / `get_metadata` fail on whole sections but work on
  individual leaf nodes. Probe single node IDs (`128:447` = "portfolios",
  `128:451` = "learn more", `128:400` = hero wordmark). IDs are scattered, not
  ordered by position — probing ±10 around a known ID works.
- Figma asset URLs expire in ~7 days. Download and commit bytes.

## Structure

- `components/ui/` — anything used by two or more sections.
- `components/sections/` — one folder per section. The dense collages of
  absolutely-positioned decorative layers stay here; they are genuinely one-off.
  Position them on a `position: relative` stage sized in `--u`. Don't reach for
  flex/grid for decorative layers.
- `components/layout/` — Nav, MenuOverlay, Footer.
- `src/data/` — plain exported arrays for events, portfolios, team.

`components/ui/SectionStub` is temporary scaffolding. Delete it (and its
stylesheet) once all six sections are built.

## Verifying

Run the dev server and compare at **exactly 1920px viewport** — that is where
the build should be a pixel match. Then sweep 2560 / 1440 / 1024 / 768 / 390 and
check for horizontal overflow and any text under ~15px.
