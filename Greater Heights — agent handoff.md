Greater Heights — agent handoff
Educational climber that trains which 4-digit number is greater. One file, no build step.
File: 

Stack: single HTML file, vanilla JS + CSS, mobile-first (max-width 480px). Tap platforms or Left/Right / A/D. Best score in localStorage key greater-heights-best.

Loop
Player stands on a pad. Two numbered platforms appear above. Jump to the larger number before the stand-pad’s timer ends.

Correct: arc jump onto that pad, camera scrolls so the landed pad sits near the lower third (REST_Y = 0.22), next pair spawns STEP (168px) higher.
Wrong pick: unchosen (and the picked) choice vanishes in place (.vanish, fade/scale — does not tumble). Hero falls. Game over.
Timer expires while still on the stand pad: that pad crumbles, hero falls. Game over.

Score = floors + streak bonus + level bonus. HUD: Score, Lv, Best.

Numbers
Always 1000–9999. Modes do not change digit count. They change how close the pair is and how fast the clock is.
Closeness buckets in pickPair():

far — thousands differ
hundreds — differ by 100–400
tens — differ by 10–90
ones — differ by 1–9






































Modedata-modeEarly pairsTightens to onesStart timeMin timeWarm-upkidsfar, then hundredslevel 4+4.8s2.4sClose callsclasshundreds immediatelylevel 34.0s1.6sSpeed climbclimbfar for first 6 floorslevel 33.8s1.6s
timeForFloor(): base - (level-1)*450 - (floor % 20)*20, clamped to min.

Levels
FLOORS_PER_LEVEL = 20. Level = floor(floor / 20) + 1.
On level-up:

Banner LEVEL n!
Next pair spawns with timer frozen (onBreak = true, hint “JUMP WHEN READY”).
First jump of the new level is untimed. After that landing, countdown resumes, tighter.


Platform lifecycle (easy to break — read this)
Two different fail visuals. Do not mix them up.

Stand pad you jumped from / are standing on
When its choice timer starts (spawnChoice not paused), stamp:
dataset.dropAt = deadline
dataset.shakeAt = deadline - duration * 0.28
Every frame, any pad with those attributes:
now >= shakeAt → .shake (original mild rattle only — no hard shake)
now >= dropAt → .crumble (tumbles down)
Jumping off does not cancel this. The pad still shakes and falls on its own clock.
Hero only falls if p === currentPlat at drop time.

Unchosen numbered platform
.vanish — fade out in place. Never crumble.

Do not crumble the stand pad on jump-off. That was tried and rejected.
Shake is only the original platShake (~2px + slight rotate). A late “violent” shake was added and removed twice; do not bring it back.

Camera / hero

Platforms live in #world with bottom: worldY. Camera is translateY(camera) on #world.
Hero is not inside #world. Screen Y = heroWorldY - camera.
Jump: 0.48s ease-in-out plus sin(πt)*90 arc. Camera target updates when the jump starts.
Fall: fallVY then gravity.


Intentional non-features / next ideas already discussed
Not built: decimals, fractions, negatives, equals-as-third-option, number-line hint, classroom/leaderboard, sound, Godot/Phaser port.
User direction so far: 4-digit comparisons, climb + scroll, level every 20 with a rest jump, stand-pad shake-then-fall on its own timer even after leaving, unused choice vanishes.

Touch points in code

Pair gen: pickPair(), rangeForFloor()
Timer: timeForFloor(), spawnChoice(worldY, paused)
Jump / fall: choose(), startJump(), startFall(), loop()
Per-pad collapse: dataset.dropAt / shakeAt handled in loop()
CSS: .shake, .crumble, .vanish