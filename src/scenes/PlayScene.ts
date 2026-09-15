import Phaser from "phaser";
import { JUMP_ARC, JUMP_MS, PAD_LEFT, PAD_RIGHT, SHAKE_FRACTION, STEP } from "../constants";
import { soundsOf } from "../audio/SoundManager";
import { cheerForScore } from "../cheers";
import { hostEvents, externalScores } from "../host";
import { pickPair } from "../numbers/pair";
import { isCasualWin, shouldLevelBreak } from "../modes";
import { randomRng } from "../numbers/rng";
import type { ChoicePair, GameConfig, Side } from "../numbers/types";
import { readBest, writeBest } from "../storage/best";
import { paceAfterAnswer, paceAfterWait, restYFromPace } from "../cameraPace";
import { levelForFloor, timeForFloor } from "../timer";
import { Hud } from "../ui/Hud";
import { PauseOverlay } from "../pause/PauseOverlay";
import { columnX, playHeight } from "../world/column";
import { Player } from "../world/Player";
import { Sky } from "../world/Sky";
import { SodPlatform } from "../world/SodPlatform";

export class PlayScene extends Phaser.Scene {
  private config!: GameConfig;
  private player!: Player;
  private hud!: Hud;
  private pauseUi!: PauseOverlay;
  private sky!: Sky;
  private ground!: Phaser.GameObjects.Graphics;
  private leftPlat: SodPlatform | null = null;
  private rightPlat: SodPlatform | null = null;
  private stand: SodPlatform | null = null;
  private platforms: SodPlatform[] = [];
  private pair: ChoicePair | null = null;
  private floor = 0;
  private score = 0;
  private best = 0;
  private cameraY = 0;
  private cameraTarget = 0;
  private pace = 0;
  private choiceAt = 0;
  private jumping = false;
  private falling = false;
  private busy = false;
  private paused = false;
  private onBreak = false;
  private deadline = 0;
  private duration = 4500;
  private remainingOnPause = 0;
  private groundTop = 0;
  private startHint: Phaser.GameObjects.Text | null = null;
  private pauseAt = 0;

  constructor() {
    super("climb");
  }

  init(): void {
    this.config = this.registry.get("playConfig") as GameConfig;
  }

