import { ScreenId, TOTAL_ROUNDS } from "../lib/gameConstants";

interface ScreenRevealProps {
  screen: ScreenId;
  p1Earned: number;
  p2Earned: number;
  currentBarsHeight: { p1: number; p2: number };
  isNextBtnVisible: boolean;
  currentRound: number;
  startNextRound: () => void;
}

export default function ScreenReveal({
  screen,
  p1Earned,
  p2Earned,
  currentBarsHeight,
  isNextBtnVisible,
  currentRound,
  startNextRound,
}: ScreenRevealProps) {
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
    </div>
  );
}
