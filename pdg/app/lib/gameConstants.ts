export const TOTAL_ROUNDS = 2;
export const TURN_TIME = 60; // seconds per player per round
export const PREP_COUNTDOWN = 10; // seconds for topic prep

// Animation timings for results reveal
export const VOTER_REVEAL_DELAY = 800; // ms between each voter card reveal
export const VOTER_REVEAL_ANIMATION_DURATION = 600; // ms for individual voter card animation

/** Custom name as primary, P1/P2 as subtle secondary — e.g. "HWELRO (P1)" */
export function formatScorecardName(name: string, slot: 1 | 2): string {
  const isDefault = name === "Player 1" || name === "Player 2";
  return isDefault ? `P${slot}` : `${name} (P${slot})`;
}

export const JUDGING_JOKES = [
  "Bribing the judges...",
  "Consulting the magic 8-ball...",
  "Checking twitter sentiment...",
  "Counting mail-in ballots...",
  "Calculating swagger levels...",
  "Running algorithm.exe...",
  "Asking my mom who won...",
];

export type ScreenId =
  | "lobby"
  | "voter-grid"
  | "voter-profile"
  | "topic"
  | "input"
  | "debate"
  | "judging"
  | "reveal"
  | "results"
  | "winner";

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rot: number;
  rotSpeed: number;
}
