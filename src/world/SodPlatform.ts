import Phaser from "phaser";
import { NAVY, SHAKE_PX } from "../constants";
import { formatValue } from "../numbers/format";
import type { GameValue } from "../numbers/types";

const W = 176;
const DIRT_H = 52;
const GRASS_H = 16;

export class SodPlatform {
  readonly container: Phaser.GameObjects.Container;
  worldY: number;
  xFrac: number;
  value: GameValue | null;
  dropAt = 0;
  shakeAt = 0;
  shaking = false;
  gone = false;
  private tagText: Phaser.GameObjects.Text;
  private tagBg: Phaser.GameObjects.Rectangle;
  private tagPin: Phaser.GameObjects.Arc;
  private shakeTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    worldY: number,
    xFrac: number,
    value: GameValue | null,
  ) {
    this.worldY = worldY;
    this.xFrac = xFrac;
    this.value = value;

    const g = scene.add.graphics();
    g.fillStyle(0xc9a066, 1);
    g.fillRoundedRect(-W / 2, GRASS_H - 4, W, DIRT_H, 8);
    g.lineStyle(0, NAVY, 1);
    g.fillStyle(0x6fbf3b, 1);
    g.fillRoundedRect(-W / 2 - 2, 0, W + 4, GRASS_H + 6, 8);
    for (let i = 0; i < 5; i++) {
      const cx = -W / 2 + 18 + i * 36;
      g.fillStyle(i % 2 ? 0x62b332 : 0x78c94a, 1);
      g.fillCircle(cx, GRASS_H + 2, 10);
    }

    this.tagBg = scene.add.rectangle(0, GRASS_H + 26, 88, 36, 0xf3e2b8);
    this.tagBg.setStrokeStyle(0, NAVY);
    this.tagPin = scene.add.circle(0, GRASS_H + 8, 5, 0xe85d4c);
    this.tagText = scene.add
      .text(0, GRASS_H + 26, value ? formatValue(value) : "", {
        fontFamily: "Nunito, sans-serif",
        fontSize: value && formatValue(value).length > 5 ? "16px" : "22px",
        color: "#16324f",
        fontStyle: "800",
      })
      .setOrigin(0.5);

    const shadow = scene.add.rectangle(6, GRASS_H + DIRT_H / 2 + 6, W, DIRT_H + 4, NAVY, 1);

    this.container = scene.add.container(x, worldY, [
      shadow,
      g,
      this.tagBg,
      this.tagPin,
      this.tagText,
    ]);
    this.container.setDepth(8);
    this.container.setSize(W, DIRT_H + GRASS_H);
    if (value) {
      this.container.setInteractive(
        new Phaser.Geom.Rectangle(-W / 2, 0, W, DIRT_H + GRASS_H),
        Phaser.Geom.Rectangle.Contains,
      );
    }
    this.setTagVisible(Boolean(value));
  }

  setValue(value: GameValue | null): void {
    this.value = value;
    if (!value) {
      this.tagText.setText("");
      this.setTagVisible(false);
      return;
    }
    const label = formatValue(value);
    this.tagText.setText(label);
    this.tagText.setFontSize(label.length > 5 ? 16 : 22);
    this.setTagVisible(true);
  }

  setTagVisible(on: boolean): void {
    this.tagBg.setVisible(on);
    this.tagPin.setVisible(on);
    this.tagText.setVisible(on);
  }

  startShake(scene: Phaser.Scene): void {
    if (this.shaking || this.gone) return;
    this.shaking = true;
    this.shakeTween = scene.tweens.add({
      targets: this.container,
      x: this.container.x + SHAKE_PX,
      duration: 50,
      yoyo: true,
      repeat: -1,
    });
  }

  vanish(scene: Phaser.Scene): void {
    if (this.gone) return;
    this.gone = true;
    this.shakeTween?.stop();
    this.container.disableInteractive();
    scene.tweens.add({
      targets: this.container,
      alpha: 0,
      scale: 0.86,
      duration: 220,
      onComplete: () => this.container.setVisible(false),
    });
  }

  crumble(scene: Phaser.Scene): void {
    if (this.gone) return;
    this.gone = true;
    this.shakeTween?.stop();
    this.container.disableInteractive();
    scene.tweens.add({
      targets: this.container,
      y: this.container.y + 110,
      angle: 16,
      alpha: 0,
      duration: 450,
      ease: "Cubic.easeIn",
      onComplete: () => this.container.setVisible(false),
    });
  }

  destroy(): void {
    this.shakeTween?.stop();
    this.container.destroy();
  }
}
