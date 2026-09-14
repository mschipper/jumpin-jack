import type { GameValue } from "./types";

/** Negative if a < b, 0 if equal, positive if a > b. */
export function compare(a: GameValue, b: GameValue): number {
  if (a.kind === "whole" && b.kind === "whole") return a.n - b.n;
  return 0;
}

export function greater(a: GameValue, b: GameValue): boolean {
  return compare(a, b) > 0;
}
