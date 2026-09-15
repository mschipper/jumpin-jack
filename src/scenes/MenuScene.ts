import Phaser from "phaser";
import { soundsOf } from "../audio/SoundManager";
import { missingFields } from "../config";
import { GOLD, NAVY, PLAY_COLUMN } from "../constants";
import type {
  Difficulty,
  GameConfig,
  NumberKind,
  PartialConfig,
  PlayMode,
} from "../numbers/types";
import { columnLeft } from "../world/column";
import { Sky } from "../world/Sky";
import { addPaperCard } from "../ui/paperCard";

export class MenuScene extends Phaser.Scene {
  private numbers: NumberKind = "whole";
  private difficulty: Difficulty = "normal";
  private mode: PlayMode = "challenge";
  private sky!: Sky;
  private panel: Phaser.GameObjects.Container | null = null;
  private openFields: (keyof GameConfig)[] = [];

  constructor() {
    super("menu");
  }

  create(): void {
    const locked = (this.registry.get("partialConfig") as PartialConfig | undefined) ?? {};
    const last = this.registry.get("playConfig") as GameConfig | undefined;
    this.numbers = last?.numbers ?? locked.numbers ?? "whole";
    this.difficulty = last?.difficulty ?? locked.difficulty ?? "normal";
    this.mode = last?.mode ?? locked.mode ?? "challenge";
    this.openFields = missingFields(locked);

    this.sky = new Sky(this);
    this.scale.on("resize", this.onResize, this);
    this.events.once("shutdown", () => this.scale.off("resize", this.onResize, this));

    const x = columnLeft(this) + PLAY_COLUMN / 2;
    const hasOptions = this.openFields.length > 0;
    const howToY = 108;
    const howToH = 118;
    const optsY = howToY + howToH / 2 + 40;
    const startY = hasOptions ? optsY + 64 : optsY;
    const blockH = startY + 36;
    const gTop = this.scale.height - 110;
    const top = Math.round(
      Phaser.Math.Clamp(
        (this.scale.height - blockH) / 2,
        36,
        Math.max(36, gTop - 120 - blockH),
      ),
    );

    const UI = 20;
    this.add
      .text(x + 4, top + 4, "Jumpin' Jack", {
        fontFamily: "Titan One, sans-serif",
        fontSize: "56px",
        color: "#16324f",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(UI);
    this.add
      .text(x, top, "Jumpin' Jack", {
        fontFamily: "Titan One, sans-serif",
        fontSize: "56px",
        color: "#fff8e7",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(UI);

    addPaperCard(this, x, top + howToY, PLAY_COLUMN - 64, howToH, 18).setDepth(UI);
    this.add
      .text(x, top + howToY - 22, "Jump to the bigger number\nbefore the pad gives way.", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color: "#16324f",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(UI);
    this.add
      .text(x, top + howToY + 28, "Tap a platform  ·  arrows / A D", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "13px",
        color: "#5a6d80",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(UI);

    if (hasOptions) {
      const opts = this.add
        .rectangle(x, top + optsY, 200, 44, NAVY, 0.82)
        .setInteractive({ useHandCursor: true })
        .setDepth(UI);
      this.add
        .text(x, top + optsY, "Game options", {
          fontFamily: "Nunito, sans-serif",
          fontSize: "16px",
          color: "#fff8e7",
        })
        .setOrigin(0.5)
        .setDepth(UI);
      opts.on("pointerup", () => {
        soundsOf(this).play("button_press");
        this.showOptions();
      });
    }

    const start = this.add
      .rectangle(x, top + startY, 240, 56, GOLD)
      .setInteractive({ useHandCursor: true })
      .setDepth(UI);
    this.add
      .text(x, top + startY, "Start Climb", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "24px",
        color: "#1d3557",
      })
      .setOrigin(0.5)
      .setDepth(UI);
    start.on("pointerup", () => {
      if (this.panel?.visible) return;
      soundsOf(this).play("button_press");
      this.begin();
    });

    const dirt = this.add.graphics();
    dirt.setDepth(8);
    dirt.fillStyle(0xc9a066, 1);
    dirt.fillRect(0, gTop + 16, this.scale.width, 200);
    dirt.fillStyle(0x6fbf3b, 1);
    dirt.fillRect(0, gTop, this.scale.width, 22);
    const hero = this.add.sprite(x, gTop, "adventurer", 0).setOrigin(0.5, 1);
    hero.setScale(1);
    hero.setDepth(8);
    hero.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  private showOptions(): void {
    if (this.panel) {
      this.panel.setVisible(true);
      this.panel.setActive(true);
      return;
    }

    const cx = PLAY_COLUMN / 2;
    const cy = this.scale.height / 2;
    const rows = this.openFields.length;
    const cardH = 132 + rows * 92;
    const veil = this.add
      .rectangle(cx, cy, this.scale.width * 2, this.scale.height * 2, NAVY, 0.45)
      .setInteractive();
    const card = addPaperCard(this, cx, cy, PLAY_COLUMN - 36, cardH, 24);
    const title = this.add
      .text(cx, cy - cardH / 2 + 36, "Game options", {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "26px",
        color: "#16324f",
      })
      .setOrigin(0.5);

    const kids: Phaser.GameObjects.GameObject[] = [veil, card, title];
    let y = cy - cardH / 2 + 78;
    for (const field of this.openFields) {
      if (field === "numbers") {
        y = this.panelRow(kids, cx, y, "NUMBERS", ["whole", "decimal", "fraction"], this.numbers, (v) => {
          this.numbers = v as NumberKind;
        });
      } else if (field === "difficulty") {
        y = this.panelRow(kids, cx, y, "DIFFICULTY", ["easy", "normal", "hard"], this.difficulty, (v) => {
          this.difficulty = v as Difficulty;
        });
      } else if (field === "mode") {
        y = this.panelRow(kids, cx, y, "MODE", ["casual", "challenge", "speed"], this.mode, (v) => {
          this.mode = v as PlayMode;
        });
      }
    }

    const doneY = cy + cardH / 2 - 40;
    const done = this.add
      .rectangle(cx, doneY, 160, 44, GOLD)
      .setInteractive({ useHandCursor: true });
    const doneT = this.add
      .text(cx, doneY, "Done", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "20px",
        color: "#1d3557",
      })
      .setOrigin(0.5);
    kids.push(done, doneT);

    this.panel = this.add.container(columnLeft(this), 0, kids);
    this.panel.setScrollFactor(0);
    this.panel.setDepth(50);

    const close = () => {
      soundsOf(this).play("button_press");
      this.hideOptions();
    };
    done.on("pointerup", close);
    veil.on("pointerup", close);
  }

  private hideOptions(): void {
    this.panel?.setVisible(false);
    this.panel?.setActive(false);
  }

  private panelRow(
    kids: Phaser.GameObjects.GameObject[],
    x: number,
    y: number,
    label: string,
    options: string[],
    current: string,
    onPick: (v: string) => void,
  ): number {
    const lab = this.add
      .text(x, y, label, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "12px",
        color: "#16324f",
        letterSpacing: 3,
      })
      .setOrigin(0.5);
    kids.push(lab);
    const buttons: { bg: Phaser.GameObjects.Rectangle; text: Phaser.GameObjects.Text; key: string }[] = [];
    const gap = 114;
    const startX = x - ((options.length - 1) * gap) / 2;
    options.forEach((opt, i) => {
      const on = opt === current;
      const bg = this.add
        .rectangle(startX + i * gap, y + 32, 104, 42, on ? GOLD : NAVY, on ? 1 : 0.88)
        .setInteractive({ useHandCursor: true });
      const text = this.add
        .text(startX + i * gap, y + 32, labelFor(opt), {
          fontFamily: "Nunito, sans-serif",
          fontSize: "13px",
          color: on ? "#1d3557" : "#fff8e7",
        })
        .setOrigin(0.5);
      buttons.push({ bg, text, key: opt });
      kids.push(bg, text);
      bg.on("pointerup", () => {
        soundsOf(this).play("button_press");
        onPick(opt);
        for (const b of buttons) {
          const sel = b.key === opt;
          b.bg.setFillStyle(sel ? GOLD : NAVY, sel ? 1 : 0.88);
          b.text.setColor(sel ? "#1d3557" : "#fff8e7");
        }
      });
    });
    return y + 92;
  }

  private begin(): void {
    const locked = (this.registry.get("partialConfig") as PartialConfig | undefined) ?? {};
    const config: GameConfig = {
      numbers: locked.numbers ?? this.numbers,
      difficulty: locked.difficulty ?? this.difficulty,
      mode: locked.mode ?? this.mode,
      min: locked.min,
      max: locked.max,
    };
    this.registry.set("playConfig", config);
    this.scene.start("climb");
  }

  update(_time: number, delta: number): void {
    this.sky.update(delta, 0, false);
  }

  private onResize(): void {
    this.sky.layout();
    if (this.panel) this.panel.x = columnLeft(this);
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