  create(): void {
    this.best = readBest(this.config);
    this.floor = 0;
    this.score = 0;
    this.jumping = false;
    this.falling = false;
    this.busy = false;
    this.paused = false;
    this.onBreak = false;
    this.platforms = [];
    this.pace = 0;

    this.sky = new Sky(this);
    this.drawGround();
    soundsOf(this).playMusic();
    this.player = new Player(this);
    this.hud = new Hud(this, () => this.togglePause());
    this.pauseUi = new PauseOverlay(
      this,
      () => this.togglePause(),
      () => {
        soundsOf(this).stopMusic();
        this.scene.start("menu");
      },
    );

    this.groundTop = playHeight(this) - 120;
    this.player.place(columnX(this, 0.5), this.groundTop);
    this.cameraY = 0;
    this.cameraTarget = 0;
    this.cameras.main.setScroll(0, 0);

    this.spawnChoice(this.groundTop - STEP, true);
    this.hud.set(this.score, 1, this.best, this.config.mode);
    this.hud.setHint("");
    this.hud.setTimer(1, this.config.mode);
    this.showStartHint();

    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => this.onKey(e));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.onPointer(pointer));
    this.scale.on("resize", this.onResize, this);
    this.events.once("shutdown", () => this.scale.off("resize", this.onResize, this));
    hostEvents(this).emit("game_start", { ...this.config });
  }

  private drawGround(): void {
    this.ground = this.add.graphics();
    this.ground.setDepth(5);
    this.paintGround();
  }

  private paintGround(): void {
    const w = this.scale.width;
    const top = this.groundTop || playHeight(this) - 120;
    this.ground.clear();
    this.ground.fillStyle(0x16324f, 1);
    this.ground.fillRect(0, top + 8, w, 400);
    this.ground.fillStyle(0xc9a066, 1);
    this.ground.fillRect(0, top + 16, w, 400);
    this.ground.fillStyle(0x6fbf3b, 1);
    this.ground.fillRect(0, top, w, 22);
    for (let x = 20; x < w; x += 48) {
      this.ground.fillStyle(0x62b332, 1);
      this.ground.fillCircle(x, top + 18, 12);
    }
  }

  private spawnChoice(worldY: number, paused: boolean): void {
    this.choiceAt = this.time.now;
    const pair = pickPair(
      Math.max(1, this.floor + 1),
      this.config.difficulty,
      randomRng,
      this.config.numbers,
      undefined,
      { min: this.config.min, max: this.config.max },
    );
    this.pair = pair;
    const left = new SodPlatform(this, columnX(this, PAD_LEFT), worldY, PAD_LEFT, pair.left);
    const right = new SodPlatform(this, columnX(this, PAD_RIGHT), worldY, PAD_RIGHT, pair.right);
    left.hit.on("pointerup", () => this.choose("left"));
    right.hit.on("pointerup", () => this.choose("right"));
    this.leftPlat = left;
    this.rightPlat = right;
    this.platforms.push(left, right);

    if (this.config.mode === "casual") {
      this.onBreak = false;
      this.deadline = Number.POSITIVE_INFINITY;
      this.hud.setTimer(1, this.config.mode);
      return;
    }

    this.duration = timeForFloor(this.floor + 1, this.config.mode, this.config.difficulty);
    if (paused) {
      this.onBreak = true;
      this.deadline = Number.POSITIVE_INFINITY;
      this.hud.setTimer(1, this.config.mode);
    } else {
      this.onBreak = false;
      this.deadline = this.time.now + this.duration;
      if (this.stand) {
        this.stand.dropAt = this.deadline;
        this.stand.shakeAt = this.deadline - this.duration * SHAKE_FRACTION;
      }
    }
  }

  private onPointer(pointer: Phaser.Input.Pointer): void {
    if (this.hud.hitPause(pointer.x, pointer.y)) {
      this.togglePause();
      return;
    }
    if (this.paused || this.busy || this.falling || this.jumping || !this.pair) return;
    const pt = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const over = (p: SodPlatform | null) => {
      if (!p || p.gone) return false;
      const b = p.hit.getBounds();
      return Phaser.Geom.Rectangle.Contains(b, pt.x, pt.y);
    };
    if (over(this.leftPlat)) this.choose("left");
    else if (over(this.rightPlat)) this.choose("right");
  }

  private onKey(e: KeyboardEvent): void {
    if (e.key === "Escape" || e.key === " " || e.code === "Space") {
      e.preventDefault?.();
      this.togglePause();
      return;
    }
    if (this.paused || !this.pair) return;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.choose("left");
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.choose("right");
  }

  private choose(side: Side): void {
    if (this.busy || this.falling || this.jumping || this.paused || !this.pair) return;
    const target = side === "left" ? this.leftPlat : this.rightPlat;
    const other = side === "left" ? this.rightPlat : this.leftPlat;
    if (!target || !other) return;
    this.busy = true;
    this.pace = paceAfterAnswer(this.pace, this.time.now - this.choiceAt, this.floor === 0);

    const correct = side === this.pair.bigger;
    other.vanish(this);
    if (!correct) {
      this.hideStartHint();
      target.vanish(this);
      this.startFall();
      return;
    }

    this.onBreak = false;
    soundsOf(this).play("correct");
    this.hideStartHint();
    const destX = columnX(this, target.xFrac);
    const destY = target.worldY;
    this.startJump(destX, destY, () => {
      this.score += 1;
      this.floor += 1;
      const newLevel = levelForFloor(this.floor);
      let pauseNext = false;
      if (shouldLevelBreak(this.config.mode, this.floor)) {
        pauseNext = true;
        this.hud.setHint("JUMP WHEN READY");
        soundsOf(this).play("level_complete");
        hostEvents(this).emit("level_break", { level: newLevel });
      } else {
        this.hud.setHint("");
      }
      this.hud.set(this.score, newLevel, Math.max(this.best, this.score), this.config.mode);
      if (isCasualWin(this.config.mode, this.floor)) {
        soundsOf(this).play("level_complete");
        this.finish(true);
        return;
      }
      this.stand = target;
      this.leftPlat = null;
      this.rightPlat = null;
      this.pair = null;
      this.spawnChoice(destY - STEP, pauseNext);
      this.busy = false;
      this.prunePlatforms();
      hostEvents(this).emit("platform_landed", { floor: this.floor });
    });
  }

  private startJump(toX: number, toY: number, onLand: () => void): void {
    this.jumping = true;
    this.player.jump();
    const fromX = this.player.worldX;
    const fromY = this.player.worldY;
    this.retargetCamera(toY);
    const state = { t: 0 };
    this.tweens.add({
      targets: state,
      t: 1,
      duration: JUMP_MS,
      ease: "Sine.easeInOut",
      onUpdate: () => {
        const t = state.t;
        const x = fromX + (toX - fromX) * t;
        const base = fromY + (toY - fromY) * t;
        const arc = Math.sin(t * Math.PI) * JUMP_ARC;
        this.player.place(x, base - arc);
      },
      onComplete: () => {
        this.player.place(toX, toY);
        this.player.idle();
        this.jumping = false;
        onLand();
      },
    });
  }

  private startFall(): void {
    this.falling = true;
    this.busy = true;
    soundsOf(this).play("fail");
    this.player.jump();
    this.tweens.add({
      targets: this.player.sprite,
      y: this.player.worldY + 420,
      x: this.player.worldX + 40,
      duration: 720,
      ease: "Cubic.easeIn",
      onUpdate: () => {
        this.player.shadow.setPosition(
          this.player.sprite.x + 2,
          this.player.sprite.y + 4,
        );
      },
      onComplete: () => this.finish(false),
    });
  }

  private finish(win: boolean): void {
    const isRecord = !externalScores(this) && writeBest(this.config, this.score);
    if (this.score > this.best) this.best = this.score;
    const title = cheerForScore(this.score);
    hostEvents(this).emit("game_end", { score: this.score, title, win });
    externalScores(this)?.submit(this.score, { ...this.config });
    const blur = this.cameras.main.filters?.internal;
    if (blur) blur.addBlur(1, 2, 2, 1.4);
    this.scene.pause();
    this.scene.launch("result", {
      title,
      score: this.score,
      best: this.best,
      isRecord,
      win,
      config: this.config,
    });
    this.scene.bringToTop("result");
  }

  private togglePause(): void {
    if (this.falling || this.jumping) return;
    if (this.time.now - this.pauseAt < 80) return;
    this.pauseAt = this.time.now;
    if (!this.paused) {
      this.paused = true;
      this.remainingOnPause =
        this.deadline === Number.POSITIVE_INFINITY ? 0 : Math.max(0, this.deadline - this.time.now);
      this.leftPlat?.setTagVisible(false);
      this.rightPlat?.setTagVisible(false);
      this.pauseUi.show();
      soundsOf(this).pauseMusic();
      hostEvents(this).emit("pause");
      return;
    }
    this.paused = false;
    this.pauseUi.hide();
    soundsOf(this).resumeMusic();
    if (this.pair && this.leftPlat && this.rightPlat) {
      const next = pickPair(
        Math.max(1, this.floor + 1),
        this.config.difficulty,
        randomRng,
        this.config.numbers,
        this.pair,
        { min: this.config.min, max: this.config.max },
      );
      this.pair = next;
      this.leftPlat.setValue(next.left);
      this.rightPlat.setValue(next.right);
    }
    if (this.deadline !== Number.POSITIVE_INFINITY) {
      this.deadline = this.time.now + this.remainingOnPause;
      if (this.stand && this.stand.dropAt) {
        const used = this.duration - this.remainingOnPause;
        this.stand.dropAt = this.deadline;
        this.stand.shakeAt = this.deadline - Math.max(0, this.duration * SHAKE_FRACTION - used);
      }
    }
    hostEvents(this).emit("resume");
  }

  private prunePlatforms(): void {
    const cam = this.cameras.main.scrollY;
    const keep: SodPlatform[] = [];
    for (const p of this.platforms) {
      if (p.container.y > cam + playHeight(this) + 200) {
        p.destroy();
      } else keep.push(p);
    }
    this.platforms = keep;
  }

  private onResize(): void {
    this.sky.layout();
    this.groundTop = playHeight(this) - 120;
    this.paintGround();
    this.hud.layout(this);
    this.pauseUi.layout(this);
    if (this.leftPlat) this.leftPlat.container.x = columnX(this, PAD_LEFT);
    if (this.rightPlat) this.rightPlat.container.x = columnX(this, PAD_RIGHT);
    if (this.startHint) {
      this.startHint.setPosition(this.scale.width / 2, this.scale.height * 0.42);
    }
    if (this.stand) this.stand.container.x = columnX(this, this.stand.xFrac);
    const px = this.stand ? columnX(this, this.stand.xFrac) : columnX(this, 0.5);
    const py = this.stand ? this.stand.worldY : this.groundTop;
    if (!this.jumping && !this.falling) this.player.place(px, py);
    this.retargetCamera(py);
  }

  private showStartHint(): void {
    this.startHint = this.add
      .text(this.scale.width / 2, this.scale.height * 0.42, "Jump to the\nbigger number", {
        fontFamily: "Paytone One, sans-serif",
        fontSize: "40px",
        color: "#fff8e7",
        align: "center",
        stroke: "#16324f",
        strokeThickness: 8,
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(30);
  }

  private hideStartHint(): void {
    if (!this.startHint) return;
    const hint = this.startHint;
    this.startHint = null;
    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 180,
      onComplete: () => hint.destroy(),
    });
  }

  private retargetCamera(standWorldY: number): void {
    const h = playHeight(this);
    this.cameraTarget = standWorldY - h * (1 - restYFromPace(this.pace));
  }

  update(_time: number, _delta: number): void {
    if (
      !this.paused &&
      !this.falling &&
      !this.jumping &&
      !this.onBreak &&
      this.floor > 0
    ) {
      this.pace = paceAfterWait(this.pace, _delta / 1000);
      this.retargetCamera(this.player.worldY);
    }

    const camErr = this.cameraTarget - this.cameraY;
    this.cameraY += camErr * Math.min(1, (_delta / 1000) * 6);
    this.cameras.main.setScroll(0, this.cameraY);
    this.sky.update(_delta, this.cameraY, this.paused);

    if (this.paused || this.falling || this.onBreak || this.config.mode === "casual") {
      if (this.onBreak || this.config.mode === "casual") this.hud.setTimer(1, this.config.mode);
      return;
    }

    if (this.deadline !== Number.POSITIVE_INFINITY) {
      const left = this.deadline - this.time.now;
      this.hud.setTimer(left / this.duration, this.config.mode, left);
    }

    const now = this.time.now;
    for (const p of this.platforms) {
      if (p.gone || !p.dropAt) continue;
      if (now >= p.dropAt) {
        const wasStand = p === this.stand;
        soundsOf(this).play("crumble");
        p.crumble(this);
        if (wasStand && !this.falling && !this.jumping) this.startFall();
      } else if (now >= p.shakeAt) {
        p.startShake(this);
      }
    }
  }
}
