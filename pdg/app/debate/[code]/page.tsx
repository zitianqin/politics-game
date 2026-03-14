"use client";

import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenDebate from "@/app/components/ScreenDebate";
import ScreenJudging from "@/app/components/ScreenJudging";
import ScreenReveal from "@/app/components/ScreenReveal";
import ScreenWinner from "@/app/components/ScreenWinner";
import { useGameState } from "@/app/hooks/useGameState";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    p1RoundScore,
    p2RoundScore,
    p1TotalVotes,
    p2TotalVotes,
    currentBarsHeight,
    isNextBtnVisible,
    winnerLabel,
    addTranscriptEntry,
    handleObjection,
    handleYield,
    setIsRecording,
    setMediaStream,
    startMeetVoters,
    startNextRound,
    resetGame,
    isHydrated,
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
  }, [code]);

  const router = useRouter();

  // Redirect to results page when game finishes
  useEffect(() => {
    if (isHydrated && screen === "winner") {
      router.push(`/results/${code}`);
    }
  }, [screen, isHydrated, code, router]);

  // Redirect to lobby if screen is lobby
  useEffect(() => {
    if (isHydrated && screen === "lobby") {
      router.push(`/lobby/${code}`);
    }
  }, [screen, isHydrated, code, router]);

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

      {screen === "reveal" && (
        <ScreenReveal
          screen={screen}
          p1Earned={p1RoundScore}
          p2Earned={p2RoundScore}
          currentBarsHeight={currentBarsHeight}
          isNextBtnVisible={isNextBtnVisible}
          currentRound={currentRound}
          startNextRound={startNextRound}
        />
      )}

      {screen === "winner" && (
        <ScreenWinner
          screen={screen}
          winnerLabel={winnerLabel}
          p1TotalVotes={p1TotalVotes}
          p2TotalVotes={p2TotalVotes}
          resetGame={resetGame}
        />
      )}
    </>
  );
}
