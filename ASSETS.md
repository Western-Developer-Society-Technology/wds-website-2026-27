# Assets to export from Figma

Source: [WDS Website 26-27, node 128:396](https://www.figma.com/design/u2Enk8gf9yDD0ewDPxEcyU/WDS-Website-26-27?node-id=128-396)

A 1:1 render of the frame is committed at `design/figma-1920.png` (1920 × 6848,
so 1 image px = 1 design px). Measure against that rather than re-exporting.

> **Figma MCP note:** the server truncates any response over ~5.3 KB, so
> `get_design_context` / `get_metadata` fail on whole sections but work fine on
> individual leaf nodes. Probe single node IDs (e.g. `128:447` = "portfolios",
> `128:451` = "learn more") when you need exact values.
>
> Figma asset URLs expire after ~7 days — download and commit the bytes, never
> reference the remote URL.

---

## Prompt 1 (Hero) — done

- [x] `public/fonts/coolvetica.woff2` — converted from the supplied
      `Coolvetica Rg.otf` with fontTools (65K OTF → 38K WOFF2). Source kept at
      `design/reference/coolvetica.otf`.
      ⚠️ **licensing still open**: Coolvetica is a Typodermic/Larabie font,
      free for personal use only. Commercial use needs a licence.
- [x] `public/images/heroimage.png` — crowd cut-out, 2189×666 RGBA, blue
      duotone already baked in
- [x] Blue zigzag — **drawn in code** from a points array in
      `HeroChevron.jsx`, not an asset. `design/reference/vchevron.svg` kept for
      reference only.
- [x] Stripe blocks — **generated in code** by `components/ui/Barcode.jsx` with
      a seeded PRNG, so each instance differs. `design/reference/barcode.svg`
      kept for reference only.
- [x] Asterisk — inlined in `components/ui/Asterisk.jsx` (needs `currentColor`:
      it appears yellow, white and ink)
- [x] Down arrow — inlined in `components/ui/ArrowIcon.jsx`

⚠️ **Still needed:** the diagonal **↗ arrow** used inside the `learn more` and
`view all` buttons. It is a different glyph from the ↓ arrow, not that one
rotated. Needed before prompt 2.

## Prompt 2 (What We Do) — done

- [x] `public/images/whatwedoimage1.png` — 3-person cut-out (821 × 537 RGBA)
- [x] `public/images/whatwedoimage2.png` — speaker cut-out (373 × 587 RGBA)
- [x] Diagonal ↗ arrow — inlined in `components/ui/ArrowIcon.jsx` alongside the
      ↓ glyph. Source at `design/reference/diagonalarrow.svg`.
- [x] Blue zigzag — **traced in code** as a polygon in `WhatWeDoArt.jsx`,
      recovered from the render by masking #0051ff, filling the areas the
      asterisk and speaker cover, then contour-tracing and simplifying.
- [x] Step divider — **transcribed in code** as band rectangles in
      `components/ui/StepDivider.jsx`. Not generated: the step widths are
      hand-authored and irregular, though both edges land on a 25 × 50px grid.
- [x] Barcode strip — two `Barcode` instances (ink left of design x 910, blue
      right), reusing the generator from prompt 1.

## Still needed

- [ ] `step-divider-yellow` band data for the Portfolios → Team divider. It is
      a *different* staircase from the hero one, so it needs its own transcribe
      pass in prompt 5 — pass it to `StepDivider` via the `bands` prop.

## Prompt 3 (Events) — done, with two gaps

- [~] `public/images/events/spark-hackathon.png`,
      `public/images/events/mentorship-program.png` — ⚠️ **cropped 1:1 out of
      `design/figma-1920.png`**, not exported originals. They are exactly the
      size the card renders at (708 × 472), so they are correct at 1920px but
      have no headroom on a larger display. Replace with the source photos.
- [ ] **Third event** — the design shows a casino/poker-night card bleeding off
      the right edge to signal the row scrolls. Only ~176px of it is on-canvas
      and its caption is illegible, so it is not in `src/data/events.js`. Add
      the title, date and image there and the card, its spacing and its
      progress marker all appear automatically.
- [x] Events → Portfolios strip — a `Barcode` instance (67 bars, ink on white).

## Prompt 4 (Portfolios) — done, icons are stopgaps

- [~] `public/icons/portfolios/` ×7 — folder, people, `{}` braces, gear,
      briefcase, wallet, lightbulb. ⚠️ **Extracted 1:1 from
      `design/figma-1920.png` as PNGs with alpha**, not exported SVGs. They are
      37–64px wide, i.e. exactly the size the design draws them, so they are
      correct at 1920px and will soften above it. Swapping in SVGs only means
      changing `icon` and `iconSize` in `src/data/portfolios.js`.
- [x] `JOIN US` ticker — the reusable `components/ui/Marquee`.
      ⚠️ See the `--fs-marquee` note in tokens.css: the design's glyphs are ~7%
      narrower per unit of cap height than Coolvetica, which suggests the text
      frame was scaled horizontally in Figma. Cap height is matched; the repeat
      pitch is 289 against the design's 270.

## Prompt 5 (The Team) — done, content is placeholder

- [x] Portfolios → Team staircase — **transcribed in code** as
      `TEAM_DIVIDER_BANDS` in `components/ui/StepDivider.jsx`, using the
      `stepped` variant (the ink/white boundary steps, with a 50px yellow band
      riding the edge). Verified to within 1px at four probes.
- [ ] **Real team content.** `src/data/team.js` holds 18 copies of one
      placeholder because that is literally what the Figma file contains —
      "Stephanie Li / VP of Marketing" repeated 18 times. ⚠️ This is not real
      data. Replace the array with the actual execs; the grid, spacing and row
      count all follow from its length.
- [~] `public/images/team/placeholder.png` — the one headshot, cropped 1:1 out
      of `design/figma-1920.png` at exactly the render size (215 × 216).
      Replace with real headshots alongside the data.

## Prompt 6 (Footer)

- [ ] `public/graphics/footer-checker.svg` — blue/white diagonal pixel checker
      (both corners)
- [ ] `public/graphics/barcode-blue.svg` — footer strip
- [ ] `public/icons/` ×3 — Instagram, Discord, LinkedIn (filled, blue)

---

## Don't reconstruct these in CSS

The barcodes and step dividers look procedural but the bar rhythm and step
pattern are hand-authored. A `repeating-linear-gradient` approximation reads as
visibly wrong next to the design. Export them as SVG and set
`preserveAspectRatio="none"` on the Y axis only for full-bleed scaling.
