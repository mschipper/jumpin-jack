/** Fraction of screen height from the bottom where the stand pad rests. */
export const REST_Y_MIN = 0.22;
export const REST_Y_MAX = 0.6;

const FAST_MS = 900;
const SLOW_MS = 2800;
const SETTLE_PER_SEC = 0.14;

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
  const t = Math.min(1, (elapsedMs - FAST_MS) / (SLOW_MS - FAST_MS));
  return Math.max(0, pace - t * 0.24);
}

export function paceAfterWait(pace: number, dtSec: number): number {
  return Math.max(0, pace - SETTLE_PER_SEC * dtSec);
}
