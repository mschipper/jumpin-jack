import Phaser from "phaser";
import { soundsOf } from "../audio/SoundManager";
import { GOLD, NAVY, PLAY_COLUMN } from "../constants";
import type { Difficulty, NumberKind, PlayMode, PartialConfig } from "../numbers/types";
import { columnLeft } from "../world/column";
import { Sky } from "../world/Sky";

export class MenuScene extends Phaser.Scene {
  private numbers: NumberKind = "whole";
  private difficulty: Difficulty = "normal";
  private mode: PlayMode = "challenge";
  private sky!: Sky;

  constructor() {
    super("menu");
  }

  create(): void {
    const partial = (this.registry.get("partialConfig") as PartialConfig | undefined) ?? {};
    this.numbers = partial.numbers ?? "whole";
    this.difficulty = partial.difficulty ?? "normal";
    this.mode = partial.mode ?? "challenge";

    this.sky = new Sky(this);
    this.scale.on("resize", this.onResize, this);
    this.events.once("shutdown", () => this.scale.off("resize", this.onResize, this));

    const x = columnLeft(this) + PLAY_COLUMN / 2;
    this.add
      .text(x, 70, "Jumpin' Jack", {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "36px",
        color: "#fff8e7",
      })
      .setOrigin(0.5);
    this.add
      .text(x, 118, "Jump to the bigger number\nbefore the pad gives way.", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#fff8e7",
        align: "center",
      })
      .setOrigin(0.5);

    const miss = {
      numbers: !partial.numbers,
      difficulty: !partial.difficulty,
      mode: !partial.mode,
    };
    let y = 170;
    if (miss.numbers) {
      y = this.row(x, y, "NUMBERS", ["whole", "decimal", "fraction"], this.numbers, (v) => {
        this.numbers = v as NumberKind;
      });
    }
    if (miss.difficulty) {
      y = this.row(x, y, "DIFFICULTY", ["easy", "normal", "hard"], this.difficulty, (v) => {
        this.difficulty = v as Difficulty;
      });
    }
    if (miss.mode) {
      y = this.row(x, y, "MODE", ["casual", "challenge", "speed"], this.mode, (v) => {
        this.mode = v as PlayMode;
      });
    }

    const start = this.add.rectangle(x, y + 24, 220, 52, GOLD).setInteractive({ useHandCursor: true });
    this.add
      .text(x, y + 24, "Start Climb", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "22px",
        color: "#1d3557",
      })
      .setOrigin(0.5);
    start.on("pointerup", () => {
      soundsOf(this).play("button_press");
      this.begin();
    });

    this.add
      .text(x, y + 70, "Tap a platform  ·  arrows / A D", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "12px",
        color: "#fff8e7",
      })
      .setOrigin(0.5);

    const gTop = this.scale.height - 110;
    const dirt = this.add.graphics();
    dirt.fillStyle(0xc9a066, 1);
    dirt.fillRect(0, gTop + 16, this.scale.width, 200);
    dirt.fillStyle(0x6fbf3b, 1);
    dirt.fillRect(0, gTop, this.scale.width, 22);
    const hero = this.add.sprite(x, gTop, "adventurer", 0).setOrigin(0.5, 1);
    hero.setScale(1);
    hero.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  private row(
    x: number,
    y: number,
    label: string,
    options: string[],
    current: string,
    onPick: (v: string) => void,
  ): number {
    this.add
      .text(x, y, label, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "12px",
        color: "#fff8e7",
        letterSpacing: 3,
      })
      .setOrigin(0.5);
    const buttons: { bg: Phaser.GameObjects.Rectangle; key: string }[] = [];
    const gap = 118;
    const startX = x - ((options.length - 1) * gap) / 2;
    options.forEach((opt, i) => {
      const on = opt === current;
      const bg = this.add
        .rectangle(startX + i * gap, y + 32, 108, 44, on ? GOLD : NAVY, on ? 1 : 0.72)
        .setInteractive({ useHandCursor: true });
      this.add
        .text(startX + i * gap, y + 32, labelFor(opt), {
          fontFamily: "Nunito, sans-serif",
          fontSize: "13px",
          color: on ? "#1d3557" : "#fff8e7",
        })
        .setOrigin(0.5);
      buttons.push({ bg, key: opt });
      bg.on("pointerup", () => {
        soundsOf(this).play("button_press");
        onPick(opt);
        for (const b of buttons) {
          const sel = b.key === opt;
          b.bg.setFillStyle(sel ? GOLD : NAVY, sel ? 1 : 0.72);
        }
      });
    });
    return y + 88;
  }

  private begin(): void {
    const prior = (this.registry.get("partialConfig") as PartialConfig | undefined) ?? {};
    const config = {
      numbers: this.numbers,
      difficulty: this.difficulty,
      mode: this.mode,
      min: prior.min,
      max: prior.max,
    };
    this.registry.set("partialConfig", config);
    this.registry.set("playConfig", config);
    this.scene.start("climb");
  }

  update(_time: number, delta: number): void {
    this.sky.update(delta, 0, false);
  }

  private onResize(): void {
    this.sky.layout();
  }
}

const LABELS: Record<string, string> = {
  whole: "Whole",
  decimal: "Decimal",
  fraction: "Fractions",
  easy: "Easy",
  normal: "Normal",
  hard: "Hard",
  casual: "Casual",
  challenge: "Challenge",
  speed: "Speed run",
};

function labelFor(s: string): string {
  return LABELS[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
}
