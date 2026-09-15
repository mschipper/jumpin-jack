/** Fraction of screen height from the bottom where the stand pad rests. */
export const REST_Y_MIN = 0.22;
export const REST_Y_MAX = 0.6;

/** Answers at or under this still count as fast. */
const FAST_MS = 1600;
/** Hold current height until the player has lingered this long. */
const HOLD_MS = 2200;
const SLOW_MS = 3500;
const SETTLE_PER_SEC = 0.16;

export function restYFromPace(pace: number): number {
  const p = Math.min(1, Math.max(0, pace));
  return REST_Y_MIN + (REST_Y_MAX - REST_Y_MIN) * p;
}

/** First jump from the ground does not change pace. */
export function paceAfterAnswer(pace: number, elapsedMs: number, fromGround: boolean): number {
  if (fromGround) return pace;
  if (elapsedMs <= FAST_MS) {
    const t = 1 - elapsedMs / FAST_MS;
    return Math.min(1, pace + 0.16 + t * 0.38);
  }
  if (elapsedMs < HOLD_MS) return pace;
  const t = Math.min(1, (elapsedMs - HOLD_MS) / (SLOW_MS - HOLD_MS));
  return Math.max(0, pace - t * 0.24);
}

/** No decay while the current answer is still in the fast/hold window. */
export function paceAfterWait(pace: number, dtSec: number, elapsedMs: number): number {
  if (elapsedMs < HOLD_MS) return pace;
  return Math.max(0, pace - SETTLE_PER_SEC * dtSec);
}
