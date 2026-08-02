/**
 * mulberry32 — a tiny seeded PRNG.
 *
 * Decorative generators (the barcodes) must produce the *same* sequence on the
 * server and in the browser or React throws a hydration mismatch. Never reach
 * for Math.random() in render for this reason: pass a seed instead, and vary
 * the seed to vary the pattern.
 */
export function makeRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
