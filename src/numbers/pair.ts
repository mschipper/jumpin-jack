import type { ChoicePair, Difficulty, GameValue, NumberKind } from "./types";
import { compare, samePair } from "./compare";
import { pickWholePair } from "./whole";
import { pickDecimalPair } from "./decimal";
import { pickFractionPair } from "./fraction";
import type { Rng } from "./rng";
import type { NumberRange } from "./range";

export function pickPair(
  floor: number,
  difficulty: Difficulty,
  rng: Rng,
  numbers: NumberKind = "whole",
  exclude?: ChoicePair,
  range?: NumberRange,
): ChoicePair {
  for (let i = 0; i < 30; i++) {
    const [A, B] = rawPair(floor, difficulty, rng, numbers, range);
    const leftFirst = rng() < 0.5;
    const left = leftFirst ? A : B;
    const right = leftFirst ? B : A;
    if (exclude && samePair(left, right, exclude)) continue;
    if (compare(left, right) === 0) continue;
    return {
      left,
      right,
      bigger: compare(left, right) > 0 ? "left" : "right",
    };
  }
  const fallback: GameValue = { kind: "whole", n: 1 };
  const other: GameValue = { kind: "whole", n: 2 };
  return { left: fallback, right: other, bigger: "right" };
}

function rawPair(
  floor: number,
  difficulty: Difficulty,
  rng: Rng,
  numbers: NumberKind,
  range?: NumberRange,
): [GameValue, GameValue] {
  if (numbers === "decimal") return pickDecimalPair(floor, difficulty, rng, range);
  if (numbers === "fraction") return pickFractionPair(floor, difficulty, rng, range);
  const [a, b] = pickWholePair(floor, difficulty, rng, undefined, range);
  return [
    { kind: "whole", n: a },
    { kind: "whole", n: b },
  ];
}

export function pairAsNumbers(pair: ChoicePair): [number, number] {
  const n = (v: GameValue) => {
    if (v.kind === "whole") return v.n;
    if (v.kind === "decimal") return v.scaled / 10 ** v.places;
    return v.num / v.den;
  };
  return [n(pair.left), n(pair.right)];
}
