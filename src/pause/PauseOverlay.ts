import Phaser from "phaser";
import { soundsOf } from "../audio/SoundManager";
import { GOLD, NAVY, PLAY_COLUMN } from "../constants";
import { columnLeft } from "../world/column";
import { addPaperCard } from "../ui/paperCard";

export class PauseOverlay {
  readonly root: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly veil: Phaser.GameObjects.Rectangle;
  private resumeBtn: Phaser.GameObjects.Rectangle;
  private quitBtn: Phaser.GameObjects.Text;
  private muteBtn: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, onResume: () => void, onQuit: () => void) {
    this.scene = scene;
    const w = PLAY_COLUMN - 32;
    const cy = scene.scale.height / 2;
    const cx = PLAY_COLUMN / 2;
    this.veil = scene.add
      .rectangle(cx, cy, scene.scale.width * 2, scene.scale.height * 2, NAVY, 0.45)
      .setInteractive();
    const card = addPaperCard(scene, cx, cy, w, 268);
    const title = scene.add
      .text(cx, cy - 86, "Paused", {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "32px",
        color: "#16324f",
      })
      .setOrigin(0.5);
    const resume = scene.add
      .rectangle(cx, cy - 8, 200, 48, GOLD)
      .setInteractive({ useHandCursor: true });
    const resumeT = scene.add
      .text(cx, cy - 8, "Resume", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "20px",
        color: "#1d3557",
      })
      .setOrigin(0.5);
    const muteT = scene.add
      .text(cx, cy + 48, muteLabel(soundsOf(scene).muted), {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color: "#16324f",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    const quit = scene.add
      .text(cx, cy + 92, "Change setup", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "14px",
        color: "#16324f",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    resume.on("pointerup", () => {
      soundsOf(scene).play("button_press");
      onResume();
    });
    muteT.on("pointerup", () => {
      const s = soundsOf(scene);
      const next = s.toggleMute();
      muteT.setText(muteLabel(next));
      if (!next) s.play("button_press");
    });
    quit.on("pointerup", () => {
      soundsOf(scene).play("button_press");
      onQuit();
    });

    this.root = scene.add.container(columnLeft(scene), 0, [
      this.veil, card, title, resume, resumeT, muteT, quit,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(50);
    this.resumeBtn = resume;
    this.quitBtn = quit;
    this.muteBtn = muteT;
    this.hide();
  }

  show(): void {
    this.root.setVisible(true);
    this.root.setActive(true);
    this.veil.setInteractive();
    this.resumeBtn.setInteractive({ useHandCursor: true });
    this.quitBtn.setInteractive({ useHandCursor: true });
    this.muteBtn.setInteractive({ useHandCursor: true });
    this.muteBtn.setText(muteLabel(soundsOf(this.scene).muted));
  }

  hide(): void {
    this.root.setVisible(false);
    this.root.setActive(false);
    this.veil.disableInteractive();
    this.resumeBtn.disableInteractive();
    this.quitBtn.disableInteractive();
    this.muteBtn.disableInteractive();
  }

  layout(scene: Phaser.Scene): void {
    this.root.x = columnLeft(scene);
    this.veil.setSize(scene.scale.width * 2, scene.scale.height * 2);
  }
}

function muteLabel(muted: boolean): string {
  return muted ? "Sound off" : "Sound on";
}
