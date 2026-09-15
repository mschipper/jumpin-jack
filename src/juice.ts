/** Quadratic decay: 1 at t=0, 0 at t=duration. */
export function shakeMagnitude(elapsedMs: number, durationMs: number, px: number): number {
  if (durationMs <= 0 || elapsedMs < 0 || elapsedMs >= durationMs) return 0;
  const t = 1 - elapsedMs / durationMs;
  return px * t * t;
}
