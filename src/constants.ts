export const PLAY_COLUMN = 420;
export const GAME_HEIGHT = 844;
export const STEP = 200;
/** Horizontal pad centers inside the play column. */
export const PAD_LEFT = 0.22;
export const PAD_RIGHT = 0.78;
export const REST_Y = 0.22; // default / low rest; see cameraPace.ts for live range
export const FLOORS_PER_LEVEL = 20;
export const JUMP_MS = 480;
export const JUMP_ARC = 90;
export const SHAKE_FRACTION = 0.28;
export const SHAKE_PX = 2;
export const PLAYER_DISPLAY_WIDTH = 80;
export const SHADOW_OFFSET_X = 2;
export const SHADOW_OFFSET_Y = 4;
export const SHADOW_COLOR = 0x16324f;
export const SHADOW_ALPHA = 0.35;
export const NAVY = 0x16324f;
export const GOLD = 0xffd166;
export const CREAM = 0xfff8e7;
export const SKY_TOP = 0x2a6fbd;
export const SKY_BOT = 0x9fd0f5;

export const TIMER = {
  challenge: {
    easy: { start: 5500, delta: 60, floor: 2400, levelTax: 300 },
    normal: { start: 4500, delta: 90, floor: 1800, levelTax: 450 },
    hard: { start: 3800, delta: 110, floor: 1400, levelTax: 500 },
  },
  speed: {
    easy: { start: 4200, delta: 80, floor: 1800, levelTax: 0 },
    normal: { start: 3600, delta: 110, floor: 1300, levelTax: 0 },
    hard: { start: 3200, delta: 130, floor: 1100, levelTax: 0 },
  },
} as const;

export const BEST_PREFIX = "jumpin-jack-best";
