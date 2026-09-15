import { describe, expect, it } from "vitest";
import {
  REST_Y_MAX,
  REST_Y_MIN,
  paceAfterAnswer,
  paceAfterWait,
  restYFromPace,
} from "../src/cameraPace";

describe("cameraPace", () => {
  it("maps 0 to the low rest and 1 to the high rest", () => {
    expect(restYFromPace(0)).toBe(REST_Y_MIN);
    expect(restYFromPace(1)).toBe(REST_Y_MAX);
  });

  it("raises pace on a fast answer and ignores the ground jump", () => {
    expect(paceAfterAnswer(0, 200, true)).toBe(0);
    expect(paceAfterAnswer(0, 200, false)).toBeGreaterThan(0.4);
  });

  it("lowers pace a little on a slow answer", () => {
    const next = paceAfterAnswer(1, 2500, false);
    expect(next).toBeLessThan(1);
    expect(next).toBeGreaterThan(0.9);
    expect(paceAfterAnswer(1, 4000, false)).toBeLessThan(0.9);
  });

  it("settles slowly while waiting", () => {
    expect(paceAfterWait(1, 1)).toBeGreaterThan(0.9);
    expect(paceAfterWait(1, 1)).toBeLessThan(1);
    expect(paceAfterWait(0, 1)).toBe(0);
  });

  it("does not treat a 1s answer as slow", () => {
    expect(paceAfterAnswer(0.8, 1000, false)).toBeGreaterThanOrEqual(0.8);
  });
});
