import Phaser from "phaser";
import { GOLD, PLAY_COLUMN } from "../constants";
import type { GameConfig } from "../numbers/types";
import { columnLeft } from "../world/column";

interface ResultData {
  title: string;
  score: number;
  best: number;
  isRecord: boolean;
  config: GameConfig;
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("result");
  }

  create(data: ResultData): void {
    this.add.graphics().fillGradientStyle(0x2a6fbd, 0x2a6fbd, 0x9fd0f5, 0x9fd0f5, 1)
      .fillRect(0, 0, this.scale.width, this.scale.height);

    const x = columnLeft(this) + PLAY_COLUMN / 2;
    const y = this.scale.height / 2;
    const card = this.add.rectangle(x, y, PLAY_COLUMN - 40, 320, 0xfffdf6);
    void card;

    this.add
      .text(x, y - 110, data.title, {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "34px",
        color: "#16324f",
      })
      .setOrigin(0.5);

    this.add
      .text(x, y - 54, `${data.score} platforms`, {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "24px",
        color: "#16324f",
      })
      .setOrigin(0.5);

    if (data.isRecord) {
      this.add.rectangle(x, y - 8, 160, 32, GOLD);
      this.add
        .text(x, y - 8, "NEW RECORD", {
          fontFamily: "Fredoka, sans-serif",
          fontSize: "14px",
          color: "#1d3557",
        })
        .setOrigin(0.5);
    }

    this.add
      .text(x, y + 28, `Best ${data.best}`, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#5a6d80",
      })
      .setOrigin(0.5);

    const again = this.add.rectangle(x, y + 80, 200, 48, GOLD).setInteractive({ useHandCursor: true });
    this.add
      .text(x, y + 80, "Climb again", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "20px",
        color: "#1d3557",
      })
      .setOrigin(0.5);
    again.on("pointerup", () => {
      this.registry.set("playConfig", data.config);
      this.scene.start("climb");
    });

    const change = this.add
      .text(x, y + 128, "Change setup", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#16324f",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    change.on("pointerup", () => this.scene.start("menu"));
  }
}
