"use client";

import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenDebate from "@/app/components/ScreenDebate";
import ScreenJudging from "@/app/components/ScreenJudging";
import ScreenReveal from "@/app/components/ScreenReveal";
import ScreenWinner from "@/app/components/ScreenWinner";
import ResultsScreen from "@/app/components/ResultsScreen";
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
    p1Name,
    p2Name,
    winnerLabel,
    handleObjection,
    handleYield,
    setIsRecording,
    setMediaStream,
    startMeetVoters,
    startNextRound,
    resetGame,
    isHydrated,
    voterResults,
    isInterimResults,
    setScreen,
    advanceToResults,
    advanceToWinner,
    p1Candidate,
    p2Candidate,
  } = useGameState(code);

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
      {screen !== "topic" && (
        <HUD
          screen={screen}
          displayP1Votes={p1TotalVotes}
          displayP2Votes={p2TotalVotes}
          timeLeft={activePlayerTime}
          p1Name={p1Name}
          p2Name={p2Name}
        />
      )}

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
          p1Name={p1Name}
          p2Name={p2Name}
          onObjection={() => handleObjection(currentPlayer)}
          onYield={handleYield}
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
          advanceToResults={advanceToResults}
          p1Name={p1Name}
          p2Name={p2Name}
        />
      )}

      {screen === "winner" && (
        <ScreenWinner
          screen={screen}
          winnerLabel={winnerLabel}
          p1TotalVotes={p1TotalVotes}
          p2TotalVotes={p2TotalVotes}
          resetGame={resetGame}
          p1Name={p1Name}
          p2Name={p2Name}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          currentRound={currentRound}
          isInterim={isInterimResults}
          voters={voterResults}
          p1Name={p1Candidate?.name || "Player 1"}
          p2Name={p2Candidate?.name || "Player 2"}
          p1TotalVotes={p1TotalVotes}
          p2TotalVotes={p2TotalVotes}
          onContinue={() => {
            if (isInterimResults) {
              startNextRound();
            } else {
              advanceToWinner();
            }
          }}
          isVisible={true}
        />
      )}
    </>
  );
}
