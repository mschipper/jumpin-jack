import Phaser from "phaser";
import { GOLD, NAVY, PLAY_COLUMN } from "../constants";
import { columnLeft } from "../world/column";
import type { PlayMode } from "../numbers/types";

export class Hud {
  readonly root: Phaser.GameObjects.Container;
  private platformsText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;
  private bestText: Phaser.GameObjects.Text;
  private timerFill: Phaser.GameObjects.Rectangle;
  private timerBg: Phaser.GameObjects.Rectangle;
  private timerSec: Phaser.GameObjects.Text;
  private hint: Phaser.GameObjects.Text;
  private lvBg: Phaser.GameObjects.Rectangle;
  private lvLabel: Phaser.GameObjects.Text;
  private pauseHit: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, onPause: () => void) {
    const left = columnLeft(scene);
    const cream = "#fff8e7";
    const gold = "#ffd166";

    const pill = (x: number, label: string, value: string) => {
      const bg = scene.add.rectangle(x, 0, 110, 36, NAVY, 0.72).setStrokeStyle(2, 0xffffff, 0.28);
      bg.setOrigin(0, 0.5);
      const t = scene.add
        .text(x + 12, 0, `${label} `, {
          fontFamily: "Nunito, sans-serif",
          fontSize: "13px",
          color: cream,
        })
        .setOrigin(0, 0.5);
      const v = scene.add
        .text(x + 12 + t.width, 0, value, {
          fontFamily: "Nunito, sans-serif",
          fontSize: "18px",
          color: gold,
          fontStyle: "800",
        })
        .setOrigin(0, 0.5);
      return { bg, t, v };
    };

    const p = pill(0, "Platforms", "0");
    const lv = pill(118, "Lv", "1");
    const b = pill(210, "Best", "0");
    this.platformsText = p.v;
    this.levelText = lv.v;
    this.bestText = b.v;
    this.lvBg = lv.bg;
    this.lvLabel = lv.t;

    const pauseBg = scene.add.circle(PLAY_COLUMN - 48, 0, 18, GOLD);
    const bar1 = scene.add.rectangle(PLAY_COLUMN - 53, 0, 4, 14, NAVY);
    const bar2 = scene.add.rectangle(PLAY_COLUMN - 43, 0, 4, 14, NAVY);
    this.pauseHit = scene.add.circle(PLAY_COLUMN - 48, 0, 20, 0x000000, 0);
    this.pauseHit.setInteractive({ useHandCursor: true });
    this.pauseHit.on("pointerup", onPause);

    this.timerBg = scene.add.rectangle(14, 32, PLAY_COLUMN - 28, 10, NAVY, 0.28).setOrigin(0, 0.5);
    this.timerFill = scene.add.rectangle(14, 32, PLAY_COLUMN - 28, 10, 0x06d6a0).setOrigin(0, 0.5);
    this.timerSec = scene.add
      .text(PLAY_COLUMN - 18, 32, "", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "12px",
        color: "#fff8e7",
      })
      .setOrigin(1, 0.5)
      .setVisible(false);

    this.hint = scene.add
      .text(PLAY_COLUMN / 2, 50, "JUMP TO THE BIGGER NUMBER", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "12px",
        color: "#ffffff",
        fontStyle: "700",
      })
      .setOrigin(0.5, 0);

    this.root = scene.add.container(left, 28, [
      p.bg, p.t, p.v, lv.bg, lv.t, lv.v, b.bg, b.t, b.v,
      pauseBg, bar1, bar2, this.pauseHit,
      this.timerBg, this.timerFill, this.timerSec, this.hint,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(40);
  }

  layout(scene: Phaser.Scene): void {
    this.root.x = columnLeft(scene);
  }

  set(score: number, level: number, best: number, mode: PlayMode): void {
    this.platformsText.setText(String(score));
    this.levelText.setText(String(level));
    this.bestText.setText(String(best));
    const showLv = mode === "challenge";
    this.levelText.setVisible(showLv);
    this.lvBg.setVisible(showLv);
    this.lvLabel.setVisible(showLv);
  }

  setHint(text: string): void {
    this.hint.setText(text);
  }

  setTimer(pct: number, mode: PlayMode, remainingMs?: number): void {
    const timed = mode !== "casual";
    const speed = mode === "speed";
    this.timerBg.setVisible(timed);
    this.timerFill.setVisible(timed);
    const barH = speed ? 16 : 10;
    this.timerBg.setSize(PLAY_COLUMN - 28, barH);
    this.timerFill.height = barH;
    const w = Math.max(0, (PLAY_COLUMN - 28) * Phaser.Math.Clamp(pct, 0, 1));
    this.timerFill.width = w;
    const color = pct < 0.28 ? 0xef476f : pct < 0.55 ? GOLD : 0x06d6a0;
    this.timerFill.setFillStyle(color);
    if (speed && timed && remainingMs !== undefined && Number.isFinite(remainingMs)) {
      this.timerSec.setVisible(true);
      this.timerSec.setText(`${Math.max(0, remainingMs / 1000).toFixed(1)}s`);
    } else {
      this.timerSec.setVisible(false);
    }
  }
}
