import type { Closeness, Difficulty } from "./types";
import { randInt, type Rng } from "./rng";
import type { NumberRange } from "./range";

export function digitBudget(
  floor: number,
  difficulty: Difficulty,
): [number, number] {
  if (floor <= 8) {
    if (difficulty === "easy") return [1, 2];
    if (difficulty === "hard") return [2, 3];
    return [1, 2];
  }
  if (floor <= 20) {
    if (difficulty === "easy") return [2, 3];
    if (difficulty === "hard") return [3, 4];
    return [2, 3];
  }
  if (floor <= 40) {
    if (difficulty === "easy") return [3, 4];
    if (difficulty === "hard") return [4, 5];
    return [3, 5];
  }
  if (difficulty === "easy") return [4, 6];
  if (difficulty === "hard") return [5, 6];
  return [5, 6];
}

export function closenessForFloor(
  floor: number,
  difficulty: Difficulty,
): Closeness {
  if (difficulty === "easy") return "far";
  if (difficulty === "hard") {
    if (floor <= 4) return "hundreds";
    if (floor <= 12) return "tens";
    return "ones";
  }
  if (floor <= 6) return "far";
  if (floor <= 14) return "hundreds";
  if (floor <= 24) return "tens";
  return "ones";
}

function rangeForDigits(digits: number): [number, number] {
  if (digits <= 1) return [1, 9];
  const min = 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return [min, Math.min(max, 999_999)];
}

function clampTo(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function wholeBounds(
  floor: number,
  difficulty: Difficulty,
  rng: Rng,
  range?: NumberRange,
): [number, number] {
  const [dMin, dMax] = digitBudget(floor, difficulty);
  const digits = randInt(rng, dMin, dMax);
  let [lo, hi] = rangeForDigits(digits);
  const rmin = range?.min != null ? Math.ceil(range.min) : undefined;
  const rmax = range?.max != null ? Math.floor(range.max) : undefined;
  if (rmin != null) lo = Math.max(lo, rmin);
  if (rmax != null) hi = Math.min(hi, rmax);
  if (lo > hi) {
    lo = Math.max(1, rmin ?? 1);
    hi = Math.min(999_999, rmax ?? 999_999);
    if (lo > hi) {
      const t = lo;
      lo = hi;
      hi = t;
    }
  }
  return [Math.max(1, lo), Math.min(999_999, hi)];
}

export function pickWholePair(
  floor: number,
  difficulty: Difficulty,
  rng: Rng,
  exclude?: [number, number],
  range?: NumberRange,
): [number, number] {
  const [lo, hi] = wholeBounds(floor, difficulty, rng, range);
  const close = closenessForFloor(floor, difficulty);

  for (let attempt = 0; attempt < 40; attempt++) {
    let a = randInt(rng, lo, hi);
    let b: number;
    if (close === "far") {
      b = randInt(rng, lo, hi);
      const span = Math.max(3, Math.floor((hi - lo) * 0.25));
      if (Math.abs(a - b) < span) {
        b = clampTo(a + (a < (lo + hi) / 2 ? span : -span), lo, hi);
      }
    } else if (close === "hundreds") {
      const d = randInt(rng, 1, 4) * 100 * (rng() < 0.5 ? 1 : -1);
      b = clampTo(a + d, lo, hi);
    } else if (close === "tens") {
      const d = randInt(rng, 1, 9) * 10 * (rng() < 0.5 ? 1 : -1);
      b = clampTo(a + d, lo, hi);
    } else {
      const trap = difficulty === "hard" && rng() < 0.25;
      if (trap && a >= 100) {
        const rounded = Math.round(a / 100) * 100;
        b = clampTo(rounded === a ? a + 10 : rounded, lo, hi);
      } else {
        const d = randInt(rng, 1, 9) * (rng() < 0.5 ? 1 : -1);
        b = clampTo(a + d, lo, hi);
      }
    }
    if (b === a) b = clampTo(a + 1, lo, hi);
    if (b === a) b = clampTo(a - 1, lo, hi);
    if (b === a) continue;
    const same =
      exclude &&
      ((a === exclude[0] && b === exclude[1]) ||
        (a === exclude[1] && b === exclude[0]));
    if (same) continue;
    return [a, b];
  }
  const a = lo;
  const b = Math.min(hi, lo + 1);
  return [a, b];
}
