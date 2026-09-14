import { FLOORS_PER_LEVEL, TIMER } from "./constants";
import type { Difficulty, PlayMode } from "./numbers/types";

export function timeForFloor(
  floor: number,
  mode: PlayMode,
  difficulty: Difficulty,
): number {
  if (mode === "casual") return Infinity;
  const table = mode === "speed" ? TIMER.speed : TIMER.challenge;
  const t = table[difficulty];
  const level = Math.floor(Math.max(0, floor - 1) / FLOORS_PER_LEVEL);
  const inLevel = Math.max(0, floor - 1) % FLOORS_PER_LEVEL;
  const ms = t.start - level * t.levelTax - inLevel * t.delta;
  return Math.max(t.floor, ms);
}

export function levelForFloor(floor: number): number {
  return Math.floor(Math.max(0, floor) / FLOORS_PER_LEVEL) + 1;
}
