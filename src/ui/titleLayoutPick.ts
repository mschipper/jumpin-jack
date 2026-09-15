export type TitleHit = {
  kind: "start" | "options";
  x: number;
  y: number;
  w: number;
  h: number;
};

export function hitTitle(hits: TitleHit[], screenX: number, screenY: number): TitleHit | null {
  for (let i = hits.length - 1; i >= 0; i--) {
    const h = hits[i];
    if (Math.abs(screenX - h.x) <= h.w / 2 && Math.abs(screenY - h.y) <= h.h / 2) return h;
  }
  return null;
}
