/**
 * The exec team grid — 6 across, 3 down.
 *
 * ⚠️ PLACEHOLDER CONTENT. The Figma file repeats one headshot and one
 * name/role 18 times; it has never held the real team. Everything below is
 * that placeholder reproduced, so the section renders at the right density —
 * it is not real data and must be replaced before launch.
 *
 * The headshot was cropped 1:1 from design/figma-1920.png at exactly the size
 * the card renders (215 × 216), so it is correct at 1920px and has no headroom
 * above it.
 *
 * The grid derives from this array: add or remove people and the columns,
 * spacing and rows all follow.
 */
const PLACEHOLDER = {
  name: "Stephanie Li",
  role: "VP of Marketing",
  photo: "/images/team/placeholder.png",
};

export const team = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  ...PLACEHOLDER,
}));

export default team;
