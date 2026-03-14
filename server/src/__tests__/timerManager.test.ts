import {
  createTimerState,
  startTimer,
  stopTimer,
  handleObjection,
  handleYield,
  TimerState,
  TIME_PER_PLAYER,
  OBJECTION_COST,
} from "../socket/timerManager";

// Mock Socket.io Server
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

describe("TimerManager", () => {
  let timerState: TimerState;

  beforeEach(() => {
    timerState = createTimerState();
    jest.useFakeTimers();
  });

  afterEach(() => {
    stopTimer(timerState);
    jest.useRealTimers();
  });

  describe("createTimerState", () => {
    test("should initialize with 60s per player", () => {
      expect(timerState.p1Remaining).toBe(TIME_PER_PLAYER);
      expect(timerState.p2Remaining).toBe(TIME_PER_PLAYER);
    });

    test("should have no active floor initially", () => {
      expect(timerState.activeFloor).toBeNull();
    });
  });

  describe("startTimer", () => {
    test("should set active floor to given player", () => {
      const io = createMockIO();
      startTimer(
        io as any,
        "TEST01",
        timerState,
        1,
        () => {},
        () => {}
      );
      expect(timerState.activeFloor).toBe(1);
    });

    test("should emit timer:update events every 500ms", () => {
      const io = createMockIO();
      startTimer(
        io as any,
        "TEST01",
        timerState,
        1,
        () => {},
        () => {}
      );

      jest.advanceTimersByTime(500);
      const updates = io.emitted.filter((e) => e.event === "timer:update");
      expect(updates.length).toBe(1);

      jest.advanceTimersByTime(500);
      const updates2 = io.emitted.filter((e) => e.event === "timer:update");
      expect(updates2.length).toBe(2);
    });

    test("should decrement only active player time", () => {
      const io = createMockIO();
      startTimer(
        io as any,
        "TEST01",
        timerState,
        1,
        () => {},
        () => {}
      );

      jest.advanceTimersByTime(5000); // 5 seconds
      // P1 should have ~55s, P2 should still have 60s
      expect(timerState.p1Remaining).toBeLessThan(TIME_PER_PLAYER);
      expect(timerState.p2Remaining).toBe(TIME_PER_PLAYER);
    });

    test("should auto-pass floor when active player time runs out", () => {
      const io = createMockIO();
      const floorChanges: { newActive: number; reason: string }[] = [];

      startTimer(
        io as any,
        "TEST01",
        timerState,
        1,
        (newActive, reason) => floorChanges.push({ newActive, reason }),
        () => {}
      );

      // Advance past P1's 60 seconds
      jest.advanceTimersByTime(61_000);

      expect(floorChanges.length).toBeGreaterThanOrEqual(1);
      expect(floorChanges[0].newActive).toBe(2);
      expect(floorChanges[0].reason).toBe("timeout");
      expect(timerState.activeFloor).toBe(2);
    });

    test("should trigger round end when both players exhausted", () => {
      const io = createMockIO();
      let roundEnded = false;

      startTimer(
        io as any,
        "TEST01",
        timerState,
        1,
        () => {},
        () => {
          roundEnded = true;
        }
      );

      // Advance well past both players' total time (120+ seconds)
      jest.advanceTimersByTime(125_000);

      expect(roundEnded).toBe(true);
    });
  });

  describe("handleObjection", () => {
    test("should reject when objector is the active speaker", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();

      const result = handleObjection(io as any, "TEST01", timerState, 1, () => {});
      expect(result.success).toBe(false);
      expect(result.reason).toContain("own turn");
    });

    test("should reject when no active speaker", () => {
      const io = createMockIO();
      timerState.activeFloor = null;

      const result = handleObjection(io as any, "TEST01", timerState, 1, () => {});
      expect(result.success).toBe(false);
    });

    test("should reject when objector has <= 15s remaining", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();
      timerState.p2Remaining = OBJECTION_COST; // Exactly 15s — should be rejected

      const result = handleObjection(io as any, "TEST01", timerState, 2, () => {});
      expect(result.success).toBe(false);
      expect(result.reason).toContain("Not enough time");
    });

    test("should accept when objector has > 15s remaining", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();
      timerState.p2Remaining = OBJECTION_COST + 1; // Just over 15s

      const result = handleObjection(io as any, "TEST01", timerState, 2, () => {});
      expect(result.success).toBe(true);
    });

    test("should deduct exactly 15s from objector", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();
      const originalP2Time = timerState.p2Remaining;

      handleObjection(io as any, "TEST01", timerState, 2, () => {});
      expect(timerState.p2Remaining).toBe(originalP2Time - OBJECTION_COST);
    });

    test("should swap floor to objector", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();

      handleObjection(io as any, "TEST01", timerState, 2, () => {});
      expect(timerState.activeFloor).toBe(2);
    });

    test("should call onFloorChange with objection reason", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();
      const changes: { newActive: number; reason: string }[] = [];

      handleObjection(io as any, "TEST01", timerState, 2, (a, r) =>
        changes.push({ newActive: a, reason: r })
      );

      expect(changes.length).toBe(1);
      expect(changes[0].reason).toBe("objection");
      expect(changes[0].newActive).toBe(2);
    });

    test("should emit timer:update immediately after objection", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();

      handleObjection(io as any, "TEST01", timerState, 2, () => {});
      const updates = io.emitted.filter((e) => e.event === "timer:update");
      expect(updates.length).toBe(1);
    });
  });

  describe("handleYield", () => {
    test("should reject when caller is not active speaker", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();

      const result = handleYield(io as any, "TEST01", timerState, 2, () => {});
      expect(result.success).toBe(false);
      expect(result.reason).toContain("active speaker");
    });

    test("should reject when opponent has no time remaining", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();
      timerState.p2Remaining = 0;

      const result = handleYield(io as any, "TEST01", timerState, 1, () => {});
      expect(result.success).toBe(false);
      expect(result.reason).toContain("no time");
    });

    test("should swap floor on successful yield", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();

      const result = handleYield(io as any, "TEST01", timerState, 1, () => {});
      expect(result.success).toBe(true);
      expect(timerState.activeFloor).toBe(2);
    });

    test("should call onFloorChange with yield reason", () => {
      const io = createMockIO();
      timerState.activeFloor = 1;
      timerState.lastTickTime = Date.now();
      const changes: { newActive: number; reason: string }[] = [];

      handleYield(io as any, "TEST01", timerState, 1, (a, r) =>
        changes.push({ newActive: a, reason: r })
      );

      expect(changes[0].reason).toBe("yield");
      expect(changes[0].newActive).toBe(2);
    });
  });

  describe("stopTimer", () => {
    test("should clear interval and reset lastTickTime", () => {
      const io = createMockIO();
      startTimer(
        io as any,
        "TEST01",
        timerState,
        1,
        () => {},
        () => {}
      );

      expect(timerState.intervalId).not.toBeNull();
      stopTimer(timerState);
      expect(timerState.intervalId).toBeNull();
      expect(timerState.lastTickTime).toBeNull();
    });
  });
});
