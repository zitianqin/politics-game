export const TOTAL_ROUNDS = 2;
export const TURN_TIME = 60; // seconds per player per round
export const PREP_COUNTDOWN = 10; // seconds for topic prep

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

