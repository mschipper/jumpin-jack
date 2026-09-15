import { closenessForFloor } from "./whole";
import { randInt, type Rng } from "./rng";
import type { DecimalValue, Difficulty } from "./types";
import { compare } from "./compare";

function placesFor(floor: number, difficulty: Difficulty): number {
  if (difficulty === "easy") return floor <= 20 ? 1 : 2;
  if (difficulty === "hard") {
    if (floor <= 8) return 2;
    if (floor <= 24) return 3;
    return 4;
  }
  if (floor <= 8) return 1;
  if (floor <= 20) return 2;
  if (floor <= 40) return 3;
  return 4;
}

function intDigitsFor(floor: number, difficulty: Difficulty, places: number): number {
  const maxInt = Math.max(0, 6 - places);
  if (difficulty === "easy") {
    if (floor <= 10) return Math.min(1, maxInt);
    if (floor <= 25) return Math.min(2, maxInt);
    return Math.min(3, maxInt);
  }
  if (difficulty === "hard") return Math.min(floor <= 12 ? 1 : 2, maxInt);
  if (floor <= 12) return Math.min(1, maxInt);
  if (floor <= 30) return Math.min(2, maxInt);
  return Math.min(3, maxInt);
}

function randScaled(rng: Rng, intDigits: number, places: number): number {
  const total = intDigits + places;
  const min = intDigits === 0 ? 1 : 10 ** (total - 1);
  const max = 10 ** Math.min(6, total) - 1;
  return randInt(rng, min, Math.max(min, max));
}

function make(scaled: number, places: number, keepZeros = false): DecimalValue {
  return { kind: "decimal", scaled, places, keepZeros };
}

const TRAPS: [DecimalValue, DecimalValue][] = [
  [make(9, 1, true), make(89, 2, true)],
  [make(12, 1, true), make(112, 2, true)],
  [make(10, 2, true), make(9, 2, true)],
  [make(1, 1, true), make(99, 3, true)],
];

export function pickDecimalPair(
  floor: number,
  difficulty: Difficulty,
  rng: Rng,
): [DecimalValue, DecimalValue] {
  const close = closenessForFloor(floor, difficulty);
  if (difficulty === "hard" && close === "ones" && rng() < 0.28) {
    const trap = TRAPS[randInt(rng, 0, TRAPS.length - 1)];
    return rng() < 0.5 ? [trap[0], trap[1]] : [trap[1], trap[0]];
  }

  const places = placesFor(floor, difficulty);
  const intDigits = intDigitsFor(floor, difficulty, places);

  for (let attempt = 0; attempt < 40; attempt++) {
    const a = randScaled(rng, intDigits, places);
    let b: number;
    if (close === "far") {
      const span = Math.max(3, Math.floor(10 ** places * 0.3));
      b = a + span * (rng() < 0.5 ? 1 : -1) * randInt(rng, 1, 4);
    } else if (close === "hundreds") {
      b = a + 10 ** Math.max(0, places - 1) * randInt(rng, 1, 4) * (rng() < 0.5 ? 1 : -1);
    } else if (close === "tens") {
      b = a + 10 ** Math.max(0, places - 2) * randInt(rng, 1, 9) * (rng() < 0.5 ? 1 : -1);
    } else {
      b = a + randInt(rng, 1, 9) * (rng() < 0.5 ? 1 : -1);
    }
    b = Math.max(1, b);
    if (b === a) continue;
    const left = make(a, places);
    const right = make(b, places);
    if (compare(left, right) === 0) continue;
    return [left, right];
  }
  return [make(2, places), make(8, places)];
}
