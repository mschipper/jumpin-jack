import Phaser from "phaser";
import { NAVY } from "../constants";

/** Cream rounded card with a hard navy offset shadow. */
export function addPaperCard(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
  radius = 22,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const x = cx - w / 2;
  const y = cy - h / 2;
  g.fillStyle(NAVY, 1);
  g.fillRoundedRect(x + 6, y + 8, w, h, radius);
  g.fillStyle(0xfffdf6, 1);
  g.fillRoundedRect(x, y, w, h, radius);
  return g;
}
