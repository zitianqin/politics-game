"use client";

import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenDebate from "@/app/components/ScreenDebate";
import ScreenJudging from "@/app/components/ScreenJudging";
import { useGameState } from "@/app/hooks/useGameState";
import { use, useEffect } from "react";
import { getSocket } from "@/app/lib/socket";

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
    prepCountdown,
    liveTranscript,
    judgingJoke,
    showObjectionVFX,
    objectionBy,
    addTranscriptEntry,
    handleObjection,
    handleYield,
    setIsRecording,
    setMediaStream,
    startMeetVoters,
    startNextRound,
  } = useGameState();

  // Connect socket and signal reveal done on mount
  useEffect(() => {
    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
      const playerId = sessionStorage.getItem("playerId");
      if (playerId) {
        socket.emit("game:join", { code, playerId });
      }
    }
    // Signal that reveal is done → server starts Round 1
    startMeetVoters();
  }, [code, startMeetVoters]);

  // Determine which timer to show in HUD
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

      {screen === "topic" && (
        <ScreenTopic
          screen={screen}
          currentRound={currentRound}
          currentTopic={currentTopic}
          prepCountdown={prepCountdown}
        />
      )}

      {screen === "debate" && (
        <ScreenDebate
          screen={screen}
          currentRound={currentRound}
          currentPlayer={currentPlayer}
          activePlayer={currentSpeaker}
          p1TimeRemaining={p1RoundTimeRemaining}
          p2TimeRemaining={p2RoundTimeRemaining}
          currentTopic={currentTopic}
          transcript={liveTranscript}
          showObjectionVFX={showObjectionVFX}
          objectionBy={objectionBy}
          onObjection={() => handleObjection(currentPlayer)}
          onYield={handleYield}
          onSubmitSpeech={(text) => addTranscriptEntry(currentPlayer, text)}
          setIsRecording={setIsRecording}
          setMediaStream={setMediaStream}
        />
      )}

      {screen === "judging" && (
        <ScreenJudging screen={screen} judgingJoke={judgingJoke} />
      )}
    </>
  );
}
