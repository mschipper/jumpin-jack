import Phaser from "phaser";
import { soundsOf } from "../audio/SoundManager";
import { GOLD, PLAY_COLUMN } from "../constants";
import type { GameConfig } from "../numbers/types";
import { columnLeft } from "../world/column";
import { Sky } from "../world/Sky";

interface ResultData {
  title: string;
  score: number;
  best: number;
  isRecord: boolean;
  config: GameConfig;
}

export class ResultScene extends Phaser.Scene {
  private sky!: Sky;

  constructor() {
    super("result");
  }

  create(data: ResultData): void {
    this.sky = new Sky(this);
    this.scale.on("resize", this.onResize, this);
    this.events.once("shutdown", () => this.scale.off("resize", this.onResize, this));
    const s = soundsOf(this);
    s.stopMusic();
    s.stopSfx();
    if (data.isRecord) s.play("new_high_score");
    else if (data.title !== "You made it!") s.play("game_over");

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
      soundsOf(this).play("button_press");
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
    change.on("pointerup", () => {
      soundsOf(this).play("button_press");
      this.scene.start("menu");
    });
  }

  update(_time: number, delta: number): void {
    this.sky.update(delta, 0, false);
  }

  private onResize(): void {
    this.sky.layout();
  }
}
