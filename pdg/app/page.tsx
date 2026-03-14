"use client";

import Confetti from "./components/Confetti";
import HUD from "./components/HUD";
import ScreenLobby from "./components/ScreenLobby";
import ScreenVoterProfile from "./components/ScreenVoterProfile";
import ScreenTopic from "./components/ScreenTopic";
import ScreenInput from "./components/ScreenInput";
import ScreenJudging from "./components/ScreenJudging";
import ScreenReveal from "./components/ScreenReveal";
import ScreenWinner from "./components/ScreenWinner";
import ScreenVoterGrid from "./components/ScreenVoterGrid";
import { useGameState } from "./hooks/useGameState";
import { useRevealAnimation } from "./hooks/useRevealAnimation";
import { VoterProfileProps } from "./components/VoterSVG";

const MOCK_VOTERS: VoterProfileProps[] = [
  { name: "Barry Nolan", age: 64, location: "Penrith, NSW", occupation: "Retired Sparkie", quote: ["Spent 35 years on-site. Back's shot,", "energy bills are a joke. I just want", "someone who speaks plain English."], lean: "CONSERVATIVE", votingStyle: "POPULIST", concerns: ["Energy Costs", "Cost of Living"], vulnerableTo: "Straight-Talkin' & No Bulls**t" },
  { name: "Chloe Atkinson", age: 23, location: "Fitzroy, VIC", occupation: "Barista / Student", quote: ["Rent is too high and the planet", "is burning. I want someone who", "actually cares about the future."], lean: "PROGRESSIVE", votingStyle: "EMOTIONAL", concerns: ["Climate", "Housing", "LGBTQ+ Rights"], vulnerableTo: "Values-based Appeals" },
  { name: "Dr. Helen F.", age: 72, location: "Toorak, VIC", occupation: "Retired GP", quote: ["I read the AFR daily. I want", "steady, evidence-based policy,", "not these silly populist slogans."], lean: "CENTRE", votingStyle: "RATIONAL", concerns: ["Healthcare", "Fiscal Resp."], vulnerableTo: "Expert References" },
  { name: "Damo Perkins", age: 46, location: "Broken Hill, NSW", occupation: "Long-haul Truckie", quote: ["Both major parties are rotten.", "I don't trust any of 'em. I'll", "just vote for whoever pisses me off less."], lean: "APATHETIC", votingStyle: "POPULIST", concerns: ["Fuel Costs", "Gov Overreach"], vulnerableTo: "Anti-Politician Sentiment" }
];

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

      <ScreenVoterProfile 
        screen={screen} 
        voterProfiles={MOCK_VOTERS} 
        startNextRound={() => startTopicReveal(currentRound)} 
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
