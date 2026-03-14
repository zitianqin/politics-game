import { useState, useEffect } from "react";
import VoterRevealCard from "./VoterRevealCard";
import {
  VOTER_REVEAL_DELAY,
  VOTER_REVEAL_ANIMATION_DURATION,
} from "../lib/gameConstants";

interface VoterResult {
  name: string;
  age: number;
  location: string;
  votedFor: "p1" | "p2";
  rationale: string;
}

interface VoteRevealProps {
  voters: VoterResult[];
  p1Name: string;
  p2Name: string;
  isAnimating: boolean;
  onAnimationComplete?: () => void;
}

export default function VoteReveal({
  voters,
  p1Name,
  p2Name,
  isAnimating,
  onAnimationComplete,
}: VoteRevealProps) {
  const [completedCount, setCompletedCount] = useState(0);

  // Calculate when animation completes
  useEffect(() => {
    if (!isAnimating) {
      setCompletedCount(0);
      return;
    }

    if (voters.length === 0) {
      onAnimationComplete?.();
      return;
    }

    // Total time = last voter delay + animation duration + small buffer
    const lastVoterStartTime =
      voters.length * VOTER_REVEAL_DELAY + VOTER_REVEAL_ANIMATION_DURATION;

    const timer = setTimeout(() => {
      setCompletedCount(voters.length);
      onAnimationComplete?.();
    }, lastVoterStartTime);

    return () => clearTimeout(timer);
  }, [isAnimating, voters.length, onAnimationComplete]);

  return (
    <div className="vote-reveal-container">
      {voters.map((voter, index) => (
        <VoterRevealCard
          key={`${voter.name}-${index}`}
          voterName={voter.name}
          voterAge={voter.age}
          voterLocation={voter.location}
          votedFor={voter.votedFor}
          p1Name={p1Name}
          p2Name={p2Name}
          rationale={voter.rationale}
          isAnimating={isAnimating}
          delayMs={index * VOTER_REVEAL_DELAY}
        />
      ))}
    </div>
  );
}
