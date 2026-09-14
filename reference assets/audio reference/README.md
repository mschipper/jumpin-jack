# Greater Heights — Retro Platformer Audio Pack

Free Mario-style / chiptune audio options for the vertical-jump prototype **Greater Heights**.

## How to map sounds

| Game event | Folder | Suggested default |
|---|---|---|
| Background climb / adventure music (loop) | `01_music/` | `music_going_up_loop.ogg` |
| Correct jump / successful platform land | `02_jump_correct/` | `jump_plumber.ogg` (or `.mp3`) |
| Miss / fall / soft fail / game over | `03_fail/` | `fail_mixkit_arcade_alert.mp3` (short) or `fail_mixkit_arcade_retro_game_over.mp3` |
| Crumbling / giving-way platform | `04_crumble/` | `crumble_rock_break.ogg` + optional `crumble_bfh_rock_debris_01.ogg` |
| Height goal / end-of-level clear | `05_level_complete/` | `clear_mixkit_level_completed.mp3` |

Web tip: prefer `.ogg` / `.mp3` with `new Audio(url)`. Keep music looping (`audio.loop = true`). Trigger SFX one-shots on jump success, miss, platform break, and goal.

## File inventory

### 01_music/
- `music_going_up_loop.ogg` — bouncy vertical-climb adventure chiptune loop
- `music_jump_run_duck_loop.ogg` — run/jump platformer chiptune loop
- `music_platformer_stage1.mp3` — stage-1 style platformer chiptune
- `music_platformer_stage2.mp3` — stage-2 alt loop
- `music_platformer_stage3.mp3` — stage-3 alt loop

### 02_jump_correct/
- `jump_plumber.ogg` / `jump_plumber.mp3` — Mario RPG-like cartoony jump
- `jump_kenney_phase1.ogg` / `phase3` / `phase5` — short digital phase-jump beeps
- `jump_mixkit_arcade_retro.mp3` — arcade retro jump
- `jump_mixkit_player_video_game.mp3` — classic video-game jump

### 03_fail/
- `fail_platformer_chiptune_gameover.mp3` — chiptune game-over sting
- `fail_mixkit_arcade_retro_game_over.mp3` — arcade retro game over
- `fail_mixkit_funny_game_over.mp3` — light/funny fail
- `fail_mixkit_arcade_alert.mp3` — short failure alert
- `fail_mixkit_player_losing.mp3` — longer losing cue
- `fail_kenney_low_down.ogg` — descending digital fail
- `fail_bfh_soft_fall.ogg` — soft fall / tumble

### 04_crumble/
- `crumble_rock_break.ogg` — rock break
- `crumble_bfh_rock_break_01.ogg` … `_03.ogg` — rock breaking variants
- `crumble_bfh_rock_debris_01.ogg` — falling rock debris
- `crumble_bfh_breaking_01.ogg` — general break/crumble
- `crumble_falling_rock.ogg` — cave-in / falling rock (CC-BY — credit required)
- `crumble_kenney_mining.ogg` / `crumble_kenney_mining_01.ogg` — mining impact crumble
- `crumble_kenney_wood_heavy.ogg` — heavy wood impact (alt platform material)

### 05_level_complete/
- `clear_mixkit_level_completed.mp3` — game level completed fanfare
- `clear_mixkit_completion_of_level.mp3` — level completion sting
- `clear_mixkit_video_game_win.mp3` — video-game win
- `clear_mixkit_unlock_notification.mp3` — unlock / success notification
- `clear_kenney_powerup7.ogg` / `clear_kenney_powerup12.ogg` — short digital success beeps

## Licenses

See `SOURCES.md` for title, author, license, and URL for every included file.
Prefer CC0 / Mixkit License assets; one CC-BY clip (`crumble_falling_rock.ogg`) requires attribution.

