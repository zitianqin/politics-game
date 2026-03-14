import { useState, useRef, useCallback, useEffect } from "react";
import { TURN_TIME } from "../lib/gameConstants";

export interface TranscriptEntry {
  speaker: 1 | 2;
  text: string;
  timestamp: number;
  isObjection?: boolean;
}

interface UseDebateProps {
  currentPlayer: 1 | 2;
  currentRound: number;
  onRoundEnd: (p1Speech: string, p2Speech: string) => void;
  onTimeEnd: () => void;
}

export function useDebate({
  currentPlayer,
  currentRound,
  onRoundEnd,
  onTimeEnd,
}: UseDebateProps) {
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [timeLeft, setTimeLeft] = useState(TURN_TIME);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [p1TimeRemaining, setP1TimeRemaining] = useState(TURN_TIME);
  const [p2TimeRemaining, setP2TimeRemaining] = useState(TURN_TIME);

  // Track cumulative speech for each player
  const p1SpeechRef = useRef("");
  const p2SpeechRef = useRef("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const roundStartTimeRef = useRef(Date.now());

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Initialize debate state
  useEffect(() => {
    setActivePlayer(1);
    setTranscript([]);
    setP1TimeRemaining(TURN_TIME);
    setP2TimeRemaining(TURN_TIME);
    p1SpeechRef.current = "";
    p2SpeechRef.current = "";
    roundStartTimeRef.current = Date.now();
    startTimer(1);
  }, [currentRound]);

  const startTimer = useCallback(
    (playerNum: 1 | 2) => {
      clearTimer();
      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            onTimeEnd();
            return 0;
          }
          return prev - 1;
        });

        if (playerNum === 1) {
          setP1TimeRemaining((prev) => Math.max(0, prev - 1));
        } else {
          setP2TimeRemaining((prev) => Math.max(0, prev - 1));
        }
      }, 1000);

      timerRef.current = timerInterval;
    },
    [clearTimer, onTimeEnd]
  );

  const addToTranscript = useCallback(
    (speaker: 1 | 2, text: string, isObjection = false) => {
      const timestamp = Math.round(
        (Date.now() - roundStartTimeRef.current) / 1000
      );
      setTranscript((prev) => [
        ...prev,
        { speaker, text, timestamp, isObjection },
      ]);

      // Add to cumulative speech
      if (speaker === 1) {
        p1SpeechRef.current += (p1SpeechRef.current ? " " : "") + text;
      } else {
        p2SpeechRef.current += (p2SpeechRef.current ? " " : "") + text;
      }
    },
    []
  );

  const handleObjection = useCallback(
    (objectingPlayer: 1 | 2) => {
      if (activePlayer === objectingPlayer) {
        // Can't object on own turn
        return;
      }

      const remainingTime =
        objectingPlayer === 1 ? p1TimeRemaining : p2TimeRemaining;

      if (remainingTime > 15) {
        // Deduct 15 seconds from objecting player
        if (objectingPlayer === 1) {
          setP1TimeRemaining((prev) => Math.max(0, prev - 15));
        } else {
          setP2TimeRemaining((prev) => Math.max(0, prev - 15));
        }

        // Add objection to transcript
        addToTranscript(objectingPlayer, "OBJECTION!", true);

        // Switch active player
        setActivePlayer(objectingPlayer);
      }
    },
    [activePlayer, p1TimeRemaining, p2TimeRemaining, addToTranscript]
  );

  const handleYield = useCallback(() => {
    // Switch to other player
    const otherPlayer = activePlayer === 1 ? 2 : 1;
    setActivePlayer(otherPlayer);
  }, [activePlayer]);

  const handleSpeechSubmit = useCallback(
    (speaker: 1 | 2, text: string) => {
      addToTranscript(speaker, text);
    },
    [addToTranscript]
  );

  const endRound = useCallback(() => {
    clearTimer();
    onRoundEnd(p1SpeechRef.current, p2SpeechRef.current);
  }, [clearTimer, onRoundEnd]);

  return {
    activePlayer,
    timeLeft,
    transcript,
    p1TimeRemaining,
    p2TimeRemaining,
    handleObjection,
    handleYield,
    handleSpeechSubmit,
    endRound,
  };
}
