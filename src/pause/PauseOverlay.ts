import Phaser from "phaser";
import { GOLD, NAVY, PLAY_COLUMN } from "../constants";
import { columnLeft } from "../world/column";

export class PauseOverlay {
  readonly root: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, onResume: () => void, onQuit: () => void) {
    const w = PLAY_COLUMN - 32;
    const veil = scene.add.rectangle(PLAY_COLUMN / 2, scene.scale.height / 2, scene.scale.width * 2, scene.scale.height * 2, NAVY, 0.35);
    const card = scene.add.rectangle(PLAY_COLUMN / 2, scene.scale.height / 2, w, 220, 0xfffdf6);
    const title = scene.add
      .text(PLAY_COLUMN / 2, scene.scale.height / 2 - 70, "Paused", {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "32px",
        color: "#16324f",
      })
      .setOrigin(0.5);
    const resume = scene.add
      .rectangle(PLAY_COLUMN / 2, scene.scale.height / 2 + 10, 200, 48, GOLD)
      .setInteractive({ useHandCursor: true });
    const resumeT = scene.add
      .text(PLAY_COLUMN / 2, scene.scale.height / 2 + 10, "Resume", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "20px",
        color: "#1d3557",
      })
      .setOrigin(0.5);
    const quit = scene.add
      .text(PLAY_COLUMN / 2, scene.scale.height / 2 + 64, "Change setup", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#16324f",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    resume.on("pointerup", onResume);
    quit.on("pointerup", onQuit);

    this.root = scene.add.container(columnLeft(scene), 0, [veil, card, title, resume, resumeT, quit]);
    this.root.setScrollFactor(0);
    this.root.setDepth(50);
    this.root.setVisible(false);
  }

  show(): void {
    this.root.setVisible(true);
  }

  hide(): void {
    this.root.setVisible(false);
  }

  layout(scene: Phaser.Scene): void {
    this.root.x = columnLeft(scene);
  }
}
