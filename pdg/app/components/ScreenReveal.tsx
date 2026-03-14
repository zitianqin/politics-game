import { useState, useEffect } from "react";
import { ScreenId, TOTAL_ROUNDS, formatScorecardName } from "../lib/gameConstants";
import VoterResultsReveal from "./VoterResultsReveal";

interface ScreenRevealProps {
  screen: ScreenId;
  p1Earned: number;
  p2Earned: number;
  currentBarsHeight: { p1: number; p2: number };
  isNextBtnVisible: boolean;
  currentRound: number;
  startNextRound: () => void;
  p1Name?: string;
  p2Name?: string;
  voters?: Array<{
    name: string;
    age: number;
    location: string;
    votedFor: "p1" | "p2";
    rationale: string;
  }>;
}

export default function ScreenReveal({
  screen,
  p1Earned,
  p2Earned,
  currentBarsHeight,
  isNextBtnVisible,
  currentRound,
  startNextRound,
  p1Name = "Player 1",
  p2Name = "Player 2",
  voters = [],
}: ScreenRevealProps) {
  const [showVoterReveal, setShowVoterReveal] = useState(true);

  // Auto-transition to summary after some time or on complete
  // But wait, VoterResultsReveal has onComplete
  
  useEffect(() => {
    if (screen === "reveal") {
      setShowVoterReveal(true);
    }
  }, [screen]);

  const handleVoterSequenceComplete = () => {
    setShowVoterReveal(false);
  };

  return (
    <div
      id="screen-reveal"
      className={`screen ${screen === "reveal" ? "active" : ""}`}
    >
      {showVoterReveal && voters.length > 0 ? (
        <div className="flex flex-col items-center">
          <h2 className="title-text" style={{ fontSize: "50px", marginBottom: "20px" }}>
            THE JURY DECIDES...
          </h2>
          <VoterResultsReveal
            voters={voters}
            p1Name={p1Name}
            p2Name={p2Name}
            isAnimating={screen === "reveal"}
            onComplete={handleVoterSequenceComplete}
            secondsPerVoter={3000}
          />
        </div>
      ) : (
        <>
          <h2 className="title-text" style={{ fontSize: "70px", marginBottom: 0 }}>
            VOTES SECURED!
          </h2>

          <div className="bars-container">
            <div className="bar-wrapper">
              <div
                className="avatar"
                style={{ fontSize: "60px", width: "100px", height: "100px" }}
              >
                🦄
              </div>
              <div
                className="bar p1-bar"
                style={{ height: `${currentBarsHeight.p1}px` }}
              >
                <div className="bar-score">+{p1Earned}</div>
              </div>
              <div
                className="apply-font"
                style={{
                  marginTop: "8px",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  textAlign: "center",
                  color: "var(--dark)",
                }}
              >
                {formatScorecardName(p1Name, 1)}
              </div>
            </div>

            <div className="bar-wrapper">
              <div
                className="avatar"
                style={{ fontSize: "60px", width: "100px", height: "100px" }}
              >
                🦖
              </div>
              <div
                className="bar p2-bar"
                style={{ height: `${currentBarsHeight.p2}px` }}
              >
                <div className="bar-score">+{p2Earned}</div>
              </div>
              <div
                className="apply-font"
                style={{
                  marginTop: "8px",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  textAlign: "center",
                  color: "var(--dark)",
                }}
              >
                {formatScorecardName(p2Name, 2)}
              </div>
            </div>
          </div>

          <button
            className="btn green-color"
            onClick={startNextRound}
            style={{
              marginTop: "40px",
              opacity: "none",
              pointerEvents: "auto",
              transition: "opacity 0.5s",
            }}
          >
            {currentRound >= TOTAL_ROUNDS ? "SEE FINAL RESULTS!" : "NEXT ROUND"}
          </button>
        </>
      )}
    </div>
  );
}
