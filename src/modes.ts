import { FLOORS_PER_LEVEL } from "./constants";
import type { PlayMode } from "./numbers/types";

export function shouldLevelBreak(mode: PlayMode, floor: number): boolean {
  return mode === "challenge" && floor > 0 && floor % FLOORS_PER_LEVEL === 0;
}

export function isCasualWin(mode: PlayMode, floor: number): boolean {
  return mode === "casual" && floor >= 20;
}

export function hidesLevelHud(mode: PlayMode): boolean {
  return mode !== "challenge";
}

export function timerProminent(mode: PlayMode): boolean {
  return mode === "speed";
}
