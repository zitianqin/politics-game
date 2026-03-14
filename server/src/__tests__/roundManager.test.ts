import { Server } from "socket.io";

// We test roundManager by mocking timerManager's startTimer
// and verifying the correct sequence of socket events

// Mock Socket.io
function createMockIO() {
  const emitted: { event: string; data: unknown }[] = [];
  return {
    to: (_room: string) => ({
      emit: (event: string, data: unknown) => {
        emitted.push({ event, data });
      },
    }),
    emitted,
  };
}

// Mock game session factory
function createMockGame(overrides = {}) {
  return {
    id: "test-id",
    code: "TEST01",
    status: "debate" as const,
    hostId: "host-1",
    createdAt: new Date(),
    players: [
      { id: "host-1", slot: 1 as const, socketId: "s1", candidate: null },
      { id: "guest-1", slot: 2 as const, socketId: "s2", candidate: null },
    ],
    voters: [],
    rounds: [] as { roundNumber: number; topic: string; transcript: unknown[] }[],
    timerState: null,
    topics: [
      "Should Australia raise the minimum wage to $28/hour?",
      "Should Australia ban new coal and gas projects?",
    ],
    currentRound: 0,
    debatePhase: "idle" as const,
    ...overrides,
  };
}

// We need to mock the timer module to prevent real intervals
jest.mock("../socket/timerManager", () => ({
  createTimerState: jest.fn(() => ({
    p1Remaining: 60000,
    p2Remaining: 60000,
    activeFloor: null,
    intervalId: null,
    lastTickTime: null,
  })),
  startTimer: jest.fn(),
  stopTimer: jest.fn(),
  handleObjection: jest.fn(() => ({ success: true })),
  handleYield: jest.fn(() => ({ success: true })),
}));

import {
  startRound,
  endRound,
  processObjection,
  processYield,
  cleanupRound,
} from "../socket/roundManager";
import {
  startTimer,
  stopTimer,
  handleObjection,
  handleYield,
} from "../socket/timerManager";

describe("RoundManager", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("startRound", () => {
    test("should emit round:start with correct roundNumber and topic", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);

      const roundStartEvents = io.emitted.filter(
        (e) => e.event === "round:start"
      );
      expect(roundStartEvents.length).toBe(1);
      expect(roundStartEvents[0].data).toEqual({
        roundNumber: 1,
        topic: game.topics[0],
      });
    });

    test("should emit round:prep with countdown starting at 10", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);

      const prepEvents = io.emitted.filter((e) => e.event === "round:prep");
      expect(prepEvents.length).toBe(1);
      expect(prepEvents[0].data).toEqual({ countdown: 10 });
    });

    test("should emit 10 prep countdown ticks", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);

      // Advance through all 10 seconds of prep
      jest.advanceTimersByTime(10_000);

      const prepEvents = io.emitted.filter((e) => e.event === "round:prep");
      // Initial + 10 ticks = 11
      expect(prepEvents.length).toBe(11);

      // Last prep should be countdown: 0
      expect(prepEvents[prepEvents.length - 1].data).toEqual({ countdown: 0 });
    });

    test("should emit round:debate after prep countdown completes", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);

      // Advance through prep
      jest.advanceTimersByTime(10_000);

      const debateEvents = io.emitted.filter(
        (e) => e.event === "round:debate"
      );
      expect(debateEvents.length).toBe(1);
    });

    test("P1 should start Round 1", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);
      jest.advanceTimersByTime(10_000);

      const debateEvents = io.emitted.filter(
        (e) => e.event === "round:debate"
      );
      expect(debateEvents[0].data).toEqual({ activePlayer: 1 });
    });

    test("P2 should start Round 2", () => {
      const io = createMockIO();
      const game = createMockGame();

      // Clean up round 1 context first
      cleanupRound("TEST01");

      startRound(io as any, game as any, 2);
      jest.advanceTimersByTime(10_000);

      const debateEvents = io.emitted.filter(
        (e) => e.event === "round:debate"
      );
      expect(debateEvents[0].data).toEqual({ activePlayer: 2 });
    });

    test("should update game.currentRound", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);
      expect(game.currentRound).toBe(1);
    });

    test("should set debatePhase to prep", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);
      expect(game.debatePhase).toBe("prep");
    });

    test("should add round entry to game.rounds", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);
      expect(game.rounds.length).toBe(1);
      expect(game.rounds[0].roundNumber).toBe(1);
      expect(game.rounds[0].topic).toBe(game.topics[0]);
    });
  });

  describe("endRound", () => {
    test("should emit round:end with roundNumber", () => {
      const io = createMockIO();
      const game = createMockGame({ currentRound: 1 });

      // Start round first to create context
      startRound(io as any, game as any, 1);
      io.emitted.length = 0; // Clear prior events

      endRound(io as any, game as any);

      const endEvents = io.emitted.filter((e) => e.event === "round:end");
      expect(endEvents.length).toBe(1);
      expect(endEvents[0].data).toEqual({ roundNumber: 1 });
    });

    test("should set debatePhase to ended", () => {
      const io = createMockIO();
      const game = createMockGame({ currentRound: 1 });

      startRound(io as any, game as any, 1);
      endRound(io as any, game as any);

      expect(game.debatePhase).toBe("ended");
    });

    test("should call stopTimer", () => {
      const io = createMockIO();
      const game = createMockGame({ currentRound: 1 });

      startRound(io as any, game as any, 1);
      endRound(io as any, game as any);

      expect(stopTimer).toHaveBeenCalled();
    });
  });

  describe("processObjection", () => {
    test("should reject when not in debate phase", () => {
      const io = createMockIO();
      const game = createMockGame({ debatePhase: "prep" });

      const result = processObjection(io as any, game as any, 2);
      expect(result.success).toBe(false);
      expect(result.reason).toContain("Not in debate phase");
    });

    test("should delegate to timerManager handleObjection in debate phase", () => {
      const io = createMockIO();
      const game = createMockGame({ debatePhase: "debate" });

      // Need to start a round first to register context
      startRound(io as any, game as any, 1);
      jest.advanceTimersByTime(10_000); // finish prep

      const result = processObjection(io as any, game as any, 2);
      expect(handleObjection).toHaveBeenCalled();
    });
  });

  describe("processYield", () => {
    test("should reject when not in debate phase", () => {
      const io = createMockIO();
      const game = createMockGame({ debatePhase: "prep" });

      const result = processYield(io as any, game as any, 1);
      expect(result.success).toBe(false);
      expect(result.reason).toContain("Not in debate phase");
    });
  });

  describe("cleanupRound", () => {
    test("should remove round context", () => {
      const io = createMockIO();
      const game = createMockGame();

      startRound(io as any, game as any, 1);
      cleanupRound("TEST01");

      // Starting a new round should work (no stale context)
      startRound(io as any, game as any, 2);
      expect(game.currentRound).toBe(2);
    });
  });
});
