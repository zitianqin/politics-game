import { Server } from "socket.io";

export interface TimerState {
  p1Remaining: number; // milliseconds
  p2Remaining: number; // milliseconds
  activeFloor: 1 | 2 | null;
  intervalId: ReturnType<typeof setInterval> | null;
  lastTickTime: number | null;
}

const TICK_INTERVAL = 500; // ms
const TIME_PER_PLAYER = 60_000; // 60s in ms
const OBJECTION_COST = 15_000; // 15s in ms

export function createTimerState(): TimerState {
  return {
    p1Remaining: TIME_PER_PLAYER,
    p2Remaining: TIME_PER_PLAYER,
    activeFloor: null,
    intervalId: null,
    lastTickTime: null,
  };
}

export function startTimer(
  io: Server,
  roomCode: string,
  timerState: TimerState,
  activePlayer: 1 | 2,
  onFloorChange: (newActive: 1 | 2, reason: string) => void,
  onRoundEnd: () => void
): void {
  stopTimer(timerState);

  timerState.activeFloor = activePlayer;
  timerState.lastTickTime = Date.now();

  timerState.intervalId = setInterval(() => {
    if (timerState.activeFloor === null || timerState.lastTickTime === null) {
      return;
    }

    const now = Date.now();
    const elapsed = now - timerState.lastTickTime;
    timerState.lastTickTime = now;

    // Deduct elapsed time from active player
    if (timerState.activeFloor === 1) {
      timerState.p1Remaining = Math.max(0, timerState.p1Remaining - elapsed);
    } else {
      timerState.p2Remaining = Math.max(0, timerState.p2Remaining - elapsed);
    }

    // Broadcast timer update
    io.to(roomCode).emit("timer:update", {
      p1remaining: Math.round(timerState.p1Remaining / 1000),
      p2remaining: Math.round(timerState.p2Remaining / 1000),
      activePlayer: timerState.activeFloor
    });

    // Check for time exhaustion
    const activeRemaining =
      timerState.activeFloor === 1
        ? timerState.p1Remaining
        : timerState.p2Remaining;

    if (activeRemaining <= 0) {
      const opponent: 1 | 2 = timerState.activeFloor === 1 ? 2 : 1;
      const opponentRemaining =
        opponent === 1 ? timerState.p1Remaining : timerState.p2Remaining;

      if (opponentRemaining <= 0) {
        // Both exhausted → round end
        stopTimer(timerState);
        onRoundEnd();
      } else {
        // Auto-pass floor to opponent
        timerState.activeFloor = opponent;
        timerState.lastTickTime = Date.now();
        onFloorChange(opponent, "timeout");
      }
    }
  }, TICK_INTERVAL);
}

export function stopTimer(timerState: TimerState): void {
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
  }
  timerState.lastTickTime = null;
}

export interface ObjectionResult {
  success: boolean;
  reason?: string;
}

export function handleObjection(
  io: Server,
  roomCode: string,
  timerState: TimerState,
  byPlayer: 1 | 2,
  onFloorChange: (newActive: 1 | 2, reason: string) => void
): ObjectionResult {
  // Rule 1: opponent must be speaking
  if (timerState.activeFloor === byPlayer) {
    return { success: false, reason: "Cannot object on own turn" };
  }

  if (timerState.activeFloor === null) {
    return { success: false, reason: "No active speaker" };
  }

  // Rule 2: objector must have > 15s remaining
  const objectorRemaining =
    byPlayer === 1 ? timerState.p1Remaining : timerState.p2Remaining;

  if (objectorRemaining <= OBJECTION_COST) {
    return { success: false, reason: "Not enough time to object (need >15s)" };
  }

  // Deduct 15s from objector
  if (byPlayer === 1) {
    timerState.p1Remaining -= OBJECTION_COST;
  } else {
    timerState.p2Remaining -= OBJECTION_COST;
  }

  // Swap floor to objector
  timerState.activeFloor = byPlayer;
  timerState.lastTickTime = Date.now();

  // Broadcast updated timer immediately
  io.to(roomCode).emit("timer:update", {
    p1remaining: Math.round(timerState.p1Remaining / 1000),
    p2remaining: Math.round(timerState.p2Remaining / 1000),
    activePlayer: timerState.activeFloor
  });

  onFloorChange(byPlayer, "objection");

  return { success: true };
}

export function handleYield(
  io: Server,
  roomCode: string,
  timerState: TimerState,
  byPlayer: 1 | 2,
  onFloorChange: (newActive: 1 | 2, reason: string) => void
): { success: boolean; reason?: string } {
  // Must be the active speaker to yield
  if (timerState.activeFloor !== byPlayer) {
    return { success: false, reason: "Only the active speaker can yield" };
  }

  const opponent: 1 | 2 = byPlayer === 1 ? 2 : 1;
  const opponentRemaining =
    opponent === 1 ? timerState.p1Remaining : timerState.p2Remaining;

  // If opponent has no time, cannot yield to them
  if (opponentRemaining <= 0) {
    return { success: false, reason: "Opponent has no time remaining" };
  }

  // Swap floor
  timerState.activeFloor = opponent;
  timerState.lastTickTime = Date.now();

  onFloorChange(opponent, "yield");

  return { success: true };
}

// Export constants for testing
export { TICK_INTERVAL, TIME_PER_PLAYER, OBJECTION_COST };
