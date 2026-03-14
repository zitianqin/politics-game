"use client";

import Confetti from "@/app/components/Confetti";
import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenDebate from "@/app/components/ScreenDebate";
import ScreenJudging from "@/app/components/ScreenJudging";
import { useGameState } from "@/app/hooks/useGameState";
import { TranscriptEntry } from "@/app/hooks/useDebate";

export default function DebatePage({ params }: { params: { code: string } }) {
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
  } = useGameState();

  // Determine which timer to show in HUD

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
