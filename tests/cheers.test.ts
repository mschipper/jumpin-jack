import { describe, expect, it } from "vitest";
import { cheerForScore } from "../src/cheers";

describe("cheerForScore", () => {
  it("steps up through the cheer ladder", () => {
    expect(cheerForScore(0)).toBe("Ok!");
    expect(cheerForScore(1)).toBe("Getting there!");
    expect(cheerForScore(10)).toBe("Good!");
    expect(cheerForScore(20)).toBe("Awesome!");
    expect(cheerForScore(80)).toBe("Unbelievable!");
    expect(cheerForScore(200)).toBe("Unbelievable!");
  });
});
