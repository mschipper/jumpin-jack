export type NumberKind = "whole" | "decimal" | "fraction";
export type Difficulty = "easy" | "normal" | "hard";
export type PlayMode = "casual" | "challenge" | "speed";
export type Closeness = "far" | "hundreds" | "tens" | "ones";
export type Side = "left" | "right";

export type WholeValue = { kind: "whole"; n: number };

export type GameValue = WholeValue;

export type Rng = () => number;

export interface GameConfig {
  numbers: NumberKind;
  difficulty: Difficulty;
  mode: PlayMode;
}

export interface PartialConfig {
  numbers?: NumberKind;
  difficulty?: Difficulty;
  mode?: PlayMode;
}

export interface ChoicePair {
  left: GameValue;
  right: GameValue;
  bigger: Side;
}
