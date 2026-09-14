import Phaser from "phaser";
import { GAME_HEIGHT, PLAY_COLUMN } from "./constants";
import type { Host } from "./host";
import { MenuScene } from "./scenes/MenuScene";
import { PlayScene } from "./scenes/PlayScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { ResultScene } from "./scenes/ResultScene";

export interface CreateGameOpts {
  parent: string | HTMLElement;
  host?: Host;
}

export function createGame(opts: CreateGameOpts): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: opts.parent,
    width: PLAY_COLUMN,
    height: GAME_HEIGHT,
    backgroundColor: "#2a6fbd",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [PreloadScene, MenuScene, PlayScene, ResultScene],
    audio: { noAudio: Boolean(opts.host) },
    autoFocus: false,
    callbacks: {
      postBoot: (g) => {
        g.loop.resume();
      },
    },
  });
  if (opts.host) game.registry.set("host", opts.host);
  return game;
}
