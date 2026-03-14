"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Confetti from "@/app/components/Confetti";
import HUD from "@/app/components/HUD";
import ResultsScreen from "@/app/components/ResultsScreen";
import { useGameState } from "@/app/hooks/useGameState";
import { voterRationales, getVoterRationale } from "@/app/lib/voterRationales";
import { TOTAL_ROUNDS } from "@/app/lib/gameConstants";

/**
 * Mock voter data for demo purposes.
 * In production, this will come from the server and LLM votes.
 */
const MOCK_VOTERS = [
  {
    name: "Barry Nolan",
    age: 64,
    location: "Penrith NSW",
  },
  {
    name: "Chloe Atkinson",
    age: 23,
    location: "Fitzroy VIC",
  },
  {
    name: "Minh Nguyen",
    age: 51,
    location: "Cabramatta NSW",
  },
  {
    name: "Tracey Dunbar",
    age: 38,
    location: "Townsville QLD",
  },
  {
    name: "Colonel David Marsh",
    age: 69,
    location: "Canberra ACT",
  },
];

export default function ResultsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const router = useRouter();

  const {
    p1TotalVotes,
    p2TotalVotes,
    p1RoundScore: p1Earned,
    p2RoundScore: p2Earned,
    currentRound,
    resetGame,
    startNextRound,
    isHydrated,
  } = useGameState();

  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Generate mock voter results with random vote assignment
  const [voterResults, setVoterResults] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock results with random vote distribution
    const p1CandidateName = "Candidate 1";
    const p2CandidateName = "Candidate 2";

    const results = MOCK_VOTERS.map(() => {
      const votedFor = Math.random() > 0.5 ? ("p1" as const) : ("p2" as const);
      const voter = MOCK_VOTERS[Math.floor(Math.random() * MOCK_VOTERS.length)];

      return {
        name: voter.name,
        age: voter.age,
        location: voter.location,
        votedFor,
        rationale: getVoterRationale(
          voter.name,
          votedFor === "p1" ? p1CandidateName : p2CandidateName
        ),
      };
    });

    setVoterResults(results);
  }, []);

  const isInterim = currentRound === 1 || currentRound < TOTAL_ROUNDS;

  const handleContinue = () => {
    if (isInterim) {
      // Move to next round
      startNextRound();
      router.push(`/debate/${code}`);
    } else {
      // Reset game and return to lobby
      resetGame();
      router.push("/");
    }
  };

  return (
    <>
      <Confetti active={!isInterim && isAnimationComplete} />

      <HUD
        screen="results"
        displayP1Votes={p1TotalVotes}
        displayP2Votes={p2TotalVotes}
        timeLeft={0}
      />

      {isHydrated && (
        <ResultsScreen
          currentRound={currentRound}
          isInterim={isInterim}
          voters={voterResults}
          p1Name="Player 1"
          p2Name="Player 2"
          p1TotalVotes={p1TotalVotes}
          p2TotalVotes={p2TotalVotes}
          onContinue={handleContinue}
          isVisible={true}
        />
      )}
    </>
  );
}
