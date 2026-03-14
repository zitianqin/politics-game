"use client";

import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import { useGameState } from "@/app/hooks/useGameState";

export default function RevealPage({ params }: { params: { code: string } }) {
  const { currentRound, currentTopic } = useGameState();

  return (
    <>
      <HUD
        screen="reveal"
        displayP1Votes={0}
        displayP2Votes={0}
        timeLeft={30}
      />

      <ScreenTopic
        screen="topic"
        currentRound={currentRound}
        currentTopic={currentTopic}
      />
    </>
  );
}
