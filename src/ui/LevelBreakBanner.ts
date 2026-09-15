import Phaser from "phaser";
import { LEVEL_BREAK_READY, levelBreakHeadline, levelBreakLevelLine } from "../levelBreak";

export class LevelBreakBanner {
  private readonly scene: Phaser.Scene;
  private readonly root: Phaser.GameObjects.Container;
  private readonly title: Phaser.GameObjects.Text;
  private readonly sub: Phaser.GameObjects.Text;
  private pulse?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const x = scene.scale.width / 2;
    const y = scene.scale.height * 0.38;
    this.title = scene.add
      .text(0, -28, levelBreakHeadline(), {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "36px",
        color: "#ffd166",
        align: "center",
        stroke: "#16324f",
        strokeThickness: 8,
        lineSpacing: 2,
      })
      .setOrigin(0.5);
    this.sub = scene.add
      .text(0, 28, "", {
        fontFamily: "Nunito, sans-serif",
        fontSize: "20px",
        color: "#fff8e7",
        align: "center",
        stroke: "#16324f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.root = scene.add.container(x, y, [this.title, this.sub]);
    this.root.setScrollFactor(0);
    this.root.setDepth(32);
    this.root.setAlpha(0);
    this.root.setScale(0.72);
  }

  play(nextLevel: number): void {
    this.sub.setText(levelBreakLevelLine(nextLevel));
    this.scene.tweens.add({
      targets: this.root,
      alpha: 1,
      scale: 1.08,
      duration: 180,
      ease: "Back.easeOut",
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.root,
          scale: 1,
          duration: 100,
        });
      },
    });
    this.scene.tweens.add({
      targets: this.sub,
      alpha: 1,
      duration: 180,
      delay: 220,
    });
  }

  showReady(): void {
    this.pulse?.stop();
    this.sub.setText(LEVEL_BREAK_READY);
    this.sub.setAlpha(1);
    this.sub.setScale(0.92);
    this.scene.tweens.add({
      targets: this.sub,
      scale: 1,
      duration: 160,
      ease: "Back.easeOut",
      onComplete: () => {
        this.pulse = this.scene.tweens.add({
          targets: this.sub,
          scale: 1.05,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      },
    });
  }

  hide(): void {
    this.pulse?.stop();
    this.pulse = undefined;
    this.scene.tweens.killTweensOf(this.root);
    this.scene.tweens.killTweensOf(this.sub);
    this.scene.tweens.add({
      targets: this.root,
      alpha: 0,
      y: this.root.y - 16,
      duration: 180,
      onComplete: () => this.destroy(),
    });
  }

  layout(): void {
    this.root.setPosition(this.scene.scale.width / 2, this.scene.scale.height * 0.38);
  }

  destroy(): void {
    this.pulse?.stop();
    this.pulse = undefined;
    this.scene.tweens.killTweensOf(this.root);
    this.scene.tweens.killTweensOf(this.sub);
    if (this.root.scene) this.root.destroy(true);
  }
}
