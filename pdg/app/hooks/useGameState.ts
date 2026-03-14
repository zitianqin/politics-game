"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ScreenId, TOTAL_ROUNDS, JUDGING_JOKES } from "../lib/gameConstants";
import { getSocket } from "../lib/socket";

export interface TranscriptEntry {
  speaker: 1 | 2;
  text: string;
  timestamp: number;
  isObjection?: boolean;
}

export function useGameState(gameCodeFromUrl?: string) {
  const [screen, setScreen] = useState<ScreenId>("lobby");
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("isHost") === "true" ? 1 : 2;
    }
    return 1;
  });
  const [p1TotalVotes, setP1TotalVotes] = useState(0);
  const [p2TotalVotes, setP2TotalVotes] = useState(0);

  // Server-driven debate state
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentSpeaker, setCurrentSpeaker] = useState<1 | 2>(1);
  const [p1RoundTimeRemaining, setP1RoundTimeRemaining] = useState(60);
  const [p2RoundTimeRemaining, setP2RoundTimeRemaining] = useState(60);
  const [prepCountdown, setPrepCountdown] = useState(10);

  // Objection VFX state
  const [showObjectionVFX, setShowObjectionVFX] = useState(false);
  const [objectionBy, setObjectionBy] = useState<1 | 2 | null>(null);
  const [floorChangeReason, setFloorChangeReason] = useState<string | null>(
    null
  );

  // Audio Recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Live Transcript
  const [liveTranscript, setLiveTranscript] = useState<TranscriptEntry[]>([]);

  // Round metadata
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null);

  // Reveal State
  const [p1RoundScore, setP1RoundScore] = useState(0);
  const [p2RoundScore, setP2RoundScore] = useState(0);
  const [currentBarsHeight, setCurrentBarsHeight] = useState({ p1: 0, p2: 0 });
  const [isNextBtnVisible, setIsNextBtnVisible] = useState(false);
  const [judgingJoke, setJudgingJoke] = useState(JUDGING_JOKES[0]);
  const [p1Name, setP1Name] = useState("Player 1");
  const [p2Name, setP2Name] = useState("Player 2");

  // Voter Results State (for Results screen)
  const [voterResults, setVoterResults] = useState<
    Array<{
      name: string;
      age: number;
      location: string;
      votedFor: "p1" | "p2";
      rationale: string;
    }>
  >([]);
  const [isInterimResults, setIsInterimResults] = useState(false);

  // Internal tracking
  const currentP1ArgRef = useRef("");
  const currentP2ArgRef = useRef("");
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const socketListenersAttached = useRef(false);

  // Stop audio recording and cleanup.
  // Uses functional setMediaStream so this callback never needs mediaStream or
  // isRecording as deps — keeping the reference stable across renders and
  // preventing the socket-listener effect from tearing down & re-mounting.
  const stopAudioRecording = useCallback(() => {
    setMediaStream((current) => {
      if (current) current.getTracks().forEach((t) => t.stop());
      return null;
    });
    setIsRecording(false);
  }, []); // stable — only depends on setter functions

  // ──────────────────────────────────────────────
  // Socket event listeners (server-authoritative)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (socketListenersAttached.current) return;
    const socket = getSocket();
    socketListenersAttached.current = true;

    // Round start: set topic, show topic screen
    socket.on("round:start", (data: { roundNumber: number; topic: string }) => {
      setCurrentRound(data.roundNumber);
      setCurrentTopic(data.topic);
      setPrepCountdown(10);
      setScreen("topic");
    });

    // Prep countdown from server
    socket.on("round:prep", (data: { countdown: number }) => {
      setPrepCountdown(data.countdown);
    });

    // Debate phase begins
    socket.on("round:debate", (data: { activePlayer: 1 | 2 }) => {
      setCurrentSpeaker(data.activePlayer);
      setP1RoundTimeRemaining(60);
      setP2RoundTimeRemaining(60);
      setLiveTranscript([]);
      setRoundStartTime(Date.now());
      audioChunksRef.current = [];
      currentP1ArgRef.current = "";
      currentP2ArgRef.current = "";
      setScreen("debate");
    });

    // Server timer ticks (every 500ms)
    socket.on(
      "timer:update",
      (data: {
        p1remaining: number;
        p2remaining: number;
        activePlayer: 1 | 2;
      }) => {
        setP1RoundTimeRemaining(data.p1remaining);
        setP2RoundTimeRemaining(data.p2remaining);
        if (data.activePlayer) setCurrentSpeaker(data.activePlayer);
      }
    );

    // Floor changes (objection, timeout, yield)
    socket.on(
      "floor:change",
      (data: { activePlayer: 1 | 2; reason: string }) => {
        setCurrentSpeaker(data.activePlayer);
        setFloorChangeReason(data.reason);

        if (data.reason === "objection") {
          setShowObjectionVFX(true);
          setObjectionBy(data.activePlayer);
          // Clear VFX after animation
          setTimeout(() => {
            setShowObjectionVFX(false);
            setObjectionBy(null);
          }, 2000);
        }
      }
    );

    // Round end: stop recording, prepare for judging
    socket.on("round:end", (data: { roundNumber: number }) => {
      stopAudioRecording();
    });

    // Judging starts on server
    socket.on("judging:start", (data: { roundNumber: number }) => {
      setScreen("judging");
      let jokeIdx = 0;
      const jokeInt = setInterval(() => {
        jokeIdx = (jokeIdx + 1) % JUDGING_JOKES.length;
        setJudgingJoke(JUDGING_JOKES[jokeIdx]);
      }, 1000);
      (window as any)._judgingInterval = jokeInt;
    });

