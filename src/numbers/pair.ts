import type { ChoicePair, Difficulty, GameValue } from "./types";
import { pickWholePair } from "./whole";
import type { Rng } from "./rng";

export function pickPair(
  floor: number,
  difficulty: Difficulty,
  rng: Rng,
  exclude?: [number, number],
): ChoicePair {
  const [a, b] = pickWholePair(floor, difficulty, rng, exclude);
  const leftFirst = rng() < 0.5;
  const leftN = leftFirst ? a : b;
  const rightN = leftFirst ? b : a;
  const left: GameValue = { kind: "whole", n: leftN };
  const right: GameValue = { kind: "whole", n: rightN };
  return {
    left,
    right,
    bigger: leftN > rightN ? "left" : "right",
  };
}

export function pairAsNumbers(pair: ChoicePair): [number, number] {
  return [pair.left.n, pair.right.n];
}
