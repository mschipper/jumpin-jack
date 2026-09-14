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

  it("lowers pace on a slow answer", () => {
    expect(paceAfterAnswer(1, 3000, false)).toBeLessThan(0.8);
  });

  it("settles toward 0 while waiting", () => {
    expect(paceAfterWait(1, 1)).toBeLessThan(1);
    expect(paceAfterWait(0, 1)).toBe(0);
  });
});
