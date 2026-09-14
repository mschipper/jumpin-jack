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












