"use client";

import Confetti from "@/app/components/Confetti";
import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenDebate from "@/app/components/ScreenDebate";
import ScreenJudging from "@/app/components/ScreenJudging";
import { useGameState } from "@/app/hooks/useGameState";
import { TranscriptEntry } from "@/app/hooks/useDebate";
import { use, useEffect } from "react";

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
    p1RoundTimeRemaining,
    p2RoundTimeRemaining,
    currentSpeaker,
    currentTopic,
    liveTranscript,
    judgingJoke,
    addTranscriptEntry,
    handleObjection,
    handleYield,
    setIsRecording,
    setMediaStream,
    startMeetVoters,
  } = useGameState();

  // Determine which timer to show in HUD
  useEffect(() => {
    startMeetVoters();
  }, [startMeetVoters]);

  const activePlayerTime =
    currentSpeaker === 1 ? p1RoundTimeRemaining : p2RoundTimeRemaining;

  return (
    <>
      <HUD
        screen={screen}
        displayP1Votes={0}
        displayP2Votes={0}
        timeLeft={activePlayerTime}
      />

      {screen == "topic" && (
        <ScreenTopic
          screen={screen}
          currentRound={currentRound}
          currentTopic={currentTopic}
        />
      )}

      {screen == "debate" && (
        <ScreenDebate
          screen={screen}
          currentRound={currentRound}
          currentPlayer={currentPlayer}
          activePlayer={currentSpeaker}
          timeLeft={activePlayerTime}
          currentTopic={currentTopic}
          transcript={liveTranscript}
          onObjection={() => handleObjection(currentPlayer)}
          onYield={handleYield}
          onSubmitSpeech={(text) => addTranscriptEntry(currentPlayer, text)}
          setIsRecording={setIsRecording}
          setMediaStream={setMediaStream}
        />
      )}

      {screen == "judging" && (
        <ScreenJudging screen={screen} judgingJoke={judgingJoke} />
      )}
    </>
  );
}
