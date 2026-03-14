import VoterResultsReveal from "./VoterResultsReveal";

interface VoterResult {
  name: string;
  age: number;
  location: string;
  votedFor: "p1" | "p2";
  rationale: string;
}

interface ResultsScreenProps {
  currentRound: number;
  isInterim: boolean; // true for Round 1 "Where Things Stand"; false for final results
  voters: VoterResult[];
  p1Name: string;
  p2Name: string;
  p1TotalVotes: number;
  p2TotalVotes: number;
  onContinue: () => void;
  isVisible: boolean;
}

export default function ResultsScreen({
  currentRound,
  isInterim,
  voters,
  p1Name,
  p2Name,
  onContinue,
  isVisible,
}: ResultsScreenProps) {
  return (
    <div
      id="screen-results"
      className={`screen results-screen flex flex-col items-center justify-center text-center px-4 overflow-y-auto sm:max-h-none ${
        isVisible ? "active" : ""
      }`}
      style={{
        transform: isVisible
          ? "scale(1) translateY(0)"
          : "scale(0.8) translateY(100vh)",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Header */}
      <div className="results-header flex flex-col items-center justify-center">
        {isInterim ? (
          <h2
            className="subtitle text-lg sm:text-2xl md:text-3xl"
            style={{ color: "var(--accent)" }}
          >
            ROUND {currentRound}: WHERE THINGS STAND
          </h2>
        ) : (
          <h2
            className="subtitle text-lg sm:text-2xl md:text-3xl"
            style={{ color: "var(--green)" }}
          >
            FINAL RESULTS
          </h2>
        )}

        <p
          className="mt-2 text-sm sm:text-lg md:text-xl"
          style={{
            fontFamily: "Titan One, cursive",
            color: "#fff",
            textShadow: "2px 2px 0 var(--dark)",
          }}
        >
          HOW THE VOTERS DECIDED:
        </p>
      </div>

      {/* Voter Reveal */}
      {isVisible && (
        <div className="flex items-center justify-center w-full mt-6">
          <VoterResultsReveal
            voters={voters}
            p1Name={p1Name}
            p2Name={p2Name}
            isAnimating={isVisible}
            secondsPerVoter={5000}
            onComplete={onContinue}
          />
        </div>
      )}
    </div>
  );
}
