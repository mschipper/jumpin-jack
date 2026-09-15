import type Phaser from "phaser";
import { assetBase } from "../host";

export const SOUND_IDS = [
  "button_press",
  "correct",
  "crumble",
  "fail",
  "game_over",
  "level_complete",
  "music",
  "new_high_score",
] as const;

export type SoundId = (typeof SOUND_IDS)[number];

const MUTE_KEY = "jumpin-jack-mute";
const MUSIC_VOL = 0.38;

/** Surface the LP wrapper injects under registry key `"sounds"`. */
export interface Sounds {
  play(id: SoundId): void;
  playMusic(): void;
  stopMusic(): void;
  pauseMusic(): void;
  resumeMusic(): void;
  stopSfx(): void;
  readonly muted: boolean;
  setMuted(muted: boolean): void;
  toggleMute(): boolean;
}

export class SoundManager implements Sounds {
  private music?: Phaser.Sound.BaseSound;
  private wantMusic = false;
  private unlockHooked = false;

  constructor(private readonly game: Phaser.Game) {
    if (typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1") {
      this.game.sound.mute = true;
    }
    this.hookUnlock();
  }

  static preload(scene: Phaser.Scene): void {
    if (scene.registry.get("sounds")) return;
    const sound = scene.sound as Phaser.Sound.BaseSoundManager & { noAudio?: boolean };
    if (sound.noAudio) return;
    const base = assetBase(scene);
    for (const id of SOUND_IDS) {
      scene.load.audio(id, `${base}/audio/${id}.mp3`);
    }
  }

  play(id: SoundId): void {
    if (id === "music") {
      this.playMusic();
      return;
    }
    if (!this.game.cache.audio.exists(id)) return;
    try {
      this.game.sound.play(id);
    } catch {
      // Autoplay lock — wait for unlocked.
    }
  }

  playMusic(): void {
    this.wantMusic = true;
    if (this.music?.isPlaying) return;
    if (this.music?.isPaused) {
      this.music.resume();
      return;
    }
    if (!this.game.cache.audio.exists("music")) return;
    if (this.game.sound.locked) return;
    try {
      this.music = this.game.sound.add("music", { loop: true, volume: MUSIC_VOL });
      this.music.play();
    } catch {
      // Autoplay lock.
    }
  }

  stopMusic(): void {
    this.wantMusic = false;
    this.music?.stop();
    this.music?.destroy();
    this.music = undefined;
  }

  pauseMusic(): void {
    if (this.music?.isPlaying) this.music.pause();
  }

  resumeMusic(): void {
    if (!this.wantMusic) return;
    if (this.music?.isPaused) this.music.resume();
    else this.playMusic();
  }

  stopSfx(): void {
    for (const id of SOUND_IDS) {
      if (id === "music") continue;
      this.game.sound.stopByKey(id);
    }
  }

  get muted(): boolean {
    return this.game.sound.mute;
  }

  setMuted(muted: boolean): void {
    this.game.sound.mute = muted;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    }
  }

  toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private hookUnlock(): void {
    if (this.unlockHooked) return;
    this.unlockHooked = true;
    this.game.sound.once("unlocked", () => {
      if (this.wantMusic) this.playMusic();
    });
  }
}

export function soundsOf(scene: Phaser.Scene): Sounds {
  const key = "sounds";
  let mgr = scene.registry.get(key) as Sounds | undefined;
  if (!mgr) {
    mgr = new SoundManager(scene.game);
    scene.registry.set(key, mgr);
  }
  return mgr;
}
