# Jumpin' Jack — LearningPlanet integration

For the agent that vendors this standalone repo into `learningplanet-next` using the `integrate-standalone-game` skill (same playbook as Lunch Break).

**This game is Phaser 4.** LearningPlanet already has `phaser` → Phaser 4 and `phaser3` → Phaser 3 (`npm:phaser@^3.90.0`). Lunch Break rewrites `from "phaser"` to `from "phaser3"` because it is a Phaser 3 game. **Do not do that rewrite here.** Keep `from "phaser"`.

Suggested slug: `jumpin-jack`.

Standalone entry is `src/main.ts` (reads `#game`, calls `createGame`). Everything else is wrapper-safe: `createGame({ parent, host })` in `src/game.ts`. Guard `window` / `import.meta.env` — only `main.ts` and `vite-env.d.ts` assume Vite.

---

## Host seam

Registry keys (set by the wrapper, never by game scenes):

| Key | When | Purpose |
|---|---|---|
| `"host"` | optional | `Host` object below. Standalone sets nothing. |
| `"sounds"` | optional | Object matching `Sounds` in `src/audio/SoundManager.ts`. When set, `SoundManager.preload` returns immediately. |

`createGame({ parent, host })` writes `"host"` and, if `host` is passed, boots Phaser with `audio: { noAudio: true }` so LearningPlanet’s `audioService` owns playback.

```ts
interface Host {
  config?: PartialConfig;   // host wins over URL; see params
  assetBase?: string;       // default "assets"
  scores?: { external: boolean; submit(score: number, meta?: Record<string, unknown>): void | Promise<void> };
  events?: { emit(type: string, payload?: Record<string, unknown>): void };
  playerName?: () => string | null; // seam only; unused in gameplay
}

interface PartialConfig {
  numbers?: "whole" | "decimal" | "fraction";
  difficulty?: "easy" | "normal" | "hard";
  mode?: "casual" | "challenge" | "speed";
  min?: number;
  max?: number;
}
```

Accessors: `src/host.ts` (`getHost`, `hostEvents`, `externalScores`, `assetBase`, `hostConfig`).

Preload merges `host.config` over the URL (`mergeConfig` in `src/config.ts`). If `numbers`, `difficulty`, and `mode` are all set, the title screen is skipped. `min` / `max` are optional and do not skip the title screen by themselves.

### Scores

Score = platforms successfully landed (integer). No streak or level bonus.

On end, if `host.scores.external` is true: skip `localStorage` bests and call

```ts
submit(score, { numbers, difficulty, mode, min?, max? })
```

Standalone key (do not use when `external`):

```
jumpin-jack-best:{numbers}:{difficulty}:{mode}
jumpin-jack-best:{numbers}:{difficulty}:{mode}:{min}:{max}  // when range is set
```

That is **27 independent bests** for the type × difficulty × mode matrix, plus extra keys when a lesson sets `min`/`max`. Recommend LearningPlanet `contentSlug` (or equivalent) per combo so the host stores those 27 records separately, e.g. `jumpin-jack-whole-normal-challenge`. Include the range in the slug when the lesson pins `min`/`max`.

### Events

No-op standalone. Payload is omitted when the table says —.

| Type | Payload |
|---|---|
| `game_start` | `{ numbers, difficulty, mode, min?, max? }` |
| `platform_landed` | `{ floor }` (platforms completed after that land) |
| `level_break` | `{ level }` (Challenge only, entering the new level) |
| `game_end` | `{ score, title, win }` (`win` is true only for Casual at 20) |
| `pause` | — |
| `resume` | — |

---

## URL / lesson params

Same table as the README. Host `config` wins over the URL when both exist (embed case).

| Param | Values |
|---|---|
| `numbers` | `whole` `decimal` `fraction` |
| `difficulty` | `easy` `normal` `hard` |
| `mode` | `casual` `challenge` `speed` |
| `min` `max` | inclusive numeric clamp; aliases `minValue` `maxValue` |

Partial params still show the title screen; **Game options** lists only unlocked fields. All three of `numbers` / `difficulty` / `mode` skip the title screen and start the climb.

Lesson examples:

```
?numbers=whole&difficulty=easy&mode=casual&min=1&max=20
?numbers=fraction&difficulty=hard&mode=challenge
```

---

## Assets

`assetBase` default `"assets"`. Standalone Vite serves `public/assets/` at that path. In LearningPlanet use `/games/jumpin-jack/assets`.

| Path | What |
|---|---|
| `{assetBase}/adventurer.png` | Kenney 80×110 spritesheet (9×3). Idle frame 0; jump 9, 4, 20. Nearest-neighbor. Drop shadow is runtime, not baked. |
| `{assetBase}/audio/button_press.mp3` | Menus |
| `{assetBase}/audio/correct.mp3` | Correct pick |
| `{assetBase}/audio/crumble.mp3` | Stand pad gives way |
| `{assetBase}/audio/fail.mp3` | Wrong pick / timeout fall |
| `{assetBase}/audio/game_over.mp3` | Results (not a new record) |
| `{assetBase}/audio/level_complete.mp3` | Challenge break; Casual win |
| `{assetBase}/audio/music.mp3` | Loop |
| `{assetBase}/audio/new_high_score.mp3` | Beat this-config best |

