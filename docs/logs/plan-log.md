# Jumpin' Jack — implementation log

This log is only for the Jumpin' Jack plan. Do not reuse it for other plans.

## 2026-09-14 — Phase 0 start

Set up the GitHub repo and write the asset map. No game code, no generated art, no audio conversion.

Planned steps:

1. Create this log.
2. Inspect robot frames, sheets, and audio (sizes, formats, licenses, duplicates).
3. Write `docs/asset-map.md`.
4. Add `.gitignore`, `git init`, commit existing reference files, push to `https://github.com/mschipper/jumpin-jack.git`.

## 2026-09-14 — Inspected assets

Robot Idle/Jump are 21-frame 5×5 grids. `RobotSpriteSheets/` hashes match the Foozle `Assets/SpriteSheets/` copies. Individual Idle frames are 682×730 (content ~247×360); Jump frames are 932×818 (content union 324×387). Production audio is complete except three oggs that need mp3 in Phase 4. Walk cycles and body-part PNGs are unused. Reference audio pack is backup only; `crumble_falling_rock.ogg` is CC-BY and is not in the production set.

## 2026-09-14 — Wrote asset map

Added `docs/asset-map.md` and a short `README.md` stub. No art generated. No audio converted.

## 2026-09-14 — GitHub repo live

Initialized git on `main`, remote `https://github.com/mschipper/jumpin-jack.git`. First commit `4cc622f` (166 files: prototype, Foozle pack, production audio, reference audio, asset map). Pushed to `origin/main`. Repo is public.

Phase 0 code/docs work is done. Waiting on Mike to agree the missing-vs-have list in `docs/asset-map.md` before Phase 1 mockups.

## 2026-09-14 — Phase 1 start (overall look)

Three overall-look directions as static screenshots of HTML mockups (exact HUD copy and numbers; Imagine would garble those). Desktop 16:9 and mobile 9:16 each.

Directions:
1. Toybox Sky — cartoon grass-capped pads, hanging wooden number signs
2. Cloud Deck — pale sky, white decks, cyan eye-glow, glass number plates
3. Cut-paper Kite — layered paper sky, kite-stripe pads, manila number tags

Then wait for Mike to pick before platform / menu / end-screen rounds.

## 2026-09-14 — Overall-look mockups

Built HTML/CSS mockups (not Imagine) so HUD copy and numbers stay exact. Screenshots at 2× in `docs/mockups/phase1-overall/`. Three directions: Toybox Sky, Cloud Deck, Cut-paper Kite. Desktop uses a centered 420px play column with extra sky; mobile is the column only. Tightened Cut-paper hint outline after the first shot muddied "NUMBER". Waiting on a pick before the platform-number round.

## 2026-09-14 — Overall look feedback

Mike likes **C · Cut-paper Kite** overall, not the kite-stripe platforms. Numbers should be a tag **on** the platform, not hanging below. Next: three new platform styles in the C world, tags on the pad face.

## 2026-09-14 — C-world platform styles

Locked C sky/HUD. Numbers are pinned tags on the pad face. Three pad styles in `docs/mockups/phase1-overall/c-{sod,carton,puff}-*.png`:

1. Sod — kraft dirt + scalloped grass
2. Carton — corrugated kraft + packing tape
3. Puff — paper cloud you stand on

Waiting on a pad pick before menu and results rounds.

## 2026-09-14 — HUD mix on C + Sod

Mike locked Sod pads. Wants header/timer closer to A. Three HUD options on C sky + sod pads: A Classic (navy pills, gold round pause, green-gold bar), Navy chips (A colors + C offset shadow), A pills + kite-stripe timer. Waiting on a HUD pick.

## 2026-09-14 — Number treatments

HUD locked to A Classic. Three ways to put numbers on sod pads: Manila tag, Face plate, Stamp. Each board shows whole `999,999`, decimal `0.89`/`0.9`, and stacked `3/4` vs `2/3`. Waiting on a number-treatment pick before menus and results.

## 2026-09-14 — Menu styles

