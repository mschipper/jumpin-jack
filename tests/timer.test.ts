import { describe, expect, it } from "vitest";
import { timeForFloor, levelForFloor } from "../src/timer";

describe("timeForFloor", () => {
  it("casual has no timer", () => {
    expect(timeForFloor(1, "casual", "normal")).toBe(Infinity);
  });

  it("challenge normal starts at 4500 and clamps to the floor", () => {
    expect(timeForFloor(1, "challenge", "normal")).toBe(4500);
    const late = timeForFloor(200, "challenge", "normal");
    expect(late).toBe(1800);
  });

  it("decreases with each answer", () => {
    const a = timeForFloor(2, "challenge", "normal");
    const b = timeForFloor(3, "challenge", "normal");
    expect(b).toBeLessThan(a);
  });
});

describe("levelForFloor", () => {
  it("is 1-based groups of 20", () => {
    expect(levelForFloor(0)).toBe(1);
    expect(levelForFloor(19)).toBe(1);
    expect(levelForFloor(20)).toBe(2);
    expect(levelForFloor(80)).toBe(5);
  });
});
