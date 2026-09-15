import { closenessForFloor } from "./whole";
import { randInt, type Rng } from "./rng";
import type { Difficulty, FractionValue } from "./types";
import { compare } from "./compare";

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function reduce(num: number, den: number): FractionValue {
  const g = gcd(num, den);
  return { kind: "fraction", num: num / g, den: den / g };
}

const RELATED = [
  [2, 4, 8],
  [2, 4],
  [3, 6, 9],
  [3, 6],
  [4, 8],
  [5, 10],
];

const HARD_TRAPS: [number, number, number, number][] = [
  [3, 4, 2, 3],
  [5, 8, 2, 3],
  [5, 6, 3, 4],
  [7, 8, 5, 6],
  [1, 2, 3, 8],
  [5, 8, 3, 5],
  [7, 12, 1, 2],
];

function randProper(rng: Rng, den: number): FractionValue {
  const num = randInt(rng, 1, den - 1);
  return reduce(num, den);
}

export function pickFractionPair(
  floor: number,
  difficulty: Difficulty,
  rng: Rng,
): [FractionValue, FractionValue] {
  const close = closenessForFloor(floor, difficulty);
  const maxDen = difficulty === "easy" ? 8 : 12;

  if (difficulty === "hard" && close === "ones" && rng() < 0.35) {
    const t = HARD_TRAPS[randInt(rng, 0, HARD_TRAPS.length - 1)];
    const a = reduce(t[0], t[1]);
    const b = reduce(t[2], t[3]);
    return rng() < 0.5 ? [a, b] : [b, a];
  }

  const sameDen =
    difficulty === "easy" ||
    (difficulty === "normal" && floor <= 12) ||
    rng() < 0.35;

  for (let attempt = 0; attempt < 50; attempt++) {
    let a: FractionValue;
    let b: FractionValue;
    if (sameDen) {
      const den = randInt(rng, 2, maxDen);
      a = randProper(rng, den);
      if (close === "far") {
        const far = a.num <= den / 2 ? randInt(rng, Math.ceil(den * 0.6), den - 1) : randInt(rng, 1, Math.max(1, Math.floor(den * 0.35)));
        b = reduce(far, den);
      } else {
        const n2 = Math.min(den - 1, Math.max(1, a.num + randInt(rng, 1, 2) * (rng() < 0.5 ? 1 : -1)));
        b = reduce(n2, den);
      }
    } else {
      const group = RELATED[randInt(rng, 0, RELATED.length - 1)];
      const d1 = group[randInt(rng, 0, group.length - 1)];
      let d2 = group[randInt(rng, 0, group.length - 1)];
      if (d2 === d1 && group.length > 1) d2 = group.find((d) => d !== d1) ?? d1;
      a = randProper(rng, d1);
      b = randProper(rng, d2);
    }
    if (compare(a, b) === 0) continue;
    if (a.den === 1 || b.den === 1) continue;
    if (close === "far") {
      const gap = Math.abs(a.num * b.den - b.num * a.den);
      if (gap * 4 < a.den * b.den && attempt < 20) continue;
    }
    return [a, b];
  }
  return [reduce(1, 8), reduce(7, 8)];
}
