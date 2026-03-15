"use client";

import { useEffect } from "react";
import { ScreenId, TOTAL_ROUNDS, formatScorecardName } from "../lib/gameConstants";

interface ScreenRevealProps {
  screen: ScreenId;
  p1Earned: number;
  p2Earned: number;
  currentBarsHeight: { p1: number; p2: number };
  isNextBtnVisible: boolean;
  currentRound: number;
  onNext: () => void;
  p1Name?: string;
  p2Name?: string;
}

export default function ScreenReveal({
  screen,
  p1Earned,
  p2Earned,
  currentBarsHeight,
  isNextBtnVisible,
  currentRound,
  onNext,
  p1Name = "Player 1",
  p2Name = "Player 2",
}: ScreenRevealProps) {
  useEffect(() => {
    const audio = new Audio("/sound-effects/confetti.mp3");
    audio.play().catch(() => {});
  }, []);

  return (
    <div
      id="screen-reveal"
      className={`screen ${screen === "reveal" ? "active" : ""}`}
    >
      <h2 className="title-text" style={{ fontSize: "70px", marginBottom: 0 }}>
        VOTES SECURED!
      </h2>

      <div className="bars-container">
        <div className="bar-wrapper">
          <div
            className="avatar"
            style={{ width: "100px", height: "100px", overflow: "visible", borderRadius: "12px", position: "relative" }}
          >
            <img src="/P1.png" alt="P1" style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", height: "150%", width: "auto", objectFit: "contain", filter: "drop-shadow(0 -3px 8px rgba(0,0,0,0.5))" }} />
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
            style={{ width: "100px", height: "100px", overflow: "visible", borderRadius: "12px", position: "relative" }}
          >
            <img src="/P2.png" alt="P2" style={{ position: "absolute", bottom: "-6px", left: "50%", transform: "translateX(-50%)", height: "150%", width: "auto", objectFit: "contain", filter: "drop-shadow(0 -3px 8px rgba(0,0,0,0.5))" }} />
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
        onClick={onNext}
        style={{
          marginTop: "40px",
          opacity: "none",
          pointerEvents: "auto",
          transition: "opacity 0.5s",
        }}
      >
        {currentRound >= TOTAL_ROUNDS ? "SEE FINAL RESULTS!" : "NEXT ROUND"}
      </button>
    </div>
  );
}
