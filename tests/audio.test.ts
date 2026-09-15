import { describe, expect, it } from "vitest";
import { SOUND_IDS } from "../src/audio/SoundManager";
import { wrapX } from "../src/world/skyMath";

describe("SOUND_IDS", () => {
  it("lists every shipped clip", () => {
    expect([...SOUND_IDS].sort()).toEqual(
      [
        "button_press",
        "correct",
        "crumble",
        "fail",
        "game_over",
        "level_complete",
        "music",
        "new_high_score",
      ].sort(),
    );
  });
});

describe("wrapX", () => {
  it("wraps past the right and left pad", () => {
    expect(wrapX(520, 400, 80)).toBe(-40);
    expect(wrapX(-90, 400, 80)).toBe(470);
    expect(wrapX(200, 400, 80)).toBe(200);
  });
});
