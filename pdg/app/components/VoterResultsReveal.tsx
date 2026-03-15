import { useState, useEffect } from "react";
import { formatScorecardName } from "../lib/gameConstants";
import VoterResultCard from "./VoterResultCard";

interface VoterResult {
  name: string;
  age: number;
  location: string;
  votedFor: "p1" | "p2";
  rationale: string;
}

interface VoterResultsRevealProps {
  voters: VoterResult[];
  p1Name: string;
  p2Name: string;
  isAnimating: boolean;
  secondsPerVoter?: number;
  onComplete?: () => void;
}

export default function VoterResultsReveal({
  voters,
  p1Name,
  p2Name,
  isAnimating,
  secondsPerVoter = 5000, // 5 seconds per voter
  onComplete,
}: VoterResultsRevealProps) {
  const [currentVoterIndex, setCurrentVoterIndex] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isAnimating) {
      setCurrentVoterIndex(-1);
      setIsTransitioning(false);
      return;
    }

    // Start sequence: show each voter one-by-one
    let voterIndex = 0;

    const showNextVoter = () => {
      if (voterIndex < voters.length) {
        setCurrentVoterIndex(voterIndex);
        setIsTransitioning(false); // Reset transition state
        // Trigger animation by setting isTransitioning after component renders
        setTimeout(() => setIsTransitioning(true), 50);
        voterIndex++;
        setTimeout(showNextVoter, secondsPerVoter);
      } else {
        // All voters shown
        setCurrentVoterIndex(-1);
        setIsTransitioning(false);
        onComplete?.();
      }
    };

    showNextVoter();
  }, [isAnimating, voters.length, secondsPerVoter, onComplete]);

  // Also handle transition state when currentVoterIndex changes
  useEffect(() => {
    if (currentVoterIndex >= 0) {
      setIsTransitioning(false);
      const transitionTimer = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(transitionTimer);
    }
  }, [currentVoterIndex]);

  if (currentVoterIndex < 0 || currentVoterIndex >= voters.length) {
    return null;
  }

  const voter = voters[currentVoterIndex];
  const candidateName = formatScorecardName(
    voter.votedFor === "p1" ? p1Name : p2Name,
    voter.votedFor === "p1" ? 1 : 2
  );

  const tilt = currentVoterIndex % 2 === 0 ? -2 : 2; // Alternate tilt

  return (
    <div className="voter-results-reveal-container">
      <VoterResultCard
        voterName={voter.name}
        voterAge={voter.age}
        voterLocation={voter.location}
        votedFor={voter.votedFor}
        candidateName={candidateName}
        rationale={voter.rationale}
        isVisible={isTransitioning}
        tilt={tilt}
        p1CandidateName={p1Name}
        p2CandidateName={p2Name}
      />
    </div>
  );
}
