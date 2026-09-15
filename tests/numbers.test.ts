import { describe, expect, it } from "vitest";
import { compare } from "../src/numbers/compare";
import {
  decimalDigitCount,
  formatDecimal,
  formatWhole,
} from "../src/numbers/format";
import { pickPair } from "../src/numbers/pair";
import { mulberry32 } from "../src/numbers/rng";
import {
  closenessForFloor,
  digitBudget,
  pickWholePair,
} from "../src/numbers/whole";
import { pickDecimalPair } from "../src/numbers/decimal";
import { pickFractionPair } from "../src/numbers/fraction";
import type { Difficulty, NumberKind } from "../src/numbers/types";

describe("compare / format", () => {
  it("compares wholes", () => {
    expect(compare({ kind: "whole", n: 12 }, { kind: "whole", n: 20 })).toBeLessThan(0);
    expect(compare({ kind: "whole", n: 100 }, { kind: "whole", n: 100 })).toBe(0);
  });

  it("formats with US commas", () => {
    expect(formatWhole(12)).toBe("12");
    expect(formatWhole(1234)).toBe("1,234");
    expect(formatWhole(999999)).toBe("999,999");
  });

  it("compares decimals without float equality", () => {
    expect(
      compare(
        { kind: "decimal", scaled: 9, places: 1 },
        { kind: "decimal", scaled: 89, places: 2 },
      ),
    ).toBeGreaterThan(0);
  });

  it("compares fractions by cross-multiply", () => {
    expect(
      compare(
        { kind: "fraction", num: 3, den: 4 },
        { kind: "fraction", num: 2, den: 3 },
      ),
    ).toBeGreaterThan(0);
    expect(
      compare(
        { kind: "fraction", num: 1, den: 2 },
        { kind: "fraction", num: 2, den: 4 },
      ),
    ).toBe(0);
  });

  it("formats decimals and strips extra zeros", () => {
    expect(formatDecimal({ kind: "decimal", scaled: 90, places: 2 })).toBe("0.9");
    expect(formatDecimal({ kind: "decimal", scaled: 90, places: 2, keepZeros: true })).toBe("0.90");
    expect(formatDecimal({ kind: "decimal", scaled: 12345, places: 2 })).toBe("123.45");
  });
});

describe("pickWholePair", () => {
  it("never equals, stays in 1..999999, for many floors", () => {
    const rng = mulberry32(42);
    for (let floor = 1; floor <= 80; floor++) {
      const [a, b] = pickWholePair(floor, "normal", rng);
      expect(a).not.toBe(b);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(b).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThanOrEqual(999_999);
      expect(b).toBeLessThanOrEqual(999_999);
    }
  });

  it("easy is always far", () => {
    expect(closenessForFloor(1, "easy")).toBe("far");
    expect(closenessForFloor(50, "easy")).toBe("far");
  });

  it("normal starts far and tightens", () => {
    expect(closenessForFloor(1, "normal")).toBe("far");
    expect(closenessForFloor(10, "normal")).toBe("hundreds");
    expect(closenessForFloor(30, "normal")).toBe("ones");
  });

  it("digit budget grows with height", () => {
    expect(digitBudget(1, "normal")[1]).toBeLessThanOrEqual(2);
    expect(digitBudget(50, "normal")[0]).toBeGreaterThanOrEqual(5);
  });

  it("exclude regenerates a different pair", () => {
    const rng = mulberry32(7);
    const first = pickWholePair(3, "normal", rng);
    const second = pickWholePair(3, "normal", rng, first);
    expect(second[0] === first[0] && second[1] === first[1]).toBe(false);
    expect(second[0] === first[1] && second[1] === first[0]).toBe(false);
  });
});

const KINDS: NumberKind[] = ["whole", "decimal", "fraction"];
const DIFFS: Difficulty[] = ["easy", "normal", "hard"];

describe("pickPair all kinds", () => {
  it("never equals and always has a bigger side", () => {
    for (const numbers of KINDS) {
      for (const difficulty of DIFFS) {
        const rng = mulberry32(numbers.length * 100 + difficulty.length);
        for (let floor = 1; floor <= 40; floor++) {
          const pair = pickPair(floor, difficulty, rng, numbers);
          expect(compare(pair.left, pair.right)).not.toBe(0);
          if (pair.bigger === "left") expect(compare(pair.left, pair.right)).toBeGreaterThan(0);
          else expect(compare(pair.right, pair.left)).toBeGreaterThan(0);
        }
      }
    }
  });

  it("pause exclude yields a different pair", () => {
    const rng = mulberry32(321);
    const first = pickPair(8, "normal", rng, "fraction");
    const second = pickPair(8, "normal", rng, "fraction", first);
    expect(compare(first.left, second.left) === 0 && compare(first.right, second.right) === 0).toBe(
      false,
    );
  });
});

describe("decimals", () => {
  it("stay within six significant digits", () => {
    const rng = mulberry32(11);
    for (let floor = 1; floor <= 50; floor++) {
      const [a, b] = pickDecimalPair(floor, "normal", rng);
      expect(decimalDigitCount(a)).toBeLessThanOrEqual(6);
      expect(decimalDigitCount(b)).toBeLessThanOrEqual(6);
      expect(compare(a, b)).not.toBe(0);
    }
  });
});

describe("min/max range", () => {
  it("keeps whole pairs inside the range", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 40; i++) {
      const [a, b] = pickWholePair(50, "hard", rng, undefined, { min: 10, max: 30 });
      expect(a).toBeGreaterThanOrEqual(10);
      expect(a).toBeLessThanOrEqual(30);
      expect(b).toBeGreaterThanOrEqual(10);
      expect(b).toBeLessThanOrEqual(30);
      expect(a).not.toBe(b);
    }
  });

  it("keeps decimal values inside the range", () => {
    const rng = mulberry32(6);
    for (let i = 0; i < 30; i++) {
      const [a, b] = pickDecimalPair(10, "normal", rng, { min: 0.2, max: 5 });
      const av = a.scaled / 10 ** a.places;
      const bv = b.scaled / 10 ** b.places;
      expect(av).toBeGreaterThanOrEqual(0.2 - 1e-9);
      expect(av).toBeLessThanOrEqual(5 + 1e-9);
      expect(bv).toBeGreaterThanOrEqual(0.2 - 1e-9);
      expect(bv).toBeLessThanOrEqual(5 + 1e-9);
    }
  });
});

describe("fractions", () => {
  it("are proper, denominator 2–12, never equal", () => {
    const rng = mulberry32(22);
    for (const diff of DIFFS) {
      for (let floor = 1; floor <= 40; floor++) {
        const [a, b] = pickFractionPair(floor, diff, rng);
        expect(a.num).toBeGreaterThan(0);
        expect(b.num).toBeGreaterThan(0);
        expect(a.num).toBeLessThan(a.den);
        expect(b.num).toBeLessThan(b.den);
        expect(a.den).toBeGreaterThanOrEqual(2);
        expect(a.den).toBeLessThanOrEqual(12);
        expect(b.den).toBeLessThanOrEqual(12);
        expect(compare(a, b)).not.toBe(0);
      }
    }
  });
});
