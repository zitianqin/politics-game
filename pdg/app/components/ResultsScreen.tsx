import { useState, useEffect } from "react";
import { formatScorecardName } from "../lib/gameConstants";
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
  p1TotalVotes,
  p2TotalVotes,
  onContinue,
  isVisible,
}: ResultsScreenProps) {
  const [isVoterSequenceComplete, setIsVoterSequenceComplete] = useState(false);
  const [isScoreVisible, setIsScoreVisible] = useState(false);
  const [isNextBtnVisible, setIsNextBtnVisible] = useState(false);

  // Reset state when visibility changes
  useEffect(() => {
    if (isVisible) {
      setIsVoterSequenceComplete(false);
      setIsScoreVisible(false);
      setIsNextBtnVisible(false);
    }
  }, [isVisible]);

  // Show score after voter sequence completes
  useEffect(() => {
    if (isVoterSequenceComplete && !isScoreVisible) {
      const timer = setTimeout(() => {
        setIsScoreVisible(true);
      }, 500); // Brief pause before score appears
      return () => clearTimeout(timer);
    }
  }, [isVoterSequenceComplete, isScoreVisible]);

  // Show button after score appears
  useEffect(() => {
    if (isScoreVisible && !isNextBtnVisible) {
      const timer = setTimeout(() => {
        setIsNextBtnVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isScoreVisible, isNextBtnVisible]);

  const isTie = p1TotalVotes === p2TotalVotes;
  const winner = p1TotalVotes > p2TotalVotes ? "p1" : p1TotalVotes < p2TotalVotes ? "p2" : "tie";
  const winnerName = winner === "p1" ? p1Name : winner === "p2" ? p2Name : "IT'S A TIE!";
  const winnerVotes = winner === "p1" ? p1TotalVotes : p2TotalVotes;

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
      {!isVoterSequenceComplete && isVisible && (
        <div className="flex items-center justify-center w-full mt-6">
          <VoterResultsReveal
            voters={voters}
            p1Name={p1Name}
            p2Name={p2Name}
            isAnimating={isVisible}
            secondsPerVoter={5000}
            onComplete={() => setIsVoterSequenceComplete(true)}
          />
        </div>
      )}

      {/* Scores */}
      <div
        className="results-scores flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-8"
        style={{
          opacity: isScoreVisible ? 1 : 0,
          transform: isScoreVisible ? "scale(1)" : "scale(0.8)",
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="score-box p1-score flex flex-col items-center px-4 py-3 sm:px-6 sm:py-4">
          <div className="score-label text-sm sm:text-lg">{p1Name}</div>
          <div
            className="score-value text-2xl sm:text-4xl"
            style={{ color: "var(--p1)" }}
          >
            {p1TotalVotes}
          </div>
        </div>

        <div className="vs-label text-lg sm:text-2xl md:text-3xl">VS</div>

        <div className="score-box p2-score flex flex-col items-center px-4 py-3 sm:px-6 sm:py-4">
          <div className="score-label text-sm sm:text-lg">
            {formatScorecardName(p2Name, 2)}
          </div>
          <div
            className="score-value text-xl sm:text-2xl md:text-4xl"
            style={{ color: "var(--p2)" }}
          >
            {p2TotalVotes}
          </div>
        </div>
      </div>

      {/* Final Results */}
      {!isInterim && isScoreVisible && (
        <div
          className="final-winner-summary flex flex-col items-center justify-center mt-6"
          style={{
            opacity: isScoreVisible ? 1 : 0,
            transform: isScoreVisible ? "scale(1)" : "scale(0.8)",
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <h2
            className="title-text text-4xl sm:text-6xl md:text-[80px]"
            style={{ marginBottom: "20px" }}
          >
            {winnerName}
          </h2>

          <p className="sub-text text-xl sm:text-3xl md:text-[32px]">
            {isTie ? `BOTH SIDES SECURED ${winnerVotes} VOTES` : `WINS WITH ${winnerVotes} VOTES`}
          </p>
        </div>
      )}

      {/* Continue Button */}
      <button
        className={`btn ${isInterim ? "green-color" : "p1-color"} mt-10`}
        onClick={onContinue}
        style={{
          opacity: isNextBtnVisible ? 1 : 0,
          pointerEvents: isNextBtnVisible ? "auto" : "none",
          transition: "opacity 0.5s",
        }}
      >
        {isInterim ? "CONTINUE TO ROUND 2" : "PLAY AGAIN"}
      </button>
    </div>
  );
}
