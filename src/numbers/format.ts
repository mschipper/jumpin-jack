import type { GameValue } from "./types";

export function formatWhole(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatValue(v: GameValue): string {
  if (v.kind === "whole") return formatWhole(v.n);
  return "";
}
