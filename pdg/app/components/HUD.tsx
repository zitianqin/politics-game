import { ScreenId, formatScorecardName } from "../lib/gameConstants";

interface HUDProps {
  screen: ScreenId;
  displayP1Votes: number;
  displayP2Votes: number;
  timeLeft: number;
  p1Name?: string;
  p2Name?: string;
}

export default function HUD({
  screen,
  displayP1Votes,
  displayP2Votes,
  timeLeft,
  p1Name = "Player 1",
  p2Name = "Player 2",
}: HUDProps) {
  return (
    <div
      id="hud"
      className={`hud ${
        screen !== "lobby" && screen !== "winner" ? "active" : ""
      }`}
    >
      <div className="player-badge" style={{ background: "var(--p1)" }}>
        <div className="avatar"><img src="/P1.png" alt="P1" style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", height: "145%", width: "auto", objectFit: "contain", filter: "drop-shadow(0 -2px 6px rgba(0,0,0,0.5))" }} /></div>
        <div className="score-info">
          <span>{formatScorecardName(p1Name, 1)} Votes</span>
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
        <div className="avatar"><img src="/P2.png" alt="P2" style={{ position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)", height: "145%", width: "auto", objectFit: "contain", filter: "drop-shadow(0 -2px 6px rgba(0,0,0,0.5))" }} /></div>
        <div className="score-info">
          <span style={{ color: "#FFB3D9" }}>{formatScorecardName(p2Name, 2)} Votes</span>
          <div className="score-val" style={{ color: "white" }}>
            {displayP2Votes}
          </div>
        </div>
      </div>
    </div>
  );
}