// Round results arrived from server (handles both 'round:results' and 'game:result' events)
const handleRoundResults = (data: {
  roundNumber: number;
  p1Score?: number;
  p2Score?: number;
  tally?: { p1: number; p2: number };
}) => {
  if ((window as any)._judgingInterval) {
    clearInterval((window as any)._judgingInterval);
  }
  // Most recent logic from main: prefer explicit p1Score/p2Score
  // But incorporate the fallback logic from yours for maximum compatibility
  const p1Score = data.p1Score ?? data.tally?.p1 ?? 0;
  const p2Score = data.p2Score ?? data.tally?.p2 ?? 0;

  setP1RoundScore(p1Score);
  setP2RoundScore(p2Score);
  setScreen("reveal");
  setIsNextBtnVisible(false);

  // Animate bars
  setTimeout(() => {
    setCurrentBarsHeight((prev) => ({
      p1: prev.p1 + p1Score / 5,
      p2: prev.p2 + p2Score / 5,
    }));
    setP1TotalVotes((prev) => prev + p1Score);
    setP2TotalVotes((prev) => prev + p2Score);
  }, 500);

  setTimeout(() => {
    setIsNextBtnVisible(true);
  }, 3000);
};

socket.on("round:results", handleRoundResults);
socket.on("game:result", handleRoundResults);

    socket.on("game:reset", () => {
      setScreen("lobby");
      setCurrentRound(1);
      setP1TotalVotes(0);
      setP2TotalVotes(0);
      setLiveTranscript([]);
      setP1Name("Player 1");
      setP2Name("Player 2");
    });

    socket.on("game:complete", () => {
      setScreen("winner");
    });

    // Live transcript chunks from /api/transcribe broadcast
    socket.on(
      "transcript:update",
      (data: {
        speaker: string;
        text: string;
        timestamp: number;
        roundNumber: number;
        isObjectionEnd?: boolean;
        inaudible?: boolean;
      }) => {
        if (data.inaudible) return; // skip silent segments
        const speakerNum: 1 | 2 = data.speaker === "player1" ? 1 : 2;
        setLiveTranscript((prev) => [
          ...prev,
          { speaker: speakerNum, text: data.text, timestamp: data.timestamp },
        ]);
      }
    );

    // Reconnect and explicit state hydration
    const handleHydration = (data: { gameState: any }) => {
      const gs = data.gameState;
      if (!gs) return;

      setIsHydrated(true);
      setCurrentRound(gs.currentRound || 1);

      const myId = sessionStorage.getItem("playerId");
      const me = gs.players?.find((p: any) => p.id === myId);
      if (me) setCurrentPlayer(me.slot as 1 | 2);

      const p1 = gs.players?.find((p: any) => p.slot === 1);
      const p2 = gs.players?.find((p: any) => p.slot === 2);
      if (p1?.displayName) setP1Name(p1.displayName);
      if (p2?.displayName) setP2Name(p2.displayName);

      if (gs.status === "meet_voters") {
        setScreen("voter-grid");
      } else if (gs.status === "debate") {
        if (gs.debatePhase === "prep") setScreen("topic");
        else setScreen("debate");

        setCurrentTopic(gs.topics[gs.currentRound - 1] || "");

        const rData = gs.rounds.find(
          (r: any) => r.roundNumber === gs.currentRound
        );
        if (rData && rData.transcript) {
          setLiveTranscript(rData.transcript);
        }
      } else if (gs.status === "judging") {
        setScreen("judging");
      } else if (gs.status === "round_results") {
        setScreen("reveal");
        const rData = gs.rounds.find(
          (r: any) => r.roundNumber === gs.currentRound
        );
        if (
          rData &&
          rData.p1Score !== undefined &&
          rData.p2Score !== undefined
        ) {
          setP1RoundScore(rData.p1Score);
          setP2RoundScore(rData.p2Score);
          setIsNextBtnVisible(true);
        }
      } else if (gs.status === "voting") {
        setScreen("judging");
      } else if (gs.status === "complete") {
        setScreen("winner");
      }
    };

    socket.on("game:reconnected", handleHydration);
    socket.on("game:state", handleHydration);

    // Request full state immediately on mount
    const gameCode =
      gameCodeFromUrl ?? sessionStorage.getItem("gameCode");
    if (gameCode) {
      socket.emit("game:getState", { code: gameCode });
    }

    return () => {
      socket.off("round:start");
      socket.off("round:prep");
      socket.off("round:debate");
      socket.off("timer:update");
      socket.off("floor:change");
      socket.off("round:end");
      socket.off("judging:start");
      socket.off("round:results");
      socket.off("game:result");
      socket.off("game:reset");
      socket.off("game:complete");
      socket.off("game:reconnected");
      socket.off("game:state");
      socket.off("transcript:update");
      socketListenersAttached.current = false;
    };
  }, [stopAudioRecording]);

  // ──────────────────────────────
  // Game flow methods
  // ──────────────────────────────

  const startVoterReveal = useCallback(() => {
    setScreen("voter-grid");
  }, []);

  const startGame = useCallback(() => {
    setP1TotalVotes(0);
    setP2TotalVotes(0);
    setCurrentRound(1);
    setScreen("voter-grid");
  }, []);

  // Signal server that reveal is done → triggers round 1
  const signalRevealDone = useCallback(() => {
    const socket = getSocket();
    const gameCode = sessionStorage.getItem("gameCode");
    if (gameCode) {
      socket.emit("reveal:done", { code: gameCode });
    }
  }, []);

  const startMeetVoters = useCallback(() => {
    signalRevealDone();
  }, [signalRevealDone]);

  // ──────────────────────────────
  // Debate methods (emit to server)
  // ──────────────────────────────

  // Add transcript entry during debate
  const addTranscriptEntry = useCallback(
    (speaker: 1 | 2, text: string, isObjection = false) => {
      const timestamp = roundStartTime
        ? Math.round((Date.now() - roundStartTime) / 1000)
        : 0;

      setLiveTranscript((prev) => [
        ...prev,
        { speaker, text, timestamp, isObjection },
      ]);

      if (speaker === 1) {
        currentP1ArgRef.current += (currentP1ArgRef.current ? " " : "") + text;
      } else {
        currentP2ArgRef.current += (currentP2ArgRef.current ? " " : "") + text;
      }
    },
    [roundStartTime]
  );

  // Emit objection to server
  const handleObjection = useCallback(
    (objectingPlayer: 1 | 2) => {
      const socket = getSocket();
      const gameCode = sessionStorage.getItem("gameCode");
      if (gameCode) {
        socket.emit("objection:raised", {
          code: gameCode,
          byPlayer: objectingPlayer,
        });
        // Add objection marker to local transcript
        addTranscriptEntry(objectingPlayer, "OBJECTION!", true);
      }
    },
    [addTranscriptEntry]
  );

  // Emit yield to server
  const handleYield = useCallback(() => {
    const socket = getSocket();
    const gameCode = sessionStorage.getItem("gameCode");
    if (gameCode) {
      socket.emit("floor:yield", {
        code: gameCode,
        byPlayer: currentSpeaker,
      });
    }
  }, [currentSpeaker]);

  // End debate round (usually triggered by server, but can be requested)
  const endDebateRound = useCallback(() => {
    stopAudioRecording();
  }, [stopAudioRecording]);

  // Judging & scoring are now handled server-side

  const startNextRound = useCallback(() => {
<<<<<<< HEAD
    if (currentRound >= TOTAL_ROUNDS) {
      setScreen("winner");
    } else {
      const socket = getSocket();
      const gameCode =
        gameCodeFromUrl ?? sessionStorage.getItem("gameCode");
      if (gameCode) {
        socket.emit("round:advance", { code: gameCode });
      }
    }
  }, [currentRound, gameCodeFromUrl]);
