export interface NumberRange {
  min?: number;
  max?: number;
}

export function parseBound(raw: string | null): number | undefined {
  if (raw == null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

export function normalizeRange(min?: number, max?: number): NumberRange {
  if (min == null && max == null) return {};
  if (min != null && max != null && min > max) return { min: max, max: min };
  return { min, max };
}

export function inRange(value: number, range?: NumberRange): boolean {
  if (!range) return true;
  if (range.min != null && value < range.min) return false;
  if (range.max != null && value > range.max) return false;
  return true;
}
