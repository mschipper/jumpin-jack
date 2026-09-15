export type NumberKind = "whole" | "decimal" | "fraction";
export type Difficulty = "easy" | "normal" | "hard";
export type PlayMode = "casual" | "challenge" | "speed";
export type Closeness = "far" | "hundreds" | "tens" | "ones";
export type Side = "left" | "right";

export type WholeValue = { kind: "whole"; n: number };

/** `value = scaled / 10^places`. `keepZeros` pads for trap pairs like 0.90 vs 0.89. */
export type DecimalValue = {
  kind: "decimal";
  scaled: number;
  places: number;
  keepZeros?: boolean;
};

export type FractionValue = { kind: "fraction"; num: number; den: number };

export type GameValue = WholeValue | DecimalValue | FractionValue;

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
