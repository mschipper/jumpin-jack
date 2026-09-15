import { describe, expect, it } from "vitest";
import {
  LEVEL_BREAK_MS,
  LEVEL_BREAK_READY,
  levelBreakHeadline,
  levelBreakLevelLine,
} from "../src/levelBreak";
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

  it("names the Challenge rest banner", () => {
    expect(levelBreakHeadline()).toBe("Level Complete!");
    expect(levelBreakLevelLine(2)).toBe("Level 2");
    expect(LEVEL_BREAK_READY).toBe("JUMP WHEN READY");
    expect(LEVEL_BREAK_MS).toBeGreaterThanOrEqual(1200);
  });

  it("speed uses a tighter timer than challenge", () => {
    expect(timeForFloor(2, "speed", "normal")).toBeLessThan(
      timeForFloor(2, "challenge", "normal"),
    );
    expect(timerProminent("speed")).toBe(true);
    expect(timerProminent("challenge")).toBe(false);
  });
});
