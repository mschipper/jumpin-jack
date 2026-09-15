import Phaser from "phaser";
import {
  PLAYER_DISPLAY_WIDTH,
  SHADOW_ALPHA,
  SHADOW_COLOR,
  SHADOW_OFFSET_X,
  SHADOW_OFFSET_Y,
} from "../constants";

export class Player {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly shadow: Phaser.GameObjects.Sprite;
  worldX = 0;
  worldY = 0;
  private readonly scene: Phaser.Scene;
  private readonly baseScale = PLAYER_DISPLAY_WIDTH / 80;
  private bob = 0;
  private readonly bobState = { y: 0 };
  private bobTween?: Phaser.Tweens.Tween;
  private scaleTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.shadow = scene.add.sprite(0, 0, "adventurer", 0);
    this.shadow.setOrigin(0.5, 1);
    this.shadow.setScale(this.baseScale);
    this.shadow.setTint(SHADOW_COLOR);
    this.shadow.setAlpha(SHADOW_ALPHA);
    this.shadow.setDepth(9);

    this.sprite = scene.add.sprite(0, 0, "adventurer", 0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(this.baseScale);
    this.sprite.setDepth(10);
    this.sprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.shadow.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    if (!scene.anims.exists("idle")) {
      // Frame 0 is the standing idle. Do not ping-pong other cells — they
      // sit higher in the 80×110 box and read as a hop.
      scene.anims.create({
        key: "idle",
        frames: [{ key: "adventurer", frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
      scene.anims.create({
        key: "jump",
        frames: [
          { key: "adventurer", frame: 9 },
          { key: "adventurer", frame: 4 },
          { key: "adventurer", frame: 20 },
        ],
        frameRate: 8,
        repeat: 0,
      });
    }
    this.idle();
  }

  idle(): void {
    this.sprite.anims.stop();
    this.shadow.anims.stop();
    this.sprite.setFrame(0);
    this.shadow.setFrame(0);
    this.startBob();
  }

  jump(): void {
    this.stopBob();
    this.sprite.play("jump", true);
    this.shadow.play("jump", true);
    this.setDrawScale(0.92, 1.1);
    this.tweenScale(1, 1, 180, "Quad.easeOut");
  }

  land(): void {
    this.sprite.anims.stop();
    this.shadow.anims.stop();
    this.sprite.setFrame(0);
    this.shadow.setFrame(0);
    this.setDrawScale(1.14, 0.86);
    this.tweenScale(1, 1, 140, "Back.easeOut", () => this.startBob());
  }

  place(x: number, y: number): void {
    this.worldX = x;
    this.worldY = y;
    this.applyPos();
  }

  private startBob(): void {
    this.stopBob();
    this.bobState.y = 0;
    this.bobTween = this.scene.tweens.add({
      targets: this.bobState,
      y: -2,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        this.bob = this.bobState.y;
        this.applyPos();
      },
    });
  }

  private stopBob(): void {
    this.bobTween?.stop();
    this.bobTween = undefined;
    this.bob = 0;
    this.applyPos();
  }

  private applyPos(): void {
    const y = this.worldY + this.bob;
    this.sprite.setPosition(this.worldX, y);
    this.shadow.setPosition(
      this.worldX + SHADOW_OFFSET_X,
      y + SHADOW_OFFSET_Y,
    );
  }

  private setDrawScale(sx: number, sy: number): void {
    this.sprite.setScale(this.baseScale * sx, this.baseScale * sy);
    this.shadow.setScale(this.baseScale * sx, this.baseScale * sy);
  }

  private tweenScale(
    sx: number,
    sy: number,
    duration: number,
    ease: string,
    onComplete?: () => void,
  ): void {
    this.scaleTween?.stop();
    this.scaleTween = this.scene.tweens.add({
      targets: [this.sprite, this.shadow],
      scaleX: this.baseScale * sx,
      scaleY: this.baseScale * sy,
      duration,
      ease,
      onComplete: () => {
        this.scaleTween = undefined;
        onComplete?.();
      },
    });
  }

  destroy(): void {
    this.stopBob();
    this.scaleTween?.stop();
    this.sprite.destroy();
    this.shadow.destroy();
  }
}
