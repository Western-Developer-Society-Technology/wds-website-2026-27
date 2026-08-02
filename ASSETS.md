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

## Blocking prompt 1 (Hero)

- [ ] `public/fonts/coolvetica.woff2` — ⚠️ **licensing**: Coolvetica is a
      Typodermic/Larabie font, free for personal use only. Commercial use needs
      a licence. Until the file exists the site falls back to Arial Black.
- [ ] `public/images/hero-crowd.png` — large group photo, **blue duotone
      already applied**; export the composited result, don't recreate the
      effect in CSS
- [ ] `public/graphics/hero-chevron-v.svg` — the giant blue V behind the hero
- [ ] `public/graphics/hero-stripes.svg` — white striped blocks, bottom-left
      and beside the rail
- [ ] `public/graphics/asterisk.svg` — the 8-point brand mark (one file,
      recoloured via `fill` / `currentColor`; used ≥6 times across the page)
- [ ] `public/icons/arrow-up-right.svg`, `public/icons/arrow-down.svg`

## Prompt 2 (What We Do)

- [ ] `public/images/wwd-group.png` — 3-person cut-out, transparent background
- [ ] `public/images/wwd-speaker.png` — woman with microphone, transparent
      cut-out
- [ ] `public/graphics/wwd-arrow-chevron.svg` — large blue arrow/chevron
- [ ] `public/graphics/step-divider-white.svg` — blocky pixel staircase, white
      on ink (hero → what we do)
- [ ] `public/graphics/barcode-split.svg` — **black bars left of x≈918, blue
      bars right of it** (what we do → events)

## Prompt 3 (Events)

- [ ] `public/images/events/` — Spark Hackathon, Mentorship Program, and the
      third (poker night) photo that sits partly off-canvas
- [ ] `public/graphics/barcode-ink.svg` — events → portfolios strip

## Prompt 4 (Portfolios)

- [ ] `public/icons/` ×7 — folder, people, `{}` code braces, gear, briefcase,
      wallet, lightbulb. Solid/filled, Phosphor-like. **Export these rather
      than substituting an icon library** — the weights won't match.

## Prompt 5 (The Team)

- [ ] `public/graphics/step-divider-yellow.svg` — staircase, yellow + ink →
      white (portfolios → team)
- [ ] `public/images/team/` ×18 headshots — Figma repeats one placeholder 18
      times, so these are outstanding **content**, not an export

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
