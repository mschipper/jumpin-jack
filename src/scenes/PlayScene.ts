import Phaser from "phaser";
import {
  FLOORS_PER_LEVEL,
  JUMP_ARC,
  JUMP_MS,
  SHAKE_FRACTION,
  SKY_BOT,
  SKY_TOP,
  STEP,
} from "../constants";
import { hostEvents, externalScores } from "../host";
import { pickPair, pairAsNumbers } from "../numbers/pair";
import { randomRng } from "../numbers/rng";
import type { ChoicePair, GameConfig, Side } from "../numbers/types";
import { readBest, writeBest } from "../storage/best";
import { paceAfterAnswer, paceAfterWait, restYFromPace } from "../cameraPace";
import { levelForFloor, timeForFloor } from "../timer";
import { Hud } from "../ui/Hud";
import { PauseOverlay } from "../pause/PauseOverlay";
import { columnX, playHeight } from "../world/column";
import { Player } from "../world/Player";
import { SodPlatform } from "../world/SodPlatform";

export class PlayScene extends Phaser.Scene {
  private config!: GameConfig;
  private player!: Player;
  private hud!: Hud;
  private pauseUi!: PauseOverlay;
  private sky!: Phaser.GameObjects.Graphics;
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
  private clouds: Phaser.GameObjects.Graphics[] = [];

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

    this.drawSky();
    this.drawGround();
    this.player = new Player(this);
    this.hud = new Hud(this, () => this.togglePause());
    this.pauseUi = new PauseOverlay(
      this,
      () => this.togglePause(),
      () => this.scene.start("menu"),
    );

    this.groundTop = playHeight(this) - 120;
    this.player.place(columnX(this, 0.5), this.groundTop);
    this.cameraY = 0;
    this.cameraTarget = 0;
    this.cameras.main.setScroll(0, 0);