Whole-file mp3s, no sprites. `SoundManager.preload` loads them unless `"sounds"` is set or Phaser `noAudio` is on.

Fonts are loaded in standalone `index.html` (not copied into LP). The wrapper must load:

- Titan One (wordmark)
- Paytone One (banners, pause/results titles)
- Nunito 800/900 (HUD, how-to, numbers)
- Fredoka 600/700 (buttons)
- Quicksand 700 (optional; numbers fall back to Nunito)

---

## Audio adapter

Implement `Sounds` from `src/audio/SoundManager.ts` and `registry.set("sounds", adapter)` after `createGame`. Required methods:

```ts
play(id: SoundId): void
playMusic(): void
stopMusic(): void
pauseMusic(): void
resumeMusic(): void
stopSfx(): void
readonly muted: boolean
setMuted(muted: boolean): void
toggleMute(): boolean
```

`SoundId`: `button_press` `correct` `crumble` `fail` `game_over` `level_complete` `music` `new_high_score`.

Lunch Break’s adapter is the template; this game also needs **pause/resume music** and **stopSfx** (results overlay). Map mute to LearningPlanet’s global sound settings, not `localStorage["jumpin-jack-mute"]`.

---

## Phaser 4 — do not rewrite imports

LearningPlanet `package.json`:

```json
"phaser": "^4.0.0",
"phaser3": "npm:phaser@^3.90.0"
```

| Game | Import |
|---|---|
| Lunch Break (Phaser 3) | `from "phaser3"` after sync codemod |
| **Jumpin' Jack (Phaser 4)** | **`from "phaser"` — leave it** |

A sync script that blindly replaces `"phaser"` → `"phaser3"` will boot the wrong engine and break Phaser 4 APIs (filters, scale, input). Skip that codemod for this game.

Boot from `src/game.ts`:

```ts
import { createGame } from "./game";

const game = createGame({ parent: el, host });
game.registry.set("sounds", adapter);
```

`createGame` uses `Phaser.Scale.RESIZE` and a 420×844 logical size. The play column stays 420px centered; extra desktop width is sky. Observe the parent and call `game.scale.refresh()` on resize (Lunch Break wrapper pattern).

---

## Sync-script sketch

Copy game code; do **not** overwrite LP-owned wrapper files.

**Copy from this repo**

- `src/audio/`, `src/numbers/`, `src/pause/`, `src/scenes/`, `src/storage/`, `src/ui/`, `src/world/`
- `src/cameraPace.ts`, `src/cheers.ts`, `src/config.ts`, `src/constants.ts`, `src/game.ts`, `src/host.ts`, `src/juice.ts`, `src/levelBreak.ts`, `src/modes.ts`, `src/timer.ts`
- `public/assets/` → `public/games/jumpin-jack/assets/`

**Do not copy**

- `src/main.ts` (standalone `#game` boot)
- `src/vite-env.d.ts`
- `index.html` (fonts must be loaded by the wrapper instead)

**LP-owned (create once, never overwrite on sync)**

- `app/_components/games/jumpin-jack/index.tsx` — React wrapper: identity, `createGame`, `"host"` / `"sounds"`, `ResizeObserver`
- `settings.ts` — `GAME_SLUG = "jumpin-jack"`, `ASSET_BASE = "/games/jumpin-jack/assets"`, sound manifest (one sample per `SoundId`, music bus for `music`)
- `audio-adapter.ts` — `Sounds` implementation over `audioService.scope`

Register the slug in `app/_components/game-embed.tsx` (`ssr: false`). Comment it as Phaser 4, not Phaser 3.

Example sync (no Phaser import rewrite):

```bash
SRC=../jumpin-jack
DEST=app/_components/games/jumpin-jack
ASSETS=public/games/jumpin-jack/assets

for d in audio numbers pause scenes storage ui world; do
  rm -rf "$DEST/$d"
  cp -R "$SRC/src/$d" "$DEST/$d"
done

for f in cameraPace.ts cheers.ts config.ts constants.ts game.ts host.ts juice.ts levelBreak.ts modes.ts timer.ts; do
  cp "$SRC/src/$f" "$DEST/$f"
done

rm -rf "$ASSETS"
cp -R "$SRC/public/assets" "$ASSETS"
```

---

## Wrapper outline

Mirror Lunch Break’s `index.tsx`, with these differences:

1. `import * as Phaser from "phaser"` (v4) **or** just `createGame` from `./game` (already imports v4).
2. `host.config` from lesson/embed props if the lesson pins number type / difficulty / mode.
3. `scores.submit(score, meta)` — persist `meta.numbers`, `meta.difficulty`, `meta.mode` (and range) via `contentSlug`.
4. `audio: { noAudio: true }` is already set when `createGame` receives `host`.
5. Inject `"sounds"` immediately after `createGame` returns.

`playerName` may be wired for a future HUD; it is unused today.

---

## Tuning

All feel constants: `src/constants.ts` (column width, jump, timers, pad shake, jump camera rattle, palette). Camera rest height vs answer speed: `src/cameraPace.ts`. Number generators: `src/numbers/`.

---

## Standalone commands (this repo)

```bash
npm install
npm run dev      # Vite, port 8080
npm test         # Vitest; no Phaser in unit tests
npm run build
```

GitHub: https://github.com/mschipper/jumpin-jack.git
