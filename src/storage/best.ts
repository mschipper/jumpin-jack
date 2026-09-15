import { BEST_PREFIX } from "../constants";
import type { GameConfig } from "../numbers/types";

export function bestKey(config: GameConfig): string {
  const range =
    config.min != null || config.max != null
      ? `:${config.min ?? ""}:${config.max ?? ""}`
      : "";
  return `${BEST_PREFIX}:${config.numbers}:${config.difficulty}:${config.mode}${range}`;
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
