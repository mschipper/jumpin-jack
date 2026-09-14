import { BEST_PREFIX } from "../constants";
import type { GameConfig } from "../numbers/types";

export function bestKey(config: GameConfig): string {
  return `${BEST_PREFIX}:${config.numbers}:${config.difficulty}:${config.mode}`;
}

export function readBest(config: GameConfig): number {
  if (typeof localStorage === "undefined") return 0;
  return Number(localStorage.getItem(bestKey(config)) || 0);
}

export function writeBest(config: GameConfig, score: number): boolean {
  const prev = readBest(config);
  if (score <= prev) return false;
  localStorage.setItem(bestKey(config), String(score));
  return true;
}
