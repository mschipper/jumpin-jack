import Phaser from "phaser";
import {
  GOLD,
  NAVY,
  SHADOW_ALPHA,
  SHADOW_COLOR,
  SHADOW_OFFSET_X,
  SHADOW_OFFSET_Y,
} from "../constants";
import { type TitleHit } from "./titleLayoutPick";

export type { TitleHit } from "./titleLayoutPick";
export { hitTitle } from "./titleLayoutPick";

const HOWTO = "Jump to the bigger number\nbefore the platform gives way.";
const CONTROLS = "Tap a platform or use keyboard arrows";
const UI = 20;

export interface TitleKit {
  scene: Phaser.Scene;
  x: number;
  hasOptions: boolean;
  add<T extends Phaser.GameObjects.GameObject>(obj: T): T;
  hit(h: TitleHit): void;
}

export function drawTitleLayout(kit: TitleKit): void {
  const gTop = drawGround(kit);
  drawPoster(kit, gTop);
}

function drawGround(kit: TitleKit): number {
  const { scene } = kit;
  const gTop = scene.scale.height - 110;
  const dirt = kit.add(scene.add.graphics());
  dirt.setDepth(8);
  dirt.fillStyle(0xc9a066, 1);
  dirt.fillRect(0, gTop + 16, scene.scale.width, 200);
  dirt.fillStyle(0x6fbf3b, 1);
  dirt.fillRect(0, gTop, scene.scale.width, 22);
  for (let gx = 16; gx < scene.scale.width; gx += 44) {
    dirt.fillStyle(gx % 88 ? 0x62b332 : 0x78c94a, 1);
    dirt.fillCircle(gx, gTop + 18, 11);
  }
  return gTop;
}

function drawHero(kit: TitleKit, x: number, feetY: number): void {
  const { scene } = kit;
  const shadow = kit.add(scene.add.sprite(x + SHADOW_OFFSET_X, feetY + SHADOW_OFFSET_Y, "adventurer", 0));
  shadow.setOrigin(0.5, 1).setScale(1.1).setTint(SHADOW_COLOR).setAlpha(SHADOW_ALPHA).setDepth(8);
  const hero = kit.add(scene.add.sprite(x, feetY, "adventurer", 0));
  hero.setOrigin(0.5, 1).setScale(1.1).setDepth(9);
  hero.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  shadow.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

function drawPoster(kit: TitleKit, gTop: number): void {
  const { x, hasOptions } = kit;
  const skyTop = 48;
  const skyBot = gTop - 132;
  const span = Math.max(280, skyBot - skyTop);
  const at = (p: number) => skyTop + span * p;

  addWordmark(kit, x, at(0.18), 62);
  addManilaTag(kit, x, at(0.46), HOWTO, CONTROLS);
  drawHero(kit, x, gTop);

  const startY = at(0.84);
  if (hasOptions) {
    addToy(kit, x, startY - 62, 200, 42, NAVY, "Game options", "#fff8e7", 16, "options");
  }
  addToy(kit, x, startY, 228, 52, GOLD, "Start Climb", "#1d3557", 22, "start");
}

function addWordmark(kit: TitleKit, x: number, y: number, size: number): void {
  const { scene } = kit;
  const text = "Jumpin'\nJack";
  const style = {
    fontFamily: "Titan One, sans-serif",
    fontSize: `${size}px`,
    align: "center" as const,
    lineSpacing: -6,
  };
  kit.add(
    scene.add
      .text(x + 4, y + 4, text, { ...style, color: "#16324f" })
      .setOrigin(0.5)
      .setDepth(UI),
  );
  kit.add(
    scene.add
      .text(x, y, text, { ...style, color: "#ffd166" })
      .setOrigin(0.5)
      .setDepth(UI),
  );
}

function addManilaTag(kit: TitleKit, x: number, y: number, title: string, sub: string): void {
  const { scene } = kit;
  const w = 360;
  const h = 108;
  const g = kit.add(scene.add.graphics()).setDepth(UI);
  g.fillStyle(NAVY, 1);
  g.fillRoundedRect(x - w / 2 + 5, y - h / 2 + 6, w, h, 12);
  g.fillStyle(0xf3e2b8, 1);
  g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
  kit.add(scene.add.circle(x, y - h / 2 + 10, 8, 0xe85d4c).setDepth(UI));
  kit.add(
    scene.add
      .text(x, y - 8, title, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "18px",
        color: "#16324f",
        align: "center",
        lineSpacing: 4,
      })
      .setOrigin(0.5)
      .setDepth(UI),
  );
  kit.add(
    scene.add
      .text(x, y + 32, sub, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#5a6d80",
      })
      .setOrigin(0.5)
      .setDepth(UI),
  );
}

function addToy(
  kit: TitleKit,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
  label: string,
  color: string,
  size: number,
  kind: "start" | "options",
): void {
  const { scene } = kit;
  kit.add(scene.add.rectangle(x, y, w, h, fill, fill === NAVY ? 0.88 : 1).setDepth(UI));
  kit.add(
    scene.add
      .text(x, y, label, {
        fontFamily: kind === "start" ? "Fredoka, sans-serif" : "Nunito, sans-serif",
        fontSize: `${size}px`,
        color,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(UI),
  );
  kit.hit({ kind, x, y, w, h });
}
