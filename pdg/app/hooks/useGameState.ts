import { useState, useRef, useCallback, useEffect } from "react";
import { ScreenId, TOTAL_ROUNDS, TURN_TIME, TOPICS, JUDGING_JOKES } from "../lib/gameConstants";
import { scoreArgument } from "../lib/scoring";

export function useGameState() {
    const [screen, setScreen] = useState<ScreenId>('lobby');
    const [currentRound, setCurrentRound] = useState(1);
    const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
    const [p1TotalVotes, setP1TotalVotes] = useState(0);
    const [p2TotalVotes, setP2TotalVotes] = useState(0);
    
    // Turn state
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentTopic, setCurrentTopic] = useState("");
    
    // Reveal State
    const [p1Earned, setP1Earned] = useState(0);
    const [p2Earned, setP2Earned] = useState(0);
    const [judgingJoke, setJudgingJoke] = useState(JUDGING_JOKES[0]);

    // Internal tracking for non-render data
    const currentP1ArgRef = useRef("");
    const currentP2ArgRef = useRef("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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

    const startTopicReveal = useCallback((round: number) => {
        const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
        setCurrentTopic(topic);
        setScreen('topic');

        setTimeout(() => {
            startTurn(1);
        }, 4000);
    }, []);

    const startGame = useCallback(() => {
        setP1TotalVotes(0);
        setP2TotalVotes(0);
        setCurrentRound(1);
        startTopicReveal(1);
    }, [startTopicReveal]);

    // We need a stable reference to submitArgument for the interval,
    // so we handle the auto-submission carefully. We'll use a callback ref
    // for the current submit action to avoid stale closures in the timer.

    // Using a ref to hold the *latest* version of submitArgument
    const submitCallbackRef = useRef<(text: string, forcePassPlayer?: 1 | 2) => void>(undefined);

    const startTurn = useCallback((playerNum: 1 | 2) => {
        setCurrentPlayer(playerNum);
        setScreen('input');
        setTimeLeft(TURN_TIME);
        
        clearTimer();
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearTimer();
                    // Auto submit empty argument on timeout
                    submitCallbackRef.current?.("", playerNum); 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [clearTimer]);

    const startJudging = useCallback(() => {
        setScreen('judging');
        
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
        
        setP1Earned(p1Score);
        setP2Earned(p2Score);
        
        setScreen('reveal');
        
        // They animate visually in the view, but functionally we update the totals here
        // The view can animate counting up if it wants, but state is exact.
        setTimeout(() => {
            setP1TotalVotes((prev) => prev + p1Score);
            setP2TotalVotes((prev) => prev + p2Score);
        }, 1000);

    }, []);

    const submitArgument = useCallback((text: string, forPlayer?: 1 | 2) => {
        clearTimer();
        const actingPlayer = forPlayer || currentPlayer;

        if (actingPlayer === 1) {
            currentP1ArgRef.current = text;
            startTurn(2);
        } else {
            currentP2ArgRef.current = text;
            startJudging();
        }
    }, [currentPlayer, startTurn, startJudging, clearTimer]);

    // Keep the callback ref updated
    useEffect(() => {
        submitCallbackRef.current = submitArgument;
    }, [submitArgument]);

    const startNextRound = useCallback(() => {
        if (currentRound >= TOTAL_ROUNDS) {
            setScreen('winner');
        } else {
            setCurrentRound(prev => prev + 1);
            startTopicReveal(currentRound + 1);
        }
    }, [currentRound, startTopicReveal]);

    const resetGame = useCallback(() => {
        setScreen('lobby');
        setP1TotalVotes(0);
        setP2TotalVotes(0);
        setCurrentRound(1);
    }, []);

    let winnerLabel = "";
    if (screen === 'winner') {
        if (p1TotalVotes > p2TotalVotes) {
            winnerLabel = "🦄 PLAYER 1 WINS!";
        } else if (p2TotalVotes > p1TotalVotes) {
            winnerLabel = "🦖 PLAYER 2 WINS!";
        } else {
            winnerLabel = "IT'S A TIE!!";
        }
    }

    return {
        screen,
        currentRound,
        currentPlayer,
        p1TotalVotes,
        p2TotalVotes,
        timeLeft,
        currentTopic,
        p1Earned,
        p2Earned,
        judgingJoke,
        winnerLabel,
        
        startGame,
        submitArgument,
        startNextRound,
        resetGame
    };
}