    this.spawnChoice(this.groundTop - STEP, true);
    this.hud.set(this.score, 1, this.best, this.config.mode);
    this.hud.setHint("JUMP TO THE BIGGER NUMBER");
    this.hud.setTimer(1, this.config.mode);

    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => this.onKey(e));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.onPointer(pointer));
    this.scale.on("resize", () => this.onResize());
    hostEvents(this).emit("game_start", { ...this.config });
  }

  private drawSky(): void {
    this.sky = this.add.graphics();
    this.sky.setScrollFactor(0);
    this.sky.setDepth(-10);
    this.paintSky();
    this.makeClouds();
  }

  private paintSky(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.sky.clear();
    this.sky.fillGradientStyle(SKY_TOP, SKY_TOP, SKY_BOT, SKY_BOT, 1);
    this.sky.fillRect(0, 0, w, h);
  }

  private makeClouds(): void {
    for (const c of this.clouds) c.destroy();
    this.clouds = [];
    const spots = [
      [0.12, 0.18, 70],
      [0.78, 0.12, 90],
      [0.88, 0.42, 50],
      [0.18, 0.55, 80],
    ];
    for (const [fx, fy, r] of spots) {
      const g = this.add.graphics();
      g.fillStyle(0xfffdf6, 1);
      const x = this.scale.width * fx;
      const y = this.scale.height * fy;
      g.fillCircle(x, y, r * 0.55);
      g.fillCircle(x + r * 0.45, y + 6, r * 0.5);
      g.fillCircle(x - r * 0.4, y + 8, r * 0.42);
      g.fillStyle(0x16324f, 1);
      // offset shadow as extra puffs underneath, then cream on top already drawn
      g.setScrollFactor(0.15);
      g.setDepth(-5);
      this.clouds.push(g);
    }
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
    const pair = pickPair(Math.max(1, this.floor + 1), this.config.difficulty, randomRng);
    this.pair = pair;
    const left = new SodPlatform(this, columnX(this, 0.27), worldY, 0.27, pair.left);
    const right = new SodPlatform(this, columnX(this, 0.73), worldY, 0.73, pair.right);
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
    if (e.key === "Escape") {
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
      target.vanish(this);
      this.startFall("You fell!");
      return;
    }

    this.onBreak = false;
    const destX = columnX(this, target.xFrac);
    const destY = target.worldY;
    this.startJump(destX, destY, () => {
      this.score += 1;
      this.floor += 1;
      const newLevel = levelForFloor(this.floor);
      const oldLevel = levelForFloor(this.floor - 1);
      let pauseNext = false;
      if (
        this.config.mode === "challenge" &&
        newLevel > oldLevel &&
        this.floor % FLOORS_PER_LEVEL === 0
      ) {
        pauseNext = true;
        this.hud.setHint("JUMP WHEN READY");
        hostEvents(this).emit("level_break", { level: newLevel });
      } else {
        this.hud.setHint("JUMP TO THE BIGGER NUMBER");
      }
      this.hud.set(this.score, newLevel, Math.max(this.best, this.score), this.config.mode);
      if (this.config.mode === "casual" && this.floor >= 20) {
        this.finish("You made it!");
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

  private startFall(title: string): void {
    this.falling = true;
    this.busy = true;
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
      onComplete: () => this.finish(title),
    });
  }

  private finish(title: string): void {
    const isRecord = !externalScores(this) && writeBest(this.config, this.score);
    if (this.score > this.best) this.best = this.score;
    hostEvents(this).emit("game_end", { score: this.score, title });
    externalScores(this)?.submit(this.score, { ...this.config });
    this.scene.start("result", {
      title,
      score: this.score,
      best: this.best,
      isRecord,
      config: this.config,
    });
  }

  private togglePause(): void {
    if (this.falling || this.jumping) return;
    if (!this.paused) {
      this.paused = true;
      this.remainingOnPause =
        this.deadline === Number.POSITIVE_INFINITY ? 0 : Math.max(0, this.deadline - this.time.now);
      this.leftPlat?.setTagVisible(false);
      this.rightPlat?.setTagVisible(false);
      this.pauseUi.show();
      hostEvents(this).emit("pause");
      return;
    }
    this.paused = false;
    this.pauseUi.hide();
    if (this.pair && this.leftPlat && this.rightPlat) {
      const prev = pairAsNumbers(this.pair);
      const next = pickPair(Math.max(1, this.floor + 1), this.config.difficulty, randomRng, prev);
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
    this.paintSky();
    this.groundTop = playHeight(this) - 120;
    this.paintGround();
    this.hud.layout(this);
    this.pauseUi.layout(this);
    if (this.leftPlat) this.leftPlat.container.x = columnX(this, 0.27);
    if (this.rightPlat) this.rightPlat.container.x = columnX(this, 0.73);
    if (this.stand) this.stand.container.x = columnX(this, this.stand.xFrac);
    const px = this.stand ? columnX(this, this.stand.xFrac) : columnX(this, 0.5);
    const py = this.stand ? this.stand.worldY : this.groundTop;
    if (!this.jumping && !this.falling) this.player.place(px, py);
    this.retargetCamera(py);
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

    if (this.paused || this.falling || this.onBreak || this.config.mode === "casual") {
      if (this.onBreak || this.config.mode === "casual") this.hud.setTimer(1, this.config.mode);
      return;
    }

    if (this.deadline !== Number.POSITIVE_INFINITY) {
      const left = this.deadline - this.time.now;
      this.hud.setTimer(left / this.duration, this.config.mode);
    }

    const now = this.time.now;
    for (const p of this.platforms) {
      if (p.gone || !p.dropAt) continue;
      if (now >= p.dropAt) {
        const wasStand = p === this.stand;
        p.crumble(this);
        if (wasStand && !this.falling && !this.jumping) this.startFall("You fell!");
      } else if (now >= p.shakeAt) {
        p.startShake(this);
      }
    }
  }
}
