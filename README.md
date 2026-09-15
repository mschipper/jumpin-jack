# Jumpin' Jack

Educational vertical climber: jump to the platform with the greater number before the one you are standing on gives way.

Standalone Phaser 4 / Vite / TypeScript app with a LearningPlanet host seam. Vendoring into `learningplanet-next` is documented in [`docs/INTEGRATION.md`](docs/INTEGRATION.md).

## Play

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:8080; it will pick the next port if 8080 is taken).

```bash
npm test
npm run build
```

Mute is on the pause overlay (Space or Escape also pauses). Safari/iOS needs a tap before music starts.

## URL params

Each field is optional. Missing fields are collected on the title screen under **Game options**. All of `numbers`, `difficulty`, and `mode` present skips the title screen and starts the climb.

| Param | Values |
|---|---|
| `numbers` | `whole` `decimal` `fraction` |
| `difficulty` | `easy` `normal` `hard` |
| `mode` | `casual` `challenge` `speed` |
| `min` / `max` | inclusive value range (aliases `minValue` / `maxValue`). Swapped if min > max. Not required to skip the title screen. |

Examples:

```
?numbers=whole&difficulty=normal&mode=challenge
?numbers=whole&difficulty=easy&mode=casual&min=1&max=20
```

**Casual** — no timer, platforms never crumble, win at 20. Wrong pick still fails.  
**Challenge** — levels of 20, rest jump at each level-up.  
**Speed run** — no levels, thicker timer with remaining seconds.

Score is platforms landed. Best score is stored per full config (and range, if set) in `localStorage`.

## Layout

Mobile portrait is the 420px play column. Desktop landscape keeps that column centered; extra width is sky.

## Visual direction

See [`docs/visual-direction.md`](docs/visual-direction.md). Tuning lives in `src/constants.ts`.
