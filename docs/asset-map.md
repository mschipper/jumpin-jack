# Jumpin' Jack — asset map

Phase 0 inventory. Production art is not generated here. Anything in **Missing** needs to be provided or created later, with three options before a generated asset is used.

## Robot (have — use)

Foozle “Cute Robot” pack, **CC0**. Commissioned from mayakhan95, distributed by Foozle. License: `reference assets/Foozle_2DC0001_Cute_Robot/Foozle_File_License.txt`. Attribution not required.

Gray body, cyan square eyes, idle bob and jump cycle. This is the player.

### Sheets (padded grids — do not load at runtime)

`RobotSpriteSheets/` is a **byte-identical copy** of `reference assets/Foozle_2DC0001_Cute_Robot/Assets/SpriteSheets/`.

| File | Canvas | Grid | Frames | Notes |
|---|---|---|---|---|
| Idle.png | 3414×3654 | 5×5 cells of 682×730 | 21 (last 4 cells empty) | ~1.3 MB. Heavy per-cell padding. |
| Jump.png | 4664×4094 | 5×5 cells of 932×818 | 21 (last 4 cells empty) | ~1.8 MB. Heavy per-cell padding. |
| Walk.png | 3574×3724 | 5×5 of 714×744 | 21 | **Do not use in gameplay.** |
| Walk02.png | 3914×3774 | 5×5 of 782×754 | 21 | Run cycle. **Do not use in gameplay.** |

### Individual frames (prefer these for the atlas)

`reference assets/Foozle_2DC0001_Cute_Robot/Assets/{Idle,Jump}/Armature_{Idle|Jump}_00.png` … `_20.png` (21 each).

| Anim | Canvas | Opaque content (union) | Use |
|---|---|---|---|
| Idle | 682×730 | 247×360 | Loop on a pad |
| Jump | 932×818 | 324×387 | In-air arc; reuse for fall (no fall sheet) |

**Atlas plan (Phase 2):** trim each frame to its opaque bounds plus a few pixels of padding, pack 21 idle + 21 jump into one Phaser atlas, scale down at runtime (prototype hero was ~52×70; expect ~64–96 px tall in the play column). Do not ship the 3k-wide sheets to the browser.

### Not used in gameplay

| Path | Why |
|---|---|
| Walk / Walk02 sheets and frame folders | Player never walks |
| `GameAssetsSource/Robot(512px)/` and `Robot(1500px)/` | Loose body parts for a ragdoll we are not building |
| Preview GIFs and branding PNG | Marketing only |

Keep them in the repo as source. Omit them from `public/assets`.

---

## Audio — production set (have — use)

`audio/`. Named for intended use. Source may be ogg; **shipped** copies are mp3 under `public/assets/audio/` (Safari-friendly). Keep originals in `audio/` as source.

| File | Format | Duration | Role |
|---|---|---|---|
| `button_press.mp3` | mp3, 44.1 kHz stereo | 1.32 s | Menus / pause |
| `correct.ogg` | vorbis, 44.1 kHz mono | 0.52 s | Correct land. Shipped as mp3. |
| `crumble.ogg` | vorbis, 48 kHz stereo | 0.46 s | Stand pad gives way. Shipped as mp3. |
| `fail.mp3` | mp3, 44.1 kHz stereo | 3.00 s | Wrong pick / timeout fall |
| `game_over.mp3` | mp3, 44.1 kHz stereo | 3.54 s | Results appear |
| `level_complete.mp3` | mp3, 44.1 kHz stereo | 0.84 s | Challenge break; Casual win |
| `music.ogg` | vorbis, 48 kHz stereo | 52.5 s loop | Climb music. Shipped as mp3. |
| `new_high_score.mp3` | mp3, 44.1 kHz stereo | 2.37 s | Beat this-config best |

No license files sit next to these. Treat them as project audio unless Mike says otherwise.

---

## Audio — reference pack (have — do not use unless a production clip fails)

`reference assets/audio reference/` — 34 clips, mapped in that folder’s README. Mostly CC0 / Mixkit.

**Do not ship** `04_crumble/crumble_falling_rock.ogg`. It is **CC-BY 3.0** (spookymodem) and is not in the production set. If we ever used it, credit would be required.

---

## Adventurer tilesheet (have — character option)

`reference assets/adventurer_tilesheet.png` — Kenney-style pixel adventurer, 720×330, 9×3 cells of 80×110. Idle and jump frames exist on the sheet. **Use only if R4 is picked.**

## Prototype (have — mechanics reference only)

| File | Role |
|---|---|
| `greater-heights.html` | Vanilla JS/CSS prototype. Timing, crumble rules, camera rest. Not imported. |
| `Greater Heights — agent handoff.md` | Written rules for the prototype. |

No art from the prototype (CSS boxes) is reused.

---

## Missing — provide or generate (3 options before a generated asset is used)

| Need | Phase | Notes | Recommended next step |
|---|---|---|---|
| Platform (idle / shake / crumble) | 1–2 | Number sits **below** the pad. Must fit 6-digit wholes with commas (`999,999`) and stacked fractions. | Generate 3 styles in Phase 1 platform mockups; after pick, produce a sprite or draw in Phaser. |
| Ground / grass | 1–2 | Player starts here, no start pad. Scrolls off and is gone. | Same as overall-look mockups. Graphic shapes are fine if that look wins. |
| Title wordmark “Jumpin’ Jack” | 1 | Menus; maybe HUD. | 3 options in menu mockups, or a dedicated wordmark round. |
| Pause button + CTA / menu chrome | 1–2 | Pause on HUD; Climb again / Change setup on results. | Phaser + type is enough if Phase 1 chooses a flat UI. Otherwise 3 button styles. |
| Bird (side fly, few frames) | 4 | Occasional, non-distracting. | Drawn in-engine as cut-paper shapes (navy offset + cream). |
| Butterfly (side fly, few frames) | 4 | Same. | Same as bird. |
| Clouds | 4 | Cream stacked ellipses, navy offset shadows, slow drift, parallax. | Procedural (locked in visual direction). |
| Number typeface | 1–2 | Kid-readable at 6 digits and stacked fractions (two text objects + a bar). | Pick a bundled webfont during visual direction. Not an image. |
| Fall pose | — | None. Reuse jump. | No asset. |
| Crumble debris / land puff | 5 | Tiny shapes. | In-engine particles. No sprite required. |

---

## Coverage vs game needs

| Game need | Status |
|---|---|
| Player idle | Have (21 frames) |
| Player jump | Have (21 frames) |
| Player fall | Missing pose — reuse jump |
| Player walk | Have, unused |
| Platforms | **Missing** |
| Ground | **Missing** |
| Sky | Code (clear blue) |
| Clouds | Procedural paper ellipses |
| Birds / butterflies | In-engine paper silhouettes |
| HUD / pause / menus | **Missing** chrome; can be type+shapes |
| Wordmark | **Missing** |
| Music | Have (mp3 in `public/assets/audio/`) |
| SFX: correct, crumble, fail, game over, level complete, high score, button | Have (mp3 in `public/assets/audio/`) |
| Font | **Missing** pick |

---

## Decisions for later phases (not made here)

- Trim-and-pack atlas vs loading individual PNGs in dev. Production should be one atlas.
- Display height of the robot in the play column (tune in Phase 2).
- Whether platforms are painted sprites or Phaser graphics after Phase 1 sign-off.
