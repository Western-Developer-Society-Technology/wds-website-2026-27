export const PORTFOLIOS = [
  {
    id: "development",
    label: "Development",
    src: "/icons/portfolios/development.svg",
    w: 139.695,
    h: 116.254,
  },
  {
    id: "internals",
    label: "Internals",
    src: "/icons/portfolios/internals.svg",
    w: 112.835,
    h: 116,
  },
  {
    id: "careers",
    label: "Careers",
    src: "/icons/portfolios/careers.svg",
    w: 117.778,
    h: 106,
  },
  {
    id: "externals",
    label: "Externals",
    src: "/icons/portfolios/externals.svg",
    w: 151.429,
    h: 106,
  },
  {
    id: "finance",
    label: "Finance",
    src: "/icons/portfolios/finance.svg",
    w: 115.993,
    h: 116,
  },
  {
    id: "technology",
    label: "Technology",
    src: "/icons/portfolios/technology.svg",
    w: 141.778,
    h: 116,
  },
  {
    id: "marketing",
    label: "Marketing",
    src: "/icons/portfolios/marketing.svg",
    w: 93,
    h: 128,
  },
];

export const PORTFOLIO_BY_ID = Object.fromEntries(
  PORTFOLIOS.map((portfolio) => [portfolio.id, portfolio]),
);

export const GRID = [
  [null, null, null, null, null, null],
  [null, "development", "internals", "careers", "externals", null],
  [null, "finance", "technology", "marketing", "asterisk", null],
  [null, null, null, null, null, null],
];

export const CELLS = GRID.flat();
