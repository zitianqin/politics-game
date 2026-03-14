"use client";

import Confetti from "./components/Confetti";
import HUD from "./components/HUD";
import ScreenLobby from "./components/ScreenLobby";
import ScreenTopic from "./components/ScreenTopic";
import ScreenInput from "./components/ScreenInput";
import ScreenJudging from "./components/ScreenJudging";
import ScreenReveal from "./components/ScreenReveal";
import ScreenWinner from "./components/ScreenWinner";
import ScreenVoterGrid from "./components/ScreenVoterGrid";
import { useGameState } from "./hooks/useGameState";
import { useRevealAnimation } from "./hooks/useRevealAnimation";

export default function Page() {
  const {
    screen,
    currentRound,
    currentPlayer,
    p1TotalVotes,
    p2TotalVotes,
    timeLeft,
    currentTopic,
    p1Earned,
    p2Earned,
    judgingJoke,
    winnerLabel,
    startGame,
    startTopicReveal,
    submitArgument,
    startNextRound,
    resetGame,
    startMeetVoters,
  } = useGameState();

  const {
    displayP1Votes,
    displayP2Votes,
    currentBarsHeight,
    isNextBtnVisible,
  } = useRevealAnimation(
    screen,
    p1Earned,
    p2Earned,
    p1TotalVotes,
    p2TotalVotes
  );

  return (
    <>
      <Confetti active={screen === "winner"} />

      <HUD
        screen={screen}
        displayP1Votes={displayP1Votes}
        displayP2Votes={displayP2Votes}
        timeLeft={timeLeft}
      />

      <ScreenLobby screen={screen} startGame={startGame} />

      <ScreenVoterGrid screen={screen} startDebate={startMeetVoters} />

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

      <ScreenReveal
        screen={screen}
        p1Earned={p1Earned}
        p2Earned={p2Earned}
        currentBarsHeight={currentBarsHeight}
        isNextBtnVisible={isNextBtnVisible}
        currentRound={currentRound}
        startNextRound={startNextRound}
      />

      <ScreenWinner
        screen={screen}
        winnerLabel={winnerLabel}
        p1TotalVotes={p1TotalVotes}
        p2TotalVotes={p2TotalVotes}
        resetGame={resetGame}
      />
    </>
  );
}
