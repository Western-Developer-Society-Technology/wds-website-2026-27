/**
 * The seven WDS portfolios, in the order the design lays them out.
 *
 * Grouped into explicit rows rather than one wrapping list. flex-wrap cannot
 * reproduce the design: row 2 is 1276 wide but row 1 breaks at 1118, so no
 * single container width produces both. The rows are hand-composed in the
 * design and are hand-composed here.
 *
 * `asterisk: true` is a yellow asterisk sitting in the row as a flow item —
 * three of them break the rows up so they stagger instead of forming a grid.
 *
 * NOTE ON THE ICONS: these were extracted 1:1 from design/figma-1920.png
 * because the SVGs were never exported. They are PNGs at exactly the size the
 * design draws them, so they are correct at 1920px and will soften above it.
 * Replace them with SVGs when you have them — only `icon` and `iconSize` here
 * need to change.
 */
const chip = (slug, label, iconSize) => ({
  slug,
  label,
  icon: `/icons/portfolios/${slug}.png`,
  iconSize,
  href: "#portfolios",
});

const ASTERISK = { asterisk: true };

export const portfolioRows = [
  [chip("development", "Development", [50, 42]), ASTERISK, chip("externals", "Externals", [64, 45])],
  [
    ASTERISK,
    chip("technology", "Technology", [55, 45]),
    chip("internals", "Internals", [43, 45]),
    chip("careers", "Careers", [54, 48]),
  ],
  [chip("finance", "Finance", [47, 47]), chip("marketing", "Marketing", [37, 50]), ASTERISK],
];

/** Chips only — the number shown in the heading superscript. */
export const portfolioCount = portfolioRows
  .flat()
  .filter((item) => !item.asterisk).length;

export default portfolioRows;
