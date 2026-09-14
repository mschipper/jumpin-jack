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
