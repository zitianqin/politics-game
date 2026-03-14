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
import { runVoterSimulation } from "../services/voting";

export interface RoundContext {
  timerState: TimerState;
  prepIntervalId: ReturnType<typeof setInterval> | null;
  revealIntervalId: ReturnType<typeof setInterval> | null;
  startTime: number | null;
}

const roundContexts = new Map<string, RoundContext>();

export function getRoundContext(code: string): RoundContext | undefined {
  return roundContexts.get(code);
}

/**
 * Start the reveal phase: 15s countdown on server.
 */
export function startMeetVotersPhase(io: Server, game: GameSession): void {
  const code = game.code;
  game.status = "meet_voters";
  
  const timerState = createTimerState();
  const ctx: RoundContext = { timerState, prepIntervalId: null, revealIntervalId: null, startTime: null };
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
    startTime: null,
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
  ctx.startTime = Date.now();

  // P1 starts Round 1, P2 starts Round 2
  const activePlayer: 1 | 2 = game.currentRound === 1 ? 1 : 2;

  io.to(code).emit("round:debate", { activePlayer, startTime: ctx.startTime });

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

  // Move to judging after a short delay or immediately
  setTimeout(() => {
    startJudgingPhase(io, game);
  }, 2000);
}

/**
 * Start the judging phase — call the LLM voter simulation.
 */
export function startJudgingPhase(io: Server, game: GameSession): void {
  const code = game.code;
  game.status = "judging";
  io.to(code).emit("judging:start", { roundNumber: game.currentRound });

  const currentRoundData = game.rounds.filter(
    (r) => r.roundNumber === game.currentRound
  );

  runVoterSimulation(game.voters, game.players, currentRoundData, game.topics)
    .then((result) => {
      game.status = "voting";
      io.to(code).emit("voting:start", {});

      const round = game.rounds.find(
        (r) => r.roundNumber === game.currentRound
      );
      if (round) {
        round.p1Score = result.p1Votes;
        round.p2Score = result.p2Votes;
      }

      const VOTE_REVEAL_DELAY_MS = 1500;

      result.votes.forEach((vote, i) => {
        setTimeout(() => {
          io.to(code).emit("vote:cast", {
            voterName: vote.voterName,
            vote: vote.vote === 1 ? "Candidate A" : "Candidate B",
            reason: vote.reason,
            index: i,
            total: result.votes.length,
          });
        }, (i + 1) * VOTE_REVEAL_DELAY_MS);
      });

      setTimeout(
        () => {
          game.status = "round_results";
          io.to(code).emit("round:results", {
            roundNumber: game.currentRound,
            p1Score: result.p1Votes,
            p2Score: result.p2Votes,
            winner: result.winner,
            tally: { p1: result.p1Votes, p2: result.p2Votes },
            breakdown: result.votes.map((v) => {
              const profile = game.voters.find((vp) => vp.name === v.voterName);
              return {
                voterName: v.voterName,
                voterAge: profile?.age || 0,
                voterLocation: profile?.location || "",
                vote: v.vote === 1 ? "Candidate A" : "Candidate B",
                reason: v.reason,
              };
            }),
          });
        },
        (result.votes.length + 1) * VOTE_REVEAL_DELAY_MS
      );
    })
    .catch((err) => {
      console.error(`[judging] LLM voting failed for game ${code}:`, err);
      game.status = "round_results";

      io.to(code).emit("round:results", {
        roundNumber: game.currentRound,
        p1Score: 0,
        p2Score: 0,
        winner: 1,
        tally: { p1: 0, p2: 0 },
        breakdown: game.voters.map((v) => ({
          voterName: v.name,
          voterAge: v.age,
          voterLocation: v.location,
          vote: "Candidate A", // fallback
          reason: "Judging error",
        })),
        error: "Voting failed — results are placeholder",
      });
    });
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

  const result = timerHandleObjection(
    io,
    game.code,
    ctx.timerState,
    byPlayer,
    onFloorChange
  );

  if (result.success) {
    const timestamp = ctx.startTime
      ? Math.round((Date.now() - ctx.startTime) / 1000)
      : 0;

    const entry = {
      speaker: `player${byPlayer}`,
      text: "OBJECTION!",
      timestamp,
      isObjection: true, // Marker for UI
    };

    const round = game.rounds.find((r) => r.roundNumber === game.currentRound);
    if (round) {
      round.transcript.push(entry);
      round.transcript.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Broadcast the objection entry to all clients
    io.to(game.code).emit("transcript:update", {
      ...entry,
      roundNumber: game.currentRound,
    });
  }

  return result;
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
