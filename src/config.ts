import type {
  Difficulty,
  NumberKind,
  PartialConfig,
  PlayMode,
  GameConfig,
} from "./numbers/types";
import { normalizeRange, parseBound } from "./numbers/range";

const KINDS: NumberKind[] = ["whole", "decimal", "fraction"];
const DIFFS: Difficulty[] = ["easy", "normal", "hard"];
const MODES: PlayMode[] = ["casual", "challenge", "speed"];

function oneOf<T extends string>(v: string | null | undefined, allowed: T[]): T | undefined {
  if (!v) return undefined;
  return allowed.includes(v as T) ? (v as T) : undefined;
}

export function parseSearch(search: string): PartialConfig {
  const q = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const range = normalizeRange(
    parseBound(q.get("min") ?? q.get("minValue")),
    parseBound(q.get("max") ?? q.get("maxValue")),
  );
  return {
    numbers: oneOf(q.get("numbers"), KINDS),
    difficulty: oneOf(q.get("difficulty"), DIFFS),
    mode: oneOf(q.get("mode"), MODES),
    min: range.min,
    max: range.max,
  };
}

export function mergeConfig(
  host: PartialConfig | undefined,
  url: PartialConfig,
): PartialConfig {
  const range = normalizeRange(host?.min ?? url.min, host?.max ?? url.max);
  return {
    numbers: host?.numbers ?? url.numbers,
    difficulty: host?.difficulty ?? url.difficulty,
    mode: host?.mode ?? url.mode,
    min: range.min,
    max: range.max,
  };
}

export function missingFields(partial: PartialConfig): (keyof GameConfig)[] {
  const miss: (keyof GameConfig)[] = [];
  if (!partial.numbers) miss.push("numbers");
  if (!partial.difficulty) miss.push("difficulty");
  if (!partial.mode) miss.push("mode");
  return miss;
}

export function isComplete(partial: PartialConfig): partial is GameConfig {
  return Boolean(partial.numbers && partial.difficulty && partial.mode);
}

export function defaultPlayConfig(): GameConfig {
  return { numbers: "whole", difficulty: "normal", mode: "challenge" };
}
