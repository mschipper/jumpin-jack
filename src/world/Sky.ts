import Phaser from "phaser";
import { CREAM, NAVY, PLAY_COLUMN, SKY_BOT, SKY_TOP } from "../constants";
import { wrapX } from "./skyMath";

type Drift = {
  obj: Phaser.GameObjects.GameObject & { x: number; y: number };
  vx: number;
  parallax: number;
  pad: number;
};

type Flyer = {
  root: Phaser.GameObjects.Container;
  vx: number;
};

export class Sky {
  private readonly scene: Phaser.Scene;
  private readonly backdrop: Phaser.GameObjects.Graphics;
  private readonly drifts: Drift[] = [];
  private readonly flyers: Flyer[] = [];
  private lastCam = 0;
  private planeIn = 3500;
  private flockIn = 5500;
  private flutterIn = 9000;
  private readonly withCritters: boolean;

  constructor(scene: Phaser.Scene, opts?: { critters?: boolean }) {
    this.scene = scene;
    this.withCritters = opts?.critters !== false;
    this.backdrop = scene.add.graphics();
    this.backdrop.setScrollFactor(0);
    this.backdrop.setDepth(-20);
    this.paintBackdrop();
    this.seedClouds();
    if (this.withCritters) this.seedBalloon();
  }

