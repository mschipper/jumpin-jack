import Phaser from "phaser";
import { soundsOf } from "../audio/SoundManager";
import { GOLD, NAVY, PLAY_COLUMN } from "../constants";
import type { GameConfig } from "../numbers/types";
import { columnLeft } from "../world/column";
import { addPaperCard } from "../ui/paperCard";

interface ResultData {
  title: string;
  score: number;
  best: number;
  isRecord: boolean;
  win: boolean;
  config: GameConfig;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("result");
  }

  create(data: ResultData): void {
    this.cameras.main.transparent = true;
    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    const s = soundsOf(this);
    s.stopMusic();
    s.stopSfx();
    if (data.isRecord) s.play("new_high_score");
    else if (!data.win) s.play("game_over");

    const x = columnLeft(this) + PLAY_COLUMN / 2;
    const y = this.scale.height / 2;
    this.add
      .rectangle(this.scale.width / 2, y, this.scale.width, this.scale.height, NAVY, 0.38)
      .setInteractive()
      .setScrollFactor(0);

    const cardW = PLAY_COLUMN - 48;
    const cardH = 420;
    addPaperCard(this, x, y, cardW, cardH, 24).setScrollFactor(0);

    this.add
      .text(x, y - 168, data.title, {
        fontFamily: "Paytone One, sans-serif",
        fontSize: data.title.length > 12 ? "28px" : "34px",
        color: "#16324f",
        align: "center",
        wordWrap: { width: cardW - 40 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.add
      .text(x, y - 40, String(data.score), {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "108px",
        color: "#ffd166",
        stroke: "#16324f",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    if (data.isRecord) {
      this.add.rectangle(x, y + 48, 160, 32, GOLD).setScrollFactor(0);
      this.add
        .text(x, y + 48, "NEW RECORD", {
          fontFamily: "Fredoka, sans-serif",
          fontSize: "14px",
          color: "#1d3557",
        })
        .setOrigin(0.5)
        .setScrollFactor(0);
    }

    this.add
      .text(x, y + 88, `Best ${data.best}`, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color: "#5a6d80",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    const again = this.add
      .rectangle(x, y + 140, 200, 48, GOLD)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    this.add
      .text(x, y + 140, "Climb again", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "20px",
        color: "#1d3557",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    again.on("pointerup", () => {
      soundsOf(this).play("button_press");
      this.registry.set("playConfig", data.config);
      this.scene.stop("result");
      this.scene.start("climb");
    });

    const menu = this.add
      .text(x, y + 188, "Menu", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color: "#16324f",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    menu.on("pointerup", () => {
      soundsOf(this).play("button_press");
      this.scene.stop("result");
      this.scene.stop("climb");
      this.scene.start("menu");
    });
  }
}
