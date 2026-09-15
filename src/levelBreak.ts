export const LEVEL_BREAK_MS = 1500;
export const LEVEL_BREAK_READY = "JUMP WHEN READY";

export function levelBreakHeadline(): string {
  return "Level Complete!";
}

export function levelBreakLevelLine(nextLevel: number): string {
  return `Level ${nextLevel}`;
}
