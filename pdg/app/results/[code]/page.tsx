"use client";

import Confetti from "@/app/components/Confetti";
import HUD from "@/app/components/HUD";
import ScreenReveal from "@/app/components/ScreenReveal";
import ScreenWinner from "@/app/components/ScreenWinner";
import { useGameState } from "@/app/hooks/useGameState";
import { useRevealAnimation } from "@/app/hooks/useRevealAnimation";

export default function ResultsPage({ params }: { params: { code: string } }) {
  const {
    p1TotalVotes,
    p2TotalVotes,
    p1Earned,
    p2Earned,
    currentRound,
    winnerLabel,
    resetGame,
    startNextRound,
  } = useGameState();

  const {
    displayP1Votes,
    displayP2Votes,
    currentBarsHeight,
    isNextBtnVisible,
  } = useRevealAnimation(
    "reveal",
    p1Earned,
    p2Earned,
    p1TotalVotes,
    p2TotalVotes
  );

  return (
    <>
      <Confetti active={false} />

      <HUD
        screen="winner"
        displayP1Votes={displayP1Votes}
        displayP2Votes={displayP2Votes}
        timeLeft={0}
      />

      <ScreenReveal
        screen="reveal"
        p1Earned={p1Earned}
        p2Earned={p2Earned}
        currentBarsHeight={currentBarsHeight}
        isNextBtnVisible={isNextBtnVisible}
        currentRound={currentRound}
        startNextRound={startNextRound}
      />

      <ScreenWinner
        screen="winner"
        winnerLabel={winnerLabel}
        p1TotalVotes={p1TotalVotes}
        p2TotalVotes={p2TotalVotes}
        resetGame={resetGame}
      />
    </>
  );
}
