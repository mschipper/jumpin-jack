import { describe, expect, it } from "vitest";
import { bestKey } from "../src/storage/best";

describe("bestKey", () => {
  it("is unique per full config", () => {
    const a = bestKey({ numbers: "whole", difficulty: "normal", mode: "challenge" });
    const b = bestKey({ numbers: "whole", difficulty: "hard", mode: "challenge" });
    const c = bestKey({ numbers: "fraction", difficulty: "normal", mode: "challenge" });
    expect(a).toBe("jumpin-jack-best:whole:normal:challenge");
    expect(a).not.toBe(b);
    expect(a).not.toBe(c);
  });
});
