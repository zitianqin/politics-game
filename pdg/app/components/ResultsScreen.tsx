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

  const winner = p1TotalVotes > p2TotalVotes ? "p1" : "p2";
  const winnerName = winner === "p1" ? p1Name : p2Name;
  const winnerVotes = winner === "p1" ? p1TotalVotes : p2TotalVotes;

  return (
    <div
      id="screen-results"
      className={`screen results-screen ${isVisible ? "active" : ""}`}
      style={{
        transform: isVisible
          ? "scale(1) translateY(0)"
          : "scale(0.8) translateY(100vh)",
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Header: Announcement of voter sequence */}
      <div className="results-header">
        {isInterim ? (
          <>
            <h2 className="subtitle" style={{ color: "var(--accent)" }}>
              ROUND {currentRound}: WHERE THINGS STAND
            </h2>
          </>
        ) : (
          <>
            <h2 className="subtitle" style={{ color: "var(--green)" }}>
              FINAL RESULTS
            </h2>
          </>
        )}
        <p
          style={{
            font: "Titan One, cursive",
            fontSize: "20px",
            color: "#fff",
            textShadow: "2px 2px 0 var(--dark)",
            marginTop: "10px",
          }}
        >
          HOW THE VOTERS DECIDED:
        </p>
      </div>

      {/* Voter Reveal Sequence (one-by-one in center) */}
      {!isVoterSequenceComplete && isVisible && (
        <VoterResultsReveal
          voters={voters}
          p1Name={p1Name}
          p2Name={p2Name}
          isAnimating={isVisible}
          secondsPerVoter={5000}
          onComplete={() => setIsVoterSequenceComplete(true)}
        />
      )}

      {/* Score Display (appears after voters) */}
      <div
        className="results-scores"
        style={{
          opacity: isScoreVisible ? 1 : 0,
          transform: isScoreVisible ? "scale(1)" : "scale(0.8)",
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        <div className="score-box p1-score">
          <div className="score-label">{p1Name}</div>
          <div className="score-value" style={{ color: "var(--p1)" }}>
            {p1TotalVotes}
          </div>
        </div>

        <div className="vs-label">VS</div>

        <div className="score-box p2-score">
          <div className="score-label">{formatScorecardName(p2Name, 2)}</div>
          <div className="score-value" style={{ color: "var(--p2)" }}>
            {p2TotalVotes}
          </div>
        </div>
      </div>

      {/* Final Results Summary (only show if not interim) */}
      {!isInterim && isScoreVisible && (
        <div
          className="final-winner-summary"
          style={{
            opacity: isScoreVisible ? 1 : 0,
            transform: isScoreVisible ? "scale(1)" : "scale(0.8)",
            transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
            marginTop: "30px",
          }}
        >
          <h2
            className="title-text"
            style={{ fontSize: "80px", marginBottom: "20px" }}
          >
            {winnerName}
          </h2>
          <p className="sub-text" style={{ fontSize: "32px" }}>
            WINS WITH {winnerVotes} VOTES
          </p>
        </div>
      )}

      {/* Continue Button */}
      <button
        className={`btn ${isInterim ? "green-color" : "p1-color"}`}
        onClick={onContinue}
        style={{
          marginTop: "40px",
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
