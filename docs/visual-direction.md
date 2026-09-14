# Jumpin' Jack — visual direction

Locked in Phase 1. Do not reopen unless Mike changes them.

## World

**C · Cut-paper Kite**, with mixes:

| Piece | Choice |
|---|---|
| Sky / clouds | Cobalt cut-paper sky, cream stacked-ellipse clouds, hard navy offset shadows |
| Platforms | **Sod** — kraft dirt block, scalloped grass cap |
| Numbers | **Manila tag** pinned on the pad face (not hanging below). Stacked fractions on a tall tag. 6-digit wholes shrink on the tag. |
| HUD / timer | **A Classic** — navy rounded pills, gold numbers, gold circle pause, green-to-gold timer bar, Fredoka/Nunito type |
| Menu | **Toy buttons** — big navy buttons, selected gold, gold **Start Climb**. Robot (or chosen character) waits on the ground. |
| End overlay | **Report card** — cream paper sheet, “You fell!” / “You made it!”, platform count, NEW RECORD pill, Climb again, Change setup |
| Title type | Paytone One wordmark in the sky |
| Player | **Adventurer** from `reference assets/adventurer_tilesheet.png` (80×110 cells). Idle `0,0` / `1,8`. Jump duck `1,0` → air `0,4` → kick `2,2`. Slight navy offset drop-shadow (`2px 4px`, 35%). Nearest-neighbor scale. Foozle robot unused. |

Play column ~420px centered. Desktop landscape expands the sky on both sides. Mobile is the column only.

## Type

- HUD / buttons: Nunito ExtraBold + Fredoka
- Wordmark: Paytone One
- Numbers on tags: Nunito / Quicksand ExtraBold, US commas, stacked fractions

## Not yet produced (Phase 2)

Adventurer atlas from the tilesheet (idle + jump, transparent, integer scale). Sod platforms as Phaser graphics or a sprite. Pause/CTA as Phaser + type matching A Classic. Drop-shadow on the adventurer in-engine.
