import type { Scene } from "phaser";
import type { PartialConfig } from "./numbers/types";

export interface ScoreSink {
  external: boolean;
  submit(score: number, meta?: Record<string, unknown>): void | Promise<void>;
}

export interface GameEvents {
  emit(type: string, payload?: Record<string, unknown>): void;
}

export interface Host {
  config?: PartialConfig;
  assetBase?: string;
  scores?: ScoreSink;
  events?: GameEvents;
  playerName?: () => string | null;
}

const NO_EVENTS: GameEvents = { emit: () => {} };

export function getHost(scene: Scene): Host {
  return (scene.registry.get("host") as Host | undefined) ?? {};
}

export function hostEvents(scene: Scene): GameEvents {
  return getHost(scene).events ?? NO_EVENTS;
}

export function externalScores(scene: Scene): ScoreSink | undefined {
  const sink = getHost(scene).scores;
  return sink?.external ? sink : undefined;
}

export function assetBase(scene: Scene): string {
  return getHost(scene).assetBase ?? "assets";
}

export function hostConfig(scene: Scene): PartialConfig | undefined {
  return getHost(scene).config;
}
