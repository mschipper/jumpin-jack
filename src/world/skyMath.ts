export function wrapX(x: number, width: number, pad: number): number {
  const span = width + pad * 2;
  if (span <= 0) return x;
  if (x > width + pad) return x - span;
  if (x < -pad) return x + span;
  return x;
}
