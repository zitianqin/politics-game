import { Server } from "socket.io";
import { GameSession } from "../state/gameState";
import {
  createTimerState,
  startTimer,
  stopTimer,
  handleObjection as timerHandleObjection,
  handleYield as timerHandleYield,
  TimerState,
} from "./timerManager";

export interface RoundContext {
  timerState: TimerState;
  prepIntervalId: ReturnType<typeof setInterval> | null;
  revealIntervalId: ReturnType<typeof setInterval> | null;
}

const roundContexts = new Map<string, RoundContext>();

export function getRoundContext(code: string): RoundContext | undefined {
  return roundContexts.get(code);
}

/**
 * Start the reveal phase: 15s countdown on server.
 */
export function startRevealPhase(io: Server, game: GameSession): void {
  const code = game.code;
  game.status = "reveal";
  
  const timerState = createTimerState();
  const ctx: RoundContext = { timerState, prepIntervalId: null, revealIntervalId: null };
  roundContexts.set(code, ctx);

  let countdown = 15;
  io.to(code).emit("reveal:start", { countdown });

  ctx.revealIntervalId = setInterval(() => {
    countdown--;
    io.to(code).emit("reveal:timer", { countdown });

    if (countdown <= 0) {
      if (ctx.revealIntervalId !== null) {
        clearInterval(ctx.revealIntervalId);
        ctx.revealIntervalId = null;
      }
      io.to(code).emit("reveal:end", {});
      startRound(io, game, 1);
    }
  }, 1000);
}

/**
 * Start a round: broadcast topic, run 10s prep countdown, then start debate.
 */
export function startRound(
  io: Server,
  game: GameSession,
  roundNumber: number
): void {
  const code = game.code;
  const topic = game.topics[roundNumber - 1];

  if (!topic) {
    console.error(`No topic for round ${roundNumber} in game ${code}`);
    return;
  }

  const ctx = roundContexts.get(code) || {
    timerState: createTimerState(),
    prepIntervalId: null,
    revealIntervalId: null,
  };
  roundContexts.set(code, ctx);

  // Set game state
  game.status = "debate";
  game.currentRound = roundNumber;
  game.debatePhase = "prep";

  // Add round to game rounds array
  game.rounds.push({
    roundNumber,
    topic,
    transcript: [],
  });

  // Broadcast round start
  io.to(code).emit("round:start", { roundNumber, topic });

  // 10-second prep countdown
  let countdown = 10;
  io.to(code).emit("round:prep", { countdown });

  ctx.prepIntervalId = setInterval(() => {
    countdown--;
    io.to(code).emit("round:prep", { countdown });

    if (countdown <= 0) {
      if (ctx.prepIntervalId !== null) {
        clearInterval(ctx.prepIntervalId);
        ctx.prepIntervalId = null;
      }
      beginDebatePhase(io, game);
    }
  }, 1000);
}

/**
 * Begin the active debate phase after prep countdown.
 */
function beginDebatePhase(io: Server, game: GameSession): void {
  const code = game.code;
  const ctx = roundContexts.get(code);
  if (!ctx) return;

  game.debatePhase = "debate";

  // P1 starts Round 1, P2 starts Round 2
  const activePlayer: 1 | 2 = game.currentRound === 1 ? 1 : 2;

  io.to(code).emit("round:debate", { activePlayer });

  const onFloorChange = (newActive: 1 | 2, reason: string) => {
    io.to(code).emit("floor:change", { activePlayer: newActive, reason });
  };

  const onRoundEnd = () => {
    endRound(io, game);
  };

  startTimer(io, code, ctx.timerState, activePlayer, onFloorChange, onRoundEnd);
}

/**
 * End the current round.
 */
export function endRound(io: Server, game: GameSession): void {
  const code = game.code;
  const ctx = roundContexts.get(code);

  if (ctx) {
    stopTimer(ctx.timerState);
    if (ctx.prepIntervalId !== null) {
      clearInterval(ctx.prepIntervalId);
      ctx.prepIntervalId = null;
    }
  }

  game.debatePhase = "ended";
  io.to(code).emit("round:end", { roundNumber: game.currentRound });
}

/**
 * Handle objection from a player.
 */
export function processObjection(
  io: Server,
  game: GameSession,
  byPlayer: 1 | 2
): { success: boolean; reason?: string } {
  const ctx = roundContexts.get(game.code);
  if (!ctx) return { success: false, reason: "No active round" };
  if (game.debatePhase !== "debate")
    return { success: false, reason: "Not in debate phase" };

  const onFloorChange = (newActive: 1 | 2, reason: string) => {
    io.to(game.code).emit("floor:change", {
      activePlayer: newActive,
      reason,
    });
  };

  return timerHandleObjection(
    io,
    game.code,
    ctx.timerState,
    byPlayer,
    onFloorChange
  );
}

/**
 * Handle voluntary floor yield.
 */
export function processYield(
  io: Server,
  game: GameSession,
  byPlayer: 1 | 2
): { success: boolean; reason?: string } {
  const ctx = roundContexts.get(game.code);
  if (!ctx) return { success: false, reason: "No active round" };
  if (game.debatePhase !== "debate")
    return { success: false, reason: "Not in debate phase" };

  const onFloorChange = (newActive: 1 | 2, reason: string) => {
    io.to(game.code).emit("floor:change", {
      activePlayer: newActive,
      reason,
    });
  };

  return timerHandleYield(
    io,
    game.code,
    ctx.timerState,
    byPlayer,
    onFloorChange
  );
}

/**
 * Cleanup round context for a game.
 */
export function cleanupRound(code: string): void {
  const ctx = roundContexts.get(code);
  if (ctx) {
    stopTimer(ctx.timerState);
    if (ctx.prepIntervalId !== null) {
      clearInterval(ctx.prepIntervalId);
    }
    if (ctx.revealIntervalId !== null) {
      clearInterval(ctx.revealIntervalId);
    }
    roundContexts.delete(code);
  }
}
