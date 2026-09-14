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

  constructor(scene: Phaser.Scene) {
    const scale = PLAYER_DISPLAY_WIDTH / 80;
    this.shadow = scene.add.sprite(0, 0, "adventurer", 0);
    this.shadow.setOrigin(0.5, 1);
    this.shadow.setScale(scale);
    this.shadow.setTint(SHADOW_COLOR);
    this.shadow.setAlpha(SHADOW_ALPHA);
    this.shadow.setDepth(9);

    this.sprite = scene.add.sprite(0, 0, "adventurer", 0);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setScale(scale);
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
  }

  jump(): void {
    this.sprite.play("jump", true);
    this.shadow.play("jump", true);
  }

  place(x: number, y: number): void {
    this.worldX = x;
    this.worldY = y;
    this.sprite.setPosition(x, y);
    this.shadow.setPosition(x + SHADOW_OFFSET_X, y + SHADOW_OFFSET_Y);
  }

  destroy(): void {
    this.sprite.destroy();
    this.shadow.destroy();
  }
}
