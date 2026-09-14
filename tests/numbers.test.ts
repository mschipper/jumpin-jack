import { describe, expect, it } from "vitest";
import { compare } from "../src/numbers/compare";
import { formatWhole } from "../src/numbers/format";
import { pickPair, pairAsNumbers } from "../src/numbers/pair";
import { mulberry32 } from "../src/numbers/rng";
import {
  closenessForFloor,
  digitBudget,
  pickWholePair,
} from "../src/numbers/whole";

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

describe("pickPair", () => {
  it("marks the bigger side", () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 20; i++) {
      const pair = pickPair(5, "normal", rng);
      const [l, r] = pairAsNumbers(pair);
      expect(l).not.toBe(r);
      if (pair.bigger === "left") expect(l).toBeGreaterThan(r);
      else expect(r).toBeGreaterThan(l);
    }
  });
});
