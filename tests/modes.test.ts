import { describe, expect, it } from "vitest";
import { isCasualWin, shouldLevelBreak, timerProminent } from "../src/modes";
import { timeForFloor } from "../src/timer";

describe("mode rules", () => {
  it("casual wins at 20 and has no timer", () => {
    expect(isCasualWin("casual", 19)).toBe(false);
    expect(isCasualWin("casual", 20)).toBe(true);
    expect(isCasualWin("challenge", 20)).toBe(false);
    expect(timeForFloor(1, "casual", "normal")).toBe(Infinity);
  });

  it("challenge breaks every 20 platforms; speed does not", () => {
    expect(shouldLevelBreak("challenge", 20)).toBe(true);
    expect(shouldLevelBreak("challenge", 40)).toBe(true);
    expect(shouldLevelBreak("challenge", 19)).toBe(false);
    expect(shouldLevelBreak("speed", 20)).toBe(false);
    expect(shouldLevelBreak("casual", 20)).toBe(false);
  });

  it("speed uses a tighter timer than challenge", () => {
    expect(timeForFloor(2, "speed", "normal")).toBeLessThan(
      timeForFloor(2, "challenge", "normal"),
    );
    expect(timerProminent("speed")).toBe(true);
    expect(timerProminent("challenge")).toBe(false);
  });
});
