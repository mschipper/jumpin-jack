import Phaser from "phaser";
import { soundsOf } from "../audio/SoundManager";
import { GOLD, NAVY, PLAY_COLUMN } from "../constants";
import { columnLeft } from "../world/column";
import { addPaperCard } from "../ui/paperCard";

export class PauseOverlay {
  readonly root: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly onResume: () => void;
  private readonly veil: Phaser.GameObjects.Rectangle;
  private readonly resumeBtn: Phaser.GameObjects.Rectangle;
  private readonly muteBtn: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, onResume: () => void) {
    this.scene = scene;
    this.onResume = onResume;
    const w = PLAY_COLUMN - 32;
    const cy = scene.scale.height / 2;
    const cx = PLAY_COLUMN / 2;
    this.veil = scene.add.rectangle(cx, cy, scene.scale.width * 2, scene.scale.height * 2, NAVY, 0.45);
    const card = addPaperCard(scene, cx, cy, w, 220);
    const title = scene.add
      .text(cx, cy - 70, "Paused", {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "32px",
        color: "#16324f",
      })
      .setOrigin(0.5);
    this.resumeBtn = scene.add.rectangle(cx, cy - 8, 200, 48, GOLD);
    const resumeT = scene.add
      .text(cx, cy - 8, "Resume", {
        fontFamily: "Fredoka, sans-serif",
        fontSize: "20px",
        color: "#1d3557",
      })
      .setOrigin(0.5);
    this.muteBtn = scene.add
      .text(cx, cy + 52, muteLabel(soundsOf(scene).muted), {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color: "#16324f",
      })
      .setOrigin(0.5);

    this.root = scene.add.container(columnLeft(scene), 0, [
      this.veil, card, title, this.resumeBtn, resumeT, this.muteBtn,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(50);
    this.hide();
  }

  show(): void {
    this.root.setVisible(true);
    this.root.setActive(true);
    this.muteBtn.setText(muteLabel(soundsOf(this.scene).muted));
  }

  hide(): void {
    this.root.setVisible(false);
    this.root.setActive(false);
  }

  layout(scene: Phaser.Scene): void {
    this.root.x = columnLeft(scene);
    this.veil.setSize(scene.scale.width * 2, scene.scale.height * 2);
  }

  /** Screen-space hits. Phaser 4 containers do not deliver child pointer events. */
  handlePointer(screenX: number, screenY: number): void {
    if (!this.root.visible) return;
    if (this.hitObject(this.resumeBtn, screenX, screenY, 0)) {
      soundsOf(this.scene).play("button_press");
      this.onResume();
      return;
    }
    if (this.hitObject(this.muteBtn, screenX, screenY, 14)) {
      const s = soundsOf(this.scene);
      const next = s.toggleMute();
      this.muteBtn.setText(muteLabel(next));
      if (!next) s.play("button_press");
    }
  }

  private hitObject(
    obj: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text,
    screenX: number,
    screenY: number,
    pad: number,
  ): boolean {
    const x = this.root.x + obj.x;
    const y = this.root.y + obj.y;
    const w = Math.max(obj.width, 180) + pad * 2;
    const h = Math.max(obj.height, 36) + pad * 2;
    return Math.abs(screenX - x) <= w / 2 && Math.abs(screenY - y) <= h / 2;
  }
}

function muteLabel(muted: boolean): string {
  return muted ? "Sound off" : "Sound on";
}
