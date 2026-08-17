export const SPONSORS = [
  { id: "ey", alt: "EY", src: "/icons/sponsors/ey.png", w: 104.708, h: 105.772 },
  { id: "slido", alt: "Slido", src: "/icons/sponsors/slido.png", w: 128.005, h: 128.005 },
  { id: "lyft", alt: "Lyft", src: "/icons/sponsors/lyft.png", w: 181.484, h: 120.99 },
  { id: "ibm", alt: "IBM", src: "/icons/sponsors/ibm.png", w: 128.108, h: 55.797 },
  { id: "wds", alt: "WDS", src: "/icons/sponsors/wds.png", w: 109, h: 46 },
  { id: "kpmg", alt: "KPMG", src: "/icons/sponsors/kpmg.png", w: 140.892, h: 140.892 },
  { id: "voices", alt: "Voices.com", src: "/icons/sponsors/voices.png", w: 171.819, h: 171.819 },
];

export const SPONSOR_BY_ID = Object.fromEntries(
  SPONSORS.map((sponsor) => [sponsor.id, sponsor]),
);

export const GRID = [
  [null, "ey", "slido"],
  [null, "lyft", "ibm"],
  ["wds", "kpmg", "voices"],
];

export const CELLS = GRID.flat();
