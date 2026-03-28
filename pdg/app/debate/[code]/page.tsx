"use client";

import HUD from "@/app/components/HUD";
import ScreenTopic from "@/app/components/ScreenTopic";
import ScreenDebate from "@/app/components/ScreenDebate";
import ScreenJudging from "@/app/components/ScreenJudging";
import ScreenReveal from "@/app/components/ScreenReveal";
import ScreenWinner from "@/app/components/ScreenWinner";
import ResultsScreen from "@/app/components/ResultsScreen";
import { useGameState } from "@/app/hooks/useGameState";
import { useAgoraDebateVoice } from "@/app/hooks/useAgoraDebateVoice";
import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/app/lib/socket";

export default function DebatePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ partyMode?: string }>;
}) {
  const { code } = use(params);
  const { partyMode } = use(searchParams);

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
    advanceToBars,
    advanceToWinner,
    p1Candidate,
    p2Candidate,
    roundStartTime,
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

  // Toggle partyMode and update URL
  const handleTogglePartyMode = () => {
    const currentMode = partyMode === "true" || partyMode === "1";
    const newMode = !currentMode;
    const params = new URLSearchParams();
    params.set("partyMode", newMode.toString());
    router.push(`/debate/${code}?${params.toString()}`);
  };

  // Redirect to lobby if screen is lobby
  useEffect(() => {
    if (isHydrated && screen === "lobby") {
      router.push(`/lobby/${code}`);
    }
  }, [screen, isHydrated, code, router]);

  // Determine which timer to show in HUD
  const activePlayerTime =
    currentSpeaker === 1 ? p1RoundTimeRemaining : p2RoundTimeRemaining;

  // Extract candidate full names for voting results display
  const p1CandidateName = p1Candidate?.fullName || p1Name;
  const p2CandidateName = p2Candidate?.fullName || p2Name;
  const { status: voiceStatus, error: voiceError } = useAgoraDebateVoice({
    enabled: screen === "topic" || screen === "debate",
    gameCode: code,
    playerSlot: currentPlayer,
    activeSpeaker: currentSpeaker,
    roundNumber: currentRound,
    debateLive: screen === "debate",
  });

  return (
    <>
      {screen !== "topic" && screen !== "results" && (
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
          roundStartTime={roundStartTime}
          showObjectionVFX={showObjectionVFX}
          objectionBy={objectionBy}
          p1Name={p1Name}
          p2Name={p2Name}
          onObjection={() => handleObjection(currentPlayer)}
          onYield={handleYield}
          setIsRecording={setIsRecording}
          setMediaStream={setMediaStream}
          voiceStatus={voiceStatus}
          voiceError={voiceError}
          partyMode={partyMode === "true" || partyMode === "1"}
          onTogglePartyMode={handleTogglePartyMode}
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
          onNext={() => {
            if (isInterimResults) {
              startNextRound();
            } else {
              advanceToWinner();
            }
          }}
          p1Name={p1CandidateName}
          p2Name={p2CandidateName}
        />
      )}

      {screen === "winner" && (
        <ScreenWinner
          screen={screen}
          winnerLabel={winnerLabel}
          p1TotalVotes={p1TotalVotes}
          p2TotalVotes={p2TotalVotes}
          resetGame={resetGame}
          p1Name={p1CandidateName}
          p2Name={p2CandidateName}
        />
      )}

      {screen === "results" && (
        <ResultsScreen
          currentRound={currentRound}
          isInterim={isInterimResults}
          voters={voterResults}
          p1Name={p1CandidateName}
          p2Name={p2CandidateName}
          p1TotalVotes={p1TotalVotes}
          p2TotalVotes={p2TotalVotes}
          onContinue={advanceToBars}
          isVisible={true}
        />
      )}
    </>
  );
}
