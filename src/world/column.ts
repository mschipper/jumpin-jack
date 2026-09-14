import { PLAY_COLUMN } from "../constants";
import type { Scene } from "phaser";

export function columnLeft(scene: Scene): number {
  return (scene.scale.width - PLAY_COLUMN) / 2;
}

export function columnX(scene: Scene, frac: number): number {
  return columnLeft(scene) + PLAY_COLUMN * frac;
}

export function playHeight(scene: Scene): number {
  return scene.scale.height;
}
