import { ScreenId } from "../lib/gameConstants";

interface HUDProps {
  screen: ScreenId;
  displayP1Votes: number;
  displayP2Votes: number;
  timeLeft: number;
}

export default function HUD({
  screen,
  displayP1Votes,
  displayP2Votes,
  timeLeft,
}: HUDProps) {
  return (
    <div
      id="hud"
      className={`hud ${
        screen !== "lobby" && screen !== "winner" ? "active" : ""
      }`}
    >
      <div className="player-badge" style={{ background: "var(--p1)" }}>
        <div className="avatar"><img src="/P1.png" alt="P1" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} /></div>
        <div className="score-info">
          <span>P1 Votes</span>
          <div className="score-val">{displayP1Votes}</div>
        </div>
      </div>

      <div
        className="clock"
        style={
          screen === "input"
            ? {
                color: timeLeft <= 10 ? "var(--p2)" : "#FFF",
                borderColor: timeLeft <= 10 ? "var(--p2)" : "#FFF",
              }
            : { display: "none" }
        }
      >
        {timeLeft}
      </div>

      <div
        className="player-badge right"
        style={{ background: "var(--p2)", color: "white" }}
      >
        <div className="avatar"><img src="/P2.png" alt="P2" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" }} /></div>
        <div className="score-info">
          <span style={{ color: "#FFB3D9" }}>P2 Votes</span>
          <div className="score-val" style={{ color: "white" }}>
            {displayP2Votes}
          </div>
        </div>
      </div>
    </div>
  );
}
