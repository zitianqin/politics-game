import { useState, useRef, useCallback, useEffect } from "react";
import {
  ScreenId,
  TOTAL_ROUNDS,
  TURN_TIME,
  TOPICS,
  JUDGING_JOKES,
} from "../lib/gameConstants";
import { scoreArgument } from "../lib/scoring";

export interface TranscriptEntry {
  speaker: 1 | 2;
  text: string;
  timestamp: number;
  isObjection?: boolean;
}

export function useGameState() {
  const [screen, setScreen] = useState<ScreenId>("lobby");
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [p1TotalVotes, setP1TotalVotes] = useState(0);
  const [p2TotalVotes, setP2TotalVotes] = useState(0);

  // Debate Screen Timing (Per-player, per-round)
  const [p1RoundTimeRemaining, setP1RoundTimeRemaining] = useState(TURN_TIME);
  const [p2RoundTimeRemaining, setP2RoundTimeRemaining] = useState(TURN_TIME);
  const [currentSpeaker, setCurrentSpeaker] = useState<1 | 2>(1);
  const [activeSpeakerPausedTime, setActiveSpeakerPausedTime] = useState<
    number | null
  >(null);

  // Audio Recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Live Transcript
  const [liveTranscript, setLiveTranscript] = useState<TranscriptEntry[]>([]);

  // Round metadata
  const [currentTopic, setCurrentTopic] = useState("");
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null);

  // Reveal State
  const [p1RoundScore, setP1RoundScore] = useState(0);
  const [p2RoundScore, setP2RoundScore] = useState(0);
  const [judgingJoke, setJudgingJoke] = useState(JUDGING_JOKES[0]);

  // Internal tracking for non-render data
  const currentP1ArgRef = useRef("");
  const currentP2ArgRef = useRef("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Stop audio recording and cleanup
  const stopAudioRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
    setIsRecording(false);
  }, [isRecording, mediaStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopAudioRecording();
    };
  }, [clearTimer, stopAudioRecording]);

  const startVoterReveal = useCallback(() => {
    setScreen("voter-grid");
  }, []);

  const startGame = useCallback(() => {
    setP1TotalVotes(0);
    setP2TotalVotes(0);
    setCurrentRound(1);
    startVoterReveal();
  }, [startVoterReveal]);

  // We need a stable reference to submitArgument for the interval,
  // so we handle the auto-submission carefully. We'll use a callback ref
  // for the current submit action to avoid stale closures in the timer.

  // Using a ref to hold the *latest* version of submitArgument
  const submitCallbackRef =
    useRef<(text: string, forcePassPlayer?: 1 | 2) => void>(undefined);

  const startDebateTimer = useCallback(
    (speaker: 1 | 2) => {
      clearTimer();
      timerRef.current = setInterval(() => {
        setP1RoundTimeRemaining((prev) => {
          if (speaker === 1 && prev <= 1) {
            clearTimer();
            // P1's time ran out, switch to P2
            setCurrentSpeaker(2);
            return 0;
          }
          return speaker === 1 ? Math.max(0, prev - 1) : prev;
        });

        setP2RoundTimeRemaining((prev) => {
          if (speaker === 2 && prev <= 1) {
            clearTimer();
            // P2's time ran out, switch to P1
            setCurrentSpeaker(1);
            return 0;
          }
          return speaker === 2 ? Math.max(0, prev - 1) : prev;
        });
      }, 1000);
    },
    [clearTimer]
  );

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

      // Also accumulate in refs for final submission
      if (speaker === 1) {
        currentP1ArgRef.current += (currentP1ArgRef.current ? " " : "") + text;
      } else {
        currentP2ArgRef.current += (currentP2ArgRef.current ? " " : "") + text;
      }
    },
    [roundStartTime]
  );

  // Handle objection: deduct 15s from objecting player, pause opponent, switch floor
  const handleObjection = useCallback(
    (objectingPlayer: 1 | 2) => {
      if (currentSpeaker === objectingPlayer) {
        // Can't object on own turn
        return;
      }

      const remainingTime =
        objectingPlayer === 1 ? p1RoundTimeRemaining : p2RoundTimeRemaining;

      if (remainingTime <= 15) {
        // Not enough time to object
        return;
      }

      // Deduct 15 seconds from objecting player
      if (objectingPlayer === 1) {
        setP1RoundTimeRemaining((prev) => Math.max(0, prev - 15));
      } else {
        setP2RoundTimeRemaining((prev) => Math.max(0, prev - 15));
      }

      // Pause the current speaker's time
      setActiveSpeakerPausedTime(
        objectingPlayer === 1 ? p2RoundTimeRemaining : p1RoundTimeRemaining
      );

      // Add objection to transcript
      addTranscriptEntry(objectingPlayer, "OBJECTION!", true);

      // Switch floor to objecting player
      setCurrentSpeaker(objectingPlayer);
    },
    [
      currentSpeaker,
      p1RoundTimeRemaining,
      p2RoundTimeRemaining,
      addTranscriptEntry,
    ]
  );

  // Yield floor to other player
  const handleYield = useCallback(() => {
    const otherPlayer = currentSpeaker === 1 ? 2 : 1;
    setCurrentSpeaker(otherPlayer);
    setActiveSpeakerPausedTime(null);
  }, [currentSpeaker]);

  // End debate round and trigger judging
  const endDebateRound = useCallback(() => {
    clearTimer();
    stopAudioRecording();
    startJudging();
  }, [clearTimer, stopAudioRecording]);

  const startTopicReveal = useCallback((round: number) => {
    const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    setCurrentTopic(topic);
    setScreen("topic");

    setTimeout(() => {
      startDebateRound(1);
    }, 4000);
    // Intentionally empty - startDebateRound is captured by closure
  }, []);

  // Initialize debate round with fresh timers
  const startDebateRound = useCallback((startingSpeaker: 1 | 2) => {
    setScreen("debate");
    setCurrentSpeaker(startingSpeaker);
    setP1RoundTimeRemaining(TURN_TIME);
    setP2RoundTimeRemaining(TURN_TIME);
    setActiveSpeakerPausedTime(null);
    setLiveTranscript([]);
    setRoundStartTime(Date.now());
    audioChunksRef.current = [];

    // Start the debate timer
    startDebateTimer(startingSpeaker);
    // Intentionally empty - startDebateTimer is captured by closure
  }, []);

  const startMeetVoters = useCallback(() => {
    // Skipped voter-profile directly to topic reveal as requested
    startTopicReveal(currentRound);
  }, [startTopicReveal, currentRound]);

  const startJudging = useCallback(() => {
    setScreen("judging");

    let jokeIdx = 0;
    const jokeInt = setInterval(() => {
      jokeIdx = (jokeIdx + 1) % JUDGING_JOKES.length;
      setJudgingJoke(JUDGING_JOKES[jokeIdx]);
    }, 1000);

    setTimeout(() => {
      clearInterval(jokeInt);
      showRevealScreen();
    }, 4000);
  }, []);

  const showRevealScreen = useCallback(() => {
    const p1Score = scoreArgument(currentP1ArgRef.current);
    const p2Score = scoreArgument(currentP2ArgRef.current);

    setP1RoundScore(p1Score);
    setP2RoundScore(p2Score);

    setScreen("reveal");

    // They animate visually in the view, but functionally we update the totals here
    // The view can animate counting up if it wants, but state is exact.
    setTimeout(() => {
      setP1TotalVotes((prev) => prev + p1Score);
      setP2TotalVotes((prev) => prev + p2Score);
    }, 1000);
  }, []);

  const submitArgument = useCallback(
    (text: string, forPlayer?: 1 | 2) => {
      clearTimer();
      const actingPlayer = forPlayer || currentPlayer;

      if (actingPlayer === 1) {
        currentP1ArgRef.current = text;
        // Legacy: in new debate flow, this is replaced by startDebateRound
      } else {
        currentP2ArgRef.current = text;
        startJudging();
      }
    },
    [currentPlayer, startJudging, clearTimer]
  );

  // Keep the callback ref updated
  useEffect(() => {
    submitCallbackRef.current = submitArgument;
  }, [submitArgument]);

  const startNextRound = useCallback(() => {
    if (currentRound >= TOTAL_ROUNDS) {
      setScreen("winner");
    } else {
      setCurrentRound((prev) => prev + 1);
      startTopicReveal(currentRound + 1);
    }
  }, [currentRound, startTopicReveal]);

  const resetGame = useCallback(() => {
    setScreen("lobby");
    setP1TotalVotes(0);
    setP2TotalVotes(0);
    setCurrentRound(1);
  }, []);

  let winnerLabel = "";
  if (screen === "winner") {
    if (p1TotalVotes > p2TotalVotes) {
      winnerLabel = "🦄 PLAYER 1 WINS!";
    } else if (p2TotalVotes > p1TotalVotes) {
      winnerLabel = "🦖 PLAYER 2 WINS!";
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

    // Debate state
    currentTopic,
    currentSpeaker,
    p1RoundTimeRemaining,
    p2RoundTimeRemaining,
    activeSpeakerPausedTime,
    liveTranscript,
    isRecording,
    mediaStream,
    roundStartTime,

    // UI state
    judgingJoke,
    winnerLabel,

    // Game flow methods
    startGame,
    startTopicReveal,
    startDebateRound,
    startMeetVoters,
    submitArgument,
    startNextRound,
    resetGame,

    // Debate methods
    addTranscriptEntry,
    handleObjection,
    handleYield,
    endDebateRound,

    // Audio methods
    setIsRecording,
    setMediaStream,
  };
}
