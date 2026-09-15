import Phaser from "phaser";
import { CREAM, NAVY, PLAY_COLUMN, SKY_BOT, SKY_TOP } from "../constants";
import { wrapX } from "./skyMath";

type Cloud = {
  g: Phaser.GameObjects.Graphics;
  vx: number;
  parallax: number;
  pad: number;
};

type Critter = {
  root: Phaser.GameObjects.Container;
  vx: number;
};

export class Sky {
  private readonly scene: Phaser.Scene;
  private readonly backdrop: Phaser.GameObjects.Graphics;
  private readonly clouds: Cloud[] = [];
  private readonly critters: Critter[] = [];
  private lastCam = 0;
  private flyIn = 2800;
  private readonly withCritters: boolean;

  constructor(scene: Phaser.Scene, opts?: { critters?: boolean }) {
    this.scene = scene;
    this.withCritters = opts?.critters !== false;
    this.backdrop = scene.add.graphics();
    this.backdrop.setScrollFactor(0);
    this.backdrop.setDepth(-20);
    this.paintBackdrop();
    this.seedClouds();
  }

  layout(): void {
    this.paintBackdrop();
    const w = this.scene.scale.width;
    for (const c of this.clouds) {
      c.g.x = Phaser.Math.Clamp(c.g.x, -c.pad, w + c.pad);
    }
  }

  update(dtMs: number, cameraY: number, frozen: boolean): void {
    if (frozen) {
      this.lastCam = cameraY;
      return;
    }
    const dt = dtMs / 1000;
    const climb = this.lastCam - cameraY;
    this.lastCam = cameraY;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    for (const c of this.clouds) {
      c.g.x = wrapX(c.g.x + c.vx * dt, w, c.pad);
      c.g.y += climb * c.parallax;
      if (c.g.y > h + 50) c.g.y = -40 - Math.random() * 40;
      if (c.g.y < -60) c.g.y = h + 30;
    }

    if (!this.withCritters) return;
    this.flyIn -= dtMs;
    if (this.flyIn <= 0) {
      this.spawnCritter();
      this.flyIn = 7000 + Math.random() * 9000;
    }
    for (let i = this.critters.length - 1; i >= 0; i--) {
      const bird = this.critters[i];
      bird.root.x += bird.vx * dt;
      if (bird.root.x < -90 || bird.root.x > w + 90) {
        bird.root.destroy();
        this.critters.splice(i, 1);
      }
    }
  }

  private paintBackdrop(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    this.backdrop.clear();
    this.backdrop.fillGradientStyle(SKY_TOP, SKY_TOP, SKY_BOT, SKY_BOT, 1);
    this.backdrop.fillRect(0, 0, w, h);
  }

  private seedClouds(): void {
    for (const c of this.clouds) c.g.destroy();
    this.clouds.length = 0;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const count = w > PLAY_COLUMN + 40 ? 8 : 5;
    for (let i = 0; i < count; i++) {
      const far = i % 2 === 0;
      const g = this.scene.add.graphics();
      const scale = far ? 0.7 + Math.random() * 0.25 : 0.95 + Math.random() * 0.35;
      drawPaperCloud(g, scale, i);
      g.setScrollFactor(0);
      g.setDepth(far ? -12 : -8);
      g.x = Math.random() * w;
      g.y = 40 + Math.random() * (h * 0.62);
      this.clouds.push({
        g,
        vx: (far ? 8 : 16) * (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.5),
        parallax: far ? 0.08 : 0.18,
        pad: 90 * scale,
      });
    }
  }

  private spawnCritter(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const fromLeft = Math.random() < 0.5;
    const wide = w > PLAY_COLUMN + 80;
    const y = wide
      ? 50 + Math.random() * (h * 0.45)
      : 56 + Math.random() * 90;
    const kind = Math.random() < 0.55 ? "bird" : "butterfly";
    const root =
      kind === "bird" ? makePaperBird(this.scene, fromLeft) : makePaperButterfly(this.scene, fromLeft);
    root.setScrollFactor(0);
    root.setDepth(-4);
    root.x = fromLeft ? -70 : w + 70;
    root.y = y;
    const speed = kind === "bird" ? 70 + Math.random() * 30 : 46 + Math.random() * 22;
    this.critters.push({ root, vx: fromLeft ? speed : -speed });
  }
}

function drawPaperCloud(g: Phaser.GameObjects.Graphics, scale: number, seed: number): void {
  const puffs = [
    { dx: 0, dy: 0, rx: 36, ry: 20 },
    { dx: 30, dy: 6, rx: 28, ry: 16 },
    { dx: -28, dy: 8, rx: 24, ry: 15 },
    { dx: 8, dy: -10, rx: 20, ry: 13 },
  ];
  if (seed % 3 === 1) puffs.push({ dx: -10, dy: 12, rx: 18, ry: 11 });
  const ox = 2;
  const oy = 4;
  g.fillStyle(NAVY, 1);
  for (const p of puffs) {
    g.fillEllipse((p.dx + ox) * scale, (p.dy + oy) * scale, p.rx * 2 * scale, p.ry * 2 * scale);
  }
  g.fillStyle(CREAM, 1);
  for (const p of puffs) {
    g.fillEllipse(p.dx * scale, p.dy * scale, p.rx * 2 * scale, p.ry * 2 * scale);
  }
}

function makePaperBird(scene: Phaser.Scene, faceRight: boolean): Phaser.GameObjects.Container {
  const body = scene.add.graphics();
  const wing = scene.add.graphics();
  const draw = (g: Phaser.GameObjects.Graphics, ox: number, oy: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillEllipse(ox, oy, 30, 16);
    g.fillCircle(ox + 12, oy - 4, 7);
    g.fillTriangle(ox + 18, oy - 5, ox + 28, oy - 1, ox + 18, oy + 2);
    g.fillTriangle(ox - 14, oy, ox - 24, oy - 7, ox - 22, oy + 6);
  };
  draw(body, 2, 4, NAVY);
  draw(body, 0, 0, CREAM);
  body.fillStyle(0xe85d4c, 1);
  body.fillTriangle(18, -5, 28, -1, 18, 2);
  wing.fillStyle(NAVY, 1);
  wing.fillEllipse(2, -2, 22, 14);
  wing.fillStyle(0x5aa6e0, 1);
  wing.fillEllipse(0, -4, 20, 12);
  const root = scene.add.container(0, 0, [body, wing]);
  root.setScale(faceRight ? 1 : -1, 1);
  scene.tweens.add({
    targets: wing,
    scaleY: 0.35,
    duration: 180,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  return root;
}

function makePaperButterfly(scene: Phaser.Scene, faceRight: boolean): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  const paint = (ox: number, oy: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillEllipse(ox - 8, oy, 16, 22);
    g.fillEllipse(ox + 8, oy, 16, 22);
  };
  paint(2, 4, NAVY);
  paint(0, 0, 0xffd166);
  g.fillStyle(0xe85d4c, 1);
  g.fillEllipse(-8, -2, 10, 14);
  g.fillEllipse(8, -2, 10, 14);
  g.fillStyle(NAVY, 1);
  g.fillRect(-1.5, -12, 3, 24);
  const root = scene.add.container(0, 0, [g]);
  root.setScale(faceRight ? 1 : -1, 1);
  scene.tweens.add({
    targets: root,
    scaleX: faceRight ? 0.55 : -0.55,
    duration: 220,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  return root;
}