  layout(): void {
    this.paintBackdrop();
    const w = this.scene.scale.width;
    for (const d of this.drifts) {
      d.obj.x = Phaser.Math.Clamp(d.obj.x, -d.pad, w + d.pad);
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

    for (const d of this.drifts) {
      d.obj.x = wrapX(d.obj.x + d.vx * dt, w, d.pad);
      d.obj.y += climb * d.parallax;
      if (d.obj.y > h + 70) d.obj.y = -50 - Math.random() * 40;
      if (d.obj.y < -80) d.obj.y = h + 40;
    }

    if (!this.withCritters) return;
    this.planeIn -= dtMs;
    this.flockIn -= dtMs;
    this.flutterIn -= dtMs;
    if (this.planeIn <= 0) {
      this.spawnPlane();
      this.planeIn = 12000 + Math.random() * 9000;
    }
    if (this.flockIn <= 0) {
      this.spawnFlock();
      this.flockIn = 9000 + Math.random() * 8000;
    }
    if (this.flutterIn <= 0) {
      this.spawnFlutter();
      this.flutterIn = 8000 + Math.random() * 9000;
    }

    for (let i = this.flyers.length - 1; i >= 0; i--) {
      const f = this.flyers[i];
      f.root.x += f.vx * dt;
      if (f.root.x < -160 || f.root.x > w + 160) {
        f.root.destroy();
        this.flyers.splice(i, 1);
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
    for (const d of this.drifts) d.obj.destroy();
    this.drifts.length = 0;
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const count = w > PLAY_COLUMN + 40 ? 7 : 4;
    for (let i = 0; i < count; i++) {
      const far = i % 2 === 0;
      const scale = far ? 0.75 + Math.random() * 0.3 : 1.05 + Math.random() * 0.35;
      this.addCloud(scale, i, far, Math.random() * w, 40 + Math.random() * (h * 0.58));
    }
    this.addCloud(2.15, 11, true, w * 0.18, h * 0.2);
    this.addCloud(1.85, 12, false, w * 0.72, h * 0.38);
    if (w > PLAY_COLUMN + 40) this.addCloud(2.35, 13, true, w * 0.88, h * 0.14);
  }

  private addCloud(scale: number, seed: number, far: boolean, x: number, y: number): void {
    const g = this.scene.add.graphics();
    drawPaperCloud(g, scale, seed);
    g.setScrollFactor(0);
    g.setDepth(far ? -14 : -8);
    g.x = x;
    g.y = y;
    this.drifts.push({
      obj: g,
      vx: (far ? 7 : 15) * (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.45),
      parallax: far ? 0.07 : 0.18,
      pad: 100 * scale,
    });
  }

  private seedBalloon(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const root = makeHotAirBalloon(this.scene);
    root.setScrollFactor(0);
    root.setDepth(-6);
    root.x = w * (0.2 + Math.random() * 0.6);
    root.y = 90 + Math.random() * (h * 0.28);
    this.drifts.push({
      obj: root,
      vx: (8 + Math.random() * 6) * (Math.random() < 0.5 ? -1 : 1),
      parallax: 0.12,
      pad: 50,
    });
  }

  private spawnPlane(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const fromLeft = Math.random() < 0.5;
    const root = makeBiplane(this.scene, fromLeft);
    root.setScrollFactor(0);
    root.setDepth(-5);
    root.x = fromLeft ? -110 : w + 110;
    root.y = 64 + Math.random() * (h * 0.32);
    const speed = 110 + Math.random() * 40;
    this.flyers.push({ root, vx: fromLeft ? speed : -speed });
  }

  private spawnFlock(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const fromLeft = Math.random() < 0.5;
    const root = makeFlock(this.scene, fromLeft);
    root.setScrollFactor(0);
    root.setDepth(-4);
    root.x = fromLeft ? -90 : w + 90;
    root.y = 70 + Math.random() * (h * 0.28);
    const speed = 78 + Math.random() * 24;
    this.flyers.push({ root, vx: fromLeft ? speed : -speed });
  }

  private spawnFlutter(): void {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;
    const fromLeft = Math.random() < 0.5;
    const wide = w > PLAY_COLUMN + 80;
    const y = wide ? 50 + Math.random() * (h * 0.4) : 56 + Math.random() * 90;
    const kind = Math.random() < 0.45 ? "bird" : "butterfly";
    const root =
      kind === "bird" ? makePaperBird(this.scene, fromLeft) : makePaperButterfly(this.scene, fromLeft);
    root.setScrollFactor(0);
    root.setDepth(-4);
    root.x = fromLeft ? -70 : w + 70;
    root.y = y;
    const speed = kind === "bird" ? 70 + Math.random() * 30 : 46 + Math.random() * 22;
    this.flyers.push({ root, vx: fromLeft ? speed : -speed });
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

function makeFlock(scene: Phaser.Scene, faceRight: boolean): Phaser.GameObjects.Container {
  const offsets = [
    [0, 0],
    [-22, -14],
    [-22, 14],
    [-44, -26],
    [-44, 26],
    [-38, 0],
  ];
  const birds = offsets.map(([x, y]) => {
    const b = makePaperBird(scene, true);
    b.setScale(0.72);
    b.x = x;
    b.y = y;
    return b;
  });
  const root = scene.add.container(0, 0, birds);
  root.setScale(faceRight ? 1 : -1, 1);
  return root;
}

function makeBiplane(scene: Phaser.Scene, faceRight: boolean): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  const paint = (ox: number, oy: number, color: number) => {
    g.fillStyle(color, 1);
    g.fillRoundedRect(ox - 22, oy - 6, 44, 12, 4);
    g.fillRect(ox - 20, oy - 18, 46, 8);
    g.fillRect(ox - 18, oy + 6, 40, 6);
    g.fillTriangle(ox - 22, oy - 6, ox - 34, oy - 18, ox - 22, oy + 4);
    g.fillCircle(ox + 8, oy - 10, 5);
    g.fillCircle(ox - 6, oy + 14, 4);
    g.fillCircle(ox + 10, oy + 14, 4);
  };
  paint(2, 4, NAVY);
  paint(0, 0, 0xe23c3c);
  g.fillStyle(CREAM, 1);
  g.fillRect(-18, -16, 42, 3);
  g.fillCircle(8, -10, 4);
  const prop = scene.add.rectangle(24, 0, 4, 22, CREAM);
  const root = scene.add.container(0, 0, [g, prop]);
  root.setScale(faceRight ? 1 : -1, 1);
  scene.tweens.add({
    targets: prop,
    angle: 360,
    duration: 90,
    repeat: -1,
  });
  return root;
}

function makeHotAirBalloon(scene: Phaser.Scene): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  g.fillStyle(NAVY, 1);
  g.fillEllipse(2, 4, 52, 64);
  g.fillRect(-8, 40, 18, 14);
  g.fillStyle(0xe85d4c, 1);
  g.fillEllipse(0, 0, 52, 64);
  g.fillStyle(0xffd166, 1);
  g.fillEllipse(0, 4, 36, 18);
  g.fillStyle(0xc9a066, 1);
  g.fillRect(-10, 36, 20, 14);
  g.lineStyle(2, NAVY, 1);
  g.lineBetween(-12, 24, -8, 36);
  g.lineBetween(12, 24, 8, 36);
  g.lineBetween(0, 28, 0, 36);
  const root = scene.add.container(0, 0, [g]);
  scene.tweens.add({
    targets: g,
    y: 10,
    duration: 2200,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  return root;
}
