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
import { drawTitleLayout, hitTitle, type TitleHit } from "../ui/titleLayouts";

export class MenuScene extends Phaser.Scene {
  private numbers: NumberKind = "whole";
  private difficulty: Difficulty = "normal";
  private mode: PlayMode = "challenge";
  private sky!: Sky;
  private panel: Phaser.GameObjects.Container | null = null;
  private openFields: (keyof GameConfig)[] = [];
  private chrome: Phaser.GameObjects.GameObject[] = [];
  private hits: TitleHit[] = [];

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
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.onPointer(pointer));

    this.rebuild();
  }

  private rebuild(): void {
    this.panel?.destroy();
    this.panel = null;
    for (const obj of this.chrome) obj.destroy();
    this.chrome = [];
    this.hits = [];
    drawTitleLayout({
      scene: this,
      x: columnLeft(this) + PLAY_COLUMN / 2,
      hasOptions: this.openFields.length > 0,
      add: (obj) => {
        this.chrome.push(obj);
        return obj;
      },
      hit: (h) => {
        this.hits.push(h);
      },
    });
  }

  private onPointer(pointer: Phaser.Input.Pointer): void {
    if (this.panel?.visible) return;
    const hit = hitTitle(this.hits, pointer.x, pointer.y);
    if (!hit) return;
    soundsOf(this).play("button_press");
    if (hit.kind === "start") this.begin();
    else this.showOptions();
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
    this.rebuild();
  }
}

const LABELS: Record<string, string> = {
  whole: "Whole",
  decimal: "Decimal",
  fraction: "Fraction",
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
