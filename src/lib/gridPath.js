// Neighbouring cells share edges; keying by endpoints collapses each shared
// edge to a single line so no border is ever drawn twice.
export function createGridPath(cells) {
  const edges = new Map();

  for (const [col, row] of cells) {
    for (const [start, end] of [
      [[col, row], [col + 1, row]],
      [[col, row], [col, row + 1]],
      [[col + 1, row], [col + 1, row + 1]],
      [[col, row + 1], [col + 1, row + 1]],
    ]) {
      edges.set([...start, ...end].join("-"), [start, end]);
    }
  }

  return [...edges.values()]
    .map(([start, end]) => `M ${start.join(" ")} L ${end.join(" ")}`)
    .join(" ");
}
