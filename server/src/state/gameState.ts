import { v4 as uuidv4 } from "uuid";
import { VoterProfile } from "../data/voterData";
import { selectVoters } from "../lib/selectVoters";

export interface Player {
  id: string;
  slot: 1 | 2;
  socketId: string | null;
  candidate: Record<string, unknown> | null;
}

export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: number;
}

export interface RoundState {
  roundNumber: number;
  topic: string;
  transcript: TranscriptEntry[];
}

export interface TimerState {
  p1Remaining: number;
  p2Remaining: number;
  activeFloor: 1 | 2 | null;
}

export interface GameSession {
  id: string;
  code: string;
  status: "lobby" | "reveal" | "debate" | "voting" | "complete";
  hostId: string;
  createdAt: Date;
  players: Player[];
  voters: VoterProfile[];
  rounds: RoundState[];
  timerState: TimerState | null;
}

const games = new Map<string, GameSession>();

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

function generateUniqueCode(): string {
  let code: string;
  do {
    code = Array.from({ length: CODE_LENGTH }, () =>
      CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
    ).join("");
  } while (games.has(code));
  return code;
}

export function createGame(hostId: string): GameSession {
  const code = generateUniqueCode();
  const game: GameSession = {
    id: uuidv4(),
    code,
    status: "lobby",
    hostId,
    createdAt: new Date(),
    players: [{ id: hostId, slot: 1, socketId: null, candidate: null }],
    voters: selectVoters(),
    rounds: [],
    timerState: null,
  };
  games.set(code, game);
  return game;
}

export function getGame(code: string): GameSession | undefined {
  return games.get(code.toUpperCase());
}

export function joinGame(
  code: string,
  playerId: string
): { game: GameSession } | { error: string } {
  const game = games.get(code.toUpperCase());
  if (!game) return { error: "Game not found" };
  if (game.status !== "lobby") return { error: "Game already in progress" };
  if (game.players.length >= 2) return { error: "Game is full" };

  game.players.push({
    id: playerId,
    slot: 2,
    socketId: null,
    candidate: null,
  });
  return { game };
}

export function getAllGames(): Map<string, GameSession> {
  return games;
}
