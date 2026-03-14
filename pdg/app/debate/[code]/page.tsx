"use client";

import { use, useEffect } from "react";
import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenInput from "@/app/components/ScreenInput";
import ScreenJudging from "@/app/components/ScreenJudging";
import { useGameState } from "@/app/hooks/useGameState";

export default function DebatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const {
    screen,
    currentRound,
    currentPlayer,
    timeLeft,
    currentTopic,
    judgingJoke,
    submitArgument,
    startMeetVoters,
  } = useGameState();

  useEffect(() => {
    startMeetVoters();
  }, [startMeetVoters]);

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
