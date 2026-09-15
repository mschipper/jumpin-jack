import type { DecimalValue, FractionValue, GameValue } from "./types";

export function formatWhole(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatDecimal(v: DecimalValue): string {
  const places = v.places;
  const raw = Math.abs(v.scaled).toString().padStart(places + 1, "0");
  const cut = raw.length - places;
  let ip = raw.slice(0, cut);
  let fp = raw.slice(cut);
  ip = ip.replace(/^0+(?=\d)/, "") || "0";
  if (!v.keepZeros) fp = fp.replace(/0+$/, "");
  if (fp.length === 0) fp = "0";
  return `${ip}.${fp}`;
}

export function formatFractionInline(v: FractionValue): string {
  return `${v.num}/${v.den}`;
}

export function formatValue(v: GameValue): string {
  if (v.kind === "whole") return formatWhole(v.n);
  if (v.kind === "decimal") return formatDecimal(v);
  return formatFractionInline(v);
}

export function digitCountWhole(n: number): number {
  return String(Math.abs(n)).length;
}

/** Digit characters excluding the decimal point and a leading 0 before it. */
export function decimalDigitCount(v: DecimalValue): number {
  const s = formatDecimal({ ...v, keepZeros: true });
  const [ip, fp = ""] = s.split(".");
  const intPart = ip === "0" ? "" : ip.replace(/^0+/, "");
  return intPart.length + fp.length;
}
