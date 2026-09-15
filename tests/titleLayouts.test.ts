import { describe, expect, it } from "vitest";
import { hitTitle } from "../src/ui/titleLayoutPick";

describe("title hits", () => {
  it("hits start and options in screen space", () => {
    const hits = [
      { kind: "options" as const, x: 200, y: 330, w: 200, h: 42 },
      { kind: "start" as const, x: 200, y: 400, w: 220, h: 52 },
    ];
    expect(hitTitle(hits, 200, 400)?.kind).toBe("start");
    expect(hitTitle(hits, 200, 330)?.kind).toBe("options");
    expect(hitTitle(hits, 10, 400)).toBeNull();
  });
});