Manila tag locked. Three menus in the locked world: One card, Toy buttons, Tag board. Robot waits on the ground. Waiting on a menu pick, then end-of-game screens.

## 2026-09-14 — End-of-game screens

Toy buttons locked. Three end overlays: Sky (type in the sky), Report card, Giant manila tag. Each has fail+new-record and Casual win. Waiting on a pick, then write `docs/visual-direction.md` to close Phase 1.

## 2026-09-14 — Report card locked; character exploration

End overlay = Report card. Extra Phase 1 ask: three Imagine cut-paper robot options (Foozle doesn't match C) with idle + jump sheets if possible. Video-first pipeline.

## 2026-09-14 — Character options (4)

Imagine stills + video harvest for Paper Stack, Kite Bot, Can Bot (idle bob and jump). Mike added `reference assets/adventurer_tilesheet.png` (Kenney-style 80×110, 9×3). Sliced idle (`0,0` + `1,8`) and jump (`1,0` duck, `0,4` air, `2,2` kick) into sheets. In-game composites on C+Sod+A HUD. Wrote `docs/visual-direction.md` with everything locked except the character pick. Paper cutouts vs cobalt sky eat navy helmet/shadow — stills are the clean R1–R3 look.

## 2026-09-14 — Robot vs Adventurer composite

Mike asked to compare the original Foozle robot with the adventurer tilesheet (not Imagine) on the locked layout. Both stand on the two sod pads, labeled. `char-compare-mobile.png` / `char-compare-desktop.png`.

## 2026-09-14 — Adventurer drop shadow

Re-rendered the compare with a slight navy offset drop-shadow on the adventurer (`2px 4px`, 35% #16324f) so he sits on the pad like the paper world.

## 2026-09-14 — Phase 1 locked

Player = **Adventurer** (tilesheet + drop shadow). Full visual direction in `docs/visual-direction.md`. Phase 1 complete. Phase 2 (core loop: whole / normal / Challenge) waits on Mike.

## 2026-09-14 — Drop shadow baked into adventurer sprites

Navy `#16324F` @ 35%, offset 2px right / 4px down at 1×, scaled with nearest-neighbor. Applied to idle, jump, and both 8-frame sheets. Compare mockup uses the baked PNG (no CSS filter). Phase 2 atlas must keep this on every frame.

## 2026-09-14 — Un-bake adventurer shadow

Mike pushed back on modifying the spritesheet. Restored clean frames from `adventurer_tilesheet.png`. Shadow is a Phase 2 **runtime** effect (duplicate tinted sprite preferred; Phaser 4 `filters.internal.addShadow` as alt). Mockups preview it with CSS `drop-shadow`.

## 2026-09-14 — Phase 2 start

Scaffold Vite + Phaser 4 + TS + Vitest. Core loop: whole numbers, normal difficulty, Challenge mode. Adventurer with runtime drop shadow. Sod platforms + manila tags. Delete Phase 1 mockups per Mike.

Planned steps:
1. Delete `docs/mockups/`.
2. Scaffold Vite/Phaser 4/Vitest.
3. Host seam, config, numbers (whole), timers, best-score storage + tests.
4. Scenes: menu (toy buttons), play, pause, results (report card).
5. Verify tests/build, commit, push.

## 2026-09-14 — Phase 2 playable

Deleted `docs/mockups/`. Vite + Phaser 4 + Vitest scaffold. Whole-number generator, config parse, timers, per-config best keys (17 tests). Toy-button menu, Challenge climb with sod pads + manila tags, Adventurer + runtime drop-shadow sprite, pause (hides/regenerates numbers), report-card results. `scene.switch` from preload to climb (start was a no-op while preload was still creating). Decimal/fraction still use the whole generator until Phase 3.

## 2026-09-14 — Idle + click fixes

Idle was ping-ponging sheet frame 17 (different vertical crop) so the adventurer looked like he was hopping. Idle is now the standing cell only. Clicks missed pads because Phaser 4 containers don't take a hit area the way Phaser 3 did, and the hidden pause overlay still had interactive children. Pads now use a Zone; pause disables input when hidden; pointerup also tests pad bounds.

## 2026-09-14 — Idle bob

Sheet has no idle loop. Standing cell (frame 0) now has a 2px sine y-bob, 1100ms yoyo, stopped during jump.

## 2026-09-14 — Camera pace

Stand-pad rest height follows answer speed: fast jumps raise `pace` (pad sits up to 60% from the bottom), waiting and slow answers ease it back to 22%. First ground jump does not bump pace.

## 2026-09-15 — Phase 3 start

Decimal + fraction generators, stacked fraction tags, easy/hard already in whole tables, Casual/Speed Run polish, URL params, tests for all generators and mode rules.

## 2026-09-15 — Phase 3 playable

Whole/decimal/fraction × easy/normal/hard generators (never equal, 6-digit decimal cap, proper fractions den 2–12, cross-multiply compare). Stacked fraction tags. Casual win at 20. Speed run: no level breaks, thicker timer + seconds once the clock starts. URL params skip only the fields provided. 30 unit tests.

## 2026-09-15 — Larger fractions + min/max params

Stacked fraction type is 28px on a taller tag. URL/host `min` and `max` (aliases `minValue`/`maxValue`) clamp generated values; not required to skip the menu. Best-score key includes the range when set.

## 2026-09-15 — Fraction tag spacing

Moved stacked numerator, bar, and denominator down 5px so they sit lower on the card.

## 2026-09-15 — Camera hold on fast streak

Pace no longer decays between jumps. Fast window is 1.6s; height holds until 2.2s of lingering, then settles. A ~1s rhythm stays at the top.

## 2026-09-15 — Slow camera decay

Hold was too sticky. Restored continuous settle, slower than the original: 0.05/s while waiting (was 0.14), 0.12 drop at a fully slow answer (was 0.24). Fast window stays 1.6s so a ~1s rhythm still climbs.

## 2026-09-15 — Phase 4 start

Audio + height flourishes. Convert the three oggs to mp3, wire SoundManager (host `"sounds"` early-return), loop music with pause/mute, procedural paper clouds with parallax drift, occasional in-engine paper birds/butterflies, despawn off-screen.

Planned steps:
1. ffmpeg ogg → mp3; copy clips to `public/assets/audio/`.
2. `src/audio/SoundManager.ts` + preload + event wiring + pause mute.
3. `src/world/Sky.ts` clouds and critters.
4. Tests for sound id contract / wrap helper; playtest.

## 2026-09-15 — Phase 4 audio files

Converted `correct.ogg`, `crumble.ogg`, `music.ogg` to mp3. Copied all eight clips to `public/assets/audio/`. Sources stay in `audio/`.

## 2026-09-15 — Phase 4 SoundManager

`src/audio/SoundManager.ts` loads whole-file mp3s unless registry `"sounds"` or `noAudio` is set. Music loops at 0.38; pause pauses it; mute lives on the pause overlay and persists in localStorage. SFX: button, correct land, crumble, fail, level complete, game over / new record.

## 2026-09-15 — Phase 4 sky

Procedural cream stacked-ellipse clouds with navy offset shadows, slow drift, climb parallax, recycle off-screen. Occasional in-engine paper birds and butterflies (no sprites). Depth behind pads so numbers stay readable.

## 2026-09-15 — Phase 4 complete

Wired across menu, climb, pause, results. 37 tests. Vite serves the mp3s. Headless Chrome mounts the Phaser canvas but does not paint WebGL, so visual/audio feel needs Mike’s playtest.

## 2026-09-15 — Sky cast, hint, pads, correct SFX

Larger clouds plus a red biplane, hot-air balloon, and bird flock. Start hint is a large centered banner that leaves on the first jump. Pads spread to 0.22/0.78. Correct SFX was both late (played after the 480ms land) and had ~100ms of baked silence plus a slow power-up arpeggio; trim silence, speed the clip, play on pick.

## 2026-09-15 — Cap sky flourishes

At most two non-cloud actors on screen. Balloon is no longer always present; one spawn queue picks plane / flock / balloon / butterfly.















