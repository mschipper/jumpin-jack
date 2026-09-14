# Character options (Phase 1 extra)

Foozle cute robot doesn’t match the locked Cut-paper world. Four replacements:

| Id | Name | Source | Idle | Jump |
|---|---|---|---|---|
| R1 | Paper Stack | Imagine still + video harvest | `r1-stack-idle-sheet.png` | `r1-stack-jump-sheet.png` |
| R2 | Kite Bot | Imagine still + video harvest | `r2-kite-idle-sheet.png` | `r2-kite-jump-sheet.png` |
| R3 | Can Bot | Imagine still + video harvest | `r3-can-idle-sheet.png` | `r3-can-jump-sheet.png` |
| R4 | Adventurer | `reference assets/adventurer_tilesheet.png` (80×110 cells, 9×3) | `r4-adventurer-idle-sheet.png` | `r4-adventurer-jump-sheet.png` |

In-game composites: `docs/mockups/phase1-overall/char-r*-mobile.png`. Paper cutouts are approximate (navy helmet/shadow vs cobalt sky). Stills `r*-idle.jpg` are the clean look for R1–R3.

Adventurer jump frames from the Kenney-style sheet: duck `1,0` → air `0,4` → kick `2,2`. Idle: `0,0` and `1,8`.

**Drop shadow is baked into** `r4-adventurer-idle.png`, `r4-adventurer-jump.png`, and both sheets: navy `#16324F` @ 35%, offset 2×4 px at 1× (4×8 at 2×, 6×12 at 3× sheets). Phase 2 must keep this on every frame.
