import Phaser from "phaser";
import { SoundManager } from "../audio/SoundManager";
import { isComplete, mergeConfig, parseSearch } from "../config";
import { assetBase, hostConfig } from "../host";
import type { PartialConfig } from "../numbers/types";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload(): void {
    const base = assetBase(this);
    this.load.spritesheet("adventurer", `${base}/adventurer.png`, {
      frameWidth: 80,
      frameHeight: 110,
    });
    SoundManager.preload(this);
  }

  create(): void {
    const stored = this.registry.get("partialConfig") as PartialConfig | undefined;
    const url =
      typeof window !== "undefined" ? parseSearch(window.location.search) : {};
    const partial = mergeConfig(hostConfig(this) ?? stored, url);
    this.registry.set("partialConfig", partial);
    if (isComplete(partial)) {
      this.registry.set("playConfig", partial);
      this.scene.switch("climb");
    } else {
      this.scene.start("menu");
    }
  }
}
