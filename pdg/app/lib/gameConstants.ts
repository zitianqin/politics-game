export const TOTAL_ROUNDS = 3;
export const TURN_TIME = 60; // seconds for party mode

export const TOPICS = [
    "SHOULD WE REPLACE TAXES WITH A DANCE BATTLE?",
    "ARE HOTDOGS CLASSIFIED AS SANDWICHES UNDER FEDERAL LAW?",
    "SHOULD WE GIVE CATS THE RIGHT TO VOTE?",
    "ALIEN INVASION: DO WE SURRENDER OR FIGHT?",
    "UNIVERSAL BASIC ICE CREAM FOR ALL CITIZENS!"
];

export const JUDGING_JOKES = [
    "Bribing the judges...",
    "Consulting the magic 8-ball...",
    "Checking twitter sentiment...",
    "Counting mail-in ballots...",
    "Calculating swagger levels...",
    "Running algorithm.exe...",
    "Asking my mom who won..."
];

export type ScreenId = 'lobby' | 'topic' | 'input' | 'judging' | 'reveal' | 'winner';

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
