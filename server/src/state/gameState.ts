import { v4 as uuidv4 } from "uuid";
import { VoterProfile } from "../data/voterData";
import { selectVoters } from "../lib/selectVoters";
import { getRandomTopics } from "../lib/topicPool";
import { CandidateProfile, getRandomCandidates } from "../lib/candidatePool";

export interface Player {
  id: string;
  slot: 1 | 2;
  socketId: string | null;
  candidate: CandidateProfile | null;
}

export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: number;
  isObjectionEnd?: boolean;
  inaudible?: boolean;
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
  topics: string[];
  currentRound: number;
  debatePhase: "idle" | "prep" | "debate" | "ended";
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
    voters: [],
    rounds: [],
    timerState: null,
    topics: [],
    currentRound: 0,
    debatePhase: "idle",
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

export function setPlayerSocketId(
  code: string,
  playerId: string,
  socketId: string
): boolean {
  const game = games.get(code.toUpperCase());
  if (!game) return false;
  const player = game.players.find((p) => p.id === playerId);
  if (!player) return false;
  player.socketId = socketId;
  return true;
}

export function findGameBySocketId(
  socketId: string
): { game: GameSession; player: Player } | null {
  for (const game of games.values()) {
    const player = game.players.find((p) => p.socketId === socketId);
    if (player) return { game, player };
  }
  return null;
}

export function clearPlayerSocketId(playerId: string, code: string): boolean {
  const game = games.get(code.toUpperCase());
  if (!game) return false;
  const player = game.players.find((p) => p.id === playerId);
  if (!player) return false;
  player.socketId = null;
  return true;
}

export function setGameStatus(
  code: string,
  status: GameSession["status"]
): boolean {
  const game = games.get(code.toUpperCase());
  if (!game) return false;
  game.status = status;
  return true;
}

export function addTranscriptEntry(
  code: string,
  roundNumber: number,
  entry: TranscriptEntry
): boolean {
  const game = games.get(code.toUpperCase());
  if (!game) return false;
  const round = game.rounds.find((r) => r.roundNumber === roundNumber);
  if (!round) return false;
  round.transcript.push(entry);
  return true;
}

export function ensureRound(
  code: string,
  roundNumber: number,
  topic: string
): RoundState | null {
  const game = games.get(code.toUpperCase());
  if (!game) return null;
  let round = game.rounds.find((r) => r.roundNumber === roundNumber);
  if (!round) {
    round = { roundNumber, topic, transcript: [] };
    game.rounds.push(round);
  }
  return round;
}

export function reconnectPlayer(
  code: string,
  playerId: string
): { game: GameSession; player: Player } | { error: string } {
  const game = games.get(code.toUpperCase());
  if (!game) return { error: "Game not found" };
  if (game.status === "complete") return { error: "Game is over" };

  const player = game.players.find((p) => p.id === playerId);
  if (!player) return { error: "Player not in this game" };

  return { game, player };
}

export function prepareRevealData(code: string): boolean {
  const game = games.get(code.toUpperCase());
  if (!game || game.players.length !== 2) return false;

  game.voters = selectVoters();
  game.topics = getRandomTopics(2);

  const candidates = getRandomCandidates(2);
  game.players[0].candidate = candidates[0] ?? null;
  game.players[1].candidate = candidates[1] ?? null;

  return (
    game.players.every((player) => player.candidate !== null) &&
    game.voters.length > 0 &&
    game.topics.length === 2
  );
}
