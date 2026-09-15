# Jumpin' Jack

Educational vertical climber: jump to the platform with the greater number before the pad you are standing on gives way.

## Play

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:8080).

```bash
npm test
npm run build
```

Skip the title screen with all three query params:

`?numbers=whole&difficulty=normal&mode=challenge`

Partial params still open the title screen. **Game options** only shows the fields that were not in the URL (or host config).

Optional value range (inclusive). If `min` is greater than `max`, they are swapped. Aliases: `minValue`, `maxValue`.

`?numbers=whole&difficulty=easy&mode=casual&min=1&max=20`

Number types (`whole` / `decimal` / `fraction`), difficulties, and modes (`casual` / `challenge` / `speed`) are live. Casual wins at 20 with no timer. Challenge rests every 20. Speed run has no breaks and a louder timer. `min` / `max` clamp the numeric value of each platform (wholes as integers, decimals as their value, fractions as num/den).

Mute is on the pause overlay. Safari/iOS needs a tap before music starts (browser autoplay). Audio files live in `public/assets/audio/` as whole-file mp3s.

## Visual direction

See `docs/visual-direction.md`.
