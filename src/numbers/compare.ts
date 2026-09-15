import type { DecimalValue, FractionValue, GameValue, WholeValue } from "./types";

function asRational(v: GameValue): { n: number; d: number } {
  if (v.kind === "whole") return { n: v.n, d: 1 };
  if (v.kind === "decimal") return { n: v.scaled, d: 10 ** v.places };
  return { n: v.num, d: v.den };
}

/** Negative if a < b, 0 if equal, positive if a > b. Fractions use cross-multiply. */
export function compare(a: GameValue, b: GameValue): number {
  const A = asRational(a);
  const B = asRational(b);
  return A.n * B.d - B.n * A.d;
}

export function greater(a: GameValue, b: GameValue): boolean {
  return compare(a, b) > 0;
}

export function numericValue(v: GameValue): number {
  if (v.kind === "whole") return v.n;
  if (v.kind === "decimal") return v.scaled / 10 ** v.places;
  return v.num / v.den;
}

export function valuesEqual(a: GameValue, b: GameValue): boolean {
  return compare(a, b) === 0;
}

export function samePair(
  left: GameValue,
  right: GameValue,
  other: { left: GameValue; right: GameValue },
): boolean {
  return (
    (valuesEqual(left, other.left) && valuesEqual(right, other.right)) ||
    (valuesEqual(left, other.right) && valuesEqual(right, other.left))
  );
}

export function isWhole(v: GameValue): v is WholeValue {
  return v.kind === "whole";
}
export function isDecimal(v: GameValue): v is DecimalValue {
  return v.kind === "decimal";
}
export function isFraction(v: GameValue): v is FractionValue {
  return v.kind === "fraction";
}