=======
    // Always signal server to advance. Server will decide if it's new round or completion.
    const socket = getSocket();
    const gameCode = sessionStorage.getItem("gameCode");
    if (gameCode) {
      socket.emit("round:advance", { code: gameCode });
    }
  }, []);
>>>>>>> origin/main

  const resetGame = useCallback(() => {
    const socket = getSocket();
    const gameCode = sessionStorage.getItem("gameCode");
    if (gameCode) {
      socket.emit("game:reset", { code: gameCode });
    }
  }, []);

  let winnerLabel = "";
  if (screen === "winner") {
    if (p1TotalVotes > p2TotalVotes) {
      winnerLabel = `🦄 ${p1Name.toUpperCase()} WINS!`;
    } else if (p2TotalVotes > p1TotalVotes) {
      winnerLabel = `🦖 ${p2Name.toUpperCase()} WINS!`;
    } else {
      winnerLabel = "IT'S A TIE!!";
    }
  }

  return {
    // Screen state
    screen,
    currentRound,
    currentPlayer,

    // Voting state
    p1TotalVotes,
    p2TotalVotes,
    p1RoundScore,
    p2RoundScore,
    currentBarsHeight,
    isNextBtnVisible,
    p1Name,
    p2Name,

    // Debate state (server-driven)
    currentTopic,
    currentSpeaker,
    p1RoundTimeRemaining,
    p2RoundTimeRemaining,
    prepCountdown,
    liveTranscript,
    isRecording,
    mediaStream,
    roundStartTime,

    // Objection VFX state
    showObjectionVFX,
    objectionBy,
    floorChangeReason,

    // UI state
    judgingJoke,
    winnerLabel,

    // Voter results (for results screen)
    voterResults,
    isInterimResults,

    // Game flow methods
    startGame,
    startMeetVoters,
    signalRevealDone,
    startNextRound,
    resetGame,

    // Debate methods (server-emitting)
    addTranscriptEntry,
    handleObjection,
    handleYield,
    endDebateRound,

    // Audio methods
    setIsRecording,
    setMediaStream,

    // Sync state
    isHydrated,
  };
}
