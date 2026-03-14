"use client";

import Confetti from "@/app/components/Confetti";
import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenInput from "@/app/components/ScreenInput";
import ScreenJudging from "@/app/components/ScreenJudging";
import { useGameState } from "@/app/hooks/useGameState";

export default function DebatePage({ params }: { params: { code: string } }) {
  const {
    screen,
    currentRound,
    currentPlayer,
    timeLeft,
    currentTopic,
    judgingJoke,
    submitArgument,
  } = useGameState();

  return (
    <>
      <HUD
        screen={screen}
        displayP1Votes={0}
        displayP2Votes={0}
        timeLeft={timeLeft}
      />

      <ScreenTopic
        screen={screen}
        currentRound={currentRound}
        currentTopic={currentTopic}
      />

      <ScreenInput
        screen={screen}
        currentPlayer={currentPlayer}
        currentTopic={currentTopic}
        submitArgument={submitArgument}
      />

      <ScreenJudging screen={screen} judgingJoke={judgingJoke} />
    </>
  );
}
