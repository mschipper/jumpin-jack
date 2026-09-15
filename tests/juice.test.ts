import { describe, expect, it } from "vitest";
import { shakeMagnitude } from "../src/juice";

describe("shakeMagnitude", () => {
  it("is full at the start and zero at/after duration", () => {
    expect(shakeMagnitude(0, 90, 3)).toBe(3);
    expect(shakeMagnitude(90, 90, 3)).toBe(0);
    expect(shakeMagnitude(120, 90, 3)).toBe(0);
  });

  it("decays while the shake is running", () => {
    const mid = shakeMagnitude(45, 90, 3);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(3);
    expect(shakeMagnitude(20, 90, 3)).toBeGreaterThan(mid);
  });

  it("is zero for empty duration or negative elapsed", () => {
    expect(shakeMagnitude(10, 0, 3)).toBe(0);
    expect(shakeMagnitude(-1, 90, 3)).toBe(0);
  });
});
