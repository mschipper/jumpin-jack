import Phaser from "phaser";
import { CREAM } from "../constants";

const DIRT = [0xc9a066, 0xa9844f, 0xb8925c];
const GRASS = [0x6fbf3b, 0x62b332, 0x78c94a];

/** Kraft/grass scraps that tumble off a crumbling sod pad. */
export function spawnCrumbleDebris(scene: Phaser.Scene, x: number, y: number): void {
  const colors = [...DIRT, ...DIRT, ...GRASS];
  for (let i = 0; i < 6; i++) {
    const w = 8 + Math.floor(Math.random() * 8);
    const h = 6 + Math.floor(Math.random() * 6);
    const bit = scene.add.rectangle(x + (Math.random() - 0.5) * 70, y + 8 + Math.random() * 18, w, h, colors[i]);
    bit.setDepth(12);
    bit.setAngle((Math.random() - 0.5) * 40);
    scene.tweens.add({
      targets: bit,
      x: bit.x + (Math.random() - 0.5) * 90,
      y: bit.y + 90 + Math.random() * 50,
      angle: bit.angle + (Math.random() < 0.5 ? -70 : 70),
      alpha: 0,
      duration: 380 + Math.random() * 160,
      ease: "Cubic.easeIn",
      onComplete: () => bit.destroy(),
    });
  }
}

/** Small cream paper puffs at the adventurer's feet on land. */
export function spawnLandPuff(scene: Phaser.Scene, x: number, y: number): void {
  for (let i = 0; i < 3; i++) {
    const side = i === 0 ? 0 : i === 1 ? -1 : 1;
    const puff = scene.add.ellipse(x + side * 10, y + 4, 16, 9, CREAM, 1);
    puff.setDepth(11);
    puff.setAlpha(0.9);
    scene.tweens.add({
      targets: puff,
      x: puff.x + side * 22,
      y: puff.y + 8,
      scaleX: 1.35,
      scaleY: 0.55,
      alpha: 0,
      duration: 240,
      ease: "Quad.easeOut",
      onComplete: () => puff.destroy(),
    });
  }
}
