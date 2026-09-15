import Phaser from "phaser";
import { GOLD, NAVY, PLAY_COLUMN } from "../constants";
import { columnLeft } from "../world/column";
import type { PlayMode } from "../numbers/types";

type Pill = {
  bg: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  value: Phaser.GameObjects.Text;
  width: number;
};

export class Hud {
  readonly root: Phaser.GameObjects.Container;
  private scorePill: Pill;
  private levelPill: Pill;
  private bestPill: Pill;
  private timerFill: Phaser.GameObjects.Rectangle;
  private timerBg: Phaser.GameObjects.Rectangle;
  private timerSec: Phaser.GameObjects.Text;
  private hint: Phaser.GameObjects.Text;
  private pauseBg: Phaser.GameObjects.Arc;
  private pauseX = PLAY_COLUMN - 24;
  private showLv = true;

  constructor(scene: Phaser.Scene, onPause: () => void) {
    const left = columnLeft(scene);
    this.levelPill = makePill(scene, "Level", "1");
    this.scorePill = makePill(scene, "Score", "0");
    this.bestPill = makePill(scene, "Best", "0");

    this.pauseBg = scene.add.circle(this.pauseX, 0, 18, GOLD);
    const bar1 = scene.add.rectangle(this.pauseX - 5, 0, 4, 14, NAVY);
    const bar2 = scene.add.rectangle(this.pauseX + 5, 0, 4, 14, NAVY);
    this.pauseBg.setInteractive({ useHandCursor: true });
    this.pauseBg.on("pointerup", onPause);

    this.timerBg = scene.add.rectangle(14, 38, PLAY_COLUMN - 28, 10, NAVY, 0.28).setOrigin(0, 0.5);
    this.timerFill = scene.add.rectangle(14, 38, PLAY_COLUMN - 28, 10, 0x06d6a0).setOrigin(0, 0.5);
    this.timerSec = scene.add
      .text(PLAY_COLUMN - 18, 38, "", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "12px",
        color: "#fff8e7",
      })
      .setOrigin(1, 0.5)
      .setVisible(false);

    this.hint = scene.add
      .text(PLAY_COLUMN / 2, 54, "", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "12px",
        color: "#ffffff",
        fontStyle: "700",
      })
      .setOrigin(0.5, 0)
      .setVisible(false);

    this.root = scene.add.container(left, 28, [
      this.levelPill.bg, this.levelPill.label, this.levelPill.value,
      this.scorePill.bg, this.scorePill.label, this.scorePill.value,
      this.bestPill.bg, this.bestPill.label, this.bestPill.value,
      this.pauseBg, bar1, bar2,
      this.timerBg, this.timerFill, this.timerSec, this.hint,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(40);
    this.layoutPills();
  }

  layout(scene: Phaser.Scene): void {
    this.root.x = columnLeft(scene);
  }

  hitPause(screenX: number, screenY: number): boolean {
    const dx = screenX - (this.root.x + this.pauseX);
    const dy = screenY - this.root.y;
    return dx * dx + dy * dy <= 24 * 24;
  }

  set(score: number, level: number, best: number, mode: PlayMode): void {
    this.showLv = mode === "challenge";
    setPillValue(this.scorePill, String(score));
    setPillValue(this.levelPill, String(level));
    setPillValue(this.bestPill, String(best));
    this.levelPill.bg.setVisible(this.showLv);
    this.levelPill.label.setVisible(this.showLv);
    this.levelPill.value.setVisible(this.showLv);
    this.layoutPills();
  }

  setHint(text: string): void {
    this.hint.setText(text);
    this.hint.setVisible(text.length > 0);
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

  private layoutPills(): void {
    let x = 0;
    const gap = 8;
    if (this.showLv) {
      placePill(this.levelPill, x);
      x += this.levelPill.width + gap;
    }
    placePill(this.scorePill, x);
    x += this.scorePill.width + gap;
    placePill(this.bestPill, x);
  }
}

function makePill(scene: Phaser.Scene, label: string, value: string): Pill {
  const cream = "#fff8e7";
  const gold = "#ffd166";
  const bg = scene.add.rectangle(0, 0, 100, 36, NAVY, 0.72).setStrokeStyle(2, 0xffffff, 0.28);
  bg.setOrigin(0, 0.5);
  const t = scene.add
    .text(0, 0, label, {
      fontFamily: "Nunito, sans-serif",
      fontSize: "13px",
      color: cream,
    })
    .setOrigin(0, 0.5);
  const v = scene.add
    .text(0, 0, value, {
      fontFamily: "Nunito, sans-serif",
      fontSize: "18px",
      color: gold,
      fontStyle: "800",
    })
    .setOrigin(0, 0.5);
  const pill: Pill = { bg, label: t, value: v, width: 100 };
  syncPillWidth(pill);
  return pill;
}

function setPillValue(pill: Pill, value: string): void {
  pill.value.setText(value);
  syncPillWidth(pill);
}

function syncPillWidth(pill: Pill): void {
  const pad = 12;
  const inner = 6;
  pill.width = Math.ceil(pad + pill.label.width + inner + pill.value.width + pad);
  pill.bg.setSize(pill.width, 36);
}

function placePill(pill: Pill, x: number): void {
  const pad = 12;
  const inner = 6;
  pill.bg.setPosition(x, 0);
  pill.label.setPosition(x + pad, 0);
  pill.value.setPosition(x + pad + pill.label.width + inner, 0);
}
