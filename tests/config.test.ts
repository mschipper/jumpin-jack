import { describe, expect, it } from "vitest";
import {
  isComplete,
  mergeConfig,
  missingFields,
  parseSearch,
} from "../src/config";

describe("parseSearch", () => {
  it("reads all three params", () => {
    const c = parseSearch("?numbers=whole&difficulty=normal&mode=challenge");
    expect(c).toEqual({
      numbers: "whole",
      difficulty: "normal",
      mode: "challenge",
    });
    expect(isComplete(c)).toBe(true);
  });

  it("applies partials and lists missing fields", () => {
    const c = parseSearch("?mode=challenge");
    expect(c.mode).toBe("challenge");
    expect(missingFields(c).sort()).toEqual(["difficulty", "numbers"]);
  });

  it("ignores unknown values", () => {
    const c = parseSearch("?numbers=roman&difficulty=easy");
    expect(c.numbers).toBeUndefined();
    expect(c.difficulty).toBe("easy");
  });

  it("reads min and max and swaps if reversed", () => {
    const c = parseSearch("?min=10&max=20");
    expect(c.min).toBe(10);
    expect(c.max).toBe(20);
    const swapped = parseSearch("?min=50&max=5");
    expect(swapped.min).toBe(5);
    expect(swapped.max).toBe(50);
  });

  it("does not require min/max to be complete", () => {
    const c = parseSearch("?numbers=whole&difficulty=normal&mode=challenge&min=1&max=20");
    expect(isComplete(c)).toBe(true);
    expect(c.min).toBe(1);
    expect(c.max).toBe(20);
  });
});

describe("mergeConfig", () => {
  it("lets host win over URL", () => {
    const merged = mergeConfig(
      { numbers: "fraction" },
      parseSearch("?numbers=whole&mode=speed"),
    );
    expect(merged.numbers).toBe("fraction");
    expect(merged.mode).toBe("speed");
  });
});
